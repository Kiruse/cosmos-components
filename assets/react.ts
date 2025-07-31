import type { CSSProperties, Ref } from 'react';
import type { CosmosElements } from './elements.js';

interface ReactIntrinsicProps {
  ref?: Ref<HTMLElement>;
  key?: string | number;
  className?: string;
  style?: CSSProperties;
}

// For older versions of React
declare namespace JSX {
  interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
}

// For React 17+
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
  }
}

// For `jsx: 'preserve'` e.g. Next.js
declare namespace React {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
  }
}
