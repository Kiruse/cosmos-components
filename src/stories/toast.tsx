import { z } from "zod";
import { ComponentAttributes, css, defineComponent } from "../webcomp.js";

type ToastAttrs = ComponentAttributes<typeof def>;

const def = defineComponent({
  name: 'cosmos-toast',
  attrs: {
    /** Variant of the toast. Defaults to 'info'. */
    variant: z.optional(z.enum(['success', 'error', 'warning', 'info'])),
    /** Title of the toast. */
    title: z.string(),
    /** Message of the toast. */
    message: z.string(),
    /** Lifespan of the toast in seconds. Defaults to 5. */
    lifespan: z.optional(z.number()),
  },
  render: ({ attrs: { variant, title, message, lifespan } }) => {
    return (
      <div class="cosmos-toast">
        <div class="cosmos-toast-title">{title}</div>
        <div class="cosmos-toast-message">{message}</div>
      </div>
    );
  },
  css: css`
    #cosmos-toast-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: var(--cosmos-toast-z, 1000);
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
