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
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';
import { Cancellation } from '../types.js';

/**
 * @element edit-cancellation-dialog
 * @fires cancellation-updated: detail will contain { previousCancellationHash, updatedCancellationHash }
 */
@localized()
@customElement('edit-cancellation-dialog')
export class EditCancellationDialog extends LitElement {
  @property()
  cancellationHash!: ActionHash;

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

  /**
   * @internal
   */
  @query('sl-dialog')
  dialog!: SlDialog;

  show() {
    this.dialog.show();
  }

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
      this.dialog.hide();
    } catch (e: any) {
      console.error(e);
      notifyError(msg('Error updating the cancellation'));
    }

    this.committing = false;
  }

  render() {
    return html` <sl-dialog .label=${msg('Edit Cancellation Reason')}>
      <form
        id="edit-cancellation"
        class="column"
        style="flex: 1; gap: 16px;"
        ${onSubmit(fields => this.updateCancellation(fields))}
      >
        <sl-textarea
          name="reason"
          .label=${msg('Reason')}
          required
          .defaultValue=${this.currentRecord.entry.reason}
        ></sl-textarea>
      </form>
      <sl-button
        slot="footer"
        form="edit-cancellation"
        type="submit"
        variant="primary"
        .loading=${this.committing}
        >${msg('Save reason')}</sl-button
      >
    </sl-dialog>`;
  }

  static styles = [sharedStyles];
}
