import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useCanvas } from '@visx/canvas';
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
  const { hasCanvas, handleChildren, registerCanvasComponent, updateNode, deleteNode, addNode } =
    useCanvas();
  const canvasId = useRef<number | null>(null);
  const prevId = useRef<number | null>(null);

  useMemo(() => {
    registerCanvasComponent(
      'GROUP',
      (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D, { top, left, restProps }) => {
        if (!ctx) {
          return;
        }
        const { x = 0, y = 0 } = restProps;

        if (!isNaN(Number(x))) {
          console.log(`translating x: ctx.translate(${Number(x)}, 0)`);
          ctx.translate(Number(x), 0);
        }

        if (!isNaN(Number(y))) {
          console.log(`translating y: ctx.translate(${Number(y)}, 0)`);
          ctx.translate(0, Number(y));
        }
        if (!isNaN(Number(left))) {
          console.log(`translating x: ctx.translate(${Number(left)}, 0)`);
          ctx.translate(Number(left), 0);
        }

        if (!isNaN(Number(top))) {
          console.log(`translating y: ctx.translate(${Number(top)}, 0)`);
          ctx.translate(0, Number(top));
        }
      },
      (_: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        // Reset current transformation matrix to the identity matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      },
    );

    console.log('adding group');
    canvasId.current = addNode(canvasParentId ?? null, 'GROUP', { top, left, restProps });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasParentId, left, restProps, top, children]);

  useLayoutEffect(() => {
    prevId.current = canvasId.current;
    return () => {
      console.log('deleting group', prevId.current);
      deleteNode(prevId.current);
    };
  }, [canvasParentId, left, restProps, top, children, deleteNode]);

  useEffect(() => {
    if (!hasCanvas || !canvasId.current) return;

    updateNode(canvasId.current, { left, top, restProps });
  }, [left, top, restProps, hasCanvas, updateNode]);

  if (hasCanvas) {
    if (!children || !canvasId.current) {
      return null;
    }

    return handleChildren(children, canvasId.current);
  }

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
