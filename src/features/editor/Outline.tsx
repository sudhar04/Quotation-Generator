import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { BLOCK_LABEL, type Block, type Quotation } from "@/models/quotation";
import { htmlToPlain } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  quotation: Quotation;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface OutlineItem {
  id: string;
  label: string;
  depth: number;
}

function outlineItems(blocks: Block[]): OutlineItem[] {
  return blocks
    .filter((block) =>
      ["logo", "title", "metadata", "heading", "pricingTable", "timelineTable", "signature", "approval", "pageBreak"].includes(
        block.type,
      ),
    )
    .map((block) => {
      if (block.type === "heading") {
        const level = block.settings.level ?? 1;
        return {
          id: block.id,
          label: htmlToPlain((block.content as { html: string }).html) || "Heading",
          depth: level - 1,
        };
      }
      if (block.type === "title")
        return {
          id: block.id,
          label: htmlToPlain((block.content as { html: string }).html) || "Document title",
          depth: 0,
        };
      return { id: block.id, label: BLOCK_LABEL[block.type], depth: 0 };
    });
}

export function Outline({ quotation, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(true);
  const items = useMemo(() => outlineItems(quotation.blocks), [quotation.blocks]);

  const jump = (id: string) => {
    onSelect(id);
    document.getElementById(`block-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <nav aria-label="Document outline" className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground"
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        Document
      </button>
      {open ? (
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          {items.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">
              No sections yet. Add a heading to build your outline.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => jump(item.id)}
                    className={cn(
                      "w-full truncate rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                      item.depth === 0
                        ? "font-medium text-foreground/90"
                        : "text-muted-foreground",
                      selectedId === item.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted",
                    )}
                    style={{ paddingLeft: 8 + item.depth * 14 }}
                    title={item.label}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </nav>
  );
}
