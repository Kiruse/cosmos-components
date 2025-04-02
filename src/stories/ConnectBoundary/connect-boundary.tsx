import { useComputed, useSignalEffect } from "@preact/signals";
import { defineComponent } from "../../webcomp.js";
import { signals, Signer } from "@apophis-sdk/core";
import { z } from "zod";

export const ConnectBoundary = defineComponent({
  name: 'cosmos-connect-boundary',
  attrs: {
    'is-logged-in': z.boolean().optional(),
  },
  events: {
    connected: z.custom<Signer>(),
  },
  render: ({ self, attrs: { 'is-logged-in': isLoggedIn } }) => {
    const isConnected = useComputed(() => !!signals.signer.value);

    useSignalEffect(() => {
      self.classList.remove('connected', 'disconnected');
      self.classList.add(isConnected.value ? 'connected' : 'disconnected');
      if (isConnected.value) {
        self.dispatchEvent(new CustomEvent('connected', { detail: signals.signer.value }));
      }
    });

    if (!isConnected.value) {
      return <slot name="connect" />;
    }

    if (isLoggedIn.value !== undefined && isLoggedIn.value !== null && !isLoggedIn.value) {
      return <slot name="login" />;
    }

    return <slot name="content" />;
  },
});
