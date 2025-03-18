import { render } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";
import { toast } from "./stories/toast.js";
import { CreateTooltipOptions, tooltip } from "./stories/tooltip.js";

export type SubAppContent = JSX.Element | (() => JSX.Element);

export function subrender(content: SubAppContent, root: HTMLDivElement, shadow: 'none' | 'open' | 'closed' = 'open') {
  const _root = shadow === 'none' ? root : root.attachShadow({ mode: shadow });
  render(typeof content === 'function' ? content() : content, _root);
  return () => {
    render(null, _root);
  };
}

export interface SubAppOptions {
  shadow?: 'none' | 'open' | 'closed';
}

/** A small utility to render preact content into a div for use in the lite or shadow DOM.
 * Cleans up after itself on unmount.
 */
export function useSubApp(content: JSX.Element | (() => JSX.Element), { shadow = 'open' }: SubAppOptions = {}) {
  const root = useRef<HTMLDivElement>(document.createElement('div'));

  useEffect(() => {
    return subrender(content, root.current, shadow);
  }, [content, shadow]);

  return root;
}

export function useTooltip(
  trigger: HTMLElement | undefined,
  content: SubAppContent,
  { shadow, ...options }: CreateTooltipOptions & SubAppOptions = {}
) {
  const contentEl = useSubApp(content, { shadow });

  useEffect(() => {
    if (!trigger) return;

    const el = tooltip.create(trigger, contentEl.current, options);
    return () => {
      el.destroy();
    }
  }, [trigger, options]);
}

export interface UseToastOptions {
  variant?: 'success' | 'error' | 'warn' | 'info';
  title?: string;
  lifespan?: number;
}

export function useToast(content: SubAppContent, { shadow, ...attrs }: UseToastOptions & SubAppOptions = {}) {
  const contentEl = useSubApp(content, { shadow });

  useEffect(() => {
    toast.show(contentEl.current, { ...attrs });
  }, [content, shadow]);
}
