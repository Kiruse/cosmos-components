import { Signer } from '@apophis-sdk/core';
import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";
import './modal-base.js';
import { getNetworkConfigSchema } from '../../internals.js';
import { toast } from '../toast.js';

export const WalletModal = defineComponent({
  name: 'cosmos-modal-wallet',
  attrs: {
    networks: z.array(getNetworkConfigSchema()),
  },
  render({ self, attrs: { networks } }) {
    return (
      <>
        <style>{css`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :host {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            color: rgb(200, 197, 219);
            font-size: calc(16px * var(--cosmos-modal-wallet-size, 1));
          }

          cosmos-modal-base::part(modal) {
            min-width: 450px;
          }

          h1 {
            font-weight: 500;
          }

          ul {
            display: flex;
            flex-direction: column;
            gap: var(--cosmos-spacing, 8px);
            list-style: none;
          }

          button {
            display: flex;
            align-items: center;
            gap: calc(var(--cosmos-spacing, 8px) * 2);
            padding: var(--cosmos-spacing, 8px);
            width: 100%;
            font-size: inherit;
            color: inherit;
            background: var(--cosmos-bg-panel-400, rgb(73, 72, 78));
            border: none;
            border-radius: var(--cosmos-roundness, 4px);
            cursor: pointer;
            transition: background 0.2s ease-in-out, opacity 0.2s ease-in-out;
            opacity: 0.8;

            &:disabled {
              filter: grayscale(0.8);
              cursor: not-allowed;
            }

            &:not(:disabled):hover {
              background: var(--cosmos-bg-panel-300, rgb(93, 92, 98));
              .logo {
                opacity: 1;
              }
            }
          }

          img.logo {
            width:  calc(32px * var(--cosmos-modal-wallet-size, 1));
            height: calc(32px * var(--cosmos-modal-wallet-size, 1));
          }
        `}</style>
        <cosmos-modal-base exportparts="modal">
          <slot slot="header" name="title"><h1>Connect your wallet</h1></slot>
          <slot slot="content">
            {Signer.signers.length > 0 ? (
              <ul>
                {Signer.signers.map(signer => (
                  <li>
                    <button
                      type="button"
                      disabled={!signer.available.value}
                      onClick={async () => {
                        try {
                          await signer.connect(networks.peek());
                          self.dispatchEvent(new CustomEvent('connect', { detail: { signer } }))
                          self.dispatchEvent(new CustomEvent('close'));
                          self.remove();
                        } catch (error: any) {
                          self.dispatchEvent(new CustomEvent('reject', { detail: { error } }))
                          toast.errorlink(error, { message: 'Failed to connect wallet.' });
                        }
                      }}
                    >
                      <img class="logo" src={signer.logoURL?.toString()} alt={`${signer.displayName} logo`} />
                      <div class="name">
                        {signer.displayName}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
                The developer has not enabled any wallets for this dapp.
              </p>
            )}
          </slot>
        </cosmos-modal-base>
      </>
    );
  },
});
