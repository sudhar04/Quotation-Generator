import { Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { Editable } from "./Editable";
import { RichText } from "@/features/editor/RichText";
import { formatAmount, parseAmount, pricingTotals, sanitizeHtml } from "@/lib/format";
import {
  uid,
  type ApprovalContent,
  type Block,
  type CustomTableContent,
  type DocumentSettings,
  type ListContent,
  type LogoContent,
  type MetadataContent,
  type PricingContent,
  type SignatureContent,
  type SpacerContent,
  type TextContent,
  type TimelineContent,
} from "@/models/quotation";
import { cn } from "@/lib/utils";

export interface DocumentBlockProps {
  block: Block;
  settings: DocumentSettings;
  editable?: boolean;
  prefix?: string;
  onChange?: (patch: Partial<Block>) => void;
  onFocus?: () => void;
}

const HEADING_SIZE = { 1: 13, 2: 11.5, 3: 10.5 } as const;

export function blockSpacing(block: Block): CSSProperties {
  return {
    marginTop: block.settings.spaceBefore ? `${block.settings.spaceBefore}px` : undefined,
    marginBottom: block.settings.spaceAfter ? `${block.settings.spaceAfter}px` : undefined,
  };
}

function textStyle(block: Block, settings: DocumentSettings, fallbackSize?: number): CSSProperties {
  const s = block.settings;
  return {
    textAlign: s.align,
    fontFamily: s.fontFamily ?? undefined,
    fontSize: `${(s.fontSize ?? fallbackSize ?? settings.bodySize) * (block.type === "heading" || block.type === "title" ? settings.headingScale : 1)}pt`,
    fontWeight: s.fontWeight ?? undefined,
    lineHeight: s.lineHeight ?? undefined,
    color: s.color ?? undefined,
  };
}

export function DocumentBlock({
  block,
  settings,
  editable = false,
  prefix,
  onChange,
  onFocus,
}: DocumentBlockProps) {
  const patchContent = (partial: Record<string, unknown>) =>
    onChange?.({ content: { ...(block.content as object), ...partial } as Block["content"] });

  const html = (block.content as TextContent).html ?? "";

  const renderText = (style: CSSProperties, placeholder: string, singleLine = false) =>
    editable ? (
      <RichText
        value={html}
        singleLine={singleLine}
        placeholder={placeholder}
        style={style}
        onFocus={onFocus}
        onChange={(next) => patchContent({ html: next })}
      />
    ) : (
      <div style={style} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    );

  switch (block.type) {
    case "logo": {
      const logo = block.content as LogoContent;
      const align = block.settings.align ?? settings.logoAlign;
      const width = block.settings.width ?? settings.logoWidth;
      return (
        <div
          style={{
            display: "flex",
            justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
          }}
        >
          {logo.src ? (
            <img
              src={logo.src}
              alt={logo.alt || "Company logo"}
              style={{ width: `${width}mm`, height: "auto" }}
            />
          ) : (
            <div
              className={cn(
                "flex h-[16mm] items-center justify-center rounded border border-dashed px-4 text-[9pt]",
                editable ? "border-[#c9d2dc] text-[#8c97a5]" : "border-transparent text-transparent",
              )}
              style={{ width: `${width}mm` }}
            >
              {editable ? "Upload logo in the inspector" : ""}
            </div>
          )}
        </div>
      );
    }

    case "title":
      return renderText(
        {
          ...textStyle(block, settings, 20),
          color: block.settings.color ?? settings.primaryColor,
          letterSpacing: "0.01em",
        },
        "Document title",
        true,
      );

    case "subtitle":
      return renderText(
        { ...textStyle(block, settings, 12), color: block.settings.color ?? settings.secondaryColor },
        "Subtitle",
        true,
      );

    case "heading": {
      const level = block.settings.level ?? 1;
      const Tag = (level === 1 ? "h2" : level === 2 ? "h3" : "h4") as "h2";
      const style: CSSProperties = {
        ...textStyle(block, settings, HEADING_SIZE[level]),
        color: block.settings.color ?? settings.primaryColor,
        fontWeight: block.settings.fontWeight ?? 700,
        textTransform: level === 1 ? "uppercase" : undefined,
        letterSpacing: level === 1 ? "0.04em" : undefined,
      };
      return (
        <Tag style={{ margin: 0 }}>
          <span style={{ display: "flex", gap: "0.4em" }}>
            {prefix ? <span style={style}>{prefix}</span> : null}
            <span style={{ flex: 1 }}>{renderText(style, "Heading", true)}</span>
          </span>
        </Tag>
      );
    }

    case "paragraph":
    case "richText":
      return renderText(textStyle(block, settings), "Write your content here…");

    case "footer":
      return renderText(
        { ...textStyle(block, settings, 9), color: block.settings.color ?? settings.secondaryColor },
        "Footer text",
        true,
      );

    case "note":
      return (
        <div
          style={{
            borderLeft: `3px solid ${settings.primaryColor}`,
            background: "#f4f7fa",
            padding: "8px 12px",
          }}
        >
          {renderText(textStyle(block, settings), "Important note…")}
        </div>
      );

    case "metadata": {
      const content = block.content as MetadataContent;
      return (
        <div style={{ display: "grid", gap: "3px", ...textStyle(block, settings) }}>
          {content.fields.map((field, index) => (
            <div key={field.id} className="group/field flex items-start gap-1">
              <Editable
                editable={editable}
                value={field.label}
                placeholder="Label"
                className="font-bold"
                onChange={(value) =>
                  patchContent({
                    fields: content.fields.map((f) => (f.id === field.id ? { ...f, label: value } : f)),
                  })
                }
              />
              <span className="font-bold">:</span>
              <Editable
                editable={editable}
                value={field.value}
                placeholder="Value"
                className="flex-1"
                onChange={(value) =>
                  patchContent({
                    fields: content.fields.map((f) => (f.id === field.id ? { ...f, value } : f)),
                  })
                }
                onEnter={() =>
                  patchContent({
                    fields: [
                      ...content.fields.slice(0, index + 1),
                      { id: uid(), label: "Label", value: "" },
                      ...content.fields.slice(index + 1),
                    ],
                  })
                }
              />
              {editable ? (
                <button
                  type="button"
                  aria-label={`Remove field ${field.label}`}
                  className="qs-no-print opacity-0 transition group-hover/field:opacity-100"
                  onClick={() =>
                    patchContent({ fields: content.fields.filter((f) => f.id !== field.id) })
                  }
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              ) : null}
            </div>
          ))}
          {editable ? (
            <button
              type="button"
              className="qs-no-print mt-1 inline-flex w-fit items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
              onClick={() =>
                patchContent({ fields: [...content.fields, { id: uid(), label: "Label", value: "" }] })
              }
            >
              <Plus className="size-3" /> Add field
            </button>
          ) : null}
        </div>
      );
    }

    case "bulletList":
    case "numberedList": {
      const content = block.content as ListContent;
      const ListTag = block.type === "bulletList" ? "ul" : "ol";
      const bullet = block.settings.bulletStyle ?? "disc";
      return (
        <ListTag
          style={{
            ...textStyle(block, settings),
            listStyleType: block.type === "bulletList" ? (bullet === "dash" ? "'–  '" : bullet) : "decimal",
            paddingLeft: `${1.15 + (block.settings.indent ?? 0) * 1.1}em`,
          }}
        >
          {content.items.map((item, index) => (
            <li key={index} className="group/item">
              <span className="flex items-start gap-1">
                <Editable
                  editable={editable}
                  value={item}
                  placeholder="List item"
                  className="flex-1"
                  onChange={(value) =>
                    patchContent({
                      items: content.items.map((it, i) => (i === index ? value : it)),
                    })
                  }
                  onEnter={() =>
                    patchContent({
                      items: [
                        ...content.items.slice(0, index + 1),
                        "",
                        ...content.items.slice(index + 1),
                      ],
                    })
                  }
                  onEmptyBackspace={() =>
                    content.items.length > 1 &&
                    patchContent({ items: content.items.filter((_, i) => i !== index) })
                  }
                />
                {editable ? (
                  <button
                    type="button"
                    aria-label="Remove list item"
                    className="qs-no-print opacity-0 transition group-hover/item:opacity-100"
                    onClick={() =>
                      patchContent({ items: content.items.filter((_, i) => i !== index) })
                    }
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                ) : null}
              </span>
            </li>
          ))}
          {editable ? (
            <li style={{ listStyle: "none" }} className="qs-no-print">
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
                onClick={() => patchContent({ items: [...content.items, ""] })}
              >
                <Plus className="size-3" /> Add item
              </button>
            </li>
          ) : null}
        </ListTag>
      );
    }

    case "divider":
      return (
        <div
          style={{
            borderTop: `1px solid ${settings.primaryColor}`,
            opacity: 0.35,
          }}
        />
      );

    case "spacer":
      return <div style={{ height: `${(block.content as SpacerContent).height}px` }} />;

    case "pageBreak":
      return null;

    case "pricingTable": {
      const content = block.content as PricingContent;
      const totals = pricingTotals(content);
      const setRows = (rows: PricingContent["rows"]) => patchContent({ rows });
      return (
        <div style={textStyle(block, settings)}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "70%", color: settings.primaryColor }}>
                  <Editable
                    editable={editable}
                    value={content.columns[0]}
                    onChange={(value) => patchContent({ columns: [value, content.columns[1]] })}
                  />
                </th>
                <th style={{ textAlign: "right", color: settings.primaryColor }}>
                  <Editable
                    editable={editable}
                    value={content.columns[1]}
                    onChange={(value) => patchContent({ columns: [content.columns[0], value] })}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, index) => (
                <tr key={row.id} className="group/row relative">
                  <td>
                    <Editable
                      editable={editable}
                      value={row.description}
                      placeholder="Item description"
                      onChange={(value) =>
                        setRows(content.rows.map((r) => (r.id === row.id ? { ...r, description: value } : r)))
                      }
                      onEnter={() =>
                        setRows([
                          ...content.rows.slice(0, index + 1),
                          { id: uid(), description: "", amount: 0 },
                          ...content.rows.slice(index + 1),
                        ])
                      }
                    />
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <Editable
                      editable={editable}
                      value={formatAmount(row.amount, content.currency)}
                      onChange={(value) =>
                        setRows(
                          content.rows.map((r) =>
                            r.id === row.id ? { ...r, amount: parseAmount(value) } : r,
                          ),
                        )
                      }
                    />
                    {editable ? (
                      <button
                        type="button"
                        aria-label="Delete row"
                        className="qs-no-print absolute -right-6 top-1.5 opacity-0 transition group-hover/row:opacity-100"
                        onClick={() => setRows(content.rows.filter((r) => r.id !== row.id))}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {content.showSubtotal ? (
                <tr>
                  <td>Subtotal</td>
                  <td style={{ textAlign: "right" }}>{formatAmount(totals.subtotal, content.currency)}</td>
                </tr>
              ) : null}
              {content.discount > 0 ? (
                <tr>
                  <td>Discount</td>
                  <td style={{ textAlign: "right" }}>
                    – {formatAmount(totals.discount, content.currency)}
                  </td>
                </tr>
              ) : null}
              {content.taxRate > 0 ? (
                <tr>
                  <td>{content.taxLabel}</td>
                  <td style={{ textAlign: "right" }}>{formatAmount(totals.tax, content.currency)}</td>
                </tr>
              ) : null}
              <tr style={{ background: "#f1f4f7" }}>
                <td style={{ fontWeight: 700, color: settings.primaryColor }}>
                  <Editable
                    editable={editable}
                    value={content.totalLabel}
                    onChange={(value) => patchContent({ totalLabel: value })}
                  />
                </td>
                <td style={{ textAlign: "right", fontWeight: 700, color: settings.primaryColor }}>
                  {content.autoCalculate ? (
                    formatAmount(totals.total, content.currency)
                  ) : (
                    <Editable
                      editable={editable}
                      value={formatAmount(content.manualTotal, content.currency)}
                      onChange={(value) => patchContent({ manualTotal: parseAmount(value) })}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          {editable ? (
            <button
              type="button"
              className="qs-no-print mt-1.5 inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
              onClick={() => setRows([...content.rows, { id: uid(), description: "", amount: 0 }])}
            >
              <Plus className="size-3" /> Add row
            </button>
          ) : null}
        </div>
      );
    }

    case "timelineTable": {
      const content = block.content as TimelineContent;
      const setRows = (rows: TimelineContent["rows"]) => patchContent({ rows });
      return (
        <div style={textStyle(block, settings)}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "72%", color: settings.primaryColor }}>
                  <Editable
                    editable={editable}
                    value={content.columns[0]}
                    onChange={(value) => patchContent({ columns: [value, content.columns[1]] })}
                  />
                </th>
                <th style={{ color: settings.primaryColor }}>
                  <Editable
                    editable={editable}
                    value={content.columns[1]}
                    onChange={(value) => patchContent({ columns: [content.columns[0], value] })}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, index) => (
                <tr key={row.id} className="group/row relative">
                  <td>
                    <Editable
                      editable={editable}
                      value={row.task}
                      placeholder="Task"
                      onChange={(value) =>
                        setRows(content.rows.map((r) => (r.id === row.id ? { ...r, task: value } : r)))
                      }
                      onEnter={() =>
                        setRows([
                          ...content.rows.slice(0, index + 1),
                          { id: uid(), task: "", duration: "" },
                          ...content.rows.slice(index + 1),
                        ])
                      }
                    />
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Editable
                      editable={editable}
                      value={row.duration}
                      placeholder="Duration"
                      onChange={(value) =>
                        setRows(
                          content.rows.map((r) => (r.id === row.id ? { ...r, duration: value } : r)),
                        )
                      }
                    />
                    {editable ? (
                      <button
                        type="button"
                        aria-label="Delete row"
                        className="qs-no-print absolute -right-6 top-1.5 opacity-0 transition group-hover/row:opacity-100"
                        onClick={() => setRows(content.rows.filter((r) => r.id !== row.id))}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {content.showSummary ? (
                <tr style={{ background: "#f1f4f7" }}>
                  <td style={{ fontWeight: 700, color: settings.primaryColor }}>
                    <Editable
                      editable={editable}
                      value={content.summaryLabel}
                      onChange={(value) => patchContent({ summaryLabel: value })}
                    />
                  </td>
                  <td style={{ fontWeight: 700, color: settings.primaryColor }}>
                    <Editable
                      editable={editable}
                      value={content.summaryValue}
                      onChange={(value) => patchContent({ summaryValue: value })}
                    />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {editable ? (
            <button
              type="button"
              className="qs-no-print mt-1.5 inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
              onClick={() => setRows([...content.rows, { id: uid(), task: "", duration: "" }])}
            >
              <Plus className="size-3" /> Add row
            </button>
          ) : null}
        </div>
      );
    }

    case "customTable": {
      const content = block.content as CustomTableContent;
      const setCell = (r: number, c: number, value: string) =>
        patchContent({
          rows: content.rows.map((row, ri) =>
            ri === r ? row.map((cellValue, ci) => (ci === c ? value : cellValue)) : row,
          ),
        });
      return (
        <div style={textStyle(block, settings)}>
          <table>
            {content.headerRow ? (
              <thead>
                <tr>
                  {content.rows[0]?.map((value, ci) => (
                    <th
                      key={ci}
                      style={{
                        width: `${content.columnWidths[ci] ?? 100 / content.rows[0].length}%`,
                        textAlign: content.align[ci] ?? "left",
                        color: settings.primaryColor,
                      }}
                    >
                      <Editable editable={editable} value={value} onChange={(v) => setCell(0, ci, v)} />
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {content.rows.slice(content.headerRow ? 1 : 0).map((row, index) => {
                const ri = index + (content.headerRow ? 1 : 0);
                return (
                  <tr key={ri} className="group/row relative">
                    {row.map((value, ci) => (
                      <td key={ci} style={{ textAlign: content.align[ci] ?? "left" }}>
                        <Editable
                          editable={editable}
                          value={value}
                          placeholder="—"
                          onChange={(v) => setCell(ri, ci, v)}
                        />
                      </td>
                    ))}
                    {editable ? (
                      <td style={{ border: "none", width: 0, padding: 0 }}>
                        <button
                          type="button"
                          aria-label="Delete row"
                          className="qs-no-print absolute -right-6 top-1.5 opacity-0 transition group-hover/row:opacity-100"
                          onClick={() =>
                            patchContent({ rows: content.rows.filter((_, i) => i !== ri) })
                          }
                        >
                          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {editable ? (
            <div className="qs-no-print mt-1.5 flex gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
                onClick={() =>
                  patchContent({
                    rows: [...content.rows, content.rows[0].map(() => "")],
                  })
                }
              >
                <Plus className="size-3" /> Row
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const cols = (content.rows[0]?.length ?? 0) + 1;
                  patchContent({
                    rows: content.rows.map((row) => [...row, ""]),
                    columnWidths: Array.from({ length: cols }, () => Math.round(100 / cols)),
                    align: [...content.align, "left"],
                  });
                }}
              >
                <Plus className="size-3" /> Column
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-destructive"
                onClick={() => {
                  const cols = Math.max((content.rows[0]?.length ?? 1) - 1, 1);
                  patchContent({
                    rows: content.rows.map((row) => row.slice(0, cols)),
                    columnWidths: Array.from({ length: cols }, () => Math.round(100 / cols)),
                    align: content.align.slice(0, cols),
                  });
                }}
              >
                <Trash2 className="size-3" /> Column
              </button>
            </div>
          ) : null}
        </div>
      );
    }

    case "signature":
    case "approval": {
      const isApproval = block.type === "approval";
      const content = block.content as SignatureContent & Partial<ApprovalContent>;
      const parties = content.parties;
      return (
        <div style={textStyle(block, settings)}>
          {isApproval ? (
            <>
              <div
                style={{
                  color: settings.primaryColor,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontSize: `${(block.settings.fontSize ?? settings.bodySize) + 2}pt`,
                  marginBottom: 4,
                }}
              >
                <Editable
                  editable={editable}
                  value={content.heading ?? "Approval"}
                  onChange={(value) => patchContent({ heading: value })}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <Editable
                  editable={editable}
                  value={content.statement ?? ""}
                  placeholder="Approval statement"
                  onChange={(value) => patchContent({ statement: value })}
                />
              </div>
            </>
          ) : null}
          <table>
            <thead>
              <tr>
                {content.columns.map((col, i) => (
                  <th key={i} style={{ width: i === 0 ? "40%" : "30%", color: settings.primaryColor }}>
                    <Editable
                      editable={editable}
                      value={col}
                      onChange={(value) =>
                        patchContent({
                          columns: content.columns.map((c, ci) => (ci === i ? value : c)) as [
                            string,
                            string,
                            string,
                          ],
                        })
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party.id} style={{ height: "16mm" }}>
                  <td>
                    <div>
                      <Editable
                        editable={editable}
                        value={party.name}
                        placeholder="Name"
                        onChange={(value) =>
                          patchContent({
                            parties: parties.map((p) => (p.id === party.id ? { ...p, name: value } : p)),
                          })
                        }
                      />
                    </div>
                    <div style={{ fontSize: "0.85em", color: settings.secondaryColor }}>
                      <Editable
                        editable={editable}
                        value={party.role}
                        placeholder="Role"
                        onChange={(value) =>
                          patchContent({
                            parties: parties.map((p) => (p.id === party.id ? { ...p, role: value } : p)),
                          })
                        }
                      />
                    </div>
                  </td>
                  <td />
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
          {editable ? (
            <div className="qs-no-print mt-1.5 flex gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-foreground"
                onClick={() =>
                  patchContent({ parties: [...parties, { id: uid(), name: "", role: "Signatory" }] })
                }
              >
                <Plus className="size-3" /> Signatory
              </button>
              {parties.length > 1 ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[8pt] text-muted-foreground hover:text-destructive"
                  onClick={() => patchContent({ parties: parties.slice(0, -1) })}
                >
                  <Trash2 className="size-3" /> Signatory
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    }

    default:
      return null;
  }
}
