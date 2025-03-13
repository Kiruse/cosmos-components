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

export type AttrDefinition = Record<string, zod.ZodSchema>;

export interface WebComponentOptions<T extends AttrDefinition> {
  name: string;
  attrs?: T;
  render: ComponentType<{ attrs: AttrSignals<T> }>;
  css?: string;
  /** General purpose unmarshal function for attributes */
  unmarshal?(value: any): any;
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
  attrs?: T;
}

export type ComponentAttributesSchema<T extends ComponentDefinition<any>> = T['attrs'];
export type ComponentAttributes<T extends ComponentDefinition<any>> = {
  [K in keyof T['attrs']]: zod.infer<T['attrs'][K]> | Signal<zod.infer<T['attrs'][K]>>;
};

export function defineComponent<T extends AttrDefinition>({
  name,
  unmarshal = defaultMarshaller.unmarshal,
  ...props
}: WebComponentOptions<T>) {
  const attrs = wrapAttrs<T>(props.attrs);
  const extraAttrs = {} as any;

  class Component extends HTMLElement {
    static observedAttributes = Object.keys(attrs);

    connectedCallback() {
      this.parseAttrs();
      this.render();
    }

    disconnectedCallback() {
      render(null, this); // properly dismount
    }

    adoptedCallback() {
      this.parseAttrs();
      this.render();
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      this.updateAttr(name, newValue);
    }

    /** Parse attributes & properties on the element. */
    parseAttrs() {
      // TODO: if the prop is a signal, we should use that signal instead of ours
      for (const attr in attrs) {
        const value = (this as any)[attr] ?? this.getAttribute(attr) ?? undefined;
        this.updateAttr(attr, value);
      }
    }

    updateAttr(name: string, value: unknown) {
      if (!(name in attrs)) {
        extraAttrs[name] = value;
        return;
      }

      const attr = attrs[name as keyof T];
      const isStringSchema = attr.schema instanceof zod.ZodString;
      const isOptionalStringSchema = attr.schema instanceof zod.ZodOptional && attr.schema._def.innerType instanceof zod.ZodString;

      if (typeof value === 'string' && !(isStringSchema || isOptionalStringSchema)) {
        value = unmarshal(JSON.parse(value));
      }

      const parsed = attr.schema.safeParse(value);
      if (!parsed.success) {
        console.warn(`Invalid attribute ${name}:`, parsed.error);
        return;
      }

      attr.signal.value = parsed.data;
    }

    render() {
      const attrSignals = Object.fromEntries(Object.entries(attrs).map(([key, value]) => [key, value.signal])) as AttrSignals<T>;
      render(h(props.render, { attrs: attrSignals }), this);
    }
  }

  if (!name.startsWith('cosmos-')) name = `cosmos-${name}`;
  customElements.define(name, Component);

  // TODO: use signals to detect changes?
  if (props.css) {
    const style = document.createElement('style');
    style.textContent = props.css ?? '';
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
    attrs: props.attrs,
  } satisfies ComponentDefinition<T>;
}

/** Rudimentary CSS template literal. Currently, it does nothing fancy, it just concatenates the strings and values.
 * It is only really used for syntax highlighting in editors that support CSS-in-JS. In VSCode, you may use
 * [Lit](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin), for example.
 */
export const css = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.map((str, i) => `${str}${values[i] || ''}`).join('');
}

function wrapAttrs<T extends AttrDefinition>(attrs: T | undefined) {
  if (!attrs) return {} as any as Attrs<T>;
  return Object.fromEntries(Object.entries(attrs).map(
    ([key, value]) => [
      key,
      {
        signal: signal(undefined),
        schema: value,
      },
    ],
  )) as Attrs<T>;
}

const getFirstStyleElem = () => document.head.querySelector('style') ?? document.head.querySelector('link[rel="stylesheet"]');
const isSignalish = (value: any): value is Signal<any> => typeof value === 'object' && 'value' in value && typeof value.subscribe === 'function' && typeof value.peek === 'function';
