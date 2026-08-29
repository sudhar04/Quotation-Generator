export type BlockType =
  | "logo"
  | "title"
  | "subtitle"
  | "metadata"
  | "heading"
  | "paragraph"
  | "richText"
  | "bulletList"
  | "numberedList"
  | "divider"
  | "spacer"
  | "pricingTable"
  | "timelineTable"
  | "customTable"
  | "note"
  | "signature"
  | "approval"
  | "footer"
  | "pageBreak";

export type Align = "left" | "center" | "right" | "justify";

export interface BlockSettings {
  align?: Align;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  spaceBefore?: number;
  spaceAfter?: number;
  color?: string;
  level?: 1 | 2 | 3;
  width?: number;
  bulletStyle?: "disc" | "circle" | "square" | "dash";
  indent?: number;
  numbered?: boolean;
  compact?: boolean;
}

export interface MetadataField {
  id: string;
  label: string;
  value: string;
}

export interface PricingRow {
  id: string;
  description: string;
  amount: number;
}

export interface TimelineRow {
  id: string;
  task: string;
  duration: string;
}

export interface LogoContent {
  src: string;
  alt: string;
}

export interface TextContent {
  html: string;
}

export interface ListContent {
  items: string[];
}

export interface MetadataContent {
  fields: MetadataField[];
}

export interface SpacerContent {
  height: number;
}

export interface PricingContent {
  columns: [string, string];
  rows: PricingRow[];
  currency: "INR" | "USD" | "EUR" | "GBP" | "AED";
  autoCalculate: boolean;
  showSubtotal: boolean;
  discount: number;
  taxLabel: string;
  taxRate: number;
  totalLabel: string;
  manualTotal: number;
}

export interface TimelineContent {
  columns: [string, string];
  rows: TimelineRow[];
  summaryLabel: string;
  summaryValue: string;
  showSummary: boolean;
}

export interface CustomTableContent {
  rows: string[][];
  headerRow: boolean;
  columnWidths: number[];
  align: Align[];
}

export interface SignatureParty {
  id: string;
  name: string;
  role: string;
}

export interface SignatureContent {
  columns: [string, string, string];
  parties: SignatureParty[];
}

export interface ApprovalContent {
  heading: string;
  statement: string;
  columns: [string, string, string];
  parties: SignatureParty[];
}

export type BlockContent =
  | LogoContent
  | TextContent
  | ListContent
  | MetadataContent
  | SpacerContent
  | PricingContent
  | TimelineContent
  | CustomTableContent
  | SignatureContent
  | ApprovalContent
  | Record<string, never>;

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  settings: BlockSettings;
}

export type MarginPreset = "normal" | "compact" | "wide" | "custom";

export interface DocumentSettings {
  pageSize: "A4";
  orientation: "portrait";
  marginPreset: MarginPreset;
  margins: { top: number; right: number; bottom: number; left: number };
  fontFamily: string;
  bodySize: number;
  headingScale: number;
  lineHeight: number;
  showPageNumbers: boolean;
  showHeader: boolean;
  headerText: string;
  footerText: string;
  logoAlign: Align;
  logoWidth: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  autoNumberSections: boolean;
}

export interface Quotation {
  id: string;
  title: string;
  client: string;
  businessCategory: string;
  projectType: string;
  preparedBy: string;
  quotationNumber: string;
  date: string;
  settings: DocumentSettings;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36];

export const MARGIN_PRESETS: Record<
  Exclude<MarginPreset, "custom">,
  { top: number; right: number; bottom: number; left: number }
> = {
  normal: { top: 20, right: 18, bottom: 18, left: 18 },
  compact: { top: 14, right: 12, bottom: 12, left: 12 },
  wide: { top: 26, right: 26, bottom: 24, left: 26 },
};

export const CURRENCY_SYMBOL: Record<PricingContent["currency"], string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
};

export const BLOCK_LABEL: Record<BlockType, string> = {
  logo: "Logo",
  title: "Document Title",
  subtitle: "Subtitle",
  metadata: "Client Information",
  heading: "Heading",
  paragraph: "Paragraph",
  richText: "Rich Text",
  bulletList: "Bullet List",
  numberedList: "Numbered List",
  divider: "Divider",
  spacer: "Spacer",
  pricingTable: "Pricing Table",
  timelineTable: "Timeline Table",
  customTable: "Custom Table",
  note: "Highlight / Note",
  signature: "Signature",
  approval: "Approval",
  footer: "Footer",
  pageBreak: "Page Break",
};

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const defaultSettings = (): DocumentSettings => ({
  pageSize: "A4",
  orientation: "portrait",
  marginPreset: "normal",
  margins: { ...MARGIN_PRESETS.normal },
  fontFamily: "Arial, Helvetica, sans-serif",
  bodySize: 10.5,
  headingScale: 1,
  lineHeight: 1.55,
  showPageNumbers: true,
  showHeader: false,
  headerText: "",
  footerText: "",
  logoAlign: "left",
  logoWidth: 46,
  primaryColor: "#1f3b57",
  secondaryColor: "#5b6b7b",
  textColor: "#1a1a1a",
  autoNumberSections: false,
});

