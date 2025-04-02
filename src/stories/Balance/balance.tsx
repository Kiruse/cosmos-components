import { Decimal } from "@kiruse/decimal";
import { useComputed } from "@preact/signals";
import { z } from "zod";
import { css, defineComponent } from "../../webcomp.js";

export const Balance = defineComponent({
  name: 'balance',
  attrs: {
    /** Stringified value of the balance. The value should be a float with corresponding decimals. */
    value: z.union([z.instanceof(Decimal), z.number(), z.bigint()]),
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
        <span class="cosmos-balance-value">{displayValue}</span>{' '}
        <span class="cosmos-balance-denom">{denom}</span>
      </>
    );
  },

  css: css`
    cosmos-balance {
      font-family: var(--cosmos-font-monospace, monospace);

      .cosmos-balance-value {
        text-align: right;
      }

      .cosmos-balance-denom {
        text-align: left;
      }
    }
  `,
});
