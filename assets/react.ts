import { CosmosElements } from './elements.js';

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements {}
  }
}
