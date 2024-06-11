import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import classnames from 'classnames';
import { useCanvas } from '@visx/canvas';
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
  const { hasCanvas, updateNode, deleteNode, addNode, registerCanvasComponent } = useCanvas();
  const canvasId = useRef<number | null>(null);
  const prevId = useRef<number | null>(null);

  useMemo(() => {
    registerCanvasComponent(
      'CIRCLE',
      (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D, { restProps }) => {
        if (!ctx) {
          return;
        }
        const { cx = 0, cy = 0, r = 0 } = restProps;

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
        if (restProps.stroke) {
          ctx.strokeStyle = restProps.stroke;
        }
        if (restProps.strokeWidth) {
          ctx.lineWidth = Number(restProps.strokeWidth);
        }
        ctx.lineCap = 'round';
        if (restProps.strokeLinecap && restProps.strokeLinecap !== 'inherit') {
          ctx.lineCap = restProps.strokeLinecap;
        }

        // Draw to the canvas
        ctx.fill();
        ctx.stroke();
      },
      (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        // Reset canvas properties
        ctx.lineWidth = PSEUDO_ZERO;
        ctx.strokeStyle = '#000';
        ctx.fillStyle = 'black';
      },
    );

    console.log('adding circle');
    canvasId.current = addNode(canvasParentId ?? null, 'CIRCLE', { restProps });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasParentId, restProps]);

  useLayoutEffect(() => {
    prevId.current = canvasId.current;
    return () => {
      console.log('deleting circle', prevId.current);
      deleteNode(prevId.current);
    };
  }, [deleteNode, canvasParentId, restProps]);

  useEffect(() => {
    if (!hasCanvas || !canvasId.current) return;

    updateNode(canvasId.current, { restProps });
  }, [restProps, hasCanvas, updateNode]);

  if (hasCanvas) {
    return null;
  }

  return <circle ref={innerRef} className={classnames('visx-circle', className)} {...restProps} />;
}
