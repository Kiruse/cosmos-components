import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getArgTypes } from '../../story-helpers.js';
import { ComponentAttributes } from '../../webcomp.js';
import { ConnectBoundary } from './connect-boundary.js';
import { modals } from '../modals/modals.js';
import { getNetworks, unindent } from '../../internals.js';

const meta: Meta<ComponentAttributes<typeof ConnectBoundary>> = {
  component: 'cosmos-connect-boundary',
  title: 'Components/ConnectBoundary',
  argTypes: getArgTypes(ConnectBoundary, {}),
  args: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => html`
    <cosmos-connect-boundary>
      <div slot="content">
        Thank you for connecting your wallet!
      </div>
      <div slot="connect">
        <button @click="${async () => modals.showWalletModal(await getNetworks())}">Connect your Wallet</button>
      </div>
    </cosmos-connect-boundary>
  `,
  parameters: {
    docs: {
      source: {
        code: unindent(`
          <cosmos-connect-boundary>
            <div slot="content">
              Thank you for connecting your wallet!
            </div>
            <div slot="connect">
              <button onClick={() => modals.showWalletModal(networks)}>Connect your Wallet</button>
            </div>
          </cosmos-connect-boundary>
        `),
      },
    },
  },
};
