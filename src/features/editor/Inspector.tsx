import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ImageUp, Trash2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FONT_OPTIONS,
  FONT_SIZES,
  MARGIN_PRESETS,
  type Align,
  type Block,
  type BlockSettings,
  type DocumentSettings,
  type LogoContent,
  type PricingContent,
  type Quotation,
  type SpacerContent,
} from "@/models/quotation";
import { cn } from "@/lib/utils";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];

interface Props {
  quotation: Quotation;
  block: Block | null;
  onBlockSettings: (patch: Partial<BlockSettings>) => void;
  onBlockContent: (patch: Record<string, unknown>) => void;
  onSettings: (patch: Partial<DocumentSettings>) => void;
  onMeta: (patch: Partial<Quotation>) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[86px_1fr] items-center gap-2">
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AlignPicker({ value, onChange }: { value?: Align; onChange: (a: Align) => void }) {
  const options: { key: Align; icon: typeof AlignLeft }[] = [
    { key: "left", icon: AlignLeft },
    { key: "center", icon: AlignCenter },
    { key: "right", icon: AlignRight },
    { key: "justify", icon: AlignJustify },
  ];
  return (
    <div className="flex gap-1">
      {options.map(({ key, icon: Icon }) => (
        <button
          key={key}
          type="button"
          aria-label={`Align ${key}`}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted",
            value === key && "border-ring bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function Inspector({
  quotation,
  block,
  onBlockSettings,
  onBlockContent,
  onSettings,
  onMeta,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const s = quotation.settings;

  const handleLogo = (file?: File) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Logo upload failed", { description: "Use a PNG, JPG, SVG or WEBP image." });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Logo upload failed", { description: "Image must be smaller than 2 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("Logo upload failed", { description: "The file could not be read." });
    reader.onload = () => {
      onBlockContent({ src: String(reader.result), alt: file.name });
      toast.success("Logo added to the document");
    };
    reader.readAsDataURL(file);
  };

  const textish =
    block &&
    ["title", "subtitle", "heading", "paragraph", "richText", "note", "footer", "bulletList", "numberedList", "metadata"].includes(
      block.type,
    );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-4 pb-2 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {block ? "Block" : "Document"}
        </p>
      </div>

      <div className="space-y-4 px-4 pb-6">
        {block ? (
          <>
            {block.type === "logo" ? (
              <div className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  className="hidden"
                  onChange={(event) => handleLogo(event.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageUp className="size-4" />
                  {(block.content as LogoContent).src ? "Replace logo" : "Upload logo"}
                </Button>
                {(block.content as LogoContent).src ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => onBlockContent({ src: "" })}
                  >
                    <Trash2 className="size-4" /> Remove logo
                  </Button>
                ) : null}
                <Row label="Alignment">
                  <AlignPicker
                    value={block.settings.align ?? s.logoAlign}
                    onChange={(align) => onBlockSettings({ align })}
                  />
                </Row>
                <Row label="Width">
                  <div className="flex items-center gap-2">
                    <Slider
                      min={15}
                      max={120}
                      step={1}
                      value={[block.settings.width ?? s.logoWidth]}
                      onValueChange={([width]) => onBlockSettings({ width })}
                    />
                    <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                      {block.settings.width ?? s.logoWidth}mm
                    </span>
                  </div>
                </Row>
                <Row label="Top space">
                  <Input
                    type="number"
                    value={block.settings.spaceBefore ?? 0}
                    onChange={(e) => onBlockSettings({ spaceBefore: Number(e.target.value) })}
                  />
                </Row>
                <Row label="Bottom space">
                  <Input
                    type="number"
                    value={block.settings.spaceAfter ?? 0}
                    onChange={(e) => onBlockSettings({ spaceAfter: Number(e.target.value) })}
                  />
                </Row>
              </div>
            ) : null}

            {block.type === "heading" ? (
              <Row label="Level">
                <Select
                  value={String(block.settings.level ?? 1)}
                  onValueChange={(value) =>
                    onBlockSettings({
                      level: Number(value) as 1 | 2 | 3,
                      fontSize: Number(value) === 1 ? 13 : Number(value) === 2 ? 11.5 : 10.5,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Heading 1</SelectItem>
                    <SelectItem value="2">Heading 2</SelectItem>
                    <SelectItem value="3">Heading 3</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
            ) : null}

            {textish ? (
              <>
                <Row label="Font">
                  <Select
                    value={block.settings.fontFamily ?? "inherit"}
                    onValueChange={(value) =>
                      onBlockSettings({ fontFamily: value === "inherit" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">Document default</SelectItem>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Row>
                <Row label="Size">
                  <Select
                    value={String(block.settings.fontSize ?? s.bodySize)}
                    onValueChange={(value) => onBlockSettings({ fontSize: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} pt
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Row>
                <Row label="Weight">
                  <Select
                    value={String(block.settings.fontWeight ?? 400)}
                    onValueChange={(value) => onBlockSettings({ fontWeight: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400">Regular</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semibold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
                <Row label="Alignment">
                  <AlignPicker
                    value={block.settings.align ?? "left"}
                    onChange={(align) => onBlockSettings({ align })}
                  />
                </Row>
                <Row label="Line height">
                  <Input
                    type="number"
                    step="0.05"
                    value={block.settings.lineHeight ?? s.lineHeight}
                    onChange={(e) => onBlockSettings({ lineHeight: Number(e.target.value) })}
                  />
                </Row>
                <Row label="Text color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Text color"
                      className="h-8 w-10 cursor-pointer rounded-md border border-border bg-card"
                      value={block.settings.color ?? s.textColor}
                      onChange={(e) => onBlockSettings({ color: e.target.value })}
                    />
                    <Button variant="ghost" size="sm" onClick={() => onBlockSettings({ color: undefined })}>
                      Reset
                    </Button>
                  </div>
                </Row>
              </>
            ) : null}

            {block.type === "bulletList" ? (
              <Row label="Bullet">
                <Select
                  value={block.settings.bulletStyle ?? "disc"}
                  onValueChange={(value) =>
                    onBlockSettings({ bulletStyle: value as BlockSettings["bulletStyle"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disc">Disc •</SelectItem>
                    <SelectItem value="circle">Circle ◦</SelectItem>
                    <SelectItem value="square">Square ▪</SelectItem>
                    <SelectItem value="dash">Dash –</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
            ) : null}

            {block.type === "bulletList" || block.type === "numberedList" ? (
              <Row label="Indent">
                <Slider
                  min={0}
                  max={3}
                  step={1}
                  value={[block.settings.indent ?? 0]}
                  onValueChange={([indent]) => onBlockSettings({ indent })}
                />
              </Row>
            ) : null}

            {block.type === "spacer" ? (
              <Row label="Height">
                <div className="flex items-center gap-2">
                  <Slider
                    min={4}
                    max={160}
                    step={2}
                    value={[(block.content as SpacerContent).height]}
                    onValueChange={([height]) => onBlockContent({ height })}
                  />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {(block.content as SpacerContent).height}px
                  </span>
                </div>
              </Row>
            ) : null}

            {block.type === "pricingTable" ? (
              <>
                <Row label="Currency">
                  <Select
                    value={(block.content as PricingContent).currency}
                    onValueChange={(currency) => onBlockContent({ currency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ Indian Rupee</SelectItem>
                      <SelectItem value="USD">$ US Dollar</SelectItem>
                      <SelectItem value="EUR">€ Euro</SelectItem>
                      <SelectItem value="GBP">£ Pound</SelectItem>
                      <SelectItem value="AED">AED Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
                <Row label="Auto total">
                  <Switch
                    checked={(block.content as PricingContent).autoCalculate}
                    onCheckedChange={(autoCalculate) => onBlockContent({ autoCalculate })}
                  />
                </Row>
                <Row label="Subtotal row">
                  <Switch
                    checked={(block.content as PricingContent).showSubtotal}
                    onCheckedChange={(showSubtotal) => onBlockContent({ showSubtotal })}
                  />
                </Row>
                <Row label="Discount">
                  <Input
                    type="number"
                    value={(block.content as PricingContent).discount}
                    onChange={(e) => onBlockContent({ discount: Number(e.target.value) })}
                  />
                </Row>
                <Row label="Tax label">
                  <Input
                    value={(block.content as PricingContent).taxLabel}
                    onChange={(e) => onBlockContent({ taxLabel: e.target.value })}
                  />
                </Row>
                <Row label="Tax %">
                  <Input
                    type="number"
                    value={(block.content as PricingContent).taxRate}
                    onChange={(e) => onBlockContent({ taxRate: Number(e.target.value) })}
                  />
                </Row>
              </>
            ) : null}

            <Separator />
            <Row label="Space before">
              <Input
                type="number"
                value={block.settings.spaceBefore ?? 0}
                onChange={(e) => onBlockSettings({ spaceBefore: Number(e.target.value) })}
              />
            </Row>
            <Row label="Space after">
              <Input
                type="number"
                value={block.settings.spaceAfter ?? 0}
                onChange={(e) => onBlockSettings({ spaceAfter: Number(e.target.value) })}
              />
            </Row>
          </>
        ) : (
          <>
            <Row label="Title">
              <Input value={quotation.title} onChange={(e) => onMeta({ title: e.target.value })} />
            </Row>
            <Row label="Client">
              <Input value={quotation.client} onChange={(e) => onMeta({ client: e.target.value })} />
            </Row>
            <Row label="Category">
              <Input
                value={quotation.businessCategory}
                onChange={(e) => onMeta({ businessCategory: e.target.value })}
              />
            </Row>
            <Row label="Project">
              <Input
                value={quotation.projectType}
                onChange={(e) => onMeta({ projectType: e.target.value })}
              />
            </Row>
            <Row label="Prepared by">
              <Input
                value={quotation.preparedBy}
                onChange={(e) => onMeta({ preparedBy: e.target.value })}
              />
            </Row>
            <Row label="Number">
              <Input
                value={quotation.quotationNumber}
                onChange={(e) => onMeta({ quotationNumber: e.target.value })}
              />
            </Row>
            <Row label="Date">
              <Input
                type="date"
                value={quotation.date}
                onChange={(e) => onMeta({ date: e.target.value })}
              />
            </Row>

            <Separator />
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Page
            </p>
            <Row label="Margins">
              <Select
                value={s.marginPreset}
                onValueChange={(value) =>
                  onSettings({
                    marginPreset: value as DocumentSettings["marginPreset"],
                    margins:
                      value === "custom"
                        ? s.margins
                        : { ...MARGIN_PRESETS[value as "normal" | "compact" | "wide"] },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            {s.marginPreset === "custom" ? (
              <div className="grid grid-cols-2 gap-2">
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                  <div key={side} className="space-y-1">
                    <Label className="text-[11px] capitalize text-muted-foreground">{side} (mm)</Label>
                    <Input
                      type="number"
                      value={s.margins[side]}
                      onChange={(e) =>
                        onSettings({ margins: { ...s.margins, [side]: Number(e.target.value) } })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <Separator />
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Typography
            </p>
            <Row label="Font">
              <Select value={s.fontFamily} onValueChange={(fontFamily) => onSettings({ fontFamily })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Body size">
              <Select
                value={String(s.bodySize)}
                onValueChange={(value) => onSettings({ bodySize: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[9, 10, 10.5, 11, 12].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} pt
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Heading scale">
              <Slider
                min={0.85}
                max={1.3}
                step={0.05}
                value={[s.headingScale]}
                onValueChange={([headingScale]) => onSettings({ headingScale })}
              />
            </Row>
            <Row label="Line height">
              <Slider
                min={1.2}
                max={2}
                step={0.05}
                value={[s.lineHeight]}
                onValueChange={([lineHeight]) => onSettings({ lineHeight })}
              />
            </Row>
            <Row label="Numbering">
              <Switch
                checked={s.autoNumberSections}
                onCheckedChange={(autoNumberSections) => onSettings({ autoNumberSections })}
              />
            </Row>

            <Separator />
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Header &amp; footer
            </p>
            <Row label="Page numbers">
              <Switch
                checked={s.showPageNumbers}
                onCheckedChange={(showPageNumbers) => onSettings({ showPageNumbers })}
              />
            </Row>
            <Row label="Header">
              <Switch
                checked={s.showHeader}
                onCheckedChange={(showHeader) => onSettings({ showHeader })}
              />
            </Row>
            {s.showHeader ? (
              <Row label="Header text">
                <Input
                  value={s.headerText}
                  placeholder={quotation.title}
                  onChange={(e) => onSettings({ headerText: e.target.value })}
                />
              </Row>
            ) : null}
            <Row label="Footer text">
              <Input
                value={s.footerText}
                placeholder="Company name · contact"
                onChange={(e) => onSettings({ footerText: e.target.value })}
              />
            </Row>

            <Separator />
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Colors
            </p>
            {(
              [
                ["Primary", "primaryColor"],
                ["Secondary", "secondaryColor"],
                ["Body text", "textColor"],
              ] as const
            ).map(([label, key]) => (
              <Row key={key} label={label}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`${label} color`}
                    className="h-8 w-10 cursor-pointer rounded-md border border-border bg-card"
                    value={s[key]}
                    onChange={(e) => onSettings({ [key]: e.target.value })}
                  />
                  <span className="font-mono text-xs text-muted-foreground">{s[key]}</span>
                </div>
              </Row>
            ))}

            <Separator />
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Logo defaults
            </p>
            <Row label="Alignment">
              <AlignPicker value={s.logoAlign} onChange={(logoAlign) => onSettings({ logoAlign })} />
            </Row>
            <Row label="Width">
              <div className="flex items-center gap-2">
                <Slider
                  min={15}
                  max={120}
                  step={1}
                  value={[s.logoWidth]}
                  onValueChange={([logoWidth]) => onSettings({ logoWidth })}
                />
                <span className="w-12 text-right text-xs text-muted-foreground">{s.logoWidth}mm</span>
              </div>
            </Row>
          </>
        )}
      </div>
    </div>
  );
}
