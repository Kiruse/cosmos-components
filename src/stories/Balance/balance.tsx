import { Decimal } from "@kiruse/decimal";
import { ReadonlySignal, useComputed } from "@preact/signals";
import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";

declare module 'preact/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      'cosmos-balance': {
        value: Decimal | string | number | ReadonlySignal<Decimal | string | number>;
        denom: string | ReadonlySignal<string>;
        decimals?: number | ReadonlySignal<number>;
      };
    }
  }
}

export const Balance = defineComponent({
  name: 'balance',
  attrs: {
    /** Stringified value of the balance. The value should be a float with corresponding decimals. */
    value: z.union([z.instanceof(Decimal), z.number(), z.string()]),
    /** Denomination to show */
    denom: z.string(),
    /** Number of decimals to show (NOT the decimals of the denom). Defaults to 3. */
    decimals: z.optional(z.number()),
  },
  render: ({ attrs: { value, denom, decimals } }) => {
    const displayValue = useComputed(() =>
      Intl.NumberFormat().format(
        parseFloat(Decimal.parse(value.value).rebase(decimals.value ?? 3).toString())
      )
    );

    return (
      <>
        <style>{css`
          :host {
          font-family: var(--cosmos-font-monospace, monospace);

          cosmos-balance::part(value) {
            text-align: right;
          }

          cosmos-balance::part(denom) {
            text-align: left;
          }
        }`}</style>
        <span part="value">{displayValue}</span>{' '}
        <span part="denom">{denom}</span>
      </>
    );
  },
});
