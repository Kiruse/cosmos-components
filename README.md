# Kiru's Cosmos Components
This project is a personal R&D effort for the development of generalized [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) that can be imported into any arbitrary frontend system, including a vanilla HTML/CSS/JS website, with minimal effort and build steps. As of the time of this writing, the experiment is promising, requiring 1 import to get started and no additional build steps.

## Usage
There two ways to use this library: As part of a more complex frontend framework such as React or Vue, or standalone directly in your browser via ESModules.

### Frontend Frameworks
To use as part of a larger frontend framework, install via your favorite package manager's equivalent of:

```bash
npm install @kiruse/cosmos-components
```

Then, simply import near your app root:

```ts
import '@kiruse/cosmos-components';
```

This will make it available as web components that you can use directly in JSX. All these components use the 'cosmos-' prefix.

### Vanilla ESM
You may also load it directly in your browser to write a plain HTML/CSS/JS website:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My new Cosmos Dapp</title>
    <script src="https://esm.sh/@kiruse/cosmos-components"></script>
  </head>
  <body>
    <p>My address is <cosmos-address value="cosmos123..." bech32prefix="cosmos" /></p>
  </body>
</html>
```

This makes it easy to get started prototyping Dapps while retaining the possibility of migrating to any more complex frontend framework of your choice!

## Components
The components are documented with storybook: https://cosmos-components.kiruse.dev

## Signals
I really like [Signals](https://preactjs.com/guide/v10/signals/). You can pass signals to the web components' properties (not attributes!) to have the component use them directly and benefit from performance improvements. Simultaneously, signals can also be used to pass values back out of the web components, as opposed to using event listeners. This can simplify your processes.

However, take caution not to switch between usage of signals or no usage of signals, as internal component state will desync.

## Contributing & Building
The build process consists of three parts:

1. Library
2. Metadata & Type Declarations
3. Storybook

All can be triggered with the `bun run build` and `bun dev` commands.

We generate metadata & type declarations from exports of components in the `src/stories` folder. For simplicity, all components must follow the following pattern:

```ts
import { css, defineComponent } from '../webcomp.js';

export const Component = defineComponent({
  name: 'component',
  attrs: {
    // define attrs here
  },
  render: ({ attrs }) => {
    // render the component
  },
  css: css`// stylesheet`,
});
```

If the component does not follow this pattern, the build script will fail to detect it.

## Roadmap
- [ ] More components
- [ ] Build script for .d.ts from sources for JSX support
- [ ] Build script for [`custom-elements.json` metadata](https://github.com/webcomponents/custom-elements-manifest)
