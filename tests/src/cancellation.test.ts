import { assert, test } from 'vitest';

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, Record, fakeActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { cleanNodeDecoding } from '@holochain-open-dev/utils/dist/clean-node-decoding.js';
import { toPromise } from '@holochain-open-dev/stores';

import { Cancellation } from '../../ui/src/types.js';
import { sampleCancellation } from '../../ui/src/mocks.js';
import { setup } from './common.js';

test('create Cancellation', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Cancellation
    const cancellation: EntryRecord<Cancellation> =
      await alice.store.client.createCancellation(
        await fakeActionHash(),
        'Lorem ipsum 2'
      );
    assert.ok(cancellation);
  });
});

test('create and read Cancellation', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const sample = await sampleCancellation();

    // Alice creates a Cancellation
    const cancellation: EntryRecord<Cancellation> =
      await alice.store.client.createCancellation(
        await fakeActionHash(),
        'Lorem ipsum 2'
      );
    assert.ok(cancellation);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice.player, bob.player], alice.player.cells[0].cell_id[0]);

    // Bob gets the created Cancellation
    const createReadOutput: EntryRecord<Cancellation> = await toPromise(
      bob.store.cancellations.get(cancellation.actionHash)
    );
    assert.ok(cleanNodeDecoding(createReadOutput.entry));
  });
});

test('create and update Cancellation', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Cancellation
    const cancellation: EntryRecord<Cancellation> =
      await alice.store.client.createCancellation(
        await fakeActionHash(),
        'Lorem ipsum 2'
      );
    assert.ok(cancellation);

    const originalActionHash = cancellation.actionHash;

    // Alice updates the Cancellation
    let updatedCancellation: EntryRecord<Cancellation> =
      await alice.store.client.updateCancellationReason(
        originalActionHash,
        'a reason'
      );
    assert.ok(updatedCancellation);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice.player, bob.player], alice.player.cells[0].cell_id[0]);

    // Bob gets the updated Cancellation
    const readUpdatedOutput0: EntryRecord<Cancellation> = await toPromise(
      bob.store.cancellations.get(cancellation.actionHash)
    );
    assert.deepEqual(readUpdatedOutput0.entry.reason, 'a reason');

    // Alice updates the Cancellation again
    updatedCancellation = await alice.store.client.updateCancellationReason(
      updatedCancellation.actionHash,
      'new reason'
    );
    assert.ok(updatedCancellation);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice.player, bob.player], alice.player.cells[0].cell_id[0]);

    // Bob gets the updated Cancellation
    const readUpdatedOutput1: EntryRecord<Cancellation> = await toPromise(
      bob.store.cancellations.get(updatedCancellation.actionHash)
    );
    assert.deepEqual(readUpdatedOutput1.entry.reason, 'new reason');
  });
});

test.only('create and delete Cancellation', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const cancelledHash = await fakeActionHash();

    let cancellactionsFor = await toPromise(
      alice.store.cancellationsFor.get(cancelledHash)
    );
    assert.equal(cancellactionsFor.length, 0);

    let undoneCancellactionsFor = await toPromise(
      alice.store.undoneCancellationsFor.get(cancelledHash)
    );
    assert.equal(undoneCancellactionsFor.length, 0);

    // Alice creates a Cancellation
    const cancellation: EntryRecord<Cancellation> =
      await alice.store.client.createCancellation(
        cancelledHash,
        'Lorem ipsum 2'
      );
    assert.ok(cancellation);

    cancellactionsFor = await toPromise(
      alice.store.cancellationsFor.get(cancelledHash)
    );
    assert.equal(cancellactionsFor.length, 1);

    // Alice deletes the Cancellation
    await alice.store.client.undoCancellation(cancellation.actionHash);

    cancellactionsFor = await toPromise(
      alice.store.cancellationsFor.get(cancelledHash)
    );
    assert.equal(cancellactionsFor.length, 0);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice.player, bob.player], alice.player.cells[0].cell_id[0]);

    // Bob tries to get the deleted Cancellation
    const readDeletedOutput: EntryRecord<Cancellation> = await toPromise(
      bob.store.cancellations.get(cancellation.actionHash)
    );
    assert.ok(readDeletedOutput);

    undoneCancellactionsFor = await toPromise(
      alice.store.undoneCancellationsFor.get(cancelledHash)
    );
    assert.equal(undoneCancellactionsFor.length, 1);
  });
});
