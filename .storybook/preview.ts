import type { Preview } from '@storybook/web-components';
import { registerCosmosSigners, WalletConnectCosmosSigner } from '@apophis-sdk/cosmos-signers';
import '../src/index.js';
import { mw, signals, Signer } from '@apophis-sdk/core';
import { DefaultCosmWasmMiddlewares } from '@apophis-sdk/cosmwasm';
import './global.css';
import { CosmosComponents, reconnectSigner } from '../src/index.js';
import { getNetworks } from '../src/internals.js';

mw.use(...DefaultCosmWasmMiddlewares);
// this should be one line, but it's bugged in 0.3-rc.1
registerCosmosSigners('21fa99318b912ecc1f79f0abf3c85ee5');

CosmosComponents.register();

getNetworks().then(networks => {
  reconnectSigner(networks);
  signals.network.value = networks[0];
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;