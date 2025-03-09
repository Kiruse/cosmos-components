import { extendDefaultMarshaller } from '@kiruse/marshal';
import { Signal, signal } from '@preact/signals';
import { ComponentChild, h, render } from 'preact';
import { ComponentType } from 'preact/compat';
import zod from 'zod';

const defaultMarshaller = extendDefaultMarshaller([]);

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
      this.render();
    }

    disconnectedCallback() {
      render(null, this); // properly dismount
    }

    adoptedCallback() {
      this.render();
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      if (!(name in attrs)) {
        extraAttrs[name] = newValue;
        return;
      }

      const attr = attrs[name as keyof T];
      const isStringSchema = attr.schema instanceof zod.ZodString;
      const isOptionalStringSchema = attr.schema instanceof zod.ZodOptional && attr.schema._def.innerType instanceof zod.ZodString;

      if (typeof newValue === 'string' && !(isStringSchema || isOptionalStringSchema)) {
        newValue = unmarshal(JSON.parse(newValue));
      }

      const parsed = attr.schema.safeParse(newValue);
      if (!parsed.success) return;

      attr.signal.value = parsed.data;
    }

    render() {
      const attrSignals = Object.fromEntries(Object.entries(attrs).map(([key, value]) => [key, value.signal])) as AttrSignals<T>;
      render(h(props.render, { attrs: attrSignals }), this);
    }
  }

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

// convert kebab-case to PascalCase
// for more complex conversions I like to use https://www.npmjs.com/package/@kristiandupont/recase
const toPascalCase = (str: string) => str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
