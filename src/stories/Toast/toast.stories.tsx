import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { toast, Toast } from './toast.js';
import { unindent } from '../../internals.js';

const meta: Meta<ComponentAttributes<typeof Toast>> = {
  component: 'cosmos-toast',
  title: 'Components/Toast',
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
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-toast variant="info">This is an informational toast.</cosmos-toast>`),
      },
    },
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    content: 'This is a success toast.',
    lifespan: Infinity,
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-toast variant="success">This is a success toast.</cosmos-toast>`),
      },
    },
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    content: 'This is an error toast.',
    lifespan: Infinity,
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-toast variant="error">This is an error toast.</cosmos-toast>`),
      },
    },
  },
};

export const Warn: Story = {
  args: {
    variant: 'warn',
    content: 'This is a warning toast.',
    lifespan: Infinity,
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-toast variant="warn">This is a warning toast.</cosmos-toast>`),
      },
    },
  },
};

export const SpawnToast: Story = {
  render: () => {
    return html`
      <button @click="${() => {
        toast.info('This is an informational toast.', {});
      }}">Spawn toast</button>
    `;
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`<button onClick={() => toast.info('This is an informational toast.', {})}>Spawn toast</button>`),
      },
    },
  },
};

export const ErrorLink: Story = {
  render: () => {
    return html`
      <button @click="${() => toast.errorlink('This is a dummy error', { message: 'Failed to connect wallet.' })}">Spawn error link toast</button>
    `;
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`<button onClick={() => toast.errorlink('This is a dummy error', { message: 'Failed to connect wallet.' })}>Spawn error link toast</button>`),
      },
    },
  },
};