import { NetworkConfig, signals } from '@apophis-sdk/core';
import { Coin } from '@apophis-sdk/core/types.sdk.js';
import { CosmosTxSignal } from '@apophis-sdk/cosmos';
import { Decimal } from '@kiruse/decimal';
import { ReadonlySignal, useComputed, useSignal, useSignalEffect } from '@preact/signals';
import { z } from 'zod';
import { css, defineComponent } from '../../webcomp.js';
import { modals } from '../modals/modals.js';

export const GasEstimate = defineComponent({
  name: 'cosmos-gas-estimate',
  attrs: {
    tx: z.instanceof(CosmosTxSignal),
  },
  render: ({ self, attrs: { tx } }) => {
    const network = useComputed(() => tx.value.network.value ?? signals.network.value!);
    const gas = useComputed(() => tx.value.estimate.value.gas?.amount);
    const first = useComputed(() => gas.value?.[0]);
    const hasMany = useComputed(() => (gas.value?.length ?? 0) > 1);
    const remain = useComputed(() => (gas.value?.length ?? 1) - 1);
    const error = useComputed(() => tx.value.estimate.value.error);

    const remainEl = useSignal<HTMLSpanElement | undefined>();

    useSignalEffect(() => {
      if (error.value) {
        self.classList.add('invalid');
      } else {
        self.classList.remove('invalid');
      }
    });

    useSignalEffect(() => {
      const _tx = tx.value;
      return _tx.start();
    });

    if (error.value) {
      return (
        <>
          <style>{styles}</style>
          <a href="#" onClick={e => {
            e.preventDefault();
            modals.showErrorModal(error.value);
          }}>
            Estimation error
          </a>
        </>
      );
    }

    if (!first.value) {
      return <cosmos-spinner size="xxs" />;
    }

    if (hasMany.value) {
      // TODO: add tooltip to show the additional gas estimates
      return (
        <>
          <style>{styles}</style>
          <span>
            <CoinEstimateSignal coin={first as ReadonlySignal<Coin>} network={network} />{' '}
            +<span ref={(el) => (remainEl.value = el ?? undefined)}>{remain}</span>
          </span>
        </>
      )
    }

    return (
      <>
        <style>{styles}</style>
        <span><CoinEstimateSignal coin={first as ReadonlySignal<Coin>} network={network} /></span>
      </>
    );
  },
});

function CoinEstimateSignal({ coin, network }: { coin: ReadonlySignal<Coin>, network: ReadonlySignal<NetworkConfig> }) {
  const asset = useComputed(() => findAsset(network.value, coin.value.denom));
  const amount = useComputed(() => {
    const decimals = asset.value?.display?.decimals ?? asset.value?.decimals ?? 6;
    return new Decimal(coin.value.amount, decimals);
  });
  const denom = useComputed(() => asset.value?.display?.symbol ?? asset.value?.denom ?? coin.value.denom);
  return <cosmos-balance value={amount} denom={denom} />;
}

function findAsset(network: NetworkConfig, denom: string) {
  switch (network.ecosystem) {
    case 'cosmos': {
      const asset = network.assets.find(a => a.denom === denom);
      if (!asset) return null;
      return asset;
    }
    default:
      return null;
  }
}

const styles = css`
  :host {
    font-family: var(--cosmos-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
  }
`;
