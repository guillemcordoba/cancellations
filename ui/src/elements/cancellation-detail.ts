import {
  hashProperty,
  notifyError,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import {
  mdiAlertCircleOutline,
  mdiCancel,
  mdiDelete,
  mdiDotsVertical,
  mdiPencil,
} from '@mdi/js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';
import { Cancellation } from '../types.js';
import './edit-cancellation-dialog.js';
import { EditCancellationDialog } from './edit-cancellation-dialog.js';
import { SlDialog } from '@shoelace-style/shoelace';

/**
 * @element cancellation-detail
 * @fires cancellation-deleted: detail will contain { cancellationHash }
 */
@localized()
@customElement('cancellation-detail')
export class CancellationDetail extends LitElement {
  // REQUIRED. The hash of the Cancellation to show
  @property(hashProperty('cancellation-hash'))
  cancellationHash!: ActionHash;

  @property()
  label: string = msg('was cancelled');

  /**
   * @internal
   */
  @consume({ context: cancellationsStoreContext, subscribe: true })
  cancellationsStore!: CancellationsStore;

  /**
   * @internal
   */
  _cancellation = new StoreSubscriber(this, () =>
    this.cancellationsStore.cancellations.get(this.cancellationHash)
  );

  /**
   * @internal
   */
  @state()
  deleting = false;

  async deleteCancellation() {
    this.deleting = true;
    try {
      await this.cancellationsStore.client.undoCancellation(
        this.cancellationHash
      );

      this.dispatchEvent(
        new CustomEvent('cancellation-deleted', {
          bubbles: true,
          composed: true,
          detail: {
            cancellationHash: this.cancellationHash,
          },
        })
      );
      (this.shadowRoot?.querySelector('#undo-cancellation') as SlDialog).hide();
    } catch (e: any) {
      notifyError(msg('Error deleting the cancellation'));
      console.error(e);
    }
    this.deleting = false;
  }

  renderDeletingDialog() {
    return html`
      <sl-dialog id="undo-cancellation" .label=${msg('Undo Cancellation')}>
        <span>${msg('Are you sure you want to undo this cancellation?')}</span>
        <sl-button
          slot="footer"
          variant="warning"
          .loading=${this.deleting}
          @click=${() => this.deleteCancellation()}
          >${msg('Undo cancellation')}</sl-button
        >
      </sl-dialog>
    `;
  }

  renderDetail(cancellation: EntryRecord<Cancellation>) {
    return html`
      ${this.renderDeletingDialog()}
      <edit-cancellation-dialog
        .cancellationHash=${this.cancellationHash}
        .currentRecord=${cancellation}
        style="display: flex; flex: 1;"
      ></edit-cancellation-dialog>
      <div class="warning-card column" style="gap: 8px">
        <div
          slot="header"
          style="display: flex; flex-direction: row; align-items: center; gap: 8px"
        >
          <sl-icon
            .src=${wrapPathInSvg(mdiCancel)}
            style="font-size: 24px;"
          ></sl-icon>
          <span style="font-size: 18px; flex: 1;">${this.label}</span>

          ${cancellation.action.author.toString() ===
          this.cancellationsStore.client.client.myPubKey.toString()
            ? html`
                <sl-dropdown>
                  <sl-icon-button
                    .src=${wrapPathInSvg(mdiPencil)}
                    style="font-size: 18px"
                    slot="trigger"
                  ></sl-icon-button>
                  <sl-menu>
                    <sl-menu-item
                      @click=${() => {
                        (
                          this.shadowRoot?.querySelector(
                            'edit-cancellation-dialog'
                          ) as EditCancellationDialog
                        ).show();
                      }}
                      >${msg('Edit reason')}</sl-menu-item
                    >
                    <sl-menu-item
                      @click=${() => {
                        (
                          this.shadowRoot?.querySelector(
                            '#undo-cancellation'
                          ) as SlDialog
                        ).show();
                      }}
                      >${msg('Undo cancellation')}</sl-menu-item
                    >
                  </sl-menu>
                </sl-dropdown>
              `
            : html``}
        </div>

        <span style="white-space: pre-line">${cancellation.entry.reason}</span>
        <div class="row placeholder" style="align-items: center; ">
          <span style="flex: 1"></span>
          <span>${msg('By')}&nbsp;</span>
          <agent-avatar
            .agentPubKey=${cancellation.action.author}
          ></agent-avatar
          >,&nbsp;
          <sl-relative-time
            .date=${new Date(cancellation.action.timestamp)}
          ></sl-relative-time>
        </div>
      </div>
    `;
  }

  render() {
    switch (this._cancellation.value.status) {
      case 'pending':
        return html`
          <div
            class="warning-card"
            style="display: flex; flex: 1; align-items: center; justify-content: center"
          >
            <sl-spinner style="font-size: 2rem;"></sl-spinner>
          </div>
        `;
      case 'complete':
        const cancellation = this._cancellation.value.value;

        return this.renderDetail(cancellation);
      case 'error':
        return html`<sl-card>
          <display-error
            .headline=${msg('Error fetching the cancellation')}
            .error=${this._cancellation.value.error.data.data}
          ></display-error>
        </sl-card>`;
    }
  }

  static styles = [
    sharedStyles,
    css`
      .warning-card {
        background-color: rgba(255, 0, 0, 0.4);
        padding: 8px;
        border-radius: 4px;
        border-style: dashed;
        border-color: red;
      }
    `,
  ];
}
