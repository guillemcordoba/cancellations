import {
  AgentPubKeyMap,
  HashType,
  HoloHashMap,
  RecordBag,
  ZomeMock,
  decodeEntry,
  entryState,
  fakeCreateAction,
  fakeDeleteEntry,
  fakeEntry,
  fakeRecord,
  fakeUpdateEntry,
  hash,
  pickBy,
} from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  AppAgentClient,
  EntryHash,
  Record,
  decodeHashFromBase64,
  fakeActionHash,
  fakeAgentPubKey,
  fakeDnaHash,
  fakeEntryHash,
} from '@holochain/client';

import { CancellationsClient } from './cancellations-client.js';
import { Cancellation } from './types.js';

export class CancellationsZomeMock extends ZomeMock implements AppAgentClient {
  constructor(myPubKey?: AgentPubKey) {
    super('cancellations_test', 'cancellations', myPubKey);
  }

  /** Cancellation */
  cancellation = new RecordBag<Cancellation>();

  cancellationsFor = new HoloHashMap<ActionHash, ActionHash[]>();

  async create_cancellation(cancellation: Cancellation): Promise<Record> {
    const record = await fakeRecord(
      await fakeCreateAction(hash(cancellation, HashType.ENTRY)),
      fakeEntry(cancellation)
    );

    this.cancellation.add([record]);

    const existingCancelledHash =
      this.cancellationsFor.get(cancellation.cancelled_hash) || [];
    this.cancellationsFor.set(cancellation.cancelled_hash, [
      ...existingCancelledHash,
      record.signed_action.hashed.hash,
    ]);

    return record;
  }

  async get_cancellation(
    cancellationHash: ActionHash
  ): Promise<Record | undefined> {
    const state = entryState(this.cancellation, cancellationHash);

    if (!state || state.deleted) return undefined;

    return state.lastUpdate?.record;
  }

  async undo_cancellation(
    original_cancellation_hash: ActionHash
  ): Promise<ActionHash> {
    const record = await fakeRecord(
      await fakeDeleteEntry(original_cancellation_hash)
    );

    this.cancellation.add([record]);

    return record.signed_action.hashed.hash;
  }

  async update_cancellation(input: {
    previous_cancellation_hash: ActionHash;
    updated_cancellation: Cancellation;
  }): Promise<Record> {
    const record = await fakeRecord(
      await fakeUpdateEntry(
        input.previous_cancellation_hash,
        undefined,
        this.myPubKey,
        fakeEntry(input.updated_cancellation)
      ),
      fakeEntry(input.updated_cancellation)
    );

    this.cancellation.add([record]);

    const cancellation = input.updated_cancellation;

    const existingCancelledHash =
      this.cancellationsFor.get(cancellation.cancelled_hash) || [];
    this.cancellationsFor.set(cancellation.cancelled_hash, [
      ...existingCancelledHash,
      record.signed_action.hashed.hash,
    ]);

    return record;
  }

  async get_cancellations_for(
    cancelledHash: ActionHash
  ): Promise<Array<Record>> {
    const actionHashes: ActionHash[] =
      this.cancellationsFor.get(cancelledHash) || [];

    return actionHashes
      .map(actionHash => this.cancellation.entryRecord(actionHash)?.record)
      .filter(r => !!r) as Record[];
  }
}

export async function sampleCancellation(
  partialCancellation: Partial<Cancellation> = {}
): Promise<Cancellation> {
  return {
    ...{
      reason: 'Lorem ipsum 2',
      cancelled_hash: await fakeActionHash(),
    },
    ...partialCancellation,
  };
}
