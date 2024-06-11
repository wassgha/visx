import { useCallback, useMemo, useRef, useState } from 'react';

export interface TreeNode<T> {
  id: number;
  payload?: T;
  children?: TreeNode<T>[];
}

interface TreeActions<T> {
  addChild: (parentId: number | null, payload: T) => number;
  findNode: (id: number) => TreeNode<T> | null;
  deleteNode: (id: number | null) => void;
  updateNode: (id: number, payload: Partial<T>) => void;
  resetTree: () => void;
}

const useTree = <T>(initialPayload: T): [TreeNode<T>, TreeActions<T>] => {
  const [statefulTree, setStatefulTree] = useState<TreeNode<T>>({
    id: Math.floor(Math.random() * 1000000),
    children: [],
    payload: initialPayload,
  });
  const tree = useRef<TreeNode<T>>({
    id: Math.floor(Math.random() * 1000000),
    children: [],
    payload: initialPayload,
  });

  const resetTree = useCallback(() => {
    tree.current = { id: tree.current.id, children: [], payload: initialPayload };
    setStatefulTree({ ...tree.current });
  }, [initialPayload]);

  const traverseAndAdd = useCallback(
    (root: TreeNode<T>, parentId: number, newChild: TreeNode<T>): TreeNode<T> => {
      if (root.id === parentId) {
        root.children = root.children ? [...root.children, newChild] : [newChild];
        return root;
      }

      if (root.children) {
        root.children = root.children.map((child) => traverseAndAdd(child, parentId, newChild));
      }

      return root;
    },
    [],
  );

  const addChild = useCallback(
    (parentId: number | null, payload: T): number => {
      const newChild = {
        id: Math.floor(Math.random() * 1000000),
        payload,
        children: [],
      };

      tree.current = traverseAndAdd(tree.current, parentId ?? tree.current.id, newChild);
      setStatefulTree({ ...tree.current });

      return newChild.id;
    },
    [traverseAndAdd, tree],
  );

  const traverseAndFind = useCallback((root: TreeNode<T>, id: number): TreeNode<T> | null => {
    if (root.id === id) {
      return root;
    }

    if (root.children) {
      for (const child of root.children) {
        const foundNode = traverseAndFind(child, id);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }, []);

  const findNode = useCallback(
    (id: number): TreeNode<T> | null => traverseAndFind(tree.current, id),
    [traverseAndFind, tree],
  );

  const traverseAndDelete = useCallback((root: TreeNode<T>, id: number): TreeNode<T> => {
    if (root.children) {
      root.children = root.children
        .filter((child) => child.id !== id)
        .map((child) => traverseAndDelete(child, id));
    }

    return root;
  }, []);

  const deleteNode = useCallback(
    (id: number | null) => {
      if (!id) {
        return;
      }
      tree.current = traverseAndDelete(tree.current, id);
      setStatefulTree({ ...tree.current });
    },
    [traverseAndDelete, tree],
  );

  const traverseAndUpdate = useCallback(
    (node: TreeNode<T>, id: number, payload: Partial<T>): TreeNode<T> => {
      if (node.id === id) {
        node.payload = { ...node.payload, ...(payload as T) };
        return node;
      }

      if (node.children) {
        node.children = node.children.map((child) => traverseAndUpdate(child, id, payload));
      }

      return node;
    },
    [],
  );

  const updateNode = useCallback(
    (id: number, payload: Partial<T>) => {
      tree.current = traverseAndUpdate(tree.current, id, payload);
      setStatefulTree({ ...tree.current });
    },
    [traverseAndUpdate, tree],
  );

  const actions: TreeActions<T> = useMemo(
    () => ({
      addChild,
      findNode,
      deleteNode,
      updateNode,
      resetTree,
    }),
    [addChild, findNode, deleteNode, resetTree, updateNode],
  );

  return [statefulTree, actions];
};

export default useTree;
