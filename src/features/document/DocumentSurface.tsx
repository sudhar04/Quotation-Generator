import { Copy, GripVertical, Trash2 } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DocumentBlock } from "./DocumentBlock";
import { chunkBlocks, contentBox, PAGE_H, PAGE_W } from "@/lib/paginate";
import { BLOCK_LABEL, type Block, type Quotation } from "@/models/quotation";
import { cn } from "@/lib/utils";

interface Props {
  quotation: Quotation;
  editable?: boolean;
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onBlockChange?: (id: string, patch: Partial<Block>) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (fromId: string, toId: string) => void;
  onPages?: (count: number) => void;
  className?: string;
}

/** Automatic section numbers for heading blocks. */
function sectionPrefixes(quotation: Quotation): Record<string, string> {
  const map: Record<string, string> = {};
  if (!quotation.settings.autoNumberSections) return map;
  let l1 = 0;
  let l2 = 0;
  quotation.blocks.forEach((block) => {
    if (block.type !== "heading") return;
    const level = block.settings.level ?? 1;
    if (level === 1) {
      l1 += 1;
      l2 = 0;
      map[block.id] = `${l1}.`;
    } else if (level === 2) {
      l2 += 1;
      map[block.id] = `${l1}.${l2}`;
    }
  });
  return map;
}

