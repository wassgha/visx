/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useCanvas } from '../CanvasContext';

export function useCanvasComponent({
  name,
  render,
  cleanup,
  children,
  canvasParentId = null,
  props,
}: {
  name: string;
  render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, rest: any) => void;
  cleanup?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, rest: any) => void;
  children?: ReactNode;
  props: any;
  canvasParentId?: number | null;
}): [number | null, ReactNode] {
  const { hasCanvas, handleChildren, addNode, deleteNode, updateNode, registerCanvasComponent } =
    useCanvas();
  const canvasId = useRef<number | null>(null);
  const prevId = useRef<number | null>(null);

  useMemo(() => {
    registerCanvasComponent(name, render, cleanup);

    canvasId.current = addNode(canvasParentId ?? null, name, {
      ...props,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasParentId, ...props]);

  useLayoutEffect(() => {
    prevId.current = canvasId.current;
    return () => {
      deleteNode(prevId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteNode, canvasParentId, ...props]);

  useEffect(() => {
    if (!hasCanvas || !canvasId.current) return;

    updateNode(canvasId.current, { ...props });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCanvas, updateNode, ...props]);

  return [
    hasCanvas && canvasId.current ? canvasId.current : null,
    children && hasCanvas && canvasId.current ? handleChildren(children, canvasId.current) : null,
  ];
}
