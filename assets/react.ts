import type { CSSProperties, Ref } from 'react';
import type { CosmosElements } from './elements.js';

interface ReactIntrinsicProps {
  ref?: Ref<HTMLElement>;
  key?: string | number;
  className?: string;
  style?: CSSProperties;
}

declare global {
  // For older versions of React
  namespace JSX {
    interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
  }

  // For `jsx: 'preserve'` e.g. Next.js
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
    }
  }
}

// For React 17+
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements<ReactIntrinsicProps> {}
  }
}
