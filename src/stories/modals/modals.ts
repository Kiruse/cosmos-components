import { WalletModal } from './modal-wallet.js';
import './modal-error.js';
import { CosmosComponent } from '../../webcomp.js';

function getModalContainer() {
  let modalContainer = document.getElementById("modal-container");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "modal-container";
    document.body.appendChild(modalContainer);
  }
  return modalContainer;
}

export namespace modals {
  export function showErrorModal(error: unknown) {
    const container = getModalContainer();
    const modal = document.createElement("cosmos-modal-error");
    Object.assign(modal, { error });
    container.appendChild(modal);
  }

  /** Show the Wallet Connection modal.
   * @returns the modal element, which exposes useful methods and events.
   */
  export function showWalletModal() {
    const container = getModalContainer();
    const modal = document.createElement("cosmos-modal-wallet");
    container.appendChild(modal);
    return modal as CosmosComponent<typeof WalletModal>;
  }
}
