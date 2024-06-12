import React, { ReactNode } from 'react';
import cx from 'classnames';
import { Line as LineType } from 'd3-shape';
import { useCanvasComponent } from '@visx/canvas';
import { AddSVGProps, LinePathConfig } from '../types';
import { line } from '../util/D3ShapeFactories';
import { PSEUDO_ZERO } from '../util/math';

export type LinePathProps<Datum> = {
  /** Array of data for which to generate a line shape. */
  data?: Datum[];
  /** React RefObject passed to the path element. */
  innerRef?: React.Ref<SVGPathElement>;
  /** Override render function which is passed the configured path generator as input. */
  children?: (args: { path: LineType<Datum> }) => React.ReactNode;
  /** Fill color of the path element. */
  fill?: string;
  /** className applied to path element. */
  className?: string;
  /** parent canvas element id  */
  canvasParentId?: number;
} & LinePathConfig<Datum>;

export default function LinePath<Datum>({
  children,
  data = [],
  x,
  y,
  fill = 'transparent',
  className,
  curve,
  innerRef,
  defined = () => true,
  canvasParentId,
  ...restProps
}: AddSVGProps<LinePathProps<Datum>, SVGPathElement>) {
  const path = line<Datum>({ x, y, defined, curve });
  const [, canvasChildren] = useCanvasComponent({
    name: 'LINE_PATH',
    children,
    canvasParentId,
    render: (
      _: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      { data = [], path, fill = 'transparent', ...restProps },
    ) => {
      if (!ctx) {
        return;
      }

      // Default properties for line path element
      ctx.lineWidth = PSEUDO_ZERO;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = 'black';

      // Trace the path
      ctx.beginPath();
      path.context(ctx);
      path(data);

      // Apply styles
      ctx.fillStyle = fill;
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
      data,
      curve,
      x,
      y,
      fill,
      path,
      ...restProps,
    },
  });

  if (canvasChildren) return canvasChildren as ReactNode;

  if (children) return <>{children({ path })}</>;

  return (
    <path
      ref={innerRef}
      className={cx('visx-linepath', className)}
      d={path(data) || ''}
      fill={fill}
      // without this a datum surrounded by nulls will not be visible
      // https://github.com/d3/d3-shape#line_defined
      strokeLinecap="round"
      {...restProps}
    />
  );
}
