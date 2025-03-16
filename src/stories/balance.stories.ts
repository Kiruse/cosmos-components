import type { Meta, StoryObj } from '@storybook/web-components';
import _ from 'lodash';
import { Balance } from './balance.js';
import { getArgTypes } from '~/story-helpers.js';
import { ComponentAttributes } from '~/webcomp.js';

const meta: Meta<ComponentAttributes<typeof Balance>> = {
  component: 'cosmos-balance',
  tags: ['autodocs'],
  argTypes: _.merge(getArgTypes(Balance), {
    value: {
      description: 'Required. The balance value to display.',
    },
    denom: {
      description: 'Required. Denomination to show for the balance.',
    },
    decimals: {
      description: 'Number of decimal places to display.',
      defaultValue: 3,
    },
  }),
  args: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 100.123456789,
    denom: 'NTRN',
  },
};
