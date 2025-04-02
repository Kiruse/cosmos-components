import type { Meta, StoryObj } from '@storybook/web-components';
import { LoadingWrapper } from './loading-wrapper.js';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { unindent } from '../../internals.js';

const meta: Meta<ComponentAttributes<typeof LoadingWrapper>> = {
  component: 'cosmos-loading-wrapper',
  title: 'Components/LoadingWrapper',
  argTypes: getArgTypes(LoadingWrapper, {
    loading: {
      description: 'Required. Whether to show the loading indicator or the actual content.',
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
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      source: {
        code: unindent(`
          <cosmos-loading-wrapper loading>
            Content
          </cosmos-loading-wrapper>
        `),
      },
    },
  },
};
