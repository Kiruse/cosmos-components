import { ReadonlySignal, useSignalEffect } from '@preact/signals';
import { type CreateTooltipOptions, tooltip } from '../stories/Tooltip/tooltip.js';
import { SubAppContent, useSubApp, type SubAppOptions } from './useSubApp.js';
import { isSignalish } from '../webcomp.js';

export function useTooltip(
  trigger: ReadonlySignal<HTMLElement | undefined> | HTMLElement,
  Component: SubAppContent,
  { shadow, ...options }: CreateTooltipOptions & SubAppOptions = {}
) {
  const content = useSubApp(Component, { shadow });

  useSignalEffect(() => {
    const triggerEl = isSignalish(trigger) ? trigger.value : trigger;
    if (!triggerEl) return;

    const tooltipInst = tooltip.create(triggerEl, content.current, options);
    return () => {
      tooltipInst.destroy();
    };
  });
}
