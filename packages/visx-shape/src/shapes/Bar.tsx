import React, { useEffect, useLayoutEffect } from 'react';
import cx from 'classnames';
import { Property, useCanvas } from '@visx/canvas';
import { AddSVGProps } from '../types';
import { PSEUDO_ZERO } from '../util/math';

export type BarProps = {
  /** className to apply to rect element. */
  className?: string;
  /** reference to rect element. */
  innerRef?: React.Ref<SVGRectElement>;
  /** parent canvas element id */
  canvasParentId?: number;
};

export default function Bar({
  className,
  innerRef,
  canvasParentId,
  ...restProps
}: AddSVGProps<BarProps, SVGRectElement>) {
  const { hasCanvas, registerCanvasElement } = useCanvas();

  useLayoutEffect(() => {
    if (!hasCanvas) return;

    registerCanvasElement(canvasParentId ?? null, {
      before: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        if (!ctx) {
          return;
        }
        // Reset canvas properties
        ctx.lineWidth = PSEUDO_ZERO;
        ctx.strokeStyle = '#000';
        ctx.fillStyle = 'black';

        // Trace the path
        const x = new Property('x', restProps.x).getPixels();
        const y = new Property('y', restProps.y).getPixels();
        const width = new Property('width', restProps.width).getPixels();
        const height = new Property('height', restProps.height).getPixels();
        const rxAttr = new Property('rx', restProps.rx);
        const ryAttr = new Property('rx', restProps.ry);
        let rx = rxAttr.getPixels();
        let ry = ryAttr.getPixels();

        if (rxAttr.hasValue() && !ryAttr.hasValue()) {
          ry = rx;
        }

        if (ryAttr.hasValue() && !rxAttr.hasValue()) {
          rx = ry;
        }
        rx = Math.min(rx, width / 2);
        ry = Math.min(ry, height / 2);
        const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);

        console.log({ bar: true, x, y, width, height, rx, ry });

        ctx.beginPath(); // always start the path so we don't fill prior paths

        if (height > 0 && width > 0) {
          ctx.moveTo(x + rx, y);
          ctx.lineTo(x + width - rx, y);
          ctx.bezierCurveTo(
            x + width - rx + KAPPA * rx,
            y,
            x + width,
            y + ry - KAPPA * ry,
            x + width,
            y + ry,
          );
          ctx.lineTo(x + width, y + height - ry);
          ctx.bezierCurveTo(
            x + width,
            y + height - ry + KAPPA * ry,
            x + width - rx + KAPPA * rx,
            y + height,
            x + width - rx,
            y + height,
          );
          ctx.lineTo(x + rx, y + height);
          ctx.bezierCurveTo(
            x + rx - KAPPA * rx,
            y + height,
            x,
            y + height - ry + KAPPA * ry,
            x,
            y + height - ry,
          );
          ctx.lineTo(x, y + ry);
          ctx.bezierCurveTo(x, y + ry - KAPPA * ry, x + rx - KAPPA * rx, y, x + rx, y);
        }

        // Apply styles
        if (restProps.fill) {
          ctx.fillStyle = restProps.fill;
        }
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
      after: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        if (!ctx) {
          return;
        }
        // Reset canvas properties
        ctx.lineWidth = PSEUDO_ZERO;
        ctx.strokeStyle = '#000';
        ctx.fillStyle = 'black';
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasCanvas) {
    return null;
  }
  return <rect ref={innerRef} className={cx('visx-bar', className)} {...restProps} />;
}
