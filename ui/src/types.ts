import { ActionCommittedSignal } from '@holochain-open-dev/utils';
import { ActionHash } from '@holochain/client';

export type CancellationsSignal = ActionCommittedSignal<EntryTypes, any>;

export type EntryTypes = { type: 'Cancellation' } & Cancellation;

export interface Cancellation {
  reason: string;
  cancelled_hash: ActionHash;
}
