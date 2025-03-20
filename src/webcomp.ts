import { DecimalMarshalUnit } from '@kiruse/decimal/marshal';
import { extendDefaultMarshaller } from '@kiruse/marshal';
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

export interface WebComponentOptions<T extends AttrDefinition> {
  name: string;
  attrs: T;
  /** Whether to use the Shadow DOM. Defaults to `'open'`. Set to `'none'` to disable the Shadow DOM, but beware of CSS scoping issues. */
  shadow?: 'none' | 'open' | 'closed';
  render: ComponentType<WebComponentProps<T>>;
  /** When not using the Shadow DOM, you can use the `css` option to inject CSS into the document head. */
  css?: string;
  /** General purpose unmarshal function for attributes. By default, we use my other `@kiruse/marshal` package. */
  unmarshal?(value: any): any;
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

export type ComponentDefinition<T extends AttrDefinition> = {
  name: string;
  Component: Ctor;
  attrs: T;
}

export type CosmosComponent<T extends ComponentDefinition<any>> = InstanceOf<T['Component']>;

export type ComponentAttributesSchema<T extends ComponentDefinition<any>> = T['attrs'];
export type ComponentAttributes<T extends ComponentDefinition<any>> = Optionalize<{
  [K in keyof T['attrs']]: zod.infer<T['attrs'][K]> | Signal<zod.infer<T['attrs'][K]>>;
}>;

type Optionalize<T> =
  & { [K in PickUndefined<T>]?: T[K]; }
  & { [K in PickDefined<T>]: T[K]; };

type PickUndefined<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

type PickDefined<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

export function defineComponent<T extends AttrDefinition>({
  name,
  unmarshal = defaultMarshaller.unmarshal,
  ...options
}: WebComponentOptions<T>) {
  const attrsDesc: T = options.attrs ?? {} as any;

  class Component extends HTMLElement {
    static observedAttributes = Object.keys(attrsDesc);
    #attrs: Attrs<T>;
    #extraAttrs = {} as any;

    constructor() {
      super();
      this.#attrs = Object.fromEntries(Object.entries(attrsDesc).map(([key, schema]) => [key, wrapAttr(schema, undefined)])) as Attrs<T>;
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
      const attr = this.#attrs[name as keyof T];
      let schema = attr.schema;
      if (schema instanceof zod.ZodOptional) {
        schema = schema._def.innerType;
      }

      const isStringSchema = schema instanceof zod.ZodString;
      const isEnumSchema = schema instanceof zod.ZodEnum;

      if (typeof newValue === 'string' && !(isStringSchema || isEnumSchema)) {
        newValue = unmarshal(JSON.parse(newValue));
      }

      this.updateAttr(name, newValue);
    }

    /** Parse attributes & properties on the element. */
    parseAttrs() {
      for (const attr in attrsDesc) {
        const value = (this as any)[attr] ?? this.getAttribute(attr) ?? undefined;
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
  } satisfies ComponentDefinition<T>;
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
  anim.pause();
  return {
    play: () => {
      anim.play();
      return new Promise<void>((resolve, reject) => {
        anim.onfinish = () => resolve();
        anim.oncancel = () => reject(new Error('Animation cancelled'));
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

function wrapAttr<T>(schema: zod.ZodSchema, initialValue: T | Signal<T>) {
  return {
    signal: isSignalish(initialValue) ? initialValue : signal(initialValue),
    schema,
  };
}

const getFirstStyleElem = () => document.head.querySelector('style') ?? document.head.querySelector('link[rel="stylesheet"]');
export const isSignalish = (value: any): value is Signal<any> => typeof value === 'object' && 'value' in value && typeof value.subscribe === 'function' && typeof value.peek === 'function';
