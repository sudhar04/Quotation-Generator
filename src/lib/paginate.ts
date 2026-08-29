import type { Block, DocumentSettings } from "@/models/quotation";

export const MM = 96 / 25.4;
export const A4_W_MM = 210;
export const A4_H_MM = 297;
export const PAGE_W = Math.round(A4_W_MM * MM);
export const PAGE_H = Math.round(A4_H_MM * MM);

export function contentBox(s: DocumentSettings) {
  const width = PAGE_W - (s.margins.left + s.margins.right) * MM;
  const footer = s.showPageNumbers || s.footerText ? 34 : 0;
  const header = s.showHeader ? 30 : 0;
  const height = PAGE_H - (s.margins.top + s.margins.bottom) * MM - footer - header;
  return { width, height, footer, header };
}

/** Group blocks into pages using measured heights. */
export function chunkBlocks(
  blocks: Block[],
  heights: Record<string, number>,
  pageHeight: number,
): Block[][] {
  const pages: Block[][] = [];
  let current: Block[] = [];
  let used = 0;

  const push = () => {
    pages.push(current);
    current = [];
    used = 0;
  };

  blocks.forEach((block, i) => {
    if (block.type === "pageBreak") {
      if (current.length) push();
      return;
    }
    const h = heights[block.id] ?? 40;
    // Keep headings/titles with the following block when possible.
    const keepWith =
      block.type === "heading" || block.type === "title" || block.type === "subtitle";
    const next = blocks[i + 1];
    const extra = keepWith && next ? Math.min(heights[next.id] ?? 40, 90) : 0;

    if (used > 0 && used + h + extra > pageHeight) push();
    current.push(block);
    used += h;
  });

  if (current.length || pages.length === 0) pages.push(current);
  return pages;
}
