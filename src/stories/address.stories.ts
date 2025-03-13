import type { Meta, StoryObj } from '@storybook/web-components';
import { AddressAttributes } from './address.js';

const meta: Meta<AddressAttributes> = {
  component: 'cosmos-address',
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    bech32prefix: { control: 'text' },
    trimsize: { control: 'number' },
  },
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
};
