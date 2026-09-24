import { useState } from "react";
import { FileDown, FileText, Loader2, Printer } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { downloadDocx } from "@/lib/docx-export";
import { downloadPdf } from "@/lib/pdf-export";
import { documentFileName } from "@/lib/download";
import type { Quotation } from "@/models/quotation";

type Format = "pdf" | "docx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation;
  pages: number;
}

const OPTIONS: {
  key: Format;
  title: string;
  description: string;
  icon: typeof FileText;
  hint: string;
}[] = [
  {
    key: "pdf",
    title: "PDF document",
    description: "Pixel-accurate A4 output that matches the preview exactly.",
    icon: Printer,
    hint: "Downloads a real A4 portrait PDF file — no print dialog needed.",
  },
  {
    key: "docx",
    title: "Editable Word (.docx)",
    description: "Native Word headings, tables and lists your client can edit.",
    icon: FileText,
    hint: "Downloads immediately with real Word styles, not an image.",
  },
];

function reason(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "Unexpected error while building the file.";
}

export function ExportDialog({ open, onOpenChange, quotation, pages }: Props) {
  const [format, setFormat] = useState<Format>("pdf");
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    const name = documentFileName(quotation.title);
    try {
      if (format === "pdf") {
        await downloadPdf(quotation);
        toast.success("PDF downloaded", { description: `${name}.pdf` });
      } else {
        await downloadDocx(quotation);
        toast.success("Word document downloaded", { description: `${name}.docx` });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(`[export:${format}]`, error);
      toast.error(format === "pdf" ? "PDF export failed" : "Word export failed", {
        description: reason(error),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export quotation</DialogTitle>
          <DialogDescription>
            {quotation.title || "Untitled quotation"} · {pages} {pages === 1 ? "page" : "pages"} · A4
            portrait
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {OPTIONS.map((option) => {
            const active = format === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFormat(option.key)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/60",
                  active && "border-ring bg-accent/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                    active && "bg-primary text-primary-foreground",
                  )}
                >
                  <option.icon className="size-4" />
                </span>
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">{option.title}</span>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                  <span className="block text-xs text-muted-foreground/80">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {busy
              ? format === "pdf"
                ? "Generating PDF…"
                : "Generating Word document…"
              : format === "pdf"
                ? "Download PDF"
                : "Download .docx"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
