import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";
import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

// This is mainly for internal use.
declare module 'preact/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'cosmos-modal-base': {
        children?: ComponentChildren;
        title?: string;
      };
    }
  }
}

export const ModalBase = defineComponent({
  name: 'cosmos-modal-base',
  attrs: {
    /** Title of the modal. Alternatively, you can also use the `header` slot. */
    title: z.optional(z.string()),
  },
  render({ self, attrs: { title } }) {
    const [backdrop, setBackdrop] = useState<HTMLDivElement | null>(null);

    const close = () => {
      self.dispatchEvent(new CustomEvent('close'));
      self.remove();
    }

    useEffect(() => {
      if (!backdrop) return;
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          close();
        }
      });
    }, [backdrop]);

    return (
      <>
        <style>{css`
          :host {
            position: fixed;
            inset: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .backdrop {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
          }

          .padding {
            flex-grow: 1;
            height: 100px;
          }

          .modal {
            min-width: 360px;
            max-width: 90vw;
            padding: var(--cosmos-spacing, 8px);
            background: var(--cosmos-bg-panel, rgb(49, 48, 54));
            border: 2px solid var(--cosmos-color-line, rgb(67, 66, 73));
            border-radius: calc(var(--cosmos-roundness, 4px) * 2);
            box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.25);

            > header {
              display: flex;
              align-items: center;
              margin-bottom: var(--cosmos-spacing, 8px);

              /* This is the default title slot. Slots are reflected, so these styles don't affect slotted elements. */
              h2 {
                color: rgb(200, 197, 219);
              }

              .close {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                margin-left: auto;
                color: rgb(200, 197, 219);
                background: transparent;
                border-radius: var(--cosmos-roundness, 4px);
                border: 1px solid var(--cosmos-color-line, rgb(67, 66, 73));
                opacity: 0.7;
                cursor: pointer;
                transition: opacity 0.3s ease-in-out;

                &:hover {
                  opacity: 1;
                  svg {
                    transform: rotate(360deg);
                  }
                }

                svg {
                  display: block;
                  width: 100%;
                  height: 100%;
                  transition: transform 0.3s ease-in-out;
                }
              }
            }

            .content-container {
              padding: var(--cosmos-spacing, 8px);
              border: 1px solid var(--cosmos-color-line, rgb(67, 66, 73));
              border-radius: var(--cosmos-roundness, 4px);

              > main {
                color: rgb(200, 197, 219);
              }
            }

            > footer:not(:empty, :blank) {
              padding: var(--cosmos-spacing, 8px);
            }
          }
        `}</style>
        <div ref={setBackdrop} class="backdrop">
          <div class="upper padding" aria-hidden="true" />
          <div class="modal">
            <header>
              <slot name="header">
                <h2>{title}</h2>
              </slot>
              <button class="close" onClick={close}>
                <svg viewBox="0 0 24 24">
                  <path d="M7 17L16.8995 7.10051" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 7.00001L16.8995 16.8995" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </header>
            <div class="content-container">
              <main class="content">
                <slot name="content" />
              </main>
            </div>
            <footer>
              <slot name="footer" />
            </footer>
          </div>
          <div class="lower padding" aria-hidden="true" />
        </div>
      </>
    );
  },
});
