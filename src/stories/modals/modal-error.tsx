import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";
import { useComputed, useSignalEffect } from "@preact/signals";
import './modal-base.js';

export type ErrorFormatter = (error: any) => string | HTMLElement | undefined;

export const ErrorModal = defineComponent({
  name: 'cosmos-modal-error',
  attrs: {
    error: z.any(),
  },
  render({ self, attrs: { error } }) {
    const formattedError = useComputed(() => formatError(error.value));
    const errorString = useComputed(() => typeof formattedError.value === 'string' ? formattedError.value : undefined);

    useSignalEffect(() => {
      const v = formattedError.value;
      if (typeof v === 'string') return;

      const existing = self.querySelector('[slot="details"]');
      if (existing) {
        existing.remove();
      }

      v.setAttribute('slot', 'details');
      self.appendChild(v);
    });

    return (
      <>
        <style>{css`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          /* This is the default title slot. Slots are reflected, so these styles don't affect slotted elements. */
          h2 {
            color: rgb(200, 197, 219);
            margin: 0;
            font-weight: normal;
          }
        `}</style>
        <cosmos-modal-base>
          <slot name="title" slot="header"><h2>Error</h2></slot>
          <slot name="details" slot="content"><pre>{errorString}</pre></slot>
        </cosmos-modal-base>
      </>
    )
  },
});

var formatters: ErrorFormatter[] = [];
export function formatError(error: any) {
  for (const formatter of formatters) {
    const formatted = formatter(error);
    if (formatted) {
      return formatted;
    }
  }

  if (typeof error === 'string') {
    return error;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return JSON.stringify(error, null, 2);
  }
}

export namespace formatError {
  export function addFormatters(...newFormatters: ErrorFormatter[]) {
    formatters.push(...newFormatters);
    return () => {
      for (const formatter of newFormatters) {
        const idx = formatters.findIndex(formatter);
        if (idx !== -1) {
          formatters.splice(idx, 1);
        }
      }
    };
  }
}
