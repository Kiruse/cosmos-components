import { trimAddress } from "@apophis-sdk/core";
import { useComputed } from "@preact/signals";
import { z } from "zod";
import { css, defineComponent } from "./webcomp.js";

defineComponent({
  name: 'cosmos-address',
  attrs: {
    value: z.string(),
    bech32prefix: z.optional(z.string()),
    trimsize: z.optional(z.number()),
  },
  render({ attrs: { bech32prefix, ...attrs } }) {
    const value = useComputed(() => {
      let val = attrs.value.value;
      const prefix = bech32prefix.value ?? '';
      const trimsize = attrs.trimsize.value ?? 6;
      console.log(prefix, val, trimsize);
      if (prefix && val.startsWith(prefix + '1')) val = val.slice(prefix.length + 1);
      val = trimAddress(val, trimsize);
      if (prefix) val = `${prefix}1${val}`;
      return val;
    });

    return (
      <span class="cosmos-address">
        {value}
      </span>
    );
  },
  css: css`
    cosmos-address {
      display: inline-block;
      font-family: monospace;
    }
  `
});
