import { z } from "zod";
import { defineComponent } from "../../webcomp.js";

export const WalletModal = defineComponent({
  name: 'cosmos-modal-wallet',
  attrs: {
    error: z.any(),
  },
  render({ attrs: { error } }) {
    return (
      <>
        <div class="title-container">
          <slot name="title"><h1>Connect your wallet</h1></slot>
        </div>
        <div class="content">

        </div>
      </>
    );
  },
});
