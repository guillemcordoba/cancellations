import {
  hashProperty,
  hashState,
  notifyError,
  onSubmit,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash, AgentPubKey, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from '@mdi/js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';
import { Cancellation } from '../types.js';

/**
 * @element edit-cancellation
 * @fires cancellation-updated: detail will contain { previousCancellationHash, updatedCancellationHash }
 */
@localized()
@customElement('edit-cancellation')
export class EditCancellation extends LitElement {
  // REQUIRED. The current Cancellation record that should be updated
  @property()
  currentRecord!: EntryRecord<Cancellation>;

  /**
   * @internal
   */
  @consume({ context: cancellationsStoreContext, subscribe: true })
  cancellationsStore!: CancellationsStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  firstUpdated() {
    this.shadowRoot?.querySelector('form')!.reset();
  }

  async updateCancellation(fields: any) {
    try {
      this.committing = true;
      const updateRecord =
        await this.cancellationsStore.client.updateCancellationReason(
          this.currentRecord.actionHash,
          fields.reason
        );

      this.dispatchEvent(
        new CustomEvent('cancellation-updated', {
          composed: true,
          bubbles: true,
          detail: {
            previousCancellationHash: this.currentRecord.actionHash,
            updatedCancellationHash: updateRecord.actionHash,
          },
        })
      );
    } catch (e: any) {
      console.error(e);
      notifyError(msg('Error updating the cancellation'));
    }

    this.committing = false;
  }

  render() {
    return html` <sl-card>
      <span slot="header">${msg('Edit Cancellation')}</span>

      <form
        style="display: flex; flex: 1; flex-direction: column;"
        ${onSubmit(fields => this.updateCancellation(fields))}
      >
        <div style="margin-bottom: 16px">
          <sl-textarea
            name="reason"
            .label=${msg('Reason')}
            required
            .defaultValue=${this.currentRecord.entry.reason}
          ></sl-textarea>
        </div>

        <div style="display: flex; flex-direction: row">
          <sl-button
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent('edit-canceled', {
                  bubbles: true,
                  composed: true,
                })
              )}
            style="flex: 1;"
            >${msg('Cancel')}</sl-button
          >
          <sl-button
            type="submit"
            variant="primary"
            style="flex: 1;"
            .loading=${this.committing}
            >${msg('Save')}</sl-button
          >
        </div>
      </form>
    </sl-card>`;
  }

  static styles = [sharedStyles];
}
