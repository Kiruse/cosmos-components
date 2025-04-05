import { useEffect } from 'preact/hooks';
import { type CreateTooltipOptions } from '../stories/Tooltip/tooltip.js';
import { type SubAppContent, type SubAppOptions, useSubApp } from './useSubApp.js';
import { tooltip } from '../stories/Tooltip/tooltip.js';

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
