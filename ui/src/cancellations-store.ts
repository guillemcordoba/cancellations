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

export function throwIfUndefined<T>(object: T | undefined): T {
  if (object === undefined || object === null) throw new Error('Not found');
  return object;
}

export class CancellationsStore {
  constructor(public client: CancellationsClient) {}

  cancellationsFor = new LazyHoloHashMap((cancelledHash: ActionHash) =>
    lazyLoadAndPoll(
      async () => this.client.getCancellationsFor(cancelledHash),
      4000
    )
  );

  cancellations = new LazyHoloHashMap((cancelledHash: ActionHash) =>
    lazyLoadAndPoll(async () => {
      const c = await this.client.getCancellation(cancelledHash);
      return throwIfUndefined(c);
    }, 4000)
  );
}
