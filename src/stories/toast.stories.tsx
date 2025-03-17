import type { Meta, StoryObj } from '@storybook/web-components';
import { getArgTypes } from '~/story-helpers.js';
import { ComponentAttributes } from '~/webcomp.js';
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
    message: {
      description: 'Toast content.',
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
    message: 'This is an informational toast.',
    lifespan: Infinity,
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'This is a success toast.',
    lifespan: Infinity,
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    message: 'This is an error toast.',
    lifespan: Infinity,
  },
};

export const Warn: Story = {
  args: {
    variant: 'warn',
    message: 'This is a warning toast.',
    lifespan: Infinity,
  },
};
