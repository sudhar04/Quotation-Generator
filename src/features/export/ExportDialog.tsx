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
    hint: "Opens your browser print dialog — choose “Save as PDF”.",
  },
  {
    key: "docx",
    title: "Editable Word (.docx)",
    description: "Native Word headings, tables and lists your client can edit.",
    icon: FileText,
    hint: "Downloads immediately with real Word styles, not an image.",
  },
];

export function ExportDialog({ open, onOpenChange, quotation, pages }: Props) {
  const [format, setFormat] = useState<Format>("pdf");
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (format === "pdf") {
      onOpenChange(false);
      // Let the dialog unmount so it is not captured in the printed output.
      setTimeout(() => window.print(), 120);
      return;
    }
    setBusy(true);
    try {
      await downloadDocx(quotation);
      toast.success("Word document downloaded");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Word export failed", {
        description: "Something went wrong while building the document.",
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {format === "pdf" ? "Export PDF" : "Download .docx"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
