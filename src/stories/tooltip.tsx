import { createPopper, Placement } from "@popperjs/core/lib/index.js";
import { ComponentAttributes, css, defineComponent, isSignalish } from "../webcomp.js";

export type TooltipAttributes = ComponentAttributes<typeof Tooltip>;
export type CreateTooltipOptions = {
  placement?: Placement;
};

/** The visual tooltip component. The logic is handled with `tooltip.create` and Popper.js. */
export const Tooltip = defineComponent({
  name: 'cosmos-tooltip',
  attrs: {},
  render({ self, attrs: {} }) {
    return (
      <>
        <style>{css`
          :host {
            padding: calc(var(--cosmos-spacing, 8px));
            border-radius: calc(var(--cosmos-roundness, 4px));
            color:rgb(200, 197, 219);
            background: var(--cosmos-bg-panel,rgb(49, 48, 54));
            box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.25);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: var(--cosmos-base-font-size, 12px);
            line-height: 1.2;
            z-index: var(--cosmos-tooltip-z, 999);
          }
        `}</style>
        <slot name="content">
          <span>Tooltip content</span>
        </slot>
      </>
    );
  },
  css: css`
    #tooltip-container {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1000;
    }

    cosmos-tooltip {
      display: none;
      &.active {
        display: block;
      }
    }
  `,
});

export namespace tooltip {
  /** Create a tooltip with any arbitrary trigger & content elements. */
  export function create(trigger: HTMLElement, content: HTMLElement, options: CreateTooltipOptions = {}) {
    const tooltip = document.createElement('cosmos-tooltip');
    Object.assign(tooltip, options);
    content.setAttribute('slot', 'content');
    tooltip.appendChild(content);

    let container = document.getElementById('tooltip-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tooltip-container';
      document.body.appendChild(container);
    }
    container.appendChild(tooltip);

    let visible = false;

    const getOpts = () => {
      let placement = options.placement as Placement | undefined;
      if (isSignalish(options.placement))
        placement = options.placement.peek();

      let offset: [number, number];
      switch (placement) {
        case 'top':
          offset = [0, -8];
          break;
        case 'left':
          offset = [-8, 0];
          break;
        case 'right':
          offset = [8, 0];
          break;
        default:
        case 'bottom':
          offset = [0, 8];
          break;
      }

      return {
        placement: placement ?? 'bottom',
        modifiers: [
          { name: 'offset', options: { offset } },
          { name: 'flip', enabled: true },
          { name: 'eventListeners', enabled: visible },
        ],
      };
    }

    const popper = createPopper(trigger, tooltip, getOpts());

    let unsub: (() => void) | undefined;
    if (isSignalish(options.placement)) {
      unsub = options.placement.subscribe(p => {
        popper.setOptions(getOpts());
        popper.update();
      });
    }

    const show = () => {
      visible = true;
      tooltip.classList.add('active');
      popper.setOptions(getOpts());
      popper.update();
    };

    const hide = () => {
      visible = false;
      tooltip.classList.remove('active');
      popper.setOptions(getOpts());
      popper.update();
    };

    const onMove = (e: MouseEvent) => {
      if (trigger.contains(e.target as Node)) {
        visible = true;
        if (!tooltip.classList.contains('active')) {
          show();
        }
      } else {
        hide();
      }
    };

    document.addEventListener('mousemove', onMove);

    return {
      destroy: () => {
        document.removeEventListener('mousemove', onMove);
        popper.destroy();
        tooltip.remove();
        unsub?.();
      },
      update: () => {
        popper.update();
      },
      show,
      hide,
    };
  }
}
