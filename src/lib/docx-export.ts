import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  PageNumber,
} from "docx";
import {
  type Align,
  type ApprovalContent,
  type Block,
  type CustomTableContent,
  type ListContent,
  type LogoContent,
  type MetadataContent,
  type PricingContent,
  type Quotation,
  type SignatureContent,
  type SpacerContent,
  type TextContent,
  type TimelineContent,
} from "@/models/quotation";
import { formatAmount, pricingTotals } from "./format";

const MM_TO_TWIP = 56.7;
const MM_TO_DXA = 56.7;

const ALIGN: Record<Align, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

interface RunStyle {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
}

/**
 * Convert a small subset of inline HTML into docx runs.
 * Styles are baked into each run at creation time — docx run instances are
 * immutable, so they must never be re-created from an existing run.
 */
function htmlToRuns(
  html: string,
  size: number,
  color: string,
  force: RunStyle = {},
): TextRun[] {
  const runs: TextRun[] = [];
  const make = (text: string, style: RunStyle) =>
    new TextRun({
      text,
      size: Math.max(2, Math.round(size * 2)),
      color: (color || "#1a1a1a").replace("#", ""),
      bold: force.bold || style.bold,
      italics: force.italics || style.italics,
      underline: force.underline || style.underline ? {} : undefined,
      strike: force.strike || style.strike,
      font: "Arial",
    });

  const source = typeof html === "string" ? html : "";

  if (typeof DOMParser === "undefined") {
    const plain = source
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    plain.split("\n").forEach((line, i) => {
      if (i > 0) runs.push(new TextRun({ break: 1 }));
      if (line) runs.push(make(line, {}));
    });
  } else {
    const doc = new DOMParser().parseFromString(`<div>${source}</div>`, "text/html");
    const walk = (node: Node, style: RunStyle) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          const text = child.textContent ?? "";
          if (!text) return;
          runs.push(make(text, style));
          return;
        }
        if (child.nodeType !== 1) return;
        const el = child as HTMLElement;
        const tag = el.tagName.toUpperCase();
        if (tag === "BR") {
          runs.push(new TextRun({ break: 1 }));
          return;
        }
        const next: RunStyle = { ...style };
        if (tag === "B" || tag === "STRONG") next.bold = true;
        if (tag === "I" || tag === "EM") next.italics = true;
        if (tag === "U") next.underline = true;
        if (tag === "S" || tag === "STRIKE" || tag === "DEL") next.strike = true;
        walk(el, next);
      });
    };
    const root = doc.body.firstElementChild;
    if (root) walk(root, {});
  }

  if (!runs.length)
    runs.push(new TextRun({ text: "", size: Math.max(2, Math.round(size * 2)), font: "Arial" }));
  return runs;
}

