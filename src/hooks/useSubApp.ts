import { JSX, render } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export type SubAppContent = JSX.Element | (() => JSX.Element);

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

export function subrender(content: SubAppContent, root: HTMLDivElement, shadow: 'none' | 'open' | 'closed' = 'open') {
  const _root = shadow === 'none' ? root : root.attachShadow({ mode: shadow });
  render(typeof content === 'function' ? content() : content, _root);
  return () => {
    render(null, _root);
  };
}
