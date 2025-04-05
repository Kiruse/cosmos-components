import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { getNetworks, unindent } from '../../internals.js';
import { UserAddress } from './user-address.js';
import { modals } from '../modals/modals.js';

const meta: Meta<ComponentAttributes<typeof UserAddress>> = {
  component: 'cosmos-user-address',
  title: 'Components/UserAddress',
  argTypes: getArgTypes(UserAddress, {}),
  parameters: {
    layout: 'centered',
  },
  args: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <cosmos-user-address>
      <span
        slot="not-connected"
        @click="${async () => modals.showWalletModal(await getNetworks())}"
        style="cursor: pointer; text-decoration: underline; text-decoration-style: dotted;"
      >
        Connect wallet
      </span>
    </cosmos-user-address>
  `,
  parameters: {
    docs: {
      source: {
        code: unindent(`<cosmos-user-address>
          <span slot="not-connected" onClick=${async () => modals.showWalletModal(await getNetworks())}>
            Connect wallet
          </span>
        </cosmos-user-address>`),
      },
    },
  },
};
