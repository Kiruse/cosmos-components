import { useComputed } from "@preact/signals";
import { z } from "zod";
import { animate, ComponentAttributes, css, defineComponent } from "../../webcomp.js";
import { useEffect } from "preact/hooks";
import { modals } from "../modals/modals.js";
import { useHostClassSwitch } from '../../hooks/useHostClassSwitch.js';

export type ToastAttributes = ComponentAttributes<typeof Toast>;

declare global {
  interface Window {
    toast: typeof toast;
  }
}

export const Toast = defineComponent({
  name: 'cosmos-toast',
  attrs: {
    /** Variant of the toast. Defaults to 'info'. */
    variant: z.optional(z.enum(['success', 'error', 'warn', 'info'])),
    /** Title of the toast. */
    title: z.optional(z.string()),
    /** Lifespan of the toast in seconds. Defaults to 5. */
    lifespan: z.optional(z.number()),
  },
  render: ({ self, attrs: { variant, lifespan, ...attrs } }) => {
    const title = useComputed(() => attrs.title.value || getDefaultTitle(variant.value ?? 'info'));

    const cls = useComputed(() => variant.value ?? 'info');
    useHostClassSwitch(self, ['success', 'error', 'warning', 'info'], cls);

    useEffect(() => {
      const lifespanEl = self.shadowRoot?.querySelector('.lifespan') as HTMLElement;
      let lifespanAnim: ReturnType<typeof animate> | undefined;
      if (!lifespanEl) return;

      (async () => {
        const fadeAnim = animate(self, [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 1, transform: 'scale(1)' },
        ], { duration: 200 });
        await fadeAnim.play();

        lifespanAnim = animate(lifespanEl, [
          { transform: 'scaleX(1)' },
          { transform: 'scaleX(0)' },
        ], { duration: (lifespan.value ?? 5) * 1000 });
        await lifespanAnim.play();

        await fadeAnim.reverse();
        self.remove();
      })();

      const listener = (e: MouseEvent) => {
        if (self.contains(e.target as HTMLElement)) {
          lifespanAnim?.pause();
        } else {
          lifespanAnim?.play();
        }
      };

      document.body.addEventListener('mousemove', listener);
      return () => {
        document.body.removeEventListener('mousemove', listener);
      };
    }, []);

    return (
      <>
        <style>{css`
          :host {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            min-width: 260px;
            max-width: 400px;
            border: 1px solid var(--color);
            border-radius: 4px;
            padding: 4px;
            color:rgb(200, 197, 219);
            background: var(--cosmos-toast-bg,rgb(49, 48, 54));
            box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.25);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: var(--cosmos-base-font-size, 12px);
            line-height: 1.2;
            opacity: 0;
          }

          h1, h2, h3, h4, h5, h6 {
            color: var(--color);
            margin: 0;
            margin-bottom: 4px;
          }

          .lifespan {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--color);
          }
        `}</style>
        <div class="title">{typeof title.value === 'string' ? <h3>{title.value}</h3> : title.value}</div>
        <div class="content">
          <slot name="content">Toast content</slot>
        </div>
        <div class="lifespan" />
      </>
    );
  },

  css: css`
    #cosmos-toast-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;
      gap: calc(var(--cosmos-spacing, 8px) * 2);
      position: fixed;
      bottom: calc(var(--cosmos-spacing, 8px) * 2);
      right: calc(var(--cosmos-spacing, 8px) * 2);
      z-index: var(--cosmos-toast-z, 1000);
    }

    cosmos-toast {
      --color: rgb(42, 178, 255);
      &.success {
        --color:rgb(49, 187, 30);
      }
      &.error {
        --color:rgb(244, 27, 27);
      }
      &.warn {
        --color: #FF9800;
      }
    }
  `,
});

export namespace toast {
  export function show(content: HTMLElement | string, attrs: ToastAttributes) {
    const toast = document.createElement('cosmos-toast');
    Object.assign(toast, attrs);

    let child: HTMLElement;
    if (typeof content === 'string') {
      child = document.createElement('span');
      child.textContent = content;
    } else {
      child = content;
    }
    child.setAttribute('slot', 'content');
    toast.appendChild(child);

    let container = document.getElementById('cosmos-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cosmos-toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(toast);
  }

  export const info    = (content: HTMLElement | string, attrs: Omit<ToastAttributes, 'variant'> = {}) => show(content, { ...attrs, variant: 'info' });
  export const success = (content: HTMLElement | string, attrs: Omit<ToastAttributes, 'variant'> = {}) => show(content, { ...attrs, variant: 'success' });
  export const error   = (content: HTMLElement | string, attrs: Omit<ToastAttributes, 'variant'> = {}) => show(content, { ...attrs, variant: 'error' });
  export const warn    = (content: HTMLElement | string, attrs: Omit<ToastAttributes, 'variant'> = {}) => show(content, { ...attrs, variant: 'warn' });

  /** A variation of the error toast with a short message and a link to open a `cosmos-modal-error` containing the error details. */
  export function errorlink(error: any, { message, ...attrs }: Omit<ToastAttributes, 'variant'> & { message?: string } = {}) {
    const id = Math.random().toString(36).slice(2);
    const link = document.createElement('a');
    link.id = id;
    link.href = `#${id}`;
    link.textContent = 'See details.';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      modals.showErrorModal(error);
    });
    link.style.color = 'cornflowerblue';

    const span = document.createElement('span');
    span.appendChild(document.createTextNode((message ?? 'An error occurred.') + ' '));
    span.appendChild(link);
    return toast.error(span, attrs);
  }
}

if (typeof window !== 'undefined') {
  window.toast = toast;
}

function getDefaultTitle(variant: string) {
  switch (variant) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'warn':
      return 'Warning';
    default:
      return 'Info';
  }
}
