import React, { ReactNode } from 'react';
import { useCanvasComponent } from '@visx/canvas';
import cx from 'classnames';

type GroupProps = {
  /** Top offset applied to `<g/>`. */
  top?: number;
  /** Left offset applied to `<g/>`. */
  left?: number;
  /** Override `top` and `left` to provide the entire `transform` string. */
  transform?: string;
  /** className to apply to `<g/>`. */
  className?: string;
  children?: React.ReactNode;
  /** ref to underlying `<g/>`. */
  innerRef?: React.Ref<SVGGElement>;
  /** id of parent canvas */
  canvasParentId?: number;
};

export default function Group({
  top = 0,
  left = 0,
  transform,
  className,
  children,
  innerRef,
  canvasParentId,
  ...restProps
}: GroupProps & Omit<React.SVGProps<SVGGElement>, keyof GroupProps>) {
  const [, canvasChildren] = useCanvasComponent({
    name: 'GROUP',
    render: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D, { top, left, ...restProps }) => {
      if (!ctx) {
        return;
      }
      const { x = 0, y = 0 } = restProps;

      if (!isNaN(Number(x))) {
        ctx.translate(Number(x), 0);
      }

      if (!isNaN(Number(y))) {
        ctx.translate(0, Number(y));
      }
      if (!isNaN(Number(left))) {
        ctx.translate(Number(left), 0);
      }

      if (!isNaN(Number(top))) {
        ctx.translate(0, Number(top));
      }
    },
    cleanup: (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props) => {
      // Reverse the transformations
      if (!ctx) {
        return;
      }

      if (!isNaN(Number(props.left))) {
        ctx.translate(-Number(left), 0);
      }

      if (!isNaN(Number(props.top))) {
        ctx.translate(0, -Number(props.top));
      }

      const { x = 0, y = 0 } = props;

      if (!isNaN(Number(x))) {
        ctx.translate(-Number(x), 0);
      }

      if (!isNaN(Number(y))) {
        ctx.translate(0, -Number(y));
      }
    },
    children,
    props: {
      top,
      left,
      ...restProps,
    },
  });

  if (canvasChildren) return canvasChildren as ReactNode;

  return (
    <g
      ref={innerRef}
      className={cx('visx-group', className)}
      transform={transform || `translate(${left}, ${top})`}
      {...restProps}
    >
      {children}
    </g>
  );
}
