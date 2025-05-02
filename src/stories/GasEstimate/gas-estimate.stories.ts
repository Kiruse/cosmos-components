import { CosmosNetworkConfig, signals } from '@apophis-sdk/core';
import { Bank, Cosmos } from '@apophis-sdk/cosmos';
import { computed } from '@preact/signals';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unindent } from '../../internals.js';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { GasEstimate } from './gas-estimate.js';

const meta: Meta<ComponentAttributes<typeof GasEstimate>> = {
  component: 'cosmos-gas-estimate',
  title: 'Components/GasEstimate',
  argTypes: getArgTypes(GasEstimate, {
    tx: {
      description: 'Required. Transaction Signal object which contains the gas estimate signal. Can be obtained through `Cosmos.signalTx` helper.',
    },
  }),
  parameters: {
    layout: 'centered',
  },
  args: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => {
    const msgs = computed(() => signals.address.value ? [new Bank.Send({
      fromAddress: signals.address.value,
      toAddress: signals.address.value,
      amount: [Cosmos.coin(1n, (signals.network.value as CosmosNetworkConfig).gas[0].asset.denom)],
    })] : []);

    const tx = Cosmos.signalTx(msgs);
    return html`<cosmos-gas-estimate .tx="${tx}" />`;
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`
          const msgs = useComputed(() => signals.address.value ? [new Bank.Send({
            fromAddress: signals.address.value,
            toAddress: signals.address.value,
            amount: [Cosmos.coin(1n, (signals.network.value as CosmosNetworkConfig).gas[0].asset.denom)],
          })] : [])

          const tx = useMemo(() => Cosmos.signalTx(msgs), [msgs]);

          return <cosmos-gas-estimate tx={tx} />;
        `),
      },
    },
  },
};
