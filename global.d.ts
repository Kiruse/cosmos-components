import type { CosmosElements } from './dist/elements.js';

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements {}
  }
}

declare module 'preact/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements {}
  }
}
