import type { Meta, StoryObj } from '@storybook/web-components';
import { Address, AddressAttributes } from './address.js';
import { getArgTypes } from '../../story-helpers.js';

const meta: Meta<AddressAttributes> = {
  component: 'cosmos-address',
  title: 'Components/Address',
  argTypes: getArgTypes(Address, {
    value: {
      description: 'The actual address value.',
    },
    bech32prefix: {
      description: 'An optional Bech32 prefix, if applicable.',
    },
    trimsize: {
      defaultValue: 6,
      description: 'Number of characters to trim down on both sides to, excluding the Bech32 prefix if specified.',
    },
  }),
  args: {
    value: 'neutron1jqz2205er0d8657ugll98c462cyplkcqmjthzv',
    bech32prefix: 'neutron',
    trimsize: undefined,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 'neutron1jqz2205er0d8657ugll98c462cyplkcqmjthzv',
    bech32prefix: 'neutron',
  },
  parameters: {
    docs: {
      source: {
        code: '<cosmos-address value="neutron1jqz2205er0d8657ugll98c462cyplkcqmjthzv" bech32prefix="neutron" />',
      },
    },
  },
};
