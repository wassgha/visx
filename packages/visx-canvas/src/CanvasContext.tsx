import { ReactNode, createContext, createRef, useContext } from 'react';

export interface CanvasNode {
  type: string;
  props: unknown;
}

const CanvasContext = createContext({
  getCtx: (): CanvasRenderingContext2D | null => null,
  ref: createRef(),
  hasCanvas: false,
  registerCanvasComponent: (
    type: string,
    render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: any) => void,
    cleanup?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: any) => void,
  ) => {},
  updateNode: (id: number, props: any): void => {},
  addNode: (parentId: number | null, type: string, props: any): number => 12345,
  deleteNode: (id: number | null) => {},
  handleChildren: (nodes: ReactNode | null, canvasId: number): ReactNode | null => nodes,
});
const useCanvas = () => useContext(CanvasContext);

export { CanvasContext, useCanvas };
