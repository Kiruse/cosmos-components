import { Address } from './stories/Address/address.js';
import { Balance } from './stories/Balance/balance.js';
import { ConnectBoundary } from './stories/ConnectBoundary/connect-boundary.js';
import { LoadingWrapper } from './stories/LoadingWrapper/loading-wrapper.js';
import { Toast } from './stories/Toast/toast.js';
import { Tooltip } from './stories/Tooltip/tooltip.js';

type Ctor = new (...args: any[]) => HTMLElement;

type ComponentRecord = {
  name: string;
  Component: Ctor;
}

/** The builder class managing which Cosmos Components to register.
 * Once custom elements have been registered with the browser they
 * cannot be unregistered. By default, this class will register all
 * Cosmos Components. You can call this class' methods to choose
 * which components to register. Components you choose not to register
 * will need to be provided by your own code.
 */
export class CosmosComponents {
  static readonly defaultComponents: ComponentRecord[] = [
    Address,
    Balance,
    ConnectBoundary,
    LoadingWrapper,
    Toast,
    Tooltip,
  ];

  constructor(public readonly components: ComponentRecord[]) {}

  register() {
    for (const component of this.components) {
      customElements.define(component.name, component.Component);
    }
  }

  without(...names: string[]) {
    return new CosmosComponents(this.components.filter(c => !names.includes(c.name)));
  }

  with(name: string, component: Ctor) {
    return new CosmosComponents([...this.components, { name, Component: component }]);
  }

  /** Create a builder instance with all Cosmos Components. You can
   * further add or remove components using its methods.
   */
  static default() {
    return new CosmosComponents(this.defaultComponents);
  }

  /** Shorthand for `CosmosComponents.default().register()`. */
  static register() {
    return CosmosComponents.default().register();
  }
}
