import { AsyncReadable, lazyLoadAndPoll } from '@holochain-open-dev/stores';
import { EntryRecord, LazyHoloHashMap } from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  EntryHash,
  NewEntryAction,
  Record,
} from '@holochain/client';

import { CancellationsClient } from './cancellations-client.js';

export class CancellationsStore {
  constructor(public client: CancellationsClient) {}

  cancellationsFor = new LazyHoloHashMap((cancelledHash: ActionHash) =>
    lazyLoadAndPoll(
      async () => this.client.getCancellationsFor(cancelledHash),
      4000
    )
  );

  cancellations = new LazyHoloHashMap((cancelledHash: ActionHash) =>
    lazyLoadAndPoll(
      async () => this.client.getCancellation(cancelledHash),
      4000
    )
  );
}
