import type { Preview } from '@storybook/web-components';
import { registerCosmosSigners } from '@apophis-sdk/cosmos-signers';
import '../src/index.js';
import { mw } from '@apophis-sdk/core';
import { DefaultCosmWasmMiddlewares } from '@apophis-sdk/cosmwasm';

mw.use(...DefaultCosmWasmMiddlewares);
registerCosmosSigners(undefined);

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