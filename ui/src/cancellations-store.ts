import {
  deletedLinksStore,
  deletesForEntryStore,
  immutableEntryStore,
  latestVersionOfEntryStore,
  liveLinksStore,
  pipe,
} from '@holochain-open-dev/stores';
import { LazyHoloHashMap, slice } from '@holochain-open-dev/utils';
import { ActionHash } from '@holochain/client';

import { CancellationsClient } from './cancellations-client.js';

export class CancellationsStore {
  constructor(public client: CancellationsClient) {}

  cancellationsFor = new LazyHoloHashMap((cancelledHash: ActionHash) => ({
    live: pipe(
      liveLinksStore(
        this.client,
        cancelledHash,
        () => this.client.getCancellationsFor(cancelledHash),
        'Cancellations'
      ),
      links =>
        slice(
          this.cancellations,
          links.map(l => l.target)
        )
    ),
    undone: pipe(
      deletedLinksStore(
        this.client,
        cancelledHash,
        () => this.client.getUndoneCancellationsFor(cancelledHash),
        'Cancellations'
      ),
      linksDeleted =>
        slice(
          this.cancellations,
          linksDeleted.map(([cl]) => cl.hashed.content.target_address)
        )
    ),
  }));

  cancellations = new LazyHoloHashMap((cancellationHash: ActionHash) => ({
    latestVersion: latestVersionOfEntryStore(this.client, () =>
      this.client.getLatestCancellation(cancellationHash)
    ),
    originalEntry: immutableEntryStore(() =>
      this.client.getOriginalCancellation(cancellationHash)
    ),
    deletes: deletesForEntryStore(this.client, cancellationHash, () =>
      this.client.getCancellationDeletions(cancellationHash)
    ),
  }));
}
