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
Following is a list of all components registered by this library:

- `cosmos-address` is a utlity to standardize display of lengthy Web3 addresses. It also supports aliasing through various sources of custom address books!

## Roadmap
- [ ] More components
- [ ] Build script for .d.ts from sources for JSX support
