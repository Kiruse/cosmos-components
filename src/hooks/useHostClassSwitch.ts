import { type Signal, useSignalEffect } from '@preact/signals';

export function useHostClassSwitch(host: HTMLElement, allClasses: string[], toggle: Signal<string | undefined>) {
  useSignalEffect(() => {
    host.classList.remove(...allClasses);
    if (toggle.value) host.classList.add(toggle.value);
  });
}
