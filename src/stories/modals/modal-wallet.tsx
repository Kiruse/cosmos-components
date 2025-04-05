import { signals, Signer } from '@apophis-sdk/core';
import type { WalletConnectCosmosSigner } from '@apophis-sdk/cosmos-signers';
import { Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import qr from 'qrcode';
import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";
import './modal-base.js';
import { getNetworkConfigSchema } from '../../internals.js';
import '../Spinner/spinner.js';
import { toast } from '../Toast/toast.js';
import { rememberSigner } from '../../utils.js';
import { modals } from './modals.js';

type Platform = 'android' | 'ios' | 'browser';

export const WalletModal = defineComponent({
  name: 'cosmos-modal-wallet',
  attrs: {
    networks: z.array(getNetworkConfigSchema()),
  },
  render({ self, attrs: { networks } }) {
    // WalletConnect signers are treated specially
    const signers = Signer.signers.filter(s => s.type !== 'walletconnect');
    const [wcSigner] = Signer.signers.filter(s => s.type === 'walletconnect') as WalletConnectCosmosSigner[];
    const wcState = useComputed(() => wcSigner?.state.value);
    const canvas = useSignal<HTMLCanvasElement | null>(null);

    const close = () => {
      self.dispatchEvent(new CustomEvent('close'));
      self.remove();
    }

    const handleError = (error: any) => {
      self.dispatchEvent(new CustomEvent('reject', { detail: { error } }));
      toast.errorlink(error, { message: 'Failed to connect wallet.' });
      console.error('Failed to connect wallet:', error);
    }

    useSignalEffect(() => {
      if (!wcSigner || !canvas.value) return;
      if (wcState.value?.state === 'pending') {
        qr.toCanvas(canvas.value, wcState.value.uri!);
      }
    });

    // initialize walletconnect
    useEffect(() => {
      if (!wcSigner) return;
      let live = true;
      wcSigner.connect(networks.peek())
        .then(() => {
          if (!live) return;
          // we only want to connect immediately if the signer was not restored from a previous session
          // otherwise, the modal might close immediately after opening, which is bad UX
          if (wcSigner.state.value?.state !== 'connected') return;
          if (!wcSigner.state.value.restored) {
            signals.signer.value = wcSigner;
            rememberSigner(wcSigner);
            self.dispatchEvent(new CustomEvent('connect', { detail: { signer: wcSigner } }));
            close();
          }
        })
        .catch(handleError);
      return () => live = false;
    }, [wcSigner]);

    return (
      <>
        <style>{styles}</style>
        <cosmos-modal-base exportparts="modal">
          <slot slot="header" name="title"><h1>Connect your wallet</h1></slot>
          <slot slot="content">
            {Signer.signers.length > 0 ? (
              <>
                {(signers.length > 0) && (
                  <ul>
                    {signers.map(signer => (
                      <li>
                        <button
                          type="button"
                          disabled={!signer.available.value}
                          onClick={async () => {
                            try {
                              await signer.connect(networks.peek());
                              signals.signer.value = signer;
                              rememberSigner(signer);
                              self.dispatchEvent(new CustomEvent('connect', { detail: { signer } }))
                              close();
                            } catch (error: any) {
                              handleError(error);
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
                )}
                <WalletConnectSection self={self} close={close} canvas={canvas} />
              </>
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

interface SectionProps {
  children?: ComponentChildren;
  title: string;
  level?: 2 | 3;
  condition?: boolean;
}

function Section({ title, level = 2, condition = true, children }: SectionProps) {
  if (!condition) return null;
  const Heading = `h${level}` as keyof HTMLElementTagNameMap;
  return (
    <section>
      <Heading>{title}</Heading>
      {children}
    </section>
  )
}

function WalletConnectSection({ self, close, canvas }: { self: HTMLElement, close: () => void, canvas: Signal<HTMLCanvasElement | null> }) {
  const signer = Signer.signers.filter(s => s.type === 'walletconnect')[0] as WalletConnectCosmosSigner;
  const state = useComputed(() => signer?.state.value);

  if (!signer) return null;

  switch (state.value?.state) {
    case 'connected':
      if (state.value.restored) {
        return (
          <Section title="WalletConnect">
            <button
              type="button"
              onClick={() => {
                signals.signer.value = signer;
                rememberSigner(signer);
                self.dispatchEvent(new CustomEvent('connect', { detail: { signer: signer } }));
                close();
              }}
            >
              <img class="logo" src={signer.logoURL?.toString()} alt={`${signer.displayName} logo`} />
              <div class="name">
                Reconnect WalletConnect Session
              </div>
            </button>
          </Section>
        );
      } else {
        // When the session is not restored, the user has scanned the QR code & the modal should automatically close
        return (
          <Section title="WalletConnect">
            <p>WalletConnect session successfully established.</p>
          </Section>
        );
      }
    case 'pending':
      // URI should always be present in the pending state
      // if it isn't, something broke in Apophis SDK
      const uri = state.value?.uri;
      if (!uri) return null;

      if (isMobilePlatform()) {
        // TODO: add specific WC URIs for different wallets
        return (
          <Section title="WalletConnect">
            <button
              type="button"
              onClick={() => {
                location.href = `wc:${uri}`;
              }}
            >
              Open WalletConnect
            </button>
          </Section>
        );
      } else {
        return (
          <Section title="WalletConnect">
            <p>Scan this QR code with your mobile wallet:</p>
            <canvas ref={(el) => canvas.value = el} />
          </Section>
        );
      }
    case 'error': {
      const error = state.value?.error;
      if (!error) return null;
      return (
        <Section title="WalletConnect">
          <p>Something went horribly wrong. <a href="#" onClick={e => {
            e.preventDefault();
            modals.showErrorModal(error);
          }}>Check details.</a></p>
        </Section>
      );
    }
    case undefined: // undefined means the signer is initializing
      return (
        <Section title="WalletConnect">
          <cosmos-spinner size="md" />
        </Section>
      );
    default:
      return null;
  }
}

function detectPlatform(): Platform {
  if (navigator.userAgent.match(/android/i)) {
    return 'android';
  } else if (navigator.userAgent.match(/iphone|ipad|ipod/i)) {
    return 'ios';
  } else {
    return 'browser';
  }
}

const isMobilePlatform = (platform = detectPlatform()) => platform === 'android' || platform === 'ios';

const styles = css`
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

h2, h3 {
  display: flex;
  align-items: center;
  gap: var(--cosmos-spacing, 8px);

  &:before, &:after {
    content: '';
    flex: 1;
    display: block;
    border-bottom: 1px solid var(--cosmos-color-line, rgb(67, 66, 73));
  }
}

section {
  margin-top: calc(var(--cosmos-spacing, 8px) * 2);
  > h2, > h3 {
    margin-bottom: var(--cosmos-spacing, 8px);
  }
}

p {
  margin: var(--cosmos-spacing, 8px) 0;
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

canvas {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border-radius: calc(var(--cosmos-roundness, 4px) * 4);
  overflow: hidden;
}

cosmos-loading-wrapper::part(spinner-container) {
  aspect-ratio: 3 / 1;
}
`
