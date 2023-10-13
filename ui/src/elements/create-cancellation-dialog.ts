import {
  hashProperty,
  hashState,
  notifyError,
  onSubmit,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';
import { Cancellation } from '../types.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

/**
 * @element create-cancellation
 * @fires cancellation-created: detail will contain { cancellationHash }
 */
@localized()
@customElement('create-cancellation-dialog')
export class CreateCancellation extends LitElement {
  // REQUIRED. The cancelled hash for this Cancellation
  @property(hashProperty('cancelled-hash'))
  cancelledHash!: ActionHash;

  // The label for the dialog
  // Default: "Cancel"
  @property()
  label = msg('Cancel');

  // Warning to give to the user about cancelling
  // Will be displayed in the body of the dialog
  @property()
  warning: string | undefined;

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
  @query('#create-form')
  form!: HTMLFormElement;

  /**
   * @internal
   */
  @query('sl-dialog')
  dialog!: SlDialog;

  show() {
    this.dialog.show();
  }

  async createCancellation(fields: any) {
    if (this.cancelledHash === undefined)
      throw new Error(
        'Cannot create a new Cancellation without its cancelled_hash field'
      );

    try {
      this.committing = true;
      const record: EntryRecord<Cancellation> =
        await this.cancellationsStore.client.createCancellation(
          this.cancelledHash,
          fields.reason
        );

      this.dispatchEvent(
        new CustomEvent('cancellation-created', {
          composed: true,
          bubbles: true,
          detail: {
            cancellationHash: record.actionHash,
          },
        })
      );

      this.form.reset();
    } catch (e: any) {
      console.error(e);
      notifyError(msg('Error creating the cancellation'));
    }
    this.committing = false;
  }

  render() {
    return html` <sl-dialog .label=${this.label}>
      <form
        id="create-form"
        class="column"
        style="flex: 1; gap: 16px;"
        ${onSubmit(fields => this.createCancellation(fields))}
      >
        ${this.warning ? html`<span>${this.warning}</span>` : html``}

        <sl-textarea
          name="reason"
          .label=${msg('Reason')}
          required
        ></sl-textarea>
      </form>
      <sl-button
        slot="footer"
        form="create-form"
        variant="primary"
        type="submit"
        .loading=${this.committing}
        >${this.label}</sl-button
      >
    </sl-dialog>`;
  }

  static styles = [sharedStyles];
}
