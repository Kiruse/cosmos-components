import { ReadonlySignal, useSignalEffect } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { type CreateTooltipOptions, tooltip } from '../stories/Tooltip/tooltip.js';
import { type SubAppContent, type SubAppOptions, useSubApp } from './useSubApp.js';

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

export function useTooltipSignal(
  trigger: ReadonlySignal<HTMLElement | undefined>,
  tpl: ReadonlySignal<HTMLTemplateElement | undefined>,
  { shadow, ...options }: CreateTooltipOptions & SubAppOptions = {}
) {
  useSignalEffect(() => {
    if (!trigger.value || !tpl.value) return;

    const el = tooltip.create(trigger.value, tpl.value, options);
    return () => {
      el.destroy();
    }
  });
}
