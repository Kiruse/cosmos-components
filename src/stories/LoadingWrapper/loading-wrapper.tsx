import { Signal } from "@preact/signals";
import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";
import { cssvars } from "../../internals.js";

declare module 'preact/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'cosmos-loading-wrapper': {
        loading: boolean | Signal<boolean>;
        children?: React.ReactNode;
      };
    }
  }
}

export const LoadingWrapper = defineComponent({
  name: 'cosmos-loading-wrapper',
  attrs: {
    loading: z.boolean().optional(),
  },
  render({ attrs: { loading } }) {
    return (
      <>
        <style>{css`
          :host {
            display: block;
          }

          [part="spinner-container"] {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: var(--cosmos-spinner-size, 80px);
            min-height: var(--cosmos-spinner-size, 80px);
            width: 100%;
          }

          .spinner-outer {
            position: absolute;
            top: 50%;
            left: 50%;
            animation: spin 60s linear infinite;
          }

          .spinner-dot-container {
            position: absolute;
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg));
          }

          .spinner-dot {
            position: absolute;
            top: calc(var(--cosmos-spinner-size, 100px) * -0.5);
            background-color: var(--cosmos-spinner-color, var(--cosmos-color-primary-500, rgb(41, 170, 255)));
            width: var(--cosmos-spinner-dot-size, 15px);
            height: var(--cosmos-spinner-dot-size, 15px);
            border-radius: 50%;
            animation: bob 1s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.125s);
            transform: rotate(calc(var(--i) * 45deg));
          }

          .spinner-dot-shadow {
            position: absolute;
            top: calc(var(--cosmos-spinner-size, 100px) * -0.5);
            background-color: var(--cosmos-spinner-color, var(--cosmos-color-primary-600, rgb(37, 144, 215)));
            width: var(--cosmos-spinner-dot-size, 15px);
            height: var(--cosmos-spinner-dot-size, 15px);
            border-radius: 50%;
            animation: bob 1s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.125s + 0.05s);
            transform: rotate(calc(var(--i) * 45deg));
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes bob {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(calc(var(--cosmos-spinner-size, 100px) / 2 - var(--cosmos-spinner-dot-size, 15px)));
            }
            100% {
              transform: translateY(0);
            }
          }
        `}</style>
        {loading.value ? (
          <div part="spinner-container" role="presentation">
            <slot name="spinner">
              <div class="spinner-outer">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div class="spinner-dot-container" style={cssvars({ '--i': i })}>
                    <div class="spinner-dot-shadow" />
                    <div class="spinner-dot" />
                  </div>
                ))}
              </div>
            </slot>
          </div>
        ) : (
          <slot>Loaded content</slot>
        )}
      </>
    )
  },
});