export function makeBlock(type: BlockType): Block {
  const base = { id: uid(), type, settings: {} as BlockSettings };
  switch (type) {
    case "logo":
      return { ...base, content: { src: "", alt: "Company logo" } };
    case "title":
      return {
        ...base,
        content: { html: "QUOTATION TITLE" },
        settings: { align: "center", fontSize: 20, fontWeight: 700, spaceAfter: 6 },
      };
    case "subtitle":
      return {
        ...base,
        content: { html: "Prepared for your review" },
        settings: { align: "center", fontSize: 12, spaceAfter: 14 },
      };
    case "metadata":
      return {
        ...base,
        content: {
          fields: [
            { id: uid(), label: "Client", value: "" },
            { id: uid(), label: "Project Type", value: "" },
            { id: uid(), label: "Prepared By", value: "" },
            { id: uid(), label: "Date", value: new Date().toLocaleDateString("en-GB") },
          ],
        },
        settings: { spaceAfter: 14 },
      };
    case "heading":
      return {
        ...base,
        content: { html: "Section heading" },
        settings: { level: 1, fontSize: 13, fontWeight: 700, spaceBefore: 12, spaceAfter: 6 },
      };
    case "paragraph":
    case "richText":
      return {
        ...base,
        content: { html: "Write your content here." },
        settings: { align: "justify", spaceAfter: 8 },
      };
    case "bulletList":
      return {
        ...base,
        content: { items: ["First point", "Second point", "Third point"] },
        settings: { spaceAfter: 8, bulletStyle: "disc" },
      };
    case "numberedList":
      return {
        ...base,
        content: { items: ["First step", "Second step", "Third step"] },
        settings: { spaceAfter: 8 },
      };
    case "divider":
      return { ...base, content: {}, settings: { spaceBefore: 8, spaceAfter: 8 } };
    case "spacer":
      return { ...base, content: { height: 16 } };
    case "pricingTable":
      return {
        ...base,
        content: {
          columns: ["Description", "Amount"],
          rows: [
            { id: uid(), description: "Website Design & Development", amount: 30000 },
            { id: uid(), description: "Domain Registration – 3 Years", amount: 3200 },
          ],
          currency: "INR",
          autoCalculate: true,
          showSubtotal: false,
          discount: 0,
          taxLabel: "GST (18%)",
          taxRate: 0,
          totalLabel: "Total Payable",
          manualTotal: 0,
        },
        settings: { spaceBefore: 6, spaceAfter: 10 },
      };
    case "timelineTable":
      return {
        ...base,
        content: {
          columns: ["Task", "Duration"],
          rows: [
            { id: uid(), task: "Requirement Discussion", duration: "1 Day" },
            { id: uid(), task: "Design & UI Approval", duration: "2 Days" },
            { id: uid(), task: "Development", duration: "8 Days" },
          ],
          summaryLabel: "Total Estimated Time",
          summaryValue: "18–21 Days",
          showSummary: true,
        },
        settings: { spaceBefore: 6, spaceAfter: 10 },
      };
    case "customTable":
      return {
        ...base,
        content: {
          rows: [
            ["Column A", "Column B", "Column C"],
            ["", "", ""],
            ["", "", ""],
          ],
          headerRow: true,
          columnWidths: [34, 33, 33],
          align: ["left", "left", "left"],
        },
        settings: { spaceBefore: 6, spaceAfter: 10 },
      };
    case "note":
      return {
        ...base,
        content: { html: "Note: payment terms are 50% advance and 50% on delivery." },
        settings: { spaceBefore: 6, spaceAfter: 10 },
      };
    case "signature":
      return {
        ...base,
        content: {
          columns: ["Name", "Signature", "Date"],
          parties: [
            { id: uid(), name: "", role: "Client" },
            { id: uid(), name: "", role: "Company" },
          ],
        },
        settings: { spaceBefore: 14, spaceAfter: 8 },
      };
    case "approval":
      return {
        ...base,
        content: {
          heading: "Approval",
          statement:
            "I hereby agree to the above-mentioned Scope, Pricing, Payment Terms and Conditions.",
          columns: ["Client Name", "Signature", "Date"],
          parties: [{ id: uid(), name: "", role: "Client" }],
        },
        settings: { spaceBefore: 14, spaceAfter: 8 },
      };
    case "footer":
      return { ...base, content: { html: "Thank you for your business." }, settings: { align: "center", fontSize: 9 } };
    case "pageBreak":
      return { ...base, content: {} };
  }
}

export function createQuotation(partial?: Partial<Quotation>): Quotation {
  const now = Date.now();
  return {
    id: uid(),
    title: "Untitled Quotation",
    client: "",
    businessCategory: "",
    projectType: "",
    preparedBy: "",
    quotationNumber: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
    date: new Date().toISOString().slice(0, 10),
    settings: defaultSettings(),
    blocks: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
