import { makeBlock, uid, type Block } from "@/models/quotation";
import { parseAmount } from "./format";

const BULLET = /^[•\-*·▪]\s+/;
const NUMBERED = /^(\d+)[.)]\s+(.*)$/;
const HEADING_NUM = /^(\d+)\.\s+([A-Z0-9][^a-z]{2,})$/;
const SUBHEADING = /^([A-Z][A-Za-z0-9 &/'-]{2,60}):$/;
const CURRENCY_CELL = /(?:₹|\$|€|£|Rs\.?)\s?[\d,]+(?:\.\d{1,2})?$/;
const DURATION_CELL = /\b\d+\s*(?:[–-]\s*\d+\s*)?(?:day|days|week|weeks|month|months|hour|hours)\b/i;

function splitCells(line: string): string[] | null {
  if (line.includes("\t")) return line.split("\t").map((c) => c.trim()).filter(Boolean);
  if (line.includes("|"))
    return line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
  const m = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
  return m.length >= 2 ? m : null;
}

interface Pending {
  kind: "bullet" | "number" | "pricing" | "timeline";
  items: string[];
  rows: string[][];
}

/**
 * Deterministic parser for common quotation text patterns.
 * Recognises headings, sub-headings, paragraphs, bullet/numbered lists,
 * two-column pricing tables and timeline tables.
 */
export function parseQuickText(input: string): Block[] {
  const blocks: Block[] = [];
  let pending: Pending | null = null;

  const flush = () => {
    if (!pending) return;
    if (pending.kind === "bullet" || pending.kind === "number") {
      const base = makeBlock(pending.kind === "bullet" ? "bulletList" : "numberedList");
      blocks.push({ ...base, content: { items: pending.items } });
    } else if (pending.kind === "pricing") {
      const base = makeBlock("pricingTable");
      const rows = pending.rows.map(([description, amount]) => ({
        id: uid(),
        description,
        amount: parseAmount(amount),
      }));
      const totalRow = rows.find((r) => /total/i.test(r.description));
      blocks.push({
        ...base,
        content: {
          ...(base.content as object),
          rows: rows.filter((r) => r !== totalRow),
          autoCalculate: !totalRow,
          manualTotal: totalRow?.amount ?? 0,
          totalLabel: totalRow?.description ?? "Total Payable",
        } as Block["content"],
      });
    } else {
      const base = makeBlock("timelineTable");
      const rows = pending.rows.map(([task, duration]) => ({ id: uid(), task, duration }));
      const summary = rows.find((r) => /total/i.test(r.task));
      blocks.push({
        ...base,
        content: {
          ...(base.content as object),
          rows: rows.filter((r) => r !== summary),
          showSummary: Boolean(summary),
          summaryLabel: summary?.task ?? "Total Estimated Time",
          summaryValue: summary?.duration ?? "",
        } as Block["content"],
      });
    }
    pending = null;
  };

  const push = (block: Block) => {
    flush();
    blocks.push(block);
  };

  const lines = input.replace(/\r/g, "").split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }

    const cells = splitCells(line);
    if (cells && cells.length >= 2) {
      const last = cells[cells.length - 1];
      const first = cells.slice(0, -1).join(" ");
      if (CURRENCY_CELL.test(last) || (/^\d[\d,]*$/.test(last) && !DURATION_CELL.test(last))) {
        if (pending?.kind !== "pricing") {
          flush();
          pending = { kind: "pricing", items: [], rows: [] };
        }
        pending.rows.push([first, last]);
        continue;
      }
      if (DURATION_CELL.test(last)) {
        if (pending?.kind !== "timeline") {
          flush();
          pending = { kind: "timeline", items: [], rows: [] };
        }
        pending.rows.push([first, last]);
        continue;
      }
      if (/^(description|task|item|particulars)$/i.test(cells[0])) {
        flush();
        continue;
      }
    }

    if (BULLET.test(line)) {
      const text = line.replace(BULLET, "").trim();
      if (pending?.kind !== "bullet") {
        flush();
        pending = { kind: "bullet", items: [], rows: [] };
      }
      pending.items.push(text);
      continue;
    }

    const numbered = line.match(NUMBERED);
    const headingNum = line.match(HEADING_NUM);

    if (headingNum) {
      push({
        ...makeBlock("heading"),
        content: { html: line },
        settings: { level: 1, fontSize: 13, fontWeight: 700, spaceBefore: 12, spaceAfter: 6 },
      });
      continue;
    }

    if (numbered) {
      const text = numbered[2].trim();
      if (text.length < 48 && /^[A-Z]/.test(text) && !text.endsWith(".")) {
        push({
          ...makeBlock("heading"),
          content: { html: line },
          settings: { level: 2, fontSize: 11.5, fontWeight: 700, spaceBefore: 10, spaceAfter: 4 },
        });
        continue;
      }
      if (pending?.kind !== "number") {
        flush();
        pending = { kind: "number", items: [], rows: [] };
      }
      pending.items.push(text);
      continue;
    }

    if (SUBHEADING.test(line)) {
      push({
        ...makeBlock("heading"),
        content: { html: line.replace(/:$/, "") },
        settings: { level: 2, fontSize: 11.5, fontWeight: 700, spaceBefore: 10, spaceAfter: 4 },
      });
      continue;
    }

    if (line === line.toUpperCase() && line.length > 3 && line.length < 70 && /[A-Z]/.test(line)) {
      push({
        ...makeBlock("heading"),
        content: { html: line },
        settings: { level: 1, fontSize: 13, fontWeight: 700, spaceBefore: 12, spaceAfter: 6 },
      });
      continue;
    }

    push({ ...makeBlock("paragraph"), content: { html: line } });
  }

  flush();
  return blocks;
}
