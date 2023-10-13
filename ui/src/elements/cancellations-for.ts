import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { Record, EntryHash, ActionHash, AgentPubKey } from '@holochain/client';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { RecordBag, EntryRecord } from '@holochain-open-dev/utils';
import {
  hashProperty,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiInformationOutline } from '@mdi/js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';
import { Cancellation } from '../types.js';

import './cancellation-summary.js';

/**
 * @element cancellations-for-testesst
 */
@localized()
@customElement('cancellations-for')
export class CancellationsFor extends LitElement {
  // REQUIRED. The CancelledHash for which the Cancellations should be fetched
  @property(hashProperty('cancelled-hash'))
  cancelledHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: cancellationsStoreContext, subscribe: true })
  cancellationsStore!: CancellationsStore;

  /**
   * @internal
   */
  _cancellations = new StoreSubscriber(this, () =>
    this.cancellationsStore.cancellationsFor.get(this.cancelledHash)
  );

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0)
      return html` <div class="column center-content">
        <sl-icon
          style="color: grey; height: 64px; width: 64px; margin-bottom: 16px"
          .src=${wrapPathInSvg(mdiInformationOutline)}
        ></sl-icon>
        <span class="placeholder"
          >${msg('No cancellations found for this testesst')}</span
        >
      </div>`;

    return html`
      <div style="display: flex; flex-direction: column">
        ${hashes.map(
          hash =>
            html`<cancellation-summary
              .cancellationHash=${hash}
            ></cancellation-summary>`
        )}
      </div>
    `;
  }

  render() {
    switch (this._cancellations.value.status) {
      case 'pending':
        return html`<div
          style="display: flex; flex: 1; align-items: center; justify-content: center"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case 'complete':
        return this.renderList(this._cancellations.value.value);
      case 'error':
        return html`<display-error
          .headline=${msg('Error fetching the cancellations')}
          .error=${this._cancellations.value.error.data.data}
        ></display-error>`;
    }
  }

  static styles = [sharedStyles];
}
