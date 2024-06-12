import React from 'react';
import classnames from 'classnames';
import { useCanvasComponent } from '@visx/canvas';
import { AddSVGProps } from '../types';
import { PSEUDO_ZERO } from '../util/math';

export type CircleProps = {
  /** className to apply to circle element. */
  className?: string;
  /** reference to circle element. */
  innerRef?: React.Ref<SVGCircleElement>;
  /** parent canvas element id */
  canvasParentId?: number;
};

export default function Circle({
  className,
  innerRef,
  canvasParentId,
  ...restProps
}: AddSVGProps<CircleProps, SVGCircleElement>) {
  const [canvasId] = useCanvasComponent({
    name: 'CIRCLE',
    canvasParentId,
    render: (
      _: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      { cx = 0, cy = 0, r = 0, ...rest },
    ) => {
      if (!ctx) {
        return;
      }

      // Default properties for Circle element
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = 'rgba(0,0,0,0)';

      // Trace the path
      if (Number(r) > 0) {
        ctx.beginPath();
        ctx.arc(Number(cx), Number(cy), Number(r), 0, Math.PI * 2, false);
        ctx.closePath();
      }

      // Apply styles
      if (rest.stroke) {
        ctx.strokeStyle = rest.stroke;
      }
      if (rest.strokeWidth) {
        ctx.lineWidth = Number(rest.strokeWidth);
      }
      ctx.lineCap = 'round';
      if (restProps.strokeLinecap && rest.strokeLinecap !== 'inherit') {
        ctx.lineCap = rest.strokeLinecap;
      }

      // Draw to the canvas
      ctx.fill();
      ctx.stroke();
    },
    cleanup: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      // Reset canvas properties
      ctx.lineWidth = PSEUDO_ZERO;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = 'black';
    },
    props: {
      ...restProps,
    },
  });

  if (canvasId) {
    return null;
  }

  return <circle ref={innerRef} className={classnames('visx-circle', className)} {...restProps} />;
}
