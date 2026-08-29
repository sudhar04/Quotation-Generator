import { CURRENCY_SYMBOL, type PricingContent } from "@/models/quotation";

const LOCALE: Record<PricingContent["currency"], string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  AED: "en-AE",
};

export function formatAmount(value: number, currency: PricingContent["currency"]) {
  const n = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat(LOCALE[currency], {
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
  return `${CURRENCY_SYMBOL[currency]}${formatted}`;
}

export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function pricingTotals(c: PricingContent) {
  const subtotal = c.rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const discount = Number(c.discount) || 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = (taxable * (Number(c.taxRate) || 0)) / 100;
  const total = c.autoCalculate ? taxable + tax : Number(c.manualTotal) || 0;
  return { subtotal, discount, tax, total };
}

export function relativeDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return "today";
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return "yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Very small allow-list sanitizer for rich text HTML. */
const ALLOWED = new Set([
  "B","STRONG","I","EM","U","S","BR","SPAN","A","P","UL","OL","LI","MARK","SUP","SUB",
]);

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const walk = (node: Element) => {
    [...node.children].forEach((child) => {
      if (!ALLOWED.has(child.tagName)) {
        const text = child.textContent ?? "";
        child.replaceWith(document.createTextNode(text));
        return;
      }
      [...child.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const keep =
          (child.tagName === "A" && name === "href" && /^(https?:|mailto:|tel:)/i.test(attr.value)) ||
          (name === "style" && /^[a-z0-9\s:;#().,%'"-]*$/i.test(attr.value));
        if (!keep) child.removeAttribute(attr.name);
      });
      walk(child);
    });
  };
  const root = doc.body.firstElementChild as Element;
  walk(root);
  return root.innerHTML;
}

export function htmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
