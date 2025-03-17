import { useComputed, useSignalEffect } from "@preact/signals";
import { z } from "zod";
import { ComponentAttributes, css, defineComponent } from "../webcomp.js";

type ToastAttrs = ComponentAttributes<typeof Toast>;

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
    title: z.string(),
    /** Message of the toast. */
    message: z.string(),
    /** Lifespan of the toast in seconds. Defaults to 5. */
    lifespan: z.optional(z.number()),
  },
  render: ({ self, attrs: { variant, message, lifespan, ...attrs } }) => {
    const title = useComputed(() => attrs.title.value || getDefaultTitle(variant.value ?? 'info'));

    useSignalEffect(() => {
      self.classList.remove('success', 'error', 'warning', 'info');
      self.classList.add(variant.value ?? 'info');

      if (lifespan.value && lifespan.value !== Infinity) {
        setTimeout(() => {
          self.remove();
        }, lifespan.value * 1000);
      }
    });

    return (
      <>
        <div class="cosmos-toast-title">{typeof title.value === 'string' ? <h3>{title.value}</h3> : title.value}</div>
        <div class="cosmos-toast-message">{message}</div>
      </>
    );
  },
  css: css`
    #cosmos-toast-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;
      gap: var(--cosmos-toast-gap, 16px);
      position: fixed;
      bottom: var(--cosmos-toast-offset, 16px);
      right: var(--cosmos-toast-offset, 16px);
      z-index: var(--cosmos-toast-z, 1000);
    }

    cosmos-toast {
      --cosmos-toast-line-color: rgb(42, 178, 255);

      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-width: 260px;
      max-width: 400px;
      border-radius: 4px;
      padding: 4px;
      color:rgb(200, 197, 219);
      background: var(--cosmos-toast-bg,rgb(49, 48, 54));
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-size: 12px;
      line-height: 1.2;

      h1, h2, h3, h4, h5, h6 {
        color: var(--cosmos-toast-line-color);
        margin: 0;
        margin-bottom: 4px;
      }

      &.success {
        --cosmos-toast-line-color:rgb(49, 187, 30);
      }
      &.error {
        --cosmos-toast-line-color:rgb(244, 27, 27);
      }
      &.warn {
        --cosmos-toast-line-color: #FF9800;
      }
    }
  `,
});

export namespace toast {
  export function show(attrs: ToastAttrs) {
    const toast = document.createElement('cosmos-toast');
    let container = document.getElementById('cosmos-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cosmos-toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(toast);
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
