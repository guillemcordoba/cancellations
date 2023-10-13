import { createContext } from '@lit-labs/context';

import { CancellationsStore } from './cancellations-store';

export const cancellationsStoreContext = createContext<CancellationsStore>(
  'hc_zome_cancellations/store'
);
