import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Download,
  Eye,
  Loader2,
  Minus,
  PanelLeft,
  PanelRight,
  Pencil,
  Plus,
  Redo2,
  Undo2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentSurface } from "@/features/document/DocumentSurface";
import { Outline } from "@/features/editor/Outline";
import { Inspector } from "@/features/editor/Inspector";
import { AddBlockMenu } from "@/features/editor/AddBlockMenu";
import { QuickTextDialog } from "@/features/editor/QuickTextDialog";
import { ExportDialog } from "@/features/export/ExportDialog";
import { useQuotationEditor } from "@/hooks/useQuotationEditor";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({
    meta: [
      { title: "Editor — Quotation Studio" },
      {
        name: "description",
        content:
          "Edit your quotation block by block on a live A4 canvas, then export it as PDF or an editable Word file.",
      },
      { property: "og:title", content: "Editor — Quotation Studio" },
      {
        property: "og:description",
        content: "Block-based A4 quotation editor with PDF and editable Word export.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorPage,
});

const ZOOMS = [0.6, 0.75, 0.9, 1, 1.25, 1.5];

function EditorPage() {
  const { id } = Route.useParams();
  const editor = useQuotationEditor(id);
  const {
    quotation,
    status,
    notFound,
    canUndo,
    canRedo,
    undo,
    redo,
    addBlock,
    addBlocks,
    patchBlock,
    patchBlockSettings,
    duplicateBlock,
    deleteBlock,
    reorderBlock,
    updateSettings,
    updateMeta,
  } = editor;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.9);
  const [pages, setPages] = useState(1);
  const [preview, setPreview] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [quickOpen, setQuickOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      } else if (key === "e") {
        event.preventDefault();
        setExportOpen(true);
      } else if (key === "p") {
        event.preventDefault();
        setPreview((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">Quotation not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been deleted from this device.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selected = quotation.blocks.find((block) => block.id === selectedId) ?? null;

  const zoomStep = (direction: -1 | 1) => {
    const index = ZOOMS.indexOf(zoom);
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (index < 0 ? 3 : index) + direction))];
    setZoom(next);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40">
      <header className="qs-no-print flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to dashboard">
          <Link to="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{quotation.title || "Untitled quotation"}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {status === "saving" ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Saving…
              </>
            ) : status === "error" ? (
              <>
                <CloudOff className="size-3" /> Not saved
              </>
            ) : (
              <>
                <Check className="size-3" /> Saved · {pages} {pages === 1 ? "page" : "pages"}
              </>
            )}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo">
                <Undo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (⌘Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo">
                <Redo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⇧⌘Z)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <div className="hidden items-center gap-1 rounded-md border border-border px-1 sm:flex">
            <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => zoomStep(-1)}>
              <Minus className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => zoomStep(1)}>
              <Plus className="size-3.5" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setQuickOpen(true)}>
            <Wand2 className="size-4" /> Quick Text
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreview((value) => !value)}>
            {preview ? <Pencil className="size-4" /> : <Eye className="size-4" />}
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)}>
            <Download className="size-4" /> Export
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "qs-no-print hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex",
            (!leftOpen || preview) && "lg:hidden",
          )}
        >
          <div className="flex items-center justify-between px-4 pb-1 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Outline
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outline quotation={quotation} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="border-t border-border p-3">
            <AddBlockMenu
              className="w-full"
              onAdd={(type) => setSelectedId(addBlock(type, selectedId))}
            />
          </div>
        </aside>

        <main className="qs-print-root min-h-0 flex-1 overflow-auto bg-muted/40 p-6">
          <DocumentSurface
            quotation={quotation}
            editable={!preview}
            zoom={zoom}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBlockChange={patchBlock}
            onDuplicate={duplicateBlock}
            onDelete={(blockId) => {
              deleteBlock(blockId);
              setSelectedId(null);
            }}
            onReorder={reorderBlock}
            onPages={setPages}
          />
          {!preview ? (
            <div className="qs-no-print mx-auto mt-4 flex max-w-[794px] justify-center">
              <AddBlockMenu
                label="Add block to end"
                variant="ghost"
                onAdd={(type) => setSelectedId(addBlock(type, quotation.blocks.at(-1)?.id ?? null))}
              />
            </div>
          ) : null}
        </main>

        <aside
          className={cn(
            "qs-no-print hidden w-72 shrink-0 border-l border-border bg-background xl:block",
            (!rightOpen || preview) && "xl:hidden",
          )}
        >
          <Inspector
            quotation={quotation}
            block={selected}
            onBlockSettings={(patch) => selected && patchBlockSettings(selected.id, patch)}
            onBlockContent={(patch) =>
              selected &&
              patchBlock(selected.id, {
                content: { ...(selected.content as Record<string, unknown>), ...patch },
              } as never)
            }
            onSettings={updateSettings}
            onMeta={updateMeta}
          />
        </aside>
      </div>

      <div className="qs-no-print pointer-events-none fixed bottom-4 right-4 hidden gap-2 lg:flex">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Toggle outline panel"
          className="pointer-events-auto shadow-sm"
          onClick={() => setLeftOpen((value) => !value)}
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Toggle inspector panel"
          className="pointer-events-auto hidden shadow-sm xl:inline-flex"
          onClick={() => setRightOpen((value) => !value)}
        >
          <PanelRight className="size-4" />
        </Button>
      </div>

      <QuickTextDialog
        open={quickOpen}
        onOpenChange={setQuickOpen}
        onApply={(blocks, mode) => addBlocks(blocks, mode)}
      />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        quotation={quotation}
        pages={pages}
      />
    </div>
  );
}
