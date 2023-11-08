import { provide } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';

@customElement('cancellations-context')
export class CancellationsContext extends LitElement {
  @provide({ context: cancellationsStoreContext })
  @property({ type: Object })
  store!: CancellationsStore;

  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: contents;
    }
  `;
}
