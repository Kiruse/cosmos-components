import { z } from "zod";
import { AttrDefinition, ComponentDefinition } from "./webcomp.js";

type ArgTypes<T extends AttrDefinition> = {
  [K in keyof T]?: {
    type?: string;
    description?: string;
    defaultValue?: z.infer<T[K]>;
    options?: readonly any[];
  };
};

export function getArgTypes<Component extends ComponentDefinition<any>>(component: Component, extra: ArgTypes<Component['attrs']> = {}) {
  return Object.fromEntries(Object.entries(component.attrs ?? {}).map(([key, schema]) => {
    if (schema instanceof z.ZodOptional) {
      schema = schema._def.innerType;
    }

    let type = 'text';

    if (schema instanceof z.ZodNumber) {
      type = 'number';
    } else if (schema instanceof z.ZodBoolean) {
      type = 'boolean';
    }

    return [
      key,
      {
        type,
        table: {
          defaultValue: {
            summary: extra[key]?.defaultValue,
          },
        },
        ...extra[key],
      },
    ];
  }));
}
