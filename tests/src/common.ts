import { Scenario } from '@holochain/tryorama';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { CancellationsClient } from '../../ui/src/cancellations-client.js';
import { CancellationsStore } from '../../ui/src/cancellations-store.js';

export async function setup(scenario: Scenario) {
  const testHappUrl =
    dirname(fileURLToPath(import.meta.url)) +
    '/../../workdir/cancellations_test.happ';

  // Add 2 players with the test hApp to the Scenario. The returned players
  // can be destructured.
  const [alice, bob] = await scenario.addPlayersWithApps([
    { appBundleSource: { path: testHappUrl } },
    { appBundleSource: { path: testHappUrl } },
  ]);

  // Shortcut peer discovery through gossip and register all agents in every
  // conductor of the scenario.
  await scenario.shareAllAgents();

  const aliceStore = new CancellationsStore(
    new CancellationsClient(
      alice.appAgentWs as any,
      'cancellations_test',
      'cancellations'
    )
  );

  const bobStore = new CancellationsStore(
    new CancellationsClient(
      bob.appAgentWs as any,
      'cancellations_test',
      'cancellations'
    )
  );

  // Shortcut peer discovery through gossip and register all agents in every
  // conductor of the scenario.
  await scenario.shareAllAgents();

  return {
    alice: {
      player: alice,
      store: aliceStore,
    },
    bob: {
      player: bob,
      store: bobStore,
    },
  };
}
