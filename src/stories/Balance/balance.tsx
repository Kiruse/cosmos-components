import { Decimal } from "@kiruse/decimal";
import { ReadonlySignal, useComputed, useSignal } from "@preact/signals";
import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";
import { useTooltip } from '../../hooks/useTooltip.js';

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
    const valueEl = useSignal<HTMLSpanElement | undefined>();

    const displayValue = useComputed(() => {
      const decimal = Decimal.parse(value.value);
      if (decimal.lt(new Decimal(1000, 6))) {
        return '<' + Intl.NumberFormat().format(0.001000);
      }
      return Intl.NumberFormat(undefined, { maximumFractionDigits: decimals.value ?? 3 })
        .format(decimal.toString() as `${number}`);
    });

    const longDisplayValue = useComputed(() =>
      Intl.NumberFormat(undefined, { maximumFractionDigits: 10 })
        .format(Decimal.parse(value.value).toString() as `${number}`)
    );

    useTooltip(valueEl, <span class="cosmos-balance-long">Exact: <>{longDisplayValue}</> <>{denom}</></span>, { shadow: 'none' });

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
        <span part="value" ref={el => (valueEl.value = el ?? undefined)}>{displayValue}</span>{' '}
        <span part="denom">{denom}</span>
      </>
    );
  },
  css: css`
    .cosmos-balance-long {
      font-family: var(--cosmos-font-monospace, monospace);
    }
  `,
});
