import { useComputed } from '@preact/signals';
import { z } from "zod";
import { useHostClassSwitch } from '../../hooks/useHostClassSwitch.js';
import { cssvars } from "../../internals.js";
import { css, defineComponent } from "../../webcomp.js";

declare module 'preact/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'cosmos-spinner': {
        size?: 'xxs' | 'md';
      };
    }
  }
}

export const Spinner = defineComponent({
  name: 'cosmos-spinner',
  attrs: {
    size: z.enum(['xxs', 'md']).optional(),
  },
  render({ self, attrs: { size } }) {
    const cls = useComputed(() => size.value ?? 'md');
    useHostClassSwitch(self, ['xxs', 'md'], cls);

    return (
      <>
        <style>{styles}</style>
        <div part="container" role="presentation">
          <div class="outer">
            {Array.from({ length: 4 }).map((_, i) => (
              <>
                <div class="dot-container" style={cssvars({ '--i': i })}>
                  <div class="dot" />
                </div>
              </>
            ))}
          </div>
        </div>
      </>
    );
  },
});

const styles = css`
  :host {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--cosmos-spinner-size, 80px);
    min-height: var(--cosmos-spinner-size, 80px);
    width: 100%;
  }

  :host(.xxs) {
    --cosmos-spinner-size: 16px;
    --cosmos-spinner-dot-size: 4px;
  }

  .outer {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .dot-container {
    position: absolute;
    transform: translate(-50%, -50%);
    animation: spin 1s ease-in-out infinite;
    animation-delay: calc(var(--i) / 4 * 1s);
    &.shadow {
      animation-delay: calc(var(--i) / 4 * 1s + 0.05s);
    }
  }

  .dot {
    position: absolute;
    top: calc(var(--cosmos-spinner-size, 80px) * -0.5);
    background-color: var(--cosmos-spinner-color, var(--cosmos-color-primary-500, rgb(41, 170, 255)));
    width: var(--cosmos-spinner-dot-size, 15px);
    height: var(--cosmos-spinner-dot-size, 15px);
    border-radius: 50%;
    transform: translate(-50%, 0);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