async function dataUrlToBuffer(src: string) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Logo image could not be read (${res.status})`);
  const blob = await res.blob();
  return { buffer: await blob.arrayBuffer(), type: blob.type };
}

/** SVG needs a raster fallback in docx, so it is not supported here. */
function imageType(mime: string): "png" | "jpg" | "gif" | "bmp" {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("bmp")) return "bmp";
  return "png";
}

function cell(
  children: Paragraph[],
  width: number,
  opts?: { fill?: string; bold?: boolean },
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: opts?.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CFD6DD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CFD6DD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CFD6DD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CFD6DD" },
    },
    children,
  });
}

export async function buildDocx(q: Quotation): Promise<Blob> {
  const s = q.settings;
  const body = s.bodySize;
  const text = s.textColor;
  const primary = s.primaryColor.replace("#", "");
  const contentWidth = Math.round((210 - s.margins.left - s.margins.right) * MM_TO_DXA);
  const children: (Paragraph | Table)[] = [];

  const styledParagraph = (
    html: string,
    size: number,
    bold: boolean,
    align: Align,
    color: string,
    before: number,
    after: number,
  ) =>
    new Paragraph({
      alignment: ALIGN[align],
      spacing: { before: Math.round(before * 20), after: Math.round(after * 20), line: Math.round(s.lineHeight * 240) },
      children: htmlToRuns(html, size, color, { bold }),
    });


  for (const block of q.blocks) {
    const bs = block.settings;
    const before = bs.spaceBefore ?? 0;
    const after = bs.spaceAfter ?? 4;
    const align = bs.align ?? "left";
    const size = bs.fontSize ?? body;

    switch (block.type) {
      case "logo": {
        const logo = block.content as LogoContent;
        if (!logo.src) break;
        try {
          const { buffer, type } = await dataUrlToBuffer(logo.src);
          const width = ((bs.width ?? s.logoWidth) / 210) * (210 - s.margins.left - s.margins.right) * 3.78;
          children.push(
            new Paragraph({
              alignment: ALIGN[bs.align ?? s.logoAlign],
              spacing: { after: Math.round((bs.spaceAfter ?? 10) * 20) },
              children: [
                new ImageRun({
                  type: imageType(type),
                  data: buffer,
                  transformation: { width: Math.round(width), height: Math.round(width * 0.4) },
                  altText: { title: "Logo", description: logo.alt || "Logo", name: "Logo" },
                }),
              ],
            }),
          );
        } catch {
          /* skip unreadable image */
        }
        break;
      }
      case "title":
        children.push(
          styledParagraph(
            (block.content as TextContent).html,
            size,
            true,
            align,
            `#${primary}`,
            before,
            after,
          ),
        );
        break;
      case "subtitle":
        children.push(
          styledParagraph(
            (block.content as TextContent).html,
            size,
            false,
            align,
            s.secondaryColor,
            before,
            after,
          ),
        );
        break;
      case "heading": {
        const level = bs.level ?? 1;
        children.push(
          new Paragraph({
            alignment: ALIGN[align],
            heading:
              level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
            spacing: { before: Math.round(before * 20), after: Math.round(after * 20) },
            children: htmlToRuns((block.content as TextContent).html, size, s.primaryColor, {
              bold: true,
            }),
          }),
        );
        break;
      }
      case "paragraph":
      case "richText":
      case "footer":
        children.push(
          styledParagraph((block.content as TextContent).html, size, false, align, text, before, after),
        );
        break;
      case "note":
        children.push(
          new Paragraph({
            spacing: { before: Math.round(before * 20), after: Math.round(after * 20) },
            border: {
              left: { style: BorderStyle.SINGLE, size: 12, color: primary, space: 6 },
            },
            shading: { fill: "F4F7FA", type: ShadingType.CLEAR },
            children: htmlToRuns((block.content as TextContent).html, size, text),
          }),
        );
        break;
      case "bulletList":
      case "numberedList": {
        const items = (block.content as ListContent).items;
        items.forEach((item, i) => {
          children.push(
            new Paragraph({
              numbering: { reference: block.type === "bulletList" ? "qs-bullets" : "qs-numbers", level: 0 },
              spacing: {
                after: Math.round((i === items.length - 1 ? after : 2) * 20),
                line: Math.round(s.lineHeight * 240),
              },
              children: htmlToRuns(item, size, text),
            }),
          );
        });
        break;
      }
      case "metadata": {
        const fields = (block.content as MetadataContent).fields;
        fields.forEach((field) => {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${field.label}: `, bold: true, size: Math.round(size * 2), font: "Arial", color: text.replace("#", "") }),
                new TextRun({ text: field.value, size: Math.round(size * 2), font: "Arial", color: text.replace("#", "") }),
              ],
            }),
          );
        });
        children.push(new Paragraph({ spacing: { after: Math.round(after * 20) }, children: [] }));
        break;
      }
      case "divider":
        children.push(
          new Paragraph({
            spacing: { before: Math.round(before * 20), after: Math.round(after * 20) },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CFD6DD", space: 1 } },
            children: [],
          }),
        );
        break;
      case "spacer":
        children.push(
          new Paragraph({
            spacing: { after: Math.round((block.content as SpacerContent).height * 15) },
            children: [],
          }),
        );
        break;
      case "pageBreak":
        children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
        break;
      case "pricingTable": {
        const c = block.content as PricingContent;
        const totals = pricingTotals(c);
        const w = [Math.round(contentWidth * 0.7), contentWidth - Math.round(contentWidth * 0.7)];
        const rows: TableRow[] = [
          new TableRow({
            tableHeader: true,
            children: [
              cell([styledParagraph(c.columns[0], size, true, "left", s.primaryColor, 0, 0)], w[0], { fill: "F1F4F7" }),
              cell([styledParagraph(c.columns[1], size, true, "right", s.primaryColor, 0, 0)], w[1], { fill: "F1F4F7" }),
            ],
          }),
          ...c.rows.map(
            (r) =>
              new TableRow({
                children: [
                  cell([styledParagraph(r.description, size, false, "left", text, 0, 0)], w[0]),
                  cell([styledParagraph(formatAmount(r.amount, c.currency), size, false, "right", text, 0, 0)], w[1]),
                ],
              }),
          ),
        ];
        if (c.showSubtotal)
          rows.push(
            new TableRow({
              children: [
                cell([styledParagraph("Subtotal", size, false, "left", text, 0, 0)], w[0]),
                cell([styledParagraph(formatAmount(totals.subtotal, c.currency), size, false, "right", text, 0, 0)], w[1]),
              ],
            }),
          );
        if (c.discount > 0)
          rows.push(
            new TableRow({
              children: [
                cell([styledParagraph("Discount", size, false, "left", text, 0, 0)], w[0]),
                cell([styledParagraph(`- ${formatAmount(totals.discount, c.currency)}`, size, false, "right", text, 0, 0)], w[1]),
              ],
            }),
          );
        if (c.taxRate > 0)
          rows.push(
            new TableRow({
              children: [
                cell([styledParagraph(c.taxLabel, size, false, "left", text, 0, 0)], w[0]),
                cell([styledParagraph(formatAmount(totals.tax, c.currency), size, false, "right", text, 0, 0)], w[1]),
              ],
            }),
          );
        rows.push(
          new TableRow({
            children: [
              cell([styledParagraph(c.totalLabel, size, true, "left", s.primaryColor, 0, 0)], w[0], { fill: "F1F4F7" }),
              cell([styledParagraph(formatAmount(totals.total, c.currency), size, true, "right", s.primaryColor, 0, 0)], w[1], { fill: "F1F4F7" }),
            ],
          }),
        );
        children.push(new Table({ width: { size: contentWidth, type: WidthType.DXA }, columnWidths: w, rows }));
        children.push(new Paragraph({ spacing: { after: Math.round(after * 20) }, children: [] }));
        break;
      }
      case "timelineTable": {
        const c = block.content as TimelineContent;
        const w = [Math.round(contentWidth * 0.72), contentWidth - Math.round(contentWidth * 0.72)];
        const rows: TableRow[] = [
          new TableRow({
            tableHeader: true,
            children: [
              cell([styledParagraph(c.columns[0], size, true, "left", s.primaryColor, 0, 0)], w[0], { fill: "F1F4F7" }),
              cell([styledParagraph(c.columns[1], size, true, "left", s.primaryColor, 0, 0)], w[1], { fill: "F1F4F7" }),
            ],
          }),
          ...c.rows.map(
            (r) =>
              new TableRow({
                children: [
                  cell([styledParagraph(r.task, size, false, "left", text, 0, 0)], w[0]),
                  cell([styledParagraph(r.duration, size, false, "left", text, 0, 0)], w[1]),
                ],
              }),
          ),
        ];
        if (c.showSummary)
          rows.push(
            new TableRow({
              children: [
                cell([styledParagraph(c.summaryLabel, size, true, "left", s.primaryColor, 0, 0)], w[0], { fill: "F1F4F7" }),
                cell([styledParagraph(c.summaryValue, size, true, "left", s.primaryColor, 0, 0)], w[1], { fill: "F1F4F7" }),
              ],
            }),
          );
        children.push(new Table({ width: { size: contentWidth, type: WidthType.DXA }, columnWidths: w, rows }));
        children.push(new Paragraph({ spacing: { after: Math.round(after * 20) }, children: [] }));
        break;
      }
      case "customTable": {
        const c = block.content as CustomTableContent;
        const cols = c.rows[0]?.length ?? 1;
        const w = c.columnWidths
          .slice(0, cols)
          .map((pct) => Math.round((pct / 100) * contentWidth));
        const diff = contentWidth - w.reduce((a, b) => a + b, 0);
        if (w.length) w[w.length - 1] += diff;
        children.push(
          new Table({
            width: { size: contentWidth, type: WidthType.DXA },
            columnWidths: w,
            rows: c.rows.map(
              (row, ri) =>
                new TableRow({
                  tableHeader: ri === 0 && c.headerRow,
                  children: row.map((value, ci) =>
                    cell(
                      [
                        styledParagraph(
                          value,
                          size,
                          ri === 0 && c.headerRow,
                          c.align[ci] ?? "left",
                          ri === 0 && c.headerRow ? s.primaryColor : text,
                          0,
                          0,
                        ),
                      ],
                      w[ci] ?? Math.round(contentWidth / cols),
                      ri === 0 && c.headerRow ? { fill: "F1F4F7" } : undefined,
                    ),
                  ),
                }),
            ),
          }),
        );
        children.push(new Paragraph({ spacing: { after: Math.round(after * 20) }, children: [] }));
        break;
      }
      case "signature":
      case "approval": {
        const isApproval = block.type === "approval";
        const c = block.content as SignatureContent & Partial<ApprovalContent>;
        if (isApproval) {
          children.push(
            styledParagraph(c.heading ?? "Approval", size + 1.5, true, "left", s.primaryColor, before, 4),
          );
          children.push(styledParagraph(c.statement ?? "", size, false, "left", text, 0, 8));
        }
        const w = [
          Math.round(contentWidth * 0.4),
          Math.round(contentWidth * 0.35),
          contentWidth - Math.round(contentWidth * 0.4) - Math.round(contentWidth * 0.35),
        ];
        children.push(
          new Table({
            width: { size: contentWidth, type: WidthType.DXA },
            columnWidths: w,
            rows: [
              new TableRow({
                tableHeader: true,
                children: c.columns.map((col, i) =>
                  cell([styledParagraph(col, size, true, "left", s.primaryColor, 0, 0)], w[i], { fill: "F1F4F7" }),
                ),
              }),
              ...c.parties.map(
                (p) =>
                  new TableRow({
                    height: { value: 700, rule: "atLeast" },
                    children: [
                      cell(
                        [
                          styledParagraph(p.name || p.role, size, false, "left", text, 0, 0),
                          styledParagraph(p.name ? p.role : "", size - 1.5, false, "left", s.secondaryColor, 0, 0),
                        ],
                        w[0],
                      ),
                      cell([styledParagraph("", size, false, "left", text, 0, 0)], w[1]),
                      cell([styledParagraph("", size, false, "left", text, 0, 0)], w[2]),
                    ],
                  }),
              ),
            ],
          }),
        );
        children.push(new Paragraph({ spacing: { after: Math.round(after * 20) }, children: [] }));
        break;
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "qs-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 460, hanging: 260 } } },
            },
          ],
        },
        {
          reference: "qs-numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 460, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: { document: { run: { font: "Arial", size: Math.round(body * 2) } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: {
              top: Math.round(s.margins.top * MM_TO_TWIP),
              right: Math.round(s.margins.right * MM_TO_TWIP),
              bottom: Math.round(s.margins.bottom * MM_TO_TWIP),
              left: Math.round(s.margins.left * MM_TO_TWIP),
            },
          },
        },
        footers: s.showPageNumbers
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        children: [s.footerText ? `${s.footerText}   •   ` : "", "Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                        size: 16,
                        color: "7A8798",
                        font: "Arial",
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function downloadDocx(q: Quotation) {
  const blob = await buildDocx(q);
  if (!blob || blob.size === 0) throw new Error("The generated Word file was empty.");
  saveBlob(blob, `${documentFileName(q.title)}.docx`);
}
