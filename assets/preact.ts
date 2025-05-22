import type { Ref } from 'preact';
import type { CosmosElements } from './elements.js';
import type { CSSProperties } from 'preact/compat';

interface PreactIntrinsicAttrs {
  ref?: Ref<HTMLElement>;
  key?: string | number;
  class?: string;
  styles?: CSSProperties;
}

declare module 'preact/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements<PreactIntrinsicAttrs> {}
  }
}
