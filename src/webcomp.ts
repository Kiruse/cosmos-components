import { DecimalMarshalUnit } from '@kiruse/decimal/marshal';
import { extendDefaultMarshaller } from '@kiruse/marshal';
import { Event as TypedEvent } from '@kiruse/typed-events';
import { Signal, signal } from '@preact/signals';
import { h, render } from 'preact';
import { ComponentType } from 'preact/compat';
import zod from 'zod';

const defaultMarshaller = extendDefaultMarshaller([
  DecimalMarshalUnit,
]);

type Ctor = new (...args: any[]) => HTMLElement;
type InstanceOf<T> = T extends new (...args: any[]) => infer R ? R : never;

export type AttrDefinition = Record<string, zod.ZodSchema>;

export interface WebComponentOptions<T extends AttrDefinition, E extends EventDefinition = {}> {
  name: string;
  attrs: T;
  /** Whether to use the Shadow DOM. Defaults to `'open'`. Set to `'none'` to disable the Shadow DOM, but beware of CSS scoping issues. */
  shadow?: 'none' | 'open' | 'closed';
  render: ComponentType<WebComponentProps<T>>;
  /** When not using the Shadow DOM, you can use the `css` option to inject CSS into the document head. */
  css?: string;
  /** General purpose unmarshal function for attributes. By default, we use my other `@kiruse/marshal` package. */
  unmarshal?(value: any): any;
  /** Event definitions for this component. Each key defines a property that can be set with an event handler. */
  events?: E;
}

export interface WebComponentProps<T extends AttrDefinition> {
  /** Light root or shadow root of this component instance, depending on the `shadow` option passed to `defineComponent`. */
  self: HTMLElement;
  attrs: AttrSignals<T>;
  extraAttrs: any;
}

export type AttrSignals<T extends AttrDefinition> = {
  [K in keyof T]: Signal<zod.infer<T[K]>>;
}

type Attrs<T extends AttrDefinition> = {
  [K in keyof T]: {
    signal: Signal<zod.infer<T[K]>>;
    schema: T[K];
  };
}

export type EventDefinition = Record<string, zod.ZodSchema>;

export type ComponentDefinition<T extends AttrDefinition, E extends EventDefinition = {}> = {
  name: string;
  Component: Ctor;
  attrs: T;
  events: E;
}

export type CosmosComponent<T extends ComponentDefinition<any>> = InstanceOf<T['Component']>;

export type ComponentAttributesSchema<T extends ComponentDefinition<any>> = T['attrs'];
export type ComponentAttributes<T extends ComponentDefinition<any>> = IntrinsicCustomElementAttributes & Optionalize<{
  [K in keyof T['attrs']]: zod.infer<T['attrs'][K]> | Signal<zod.infer<T['attrs'][K]>>;
}>;

type ToPascalCase<S extends string> = S extends `${infer First}-${infer Rest}`
  ? `${Capitalize<First>}${ToPascalCase<Rest>}`
  : Capitalize<S>;

export type ComponentEventsSchema<T extends ComponentDefinition<any>> = T['events'];
export type ComponentEvents<T extends ComponentDefinition<any, EventDefinition>> = {
  [K in string & keyof T['events'] as `on${ToPascalCase<K>}`]: (e: CustomEvent<zod.infer<T['events'][K & keyof EventDefinition]>>) => void;
};

interface IntrinsicCustomElementAttributes {
  slot?: string;
  exportparts?: string;
}

type Optionalize<T> =
  & { [K in PickUndefined<T>]?: T[K]; }
  & { [K in PickDefined<T>]: T[K]; };

type PickUndefined<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

type PickDefined<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

