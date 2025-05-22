import type { CSSProperties, Ref } from 'react';
import type { CosmosElements } from './elements.js';

interface ReactIntrinsicProps {
  ref?: Ref<HTMLElement>;
  key?: string | number;
  className?: string;
  style?: CSSProperties;
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
  }
}
