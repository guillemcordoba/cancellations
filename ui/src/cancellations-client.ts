import { EntryRecord, ZomeClient } from '@holochain-open-dev/utils';
import {
  ActionHash,
  AppAgentClient,
  CreateLink,
  Delete,
  DeleteLink,
  HoloHash,
  Record,
  SignedActionHashed,
} from '@holochain/client';

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

  async getLatestCancellation(
    cancellationHash: ActionHash
  ): Promise<EntryRecord<Cancellation>> {
    const record: Record = await this.callZome(
      'get_latest_cancellation',
      cancellationHash
    );
    return new EntryRecord(record);
  }

  async getOriginalCancellation(
    cancellationHash: ActionHash
  ): Promise<EntryRecord<Cancellation>> {
    const record: Record = await this.callZome(
      'get_original_cancellation',
      cancellationHash
    );
    return new EntryRecord(record);
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
  ): Promise<Array<[CreateLink, Array<SignedActionHashed<DeleteLink>>]>> {
    return this.callZome('get_undone_cancellations_for', actionHash);
  }

  async getCancellationDeletions(
    cancellationHash: ActionHash
  ): Promise<Array<SignedActionHashed<Delete>>> {
    return this.callZome('get_cancellation_deletions', cancellationHash);
  }
}

export interface DeletedLinkTarget<H extends HoloHash = HoloHash> {
  target_address: H;
  delete_links: Array<SignedActionHashed<DeleteLink>>;
}