export function DocumentSurface({
  quotation,
  editable = false,
  zoom = 1,
  selectedId,
  onSelect,
  onBlockChange,
  onDuplicate,
  onDelete,
  onReorder,
  onPages,
  className,
}: Props) {
  const settings = quotation.settings;
  const box = useMemo(() => contentBox(settings), [settings]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const prefixes = useMemo(() => sectionPrefixes(quotation), [quotation]);

  const measure = useCallback(() => {
    const node = measureRef.current;
    if (!node) return;
    const next: Record<string, number> = {};
    node.querySelectorAll<HTMLElement>("[data-measure-id]").forEach((el) => {
      const id = el.dataset.measureId as string;
      const style = window.getComputedStyle(el);
      next[id] =
        el.getBoundingClientRect().height +
        Number.parseFloat(style.marginTop || "0") +
        Number.parseFloat(style.marginBottom || "0");
    });
    setHeights((prev) => {
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.entries(next).every(([k, v]) => Math.abs((prev[k] ?? -1) - v) < 0.5);
      return same ? prev : next;
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, quotation.blocks, settings]);

  useEffect(() => {
    const node = measureRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  const pages = useMemo(
    () => chunkBlocks(quotation.blocks, heights, box.height),
    [quotation.blocks, heights, box.height],
  );

  useEffect(() => {
    onPages?.(pages.length);
  }, [pages.length, onPages]);

  const docStyle = {
    "--doc-font": settings.fontFamily,
    "--doc-size": `${settings.bodySize}pt`,
    "--doc-leading": String(settings.lineHeight),
    "--doc-text": settings.textColor,
    "--doc-primary": settings.primaryColor,
  } as React.CSSProperties;

  const renderBlock = (block: Block) => (
    <DocumentBlock
      block={block}
      settings={settings}
      editable={editable}
      prefix={prefixes[block.id]}
      onFocus={() => onSelect?.(block.id)}
      onChange={(patch) => onBlockChange?.(block.id, patch)}
    />
  );

  return (
    <div className={cn("flex flex-col items-center gap-8", className)}>
      {/* Hidden measurement layer — mirrors document typography at content width. */}
      <div
        aria-hidden
        className="qs-doc pointer-events-none absolute -z-10 opacity-0"
        style={{ ...docStyle, width: box.width, position: "fixed", top: -99999, left: 0 }}
      >
        <div ref={measureRef}>
          {quotation.blocks.map((block) => (
            <div
              key={block.id}
              data-measure-id={block.id}
              style={{
                marginTop: block.settings.spaceBefore ?? 0,
                marginBottom: block.settings.spaceAfter ?? 0,
              }}
            >
              <DocumentBlock block={block} settings={settings} prefix={prefixes[block.id]} />
            </div>
          ))}
        </div>
      </div>

      {pages.map((pageBlocks, pageIndex) => (
        <div
          key={pageIndex}
          className="qs-page qs-doc shrink-0 rounded-[2px] shadow-paper"
          style={{
            ...docStyle,
            width: PAGE_W,
            height: PAGE_H,
            paddingTop: `${settings.margins.top}mm`,
            paddingRight: `${settings.margins.right}mm`,
            paddingBottom: `${settings.margins.bottom}mm`,
            paddingLeft: `${settings.margins.left}mm`,
            transform: zoom === 1 ? undefined : `scale(${zoom})`,
            transformOrigin: "top center",
            marginBottom: zoom === 1 ? undefined : `${(zoom - 1) * PAGE_H}px`,
          }}
        >
          {settings.showHeader ? (
            <div
              style={{
                position: "absolute",
                top: `${Math.max(settings.margins.top - 10, 4)}mm`,
                left: `${settings.margins.left}mm`,
                right: `${settings.margins.right}mm`,
                fontSize: "8pt",
                color: settings.secondaryColor,
                borderBottom: `1px solid #e4e9ee`,
                paddingBottom: 4,
              }}
            >
              {settings.headerText || quotation.title}
            </div>
          ) : null}

          <div style={{ height: box.height + (settings.showHeader ? 0 : 0) }}>
            {pageBlocks.map((block) => (
              <div
                key={block.id}
                id={`block-${block.id}`}
                data-block-id={block.id}
                draggable={editable && dragId === block.id}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", block.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => {
                  if (editable && dragId) event.preventDefault();
                }}
                onDrop={(event) => {
                  const from = event.dataTransfer.getData("text/plain");
                  if (from && from !== block.id) onReorder?.(from, block.id);
                  setDragId(null);
                }}
                onMouseDown={() => editable && onSelect?.(block.id)}
                className={cn(
                  "relative transition-[box-shadow,background-color] duration-150",
                  editable && "group/block rounded-[3px]",
                  editable && "hover:bg-[#f7f9fb]",
                  editable &&
                    selectedId === block.id &&
                    "bg-[#f4f8fc] shadow-[0_0_0_1.5px_var(--color-ring)]",
                )}
                style={{
                  marginTop: block.settings.spaceBefore ?? 0,
                  marginBottom: block.settings.spaceAfter ?? 0,
                }}
              >
                {editable ? (
                  <div className="qs-no-print pointer-events-none absolute -left-[38px] top-0 flex h-6 items-center opacity-0 transition group-hover/block:pointer-events-auto group-hover/block:opacity-100">
                    <button
                      type="button"
                      aria-label={`Drag ${BLOCK_LABEL[block.type]}`}
                      title="Drag to reorder"
                      onMouseDown={() => setDragId(block.id)}
                      className="cursor-grab rounded-md border border-border bg-card p-1 text-muted-foreground shadow-panel hover:text-foreground"
                    >
                      <GripVertical className="size-3.5" />
                    </button>
                  </div>
                ) : null}

                {editable ? (
                  <div className="qs-no-print pointer-events-none absolute -top-3 right-0 z-10 flex items-center gap-1 opacity-0 transition group-hover/block:pointer-events-auto group-hover/block:opacity-100">
                    <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-panel">
                      {BLOCK_LABEL[block.type]}
                    </span>
                    <button
                      type="button"
                      aria-label={`Duplicate ${BLOCK_LABEL[block.type]}`}
                      onClick={() => onDuplicate?.(block.id)}
                      className="rounded-md border border-border bg-card p-1 text-muted-foreground shadow-panel hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${BLOCK_LABEL[block.type]}`}
                      onClick={() => onDelete?.(block.id)}
                      className="rounded-md border border-border bg-card p-1 text-muted-foreground shadow-panel hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ) : null}

                {renderBlock(block)}
              </div>
            ))}
          </div>

          {settings.showPageNumbers || settings.footerText ? (
            <div
              className="qs-page-footer"
              style={{
                position: "absolute",
                bottom: `${Math.max(settings.margins.bottom - 10, 4)}mm`,
                left: `${settings.margins.left}mm`,
                right: `${settings.margins.right}mm`,
                display: "flex",
                justifyContent: "space-between",
                fontSize: "8pt",
                color: settings.secondaryColor,
                borderTop: "1px solid #e4e9ee",
                paddingTop: 4,
              }}
            >
              <span>{settings.footerText}</span>
              {settings.showPageNumbers ? (
                <span>
                  Page {pageIndex + 1} of {pages.length}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
