import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  FileText,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteQuotation,
  hasSeeded,
  listQuotations,
  markSeeded,
  saveMany,
  saveQuotation,
} from "@/lib/storage";
import { TEMPLATES, quotationFromTemplate, sampleQuotations } from "@/lib/templates";
import { uid, type Quotation } from "@/models/quotation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quotation Studio — Block-based quotation & proposal editor" },
      {
        name: "description",
        content:
          "Create pixel-perfect A4 quotations in a block-based editor and export polished PDF or fully editable Word documents.",
      },
      { property: "og:title", content: "Quotation Studio — Block-based quotation editor" },
      {
        property: "og:description",
        content:
          "Replace manual Word quotations with a modern block editor, live A4 preview, and PDF or editable DOCX export.",
      },
    ],
  }),
  component: Dashboard,
});

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Quotation[] | null>(null);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Quotation | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!(await hasSeeded())) {
          await saveMany(sampleQuotations());
          await markSeeded();
        }
        const list = await listQuotations();
        if (active) setItems(list);
      } catch {
        if (active) setItems([]);
        toast.error("Could not load your quotations");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = items ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      [item.title, item.client, item.projectType, item.quotationNumber]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  const create = async (templateId: string) => {
    const doc = quotationFromTemplate(templateId);
    await saveQuotation(doc);
    setPickerOpen(false);
    navigate({ to: "/editor/$id", params: { id: doc.id } });
  };

  const duplicate = async (item: Quotation) => {
    const copy: Quotation = {
      ...JSON.parse(JSON.stringify(item)),
      id: uid(),
      title: `${item.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveQuotation(copy);
    setItems(await listQuotations());
    toast.success("Quotation duplicated");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteQuotation(pendingDelete.id);
    setPendingDelete(null);
    setItems(await listQuotations());
    toast.success("Quotation deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-6">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutGrid className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Quotation Studio</span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
            Stored locally on this device
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <section className="flex flex-col gap-6 border-b border-border pb-8">
          <div className="space-y-3">
            <Badge variant="secondary" className="font-normal">
              <Sparkles className="size-3" /> Block-based document editor
            </Badge>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Quotations that look designed, not typed.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Build proposals from structured blocks, preview them on real A4 pages, and export a clean
              PDF or a Word file your client can still edit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setPickerOpen(true)}>
              <Plus className="size-4" /> New quotation
            </Button>
            <div className="relative w-full max-w-xs sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search quotations"
                className="pl-8"
                aria-label="Search quotations"
              />
            </div>
          </div>
        </section>

        <section className="pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
            {items === null ? "Loading" : `${filtered.length} document${filtered.length === 1 ? "" : "s"}`}
          </h2>

          {items === null ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-36 animate-pulse rounded-xl border border-border bg-muted/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
              <FileText className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No quotations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start from a template or import an existing document with Quick Text.
              </p>
              <Button className="mt-4" onClick={() => setPickerOpen(true)}>
                <Plus className="size-4" /> Create your first quotation
              </Button>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <li
                  key={item.id}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_28px_-18px_rgba(16,24,40,0.35)]"
                >
                  <Link
                    to="/editor/$id"
                    params={{ id: item.id }}
                    className="flex-1 space-y-2 outline-none"
                  >
                    <p className="line-clamp-2 pr-14 text-sm font-medium leading-snug">
                      {item.title || "Untitled quotation"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.client || "No client"} · {item.blocks.length} blocks
                    </p>
                  </Link>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Edited {formatDate(item.updatedAt)}
                    </span>
                    <span className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Duplicate quotation"
                        onClick={() => duplicate(item)}
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete quotation"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start a new quotation</DialogTitle>
            <DialogDescription>
              Templates come pre-filled with sections you can rename, reorder or delete.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => create(template.id)}
                className={cn(
                  "w-full rounded-xl border border-border p-3 text-left transition-colors hover:border-ring hover:bg-accent/60",
                )}
              >
                <span className="block text-sm font-medium">{template.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {template.description}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be permanently removed from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
