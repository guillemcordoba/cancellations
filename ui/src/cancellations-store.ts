import {
  deletedLinksTargetsStore,
  deletesForEntryStore,
  latestVersionOfEntryStore,
  liveLinksTargetsStore,
} from '@holochain-open-dev/stores';
import { LazyHoloHashMap } from '@holochain-open-dev/utils';
import { ActionHash } from '@holochain/client';

import { CancellationsClient } from './cancellations-client.js';

export class CancellationsStore {
  constructor(public client: CancellationsClient) {}

  cancellationsFor = new LazyHoloHashMap((cancelledHash: ActionHash) => ({
    live: liveLinksTargetsStore(
      this.client,
      cancelledHash,
      () => this.client.getCancellationsFor(cancelledHash),
      'Cancellations'
    ),
    undone: deletedLinksTargetsStore(
      this.client,
      cancelledHash,
      () => this.client.getUndoneCancellationsFor(cancelledHash),
      'Cancellations'
    ),
  }));

  cancellations = new LazyHoloHashMap((cancellationHash: ActionHash) => ({
    latestVersion: latestVersionOfEntryStore(this.client, () =>
      this.client.getLatestCancellation(cancellationHash)
    ),
    deletes: deletesForEntryStore(this.client, cancellationHash, () =>
      this.client.getCancellationDeletions(cancellationHash)
    ),
  }));
}
