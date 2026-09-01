import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseQuickText } from "@/lib/quick-text";
import { BLOCK_LABEL, type Block } from "@/models/quotation";

const EXAMPLE = `1. BUSINESS UNDERSTANDING & NEED ANALYSIS
SGP Promoters provides real estate and financial services.

Business Goals:
• Build a premium corporate online presence.
• Showcase property listings professionally.

Costing
Description                    Amount
Static Website                 ₹30,000
Domain                         ₹3,200
Total Payable                  ₹33,200`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (blocks: Block[], mode: "append" | "replace") => void;
}

export function QuickTextDialog({ open, onOpenChange, onApply }: Props) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Block[] | null>(null);

  const reset = () => {
    setText("");
    setParsed(null);
  };

  const handleParse = () => {
    if (!text.trim()) {
      toast.error("Paste your quotation text first");
      return;
    }
    const blocks = parseQuickText(text);
    if (!blocks.length) {
      toast.error("Nothing could be imported", { description: "Check the pasted content and try again." });
      return;
    }
    setParsed(blocks);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Text import</DialogTitle>
          <DialogDescription>
            Paste an existing quotation. Headings, paragraphs, lists, pricing and timeline tables are
            detected using formatting patterns — review the result before adding it.
          </DialogDescription>
        </DialogHeader>

        {parsed ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Review imported structure</p>
            <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3">
              {parsed.map((block, index) => (
                <div key={block.id} className="flex items-start gap-2 text-sm">
                  <Badge variant="secondary" className="mt-0.5 shrink-0 font-normal">
                    {BLOCK_LABEL[block.type]}
                  </Badge>
                  <span className="truncate text-muted-foreground">
                    {"html" in (block.content as Record<string, unknown>)
                      ? String((block.content as { html: string }).html).replace(/<[^>]+>/g, "")
                      : "items" in (block.content as Record<string, unknown>)
                        ? (block.content as { items: string[] }).items.join(" · ")
                        : `${index + 1} — structured block`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={EXAMPLE}
              className="h-72 resize-none font-mono text-[13px] leading-relaxed"
              aria-label="Quotation text to import"
            />
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setText(EXAMPLE)}
            >
              Insert example text
            </button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {parsed ? (
            <>
              <Button variant="outline" onClick={() => setParsed(null)}>
                Back
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onApply(parsed, "replace");
                  onOpenChange(false);
                  reset();
                  toast.success("Document replaced with imported blocks");
                }}
              >
                Replace document
              </Button>
              <Button
                onClick={() => {
                  onApply(parsed, "append");
                  onOpenChange(false);
                  reset();
                  toast.success(`${parsed.length} blocks added`);
                }}
              >
                Add to document
              </Button>
            </>
          ) : (
            <Button onClick={handleParse}>
              <Wand2 className="size-4" /> Parse text
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
