import type { Meta, StoryObj } from '@storybook/web-components';
import { Spinner } from './spinner.js';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { unindent } from '../../internals.js';

const meta: Meta<ComponentAttributes<typeof Spinner>> = {
  component: 'cosmos-spinner',
  title: 'Components/Spinner',
  argTypes: getArgTypes(Spinner, {
    size: {
      description: 'The size of the spinner.',
      defaultValue: 'md',
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
  args: {},
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-spinner />`),
      },
    },
  },
};

export const ExtraSmall: Story = {
  args: {
    size: 'xxs',
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-spinner size="xs" />`),
      },
    },
  },
};
