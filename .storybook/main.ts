import type { StorybookConfig } from '@storybook/web-components-vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  "framework": {
    "name": "@storybook/web-components-vite",
    "options": {}
  },
  "viteFinal": async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '~': path.resolve(__dirname, '../src'),
        },
      },
    };
  },
};
export default config;