import React from 'react';
import cx from 'classnames';
import { Property, useCanvasComponent } from '@visx/canvas';
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
  const [canvasId] = useCanvasComponent({
    name: 'BAR',
    canvasParentId,
    render: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D, { ...rest }) => {
      if (!ctx) {
        return;
      }
      // Reset canvas properties
      ctx.lineWidth = PSEUDO_ZERO;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = 'black';

      // Trace the path
      const x = new Property('x', rest.x).getPixels();
      const y = new Property('y', rest.y).getPixels();
      const width = new Property('width', rest.width).getPixels();
      const height = new Property('height', rest.height).getPixels();
      const rxAttr = new Property('rx', rest.rx);
      const ryAttr = new Property('rx', rest.ry);
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
      if (rest.fill) {
        ctx.fillStyle = rest.fill;
      }
      if (rest.stroke) {
        ctx.strokeStyle = rest.stroke;
      }
      if (rest.strokeWidth) {
        ctx.lineWidth = Number(rest.strokeWidth);
      }
      ctx.lineCap = 'round';
      if (rest.strokeLinecap && rest.strokeLinecap !== 'inherit') {
        ctx.lineCap = rest.strokeLinecap;
      }

      // Draw to the canvas
      ctx.fill();
      ctx.stroke();
    },
    cleanup: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      if (!ctx) {
        return;
      }
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

  return <rect ref={innerRef} className={cx('visx-bar', className)} {...restProps} />;
}
