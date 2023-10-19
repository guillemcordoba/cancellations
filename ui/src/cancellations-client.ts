import { EntryRecord, ZomeClient } from '@holochain-open-dev/utils';
import { ActionHash, AppAgentClient, Record } from '@holochain/client';

import { Cancellation, CancellationsSignal } from './types.js';

export class CancellationsClient extends ZomeClient<CancellationsSignal> {
  constructor(
    public client: AppAgentClient,
    public roleName: string,
    public zomeName = 'cancellations'
  ) {
    super(client, roleName, zomeName);
  }

  /** Cancellation */

  async createCancellation(
    cancelledHash: ActionHash,
    reason: string
  ): Promise<EntryRecord<Cancellation>> {
    const record: Record = await this.callZome('create_cancellation', {
      cancelled_hash: cancelledHash,
      reason,
    });
    return new EntryRecord(record);
  }

  async getCancellation(
    cancellationHash: ActionHash
  ): Promise<EntryRecord<Cancellation> | undefined> {
    const record: Record = await this.callZome(
      'get_cancellation',
      cancellationHash
    );
    return record ? new EntryRecord(record) : undefined;
  }

  undoCancellation(cancellationHash: ActionHash): Promise<void> {
    return this.callZome('undo_cancellation', cancellationHash);
  }

  async updateCancellationReason(
    previousCancellationHash: ActionHash,
    reason: string
  ): Promise<EntryRecord<Cancellation>> {
    const record: Record = await this.callZome('update_cancellation', {
      previous_cancellation_hash: previousCancellationHash,
      updated_reason: reason,
    });
    return new EntryRecord(record);
  }

  getCancellationsFor(actionHash: ActionHash): Promise<Array<ActionHash>> {
    return this.callZome('get_cancellations_for', actionHash);
  }

  getUndoneCancellationsFor(
    actionHash: ActionHash
  ): Promise<Array<ActionHash>> {
    return this.callZome('get_undone_cancellations_for', actionHash);
  }
}
