import { signals } from "@apophis-sdk/core";
import { css, defineComponent } from "../../webcomp.js";

export const UserAddress = defineComponent({
  name: 'cosmos-user-address',
  attrs: {},
  render({ self }) {
    if (signals.address.value) {
      return (
        <cosmos-address value={signals.address.value} bech32prefix={signals.network.value?.bech32prefix} />
      );
    } else {
      return (
        <>
          <style>{css`
            span {
              display: inline-block;
              font-family: monospace;
              font-style: italic;
            }
          `}</style>
          <slot name="not-connected">
            <span>No wallet connected</span>
          </slot>
        </>
      );
    }
  },
})
