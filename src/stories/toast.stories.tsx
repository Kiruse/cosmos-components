import type { Meta, StoryObj } from '@storybook/web-components';
import { getArgTypes } from '../story-helpers.js';
import { ComponentAttributes } from '../webcomp.js';
import { toast, Toast } from './toast.js';

const meta: Meta<ComponentAttributes<typeof Toast>> = {
  component: 'cosmos-toast',
  tags: ['autodocs'],
  argTypes: getArgTypes(Toast, {
    variant: {
      description: 'Toast variant.',
      defaultValue: 'info',
    },
    title: {
      description: 'Toast title. When omitted, corresponds to the variant.',
    },
    lifespan: {
      description: 'Toast lifespan in seconds.',
      defaultValue: 5,
    },
  }),
  args: {},
};

export default meta;
type Story = StoryObj;

export const Info: Story = {
  args: {
    variant: 'info',
    content: 'This is an informational toast.',
    lifespan: Infinity,
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    content: 'This is a success toast.',
    lifespan: Infinity,
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    content: 'This is an error toast.',
    lifespan: Infinity,
  },
};

export const Warn: Story = {
  args: {
    variant: 'warn',
    content: 'This is a warning toast.',
    lifespan: Infinity,
  },
};
