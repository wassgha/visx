import React, {
  useRef,
  useState,
  useEffect,
  DetailedHTMLProps,
  CanvasHTMLAttributes,
  useCallback,
  ReactNode,
  cloneElement,
  ReactElement,
  useLayoutEffect,
} from 'react';
import { CanvasContext, CanvasNode } from './CanvasContext';
import useTree, { TreeNode } from './hooks/useTree';
import useDevicePixelRatio from './hooks/useDevicePixelRatio';

export default function Canvas({
  children,
  height,
  width,
  ...restProps
}: DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ratio = useDevicePixelRatio();
  const registry = useRef<
    {
      type: string;
      render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: any) => void;
      cleanup?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: any) => void;
    }[]
  >([
    {
      type: 'ROOT',
      render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, { ratio }) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(ratio, ratio);
      },
    },
  ]);
  const [tree, { addChild, updateNode: treeUpdateNode, deleteNode }] = useTree<CanvasNode>({
    type: 'ROOT',
    props: { ratio },
  });

  const registerCanvasComponent = useCallback(
    (
      type: string,
      render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: any) => void,
      cleanup?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: any) => void,
    ) => {
      if (registry.current.some(({ type: t }) => t === type)) return;

      registry.current = [
        ...registry.current,
        {
          type,
          render,
          cleanup,
        },
      ];
    },
    [registry],
  );

  const addNode = useCallback(
    (parentId: number | null, type: string, props: any) => addChild(parentId, { type, props }),
    [addChild],
  );

  const updateNode = useCallback(
    (nodeId: number, props: any) => treeUpdateNode(nodeId, { props }),
    [treeUpdateNode],
  );

  // Adds `canvasParentId` prop to each child
  const handleChildren = useCallback(
    (nodes: ReactNode | null, canvasId: number): ReactNode | null => {
      // Recursively handle an array of children
      if (Array.isArray(nodes)) {
        return <>{nodes.map((child) => handleChildren(child, canvasId))}</>;
      }

      // Ignore primitives
      if (
        typeof nodes === 'string' ||
        typeof nodes === 'undefined' ||
        typeof nodes === 'number' ||
        typeof nodes === 'boolean' ||
        (typeof nodes === 'object' && Object.keys(nodes as object).length === 0)
      ) {
        return null;
      }

      // Add `canvasParentId` prop to each child
      return cloneElement(nodes as unknown as ReactElement, { canvasParentId: canvasId });
    },
    [],
  );

  const [state, setState] = useState({
    getCtx: (): CanvasRenderingContext2D | null => null,
    ref: canvasRef,
    addNode,
    updateNode,
    deleteNode,
    registerCanvasComponent,
    handleChildren,
    hasCanvas: true,
  });

  useEffect(() => {
    setState({
      getCtx: () => (canvasRef.current ? canvasRef.current.getContext('2d') : null),
      ref: canvasRef,
      registerCanvasComponent,
      handleChildren,
      addNode,
      updateNode,
      deleteNode,
      hasCanvas: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ref]);

  const execute = useCallback(
    (canvas, ctx, root: TreeNode<CanvasNode>) => {
      console.log('executing on ', root.id, root);
      const component = registry.current.find(({ type }) => type === root.payload?.type);
      component?.render?.(canvas, ctx, root.payload?.props);
      for (const child of root.children ?? []) {
        execute(canvas, ctx, child);
      }
      component?.cleanup?.(canvas, ctx, root.payload?.props);
    },
    [registry],
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    console.log('devicePixelRatio', window.devicePixelRatio);
    const { width, height } = canvas.getBoundingClientRect();
    console.log({ width, height });
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, [ratio]);

  useEffect(() => {
    updateNode(tree.id, { ratio });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    execute(canvas, ctx, tree);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  console.log({ tree, registry });

  return (
    <canvas height={height} ref={canvasRef} width={width} {...restProps}>
      <CanvasContext.Provider value={state}>{state.ref.current && children}</CanvasContext.Provider>
    </canvas>
  );
}
