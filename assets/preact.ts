import { CosmosElements } from './elements.js';

declare module 'preact/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CosmosElements {}
  }
}
