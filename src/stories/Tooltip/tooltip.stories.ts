import type { Meta, StoryObj } from '@storybook/web-components';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { Tooltip } from './tooltip.js';

const meta: Meta<ComponentAttributes<typeof Tooltip>> = {
  component: 'cosmos-tooltip',
  title: 'Components/Tooltip',
  argTypes: getArgTypes(Tooltip, {}),
  args: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
};