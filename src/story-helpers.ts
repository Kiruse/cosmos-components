import { z } from "zod";
import { ComponentAttributesSchema, ComponentDefinition } from "./webcomp.js";

export function getArgTypes<Component extends ComponentDefinition<any>>(component: Component) {
  return Object.fromEntries(Object.entries(component.attrs ?? {}).map(([key, schema]) => {
    if (schema instanceof z.ZodOptional) {
      schema = schema._def.innerType;
    }
    if (schema instanceof z.ZodNumber) {
      return [key, { type: 'number' }];
    }
    return [key, { type: 'text' }];
  }));
}