export function defineComponent<T extends AttrDefinition, E extends EventDefinition = {}>({
  name,
  unmarshal = defaultMarshaller.unmarshal,
  events = {} as E,
  ...options
}: WebComponentOptions<T, E>) {
  const attrsDesc: T = options.attrs ?? {} as any;

  class Component extends HTMLElement {
    static observedAttributes = Object.keys(attrsDesc);
    #attrs: Attrs<T>;
    #extraAttrs = {} as any;
    #eventHandlers = new Map<string, EventListener>();

    constructor() {
      super();
      this.#attrs = Object.fromEntries(Object.entries(attrsDesc).map(([key, schema]) => [key, wrapAttr(schema, undefined)])) as Attrs<T>;

      // Set up event property getters/setters
      for (const eventName of Object.keys(events)) {
        const propertyName = `on${kebabToPascal(eventName)}`;
        Object.defineProperty(this, propertyName, {
          get: () => this.#eventHandlers.get(eventName),
          set: (handler: ((e: CustomEvent) => void) | null) => {
            if (this.#eventHandlers.has(eventName)) {
              this.removeEventListener(eventName, this.#eventHandlers.get(eventName)!);
            }
            if (handler) {
              this.#eventHandlers.set(eventName, handler as EventListener);
              this.addEventListener(eventName, handler as EventListener);
            } else {
              this.#eventHandlers.delete(eventName);
            }
          },
        });
      }
    }

    connectedCallback() {
      this.parseAttrs();
      this.render();
    }
    disconnectedCallback() {
      render(null, options.shadow === 'none' ? this : this.shadowRoot!); // properly dismount
    }

    adoptedCallback() {
      this.parseAttrs();
      this.render();
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      this.updateAttr(name, this.#processAttr(attrsDesc[name as keyof T], newValue));
    }

    /** Parse attributes & properties on the element. */
    parseAttrs() {
      for (const attr in attrsDesc) {
        const value: unknown = (this as any)[attr] ?? this.#attr(attr);
        //@ts-ignore
        this.#attrs[attr] = wrapAttr(attrsDesc[attr], value);
        this.updateAttr(attr, value);
      }
    }

    updateAttr(name: string, value: unknown) {
      if (!(name in attrsDesc)) {
        this.#extraAttrs[name] = value;
        return;
      }

      const attr = this.#attrs[name as keyof T];

      const parsed = attr.schema.safeParse(value);
      if (!parsed.success) {
        console.warn(`Invalid attribute ${name}:`, parsed.error);
        return;
      }

      attr.signal.value = parsed.data;
    }

    render() {
      const useShadow = options.shadow !== 'none';
      const attrSignals = Object.fromEntries(Object.entries(this.#attrs).map(([key, value]) => [key, value.signal])) as AttrSignals<T>;
      const shadowRoot = this.#getShadowRoot();
      // MEMO: render will be deprecated in v11
      // refer to https://gist.github.com/developit/f4c67a2ede71dc2fab7f357f39cff28c when it becomes time to upgrade
      render(
        h(options.render, {
          self: this,
          attrs: attrSignals,
          extraAttrs: this.#extraAttrs,
        }),
        useShadow ? shadowRoot! : this,
      );
    }

    override remove() {
      super.remove();
      render(null, options.shadow === 'none' ? this : this.shadowRoot!); // properly dismount
      // Clean up event listeners
      for (const [eventName, handler] of this.#eventHandlers) {
        this.removeEventListener(eventName, handler);
      }
      this.#eventHandlers.clear();
    }

    /** Emit a typed `CustomEvent`. */
    emit<Ev extends string & keyof E>(eventName: Ev, detail: zod.infer<E[Ev]>) {
      const schema = events[eventName];
      if (!schema) throw new Error(`Event ${eventName} is not defined`);
      const parsed = schema.safeParse(detail);
      if (!parsed.success) throw new Error(`Invalid event detail for ${eventName}: ${parsed.error}`);
      const event = new CustomEvent(eventName, { detail: parsed.data });
      this.dispatchEvent(event);
      return event;
    }

    #attr(name: string) {
      const value: unknown = this.getAttribute(name) ?? undefined;
      const schema = attrsDesc[name as keyof T];
      return this.#processAttr(schema, value);
    }

    #processAttr(schema: zod.ZodSchema, value: unknown) {
      if (schema instanceof zod.ZodOptional) {
        schema = schema._def.innerType;
      }

      const isStringSchema = schema instanceof zod.ZodString;
      const isEnumSchema = schema instanceof zod.ZodEnum;

      if (typeof value === 'string' && !(isStringSchema || isEnumSchema)) {
        value = unmarshal(JSON.parse(value));
      }

      return value;
    }

    #getShadowRoot() {
      if (options.shadow === 'none') return null;
      return this.shadowRoot ?? this.attachShadow({ mode: options.shadow ?? 'open' });
    }
  }

  if (!name.startsWith('cosmos-')) name = `cosmos-${name}`;
  customElements.define(name, Component);

  // TODO: use signals to detect changes?
  if (options.css) {
    const style = document.createElement('style');
    style.textContent = options.css ?? '';
    const firstStyleElem = getFirstStyleElem();
    if (firstStyleElem) {
      document.head.insertBefore(style, firstStyleElem);
    } else {
      document.head.appendChild(style);
    }
  }

  return {
    name,
    /** Generated web component class. This class has already been registered with `customElements.define`. */
    Component,
    /** Attributes schema of the component. */
    attrs: options.attrs,
    /** Events schema of the component. */
    events,
  } satisfies ComponentDefinition<T, E>;
}

/** Rudimentary CSS template literal. Currently, it does nothing fancy, it just concatenates the strings and values.
 * It is only really used for syntax highlighting in editors that support CSS-in-JS. In VSCode, you may use
 * [Lit](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin), for example.
 */
export const css = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.map((str, i) => `${str}${values[i] || ''}`).join('');
}

/** Animation helper. Immediately pauses the animation after creation.
 * The `.play()` method returns a promise that resolves when the animation finishes.
 * Animations also use `fill: forwards` by default.
 */
export function animate(el: HTMLElement, keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options: KeyframeAnimationOptions = {}) {
  const anim = el.animate(keyframes, { fill: 'forwards', ...options });
  const onFinish = TypedEvent<AnimationPlaybackEvent>();
  const onCancel = TypedEvent<AnimationPlaybackEvent>();
  anim.pause();
  anim.onfinish = (e) => onFinish.emit(e);
  anim.oncancel = (e) => onCancel.emit(e);
  return {
    play: () => {
      anim.play();
      return new Promise<AnimationPlaybackEvent>((resolve, reject) => {
        onFinish.once(({ args: e }) => {
          resolve(e);
        });
        onCancel.once(({ args: e }) => {
          reject(e);
        });
      });
    },
    pause: () => anim.pause(),
    reverse: () => {
      anim.reverse();
      return new Promise<void>((resolve, reject) => {
        anim.onfinish = () => resolve();
        anim.oncancel = () => reject(new Error('Animation cancelled'));
      });
    },
    finish: () => anim.finish(),
    cancel: () => anim.cancel(),
  };
}

function kebabToPascal(kebab: string): string {
  return kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function wrapAttr<T>(schema: zod.ZodSchema, initialValue: T | Signal<T>) {
  return {
    signal: isSignalish(initialValue) ? initialValue : signal(initialValue),
    schema,
  };
}

const getFirstStyleElem = () => document.head.querySelector('style') ?? document.head.querySelector('link[rel="stylesheet"]');
export const isSignalish = (value: any): value is Signal<any> => typeof value === 'object' && 'value' in value && typeof value.subscribe === 'function' && typeof value.peek === 'function';
