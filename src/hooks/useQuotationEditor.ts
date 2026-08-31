import { useCallback, useEffect, useRef, useState } from "react";
import { getQuotation, saveQuotation } from "@/lib/storage";
import {
  makeBlock,
  uid,
  type Block,
  type BlockType,
  type DocumentSettings,
  type Quotation,
} from "@/models/quotation";

export type SaveStatus = "loading" | "saved" | "saving" | "error";

export function useQuotationEditor(id: string) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [notFound, setNotFound] = useState(false);
  const past = useRef<Quotation[]>([]);
  const future = useRef<Quotation[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    let active = true;
    getQuotation(id)
      .then((found) => {
        if (!active) return;
        if (!found) {
          setNotFound(true);
          setStatus("error");
          return;
        }
        setQuotation(found);
        setStatus("saved");
      })
      .catch(() => setStatus("error"));
    return () => {
      active = false;
    };
  }, [id]);

  const persist = useCallback((next: Quotation) => {
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveQuotation(next)
        .then(() => setStatus("saved"))
        .catch(() => setStatus("error"));
    }, 500);
  }, []);

  const apply = useCallback(
    (updater: (current: Quotation) => Quotation, options?: { history?: boolean }) => {
      setQuotation((current) => {
        if (!current) return current;
        const next = updater(current);
        if (next === current) return current;
        if (options?.history !== false) {
          past.current = [...past.current.slice(-49), current];
          future.current = [];
          setHistoryVersion((v) => v + 1);
        }
        const stamped = { ...next, updatedAt: Date.now() };
        persist(stamped);
        return stamped;
      });
    },
    [persist],
  );

  const saveNow = useCallback(async () => {
    if (!quotation) return;
    setStatus("saving");
    try {
      await saveQuotation(quotation);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [quotation]);

  const undo = useCallback(() => {
    setQuotation((current) => {
      if (!current || !past.current.length) return current;
      const previous = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current].slice(0, 50);
      setHistoryVersion((v) => v + 1);
      persist(previous);
      return previous;
    });
  }, [persist]);

  const redo = useCallback(() => {
    setQuotation((current) => {
      if (!current || !future.current.length) return current;
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, current];
      setHistoryVersion((v) => v + 1);
      persist(next);
      return next;
    });
  }, [persist]);

  const patchBlock = useCallback(
    (blockId: string, patch: Partial<Block>) =>
      apply((q) => ({
        ...q,
        blocks: q.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
      })),
    [apply],
  );

  const patchBlockSettings = useCallback(
    (blockId: string, patch: Partial<Block["settings"]>) =>
      apply((q) => ({
        ...q,
        blocks: q.blocks.map((b) =>
          b.id === blockId ? { ...b, settings: { ...b.settings, ...patch } } : b,
        ),
      })),
    [apply],
  );

  const addBlock = useCallback(
    (type: BlockType, afterId?: string | null) => {
      const block = makeBlock(type);
      apply((q) => {
        const index = afterId ? q.blocks.findIndex((b) => b.id === afterId) : q.blocks.length - 1;
        const at = index < 0 ? q.blocks.length : index + 1;
        return { ...q, blocks: [...q.blocks.slice(0, at), block, ...q.blocks.slice(at)] };
      });
      return block.id;
    },
    [apply],
  );

  const addBlocks = useCallback(
    (blocks: Block[], mode: "append" | "replace" = "append") =>
      apply((q) => ({ ...q, blocks: mode === "replace" ? blocks : [...q.blocks, ...blocks] })),
    [apply],
  );

  const duplicateBlock = useCallback(
    (blockId: string) =>
      apply((q) => {
        const index = q.blocks.findIndex((b) => b.id === blockId);
        if (index < 0) return q;
        const copy: Block = JSON.parse(JSON.stringify(q.blocks[index]));
        copy.id = uid();
        return { ...q, blocks: [...q.blocks.slice(0, index + 1), copy, ...q.blocks.slice(index + 1)] };
      }),
    [apply],
  );

  const deleteBlock = useCallback(
    (blockId: string) => apply((q) => ({ ...q, blocks: q.blocks.filter((b) => b.id !== blockId) })),
    [apply],
  );

  const reorderBlock = useCallback(
    (fromId: string, toId: string) =>
      apply((q) => {
        const from = q.blocks.findIndex((b) => b.id === fromId);
        const to = q.blocks.findIndex((b) => b.id === toId);
        if (from < 0 || to < 0 || from === to) return q;
        const blocks = [...q.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        return { ...q, blocks };
      }),
    [apply],
  );

  const moveBlock = useCallback(
    (blockId: string, direction: -1 | 1) =>
      apply((q) => {
        const index = q.blocks.findIndex((b) => b.id === blockId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= q.blocks.length) return q;
        const blocks = [...q.blocks];
        [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
        return { ...q, blocks };
      }),
    [apply],
  );

  const updateSettings = useCallback(
    (patch: Partial<DocumentSettings>) =>
      apply((q) => ({ ...q, settings: { ...q.settings, ...patch } })),
    [apply],
  );

  const updateMeta = useCallback(
    (patch: Partial<Quotation>) => apply((q) => ({ ...q, ...patch })),
    [apply],
  );

  return {
    quotation,
    status,
    notFound,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    historyVersion,
    apply,
    saveNow,
    undo,
    redo,
    addBlock,
    addBlocks,
    patchBlock,
    patchBlockSettings,
    duplicateBlock,
    deleteBlock,
    reorderBlock,
    moveBlock,
    updateSettings,
    updateMeta,
  };
}
