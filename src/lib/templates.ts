import {
  createQuotation,
  makeBlock,
  uid,
  type Block,
  type BlockSettings,
  type BlockType,
  type Quotation,
} from "@/models/quotation";

function b(type: BlockType, content?: unknown, settings?: BlockSettings): Block {
  const base = makeBlock(type);
  return {
    ...base,
    content: content === undefined ? base.content : (content as Block["content"]),
    settings: { ...base.settings, ...settings },
  };
}

const heading = (text: string) => b("heading", { html: text }, { level: 1 });
const sub = (text: string) => b("heading", { html: text }, { level: 2, fontSize: 11.5 });
const para = (text: string) => b("paragraph", { html: text });
const bullets = (items: string[]) => b("bulletList", { items });

function metadata(fields: [string, string][]) {
  return b("metadata", {
    fields: fields.map(([label, value]) => ({ id: uid(), label, value })),
  });
}

function pricing(rows: [string, number][], opts?: { total?: string; currency?: "INR" | "USD" }) {
  const base = makeBlock("pricingTable");
  return {
    ...base,
    content: {
      ...(base.content as object),
      currency: opts?.currency ?? "INR",
      totalLabel: opts?.total ?? "Total Payable",
      rows: rows.map(([description, amount]) => ({ id: uid(), description, amount })),
    } as Block["content"],
  };
}

function timeline(rows: [string, string][], summary: [string, string]) {
  const base = makeBlock("timelineTable");
  return {
    ...base,
    content: {
      ...(base.content as object),
      rows: rows.map(([task, duration]) => ({ id: uid(), task, duration })),
      summaryLabel: summary[0],
      summaryValue: summary[1],
      showSummary: true,
    } as Block["content"],
  };
}

function signature(parties: [string, string][]) {
  const base = makeBlock("signature");
  return {
    ...base,
    content: {
      columns: ["Name", "Signature", "Date"],
      parties: parties.map(([name, role]) => ({ id: uid(), name, role })),
    } as Block["content"],
  };
}

function approval(statement: string, party: [string, string]) {
  const base = makeBlock("approval");
  return {
    ...base,
    content: {
      heading: "Approval",
      statement,
      columns: ["Client Name", "Signature", "Date"],
      parties: [{ id: uid(), name: party[0], role: party[1] }],
    } as Block["content"],
  };
}

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  build: () => Partial<Quotation>;
}

const coverBlocks = (title: string, subtitle: string, fields: [string, string][]) => [
  b("logo"),
  b("title", { html: title }),
  b("subtitle", { html: subtitle }),
  metadata(fields),
  b("divider"),
];

export const TEMPLATES: TemplateDef[] = [
  {
    id: "blank",
    name: "Blank Quotation",
    description: "An empty A4 document with a logo, title and client information block.",
    build: () => ({
      title: "Untitled Quotation",
      blocks: coverBlocks("QUOTATION", "Prepared for your review", [
        ["Client", ""],
        ["Project Type", ""],
        ["Prepared By", ""],
        ["Date", new Date().toLocaleDateString("en-GB")],
      ]),
    }),
  },
  {
    id: "website",
    name: "Website Development Proposal",
    description: "Scope of work, technical specifications, deliverables, timeline and costing.",
    build: () => ({
      title: "WEBSITE DEVELOPMENT PROPOSAL",
      projectType: "Website Development",
      blocks: [
        ...coverBlocks("WEBSITE DEVELOPMENT PROPOSAL", "Scope, Timeline & Commercial Proposal", [
          ["Client", ""],
          ["Business Category", ""],
          ["Project Type", "Website Development"],
          ["Prepared By", ""],
          ["Quotation Date", new Date().toLocaleDateString("en-GB")],
        ]),
        heading("1. BUSINESS UNDERSTANDING & NEED ANALYSIS"),
        para(
          "This proposal outlines the design and development of a professional website that presents your services clearly, builds credibility and converts visitors into qualified enquiries.",
        ),
        sub("Business Goals"),
        bullets([
          "Build a premium corporate online presence.",
          "Present services and offerings professionally.",
          "Generate quality customer enquiries.",
          "Improve search engine visibility through on-page SEO.",
        ]),
        heading("2. WEBSITE SCOPE OF WORK"),
        bullets([
          "Home Page – hero section, introduction, highlights, call to action.",
          "About Us – company profile, vision and strengths.",
          "Services – structured service presentation.",
          "Gallery – curated image showcase.",
          "Contact – enquiry form, map, phone and WhatsApp.",
        ]),
        heading("3. TECHNICAL SPECIFICATIONS"),
        bullets([
          "Responsive layout for mobile, tablet and desktop.",
          "Optimised images and fast page loading.",
          "On-page SEO structure with meta tags and sitemap.",
          "SSL certificate and secure hosting configuration.",
        ]),
        heading("4. DELIVERABLES"),
        bullets([
          "Complete website with all approved pages.",
          "Basic SEO setup and Google Search Console submission.",
          "Enquiry form with email notifications.",
          "One round of post-launch corrections.",
        ]),
        heading("5. TIMELINE"),
        timeline(
          [
            ["Requirement Discussion", "1 Day"],
            ["Design & UI Approval", "2 Days"],
            ["Frontend Development", "8 Days"],
            ["SEO Setup", "2 Days"],
            ["Testing & Optimization", "2 Days"],
            ["Deployment", "3 Days"],
          ],
          ["Total Estimated Time", "18–21 Days"],
        ),
        heading("6. COSTING"),
        pricing([
          ["Website Design & Development", 30000],
          ["Domain Registration – 3 Years", 3200],
        ]),
        b("note", {
          html: "Payment Terms: 50% advance, 40% on design approval, 10% on deployment.",
        }),
        heading("7. APPROVAL"),
        approval(
          "I hereby agree to the above-mentioned Scope, Pricing, Payment Terms and Conditions.",
          ["", "Client"],
        ),
      ],
    }),
  },
  {
    id: "service",
    name: "Service Proposal",
    description: "A concise services and retainer quotation with pricing and approval.",
    build: () => ({
      title: "SERVICE PROPOSAL",
      projectType: "Professional Services",
      blocks: [
        ...coverBlocks("SERVICE PROPOSAL", "Engagement Scope & Commercials", [
          ["Client", ""],
          ["Project Type", "Professional Services"],
          ["Prepared By", ""],
          ["Date", new Date().toLocaleDateString("en-GB")],
        ]),
        heading("1. ENGAGEMENT OVERVIEW"),
        para(
          "This document describes the services to be delivered, the engagement model, deliverables and applicable commercials.",
        ),
        heading("2. SCOPE OF SERVICES"),
        bullets([
          "Discovery and requirement documentation.",
          "Monthly execution as per agreed deliverables.",
          "Performance reporting and review calls.",
        ]),
        heading("3. COMMERCIALS"),
        pricing(
          [
            ["Monthly Retainer", 25000],
            ["One-time Setup", 10000],
          ],
          { total: "Total Payable" },
        ),
        heading("4. TERMS"),
        bullets([
          "Invoices are raised on the 1st of every month.",
          "Payment due within 7 days of invoice date.",
          "30 days notice for termination by either party.",
        ]),
        signature([
          ["", "Client"],
          ["", "Company"],
        ]),
      ],
    }),
  },
  {
    id: "realestate",
    name: "Real Estate Proposal",
    description: "Property marketing and digital presence proposal for real estate businesses.",
    build: () => ({
      title: "REAL ESTATE MARKETING PROPOSAL",
      projectType: "Real Estate Marketing",
      blocks: [
        ...coverBlocks("REAL ESTATE MARKETING PROPOSAL", "Property Presentation & Lead Generation", [
          ["Client", ""],
          ["Business Category", "Real Estate, Property & Financial Services"],
          ["Project Type", "Real Estate Marketing"],
          ["Prepared By", ""],
          ["Date", new Date().toLocaleDateString("en-GB")],
        ]),
        heading("1. OBJECTIVE"),
        para(
          "Present property inventory with a premium digital experience and generate consistent, qualified buyer enquiries.",
        ),
        heading("2. SCOPE OF WORK"),
        bullets([
          "Property listing pages with image galleries and specifications.",
          "Enquiry capture with WhatsApp and call integration.",
          "Location and amenity highlights for each project.",
          "Investment and financial services section.",
        ]),
        heading("3. TIMELINE"),
        timeline(
          [
            ["Requirement & Inventory Collection", "2 Days"],
            ["Design & Approval", "3 Days"],
            ["Development", "10 Days"],
            ["Launch", "2 Days"],
          ],
          ["Total Estimated Time", "15–18 Days"],
        ),
        heading("4. COSTING"),
        pricing([
          ["Property Website Development", 45000],
          ["Listing Setup (up to 25 properties)", 8000],
        ]),
        heading("5. APPROVAL"),
        approval(
          "I hereby agree to the above-mentioned Scope, Pricing, Payment Terms and Conditions.",
          ["", "Client"],
        ),
      ],
    }),
  },
];

export function quotationFromTemplate(templateId: string): Quotation {
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  return createQuotation(template.build());
}

/** Demonstration data shown on a fresh install. */
export function sampleQuotations(): Quotation[] {
  const website = quotationFromTemplate("website");
  const sgp = createQuotation({
    ...website,
    id: uid(),
    title: "PREMIUM STATIC WEBSITE DEVELOPMENT – SOP PROPOSAL",
    client: "SGP Promoters",
    businessCategory: "Real Estate, Property & Financial Services",
    projectType: "Premium Static Website",
    preparedBy: "New Jersey Freelancers",
    blocks: website.blocks.map((block) => {
      if (block.type === "title") return { ...block, content: { html: "PREMIUM STATIC WEBSITE DEVELOPMENT" } };
      if (block.type === "metadata")
        return {
          ...block,
          content: {
            fields: [
              { id: uid(), label: "Client", value: "SGP Promoters" },
              {
                id: uid(),
                label: "Business Category",
                value: "Real Estate, Property & Financial Services",
              },
              { id: uid(), label: "Project Type", value: "Premium Static Website" },
              { id: uid(), label: "Prepared By", value: "New Jersey Freelancers" },
              { id: uid(), label: "Quotation Date", value: new Date().toLocaleDateString("en-GB") },
            ],
          },
        };
      return { ...block, id: uid() };
    }),
    updatedAt: Date.now(),
  });

  const boating = createQuotation({
    title: "DYNAMIC WEBSITE + ONLINE RIDE BOOKING SYSTEM",
    client: "Pondy Bienvenue Boating",
    businessCategory: "Tourism & Water Sports",
    projectType: "Dynamic Website with Booking Engine",
    preparedBy: "New Jersey Freelancers",
    blocks: [
      ...coverBlocks("DYNAMIC WEBSITE + ONLINE RIDE BOOKING SYSTEM", "Scope, Timeline & Costing", [
        ["Client", "Pondy Bienvenue Boating"],
        ["Business Category", "Tourism & Water Sports"],
        ["Project Type", "Dynamic Website with Booking Engine"],
        ["Prepared By", "New Jersey Freelancers"],
        ["Date", new Date().toLocaleDateString("en-GB")],
      ]),
      heading("1. BUSINESS UNDERSTANDING"),
      para(
        "Pondy Bienvenue Boating offers guided boat rides and water experiences. The website should showcase every ride, allow customers to book online and confirm slots instantly.",
      ),
      heading("2. SCOPE OF WORK"),
      bullets([
        "Ride catalogue with pricing, duration and capacity.",
        "Online booking with date, time slot and passenger count.",
        "Payment link generation and booking confirmation email.",
        "Admin panel for bookings, slots and ride management.",
      ]),
      heading("3. TIMELINE"),
      timeline(
        [
          ["Requirement Discussion", "2 Days"],
          ["UI Design & Approval", "3 Days"],
          ["Website Development", "10 Days"],
          ["Booking Engine & Payments", "7 Days"],
          ["Testing & Deployment", "3 Days"],
        ],
        ["Total Estimated Time", "24–28 Days"],
      ),
      heading("4. COSTING"),
      pricing([
        ["Dynamic Website Development", 55000],
        ["Online Ride Booking System", 35000],
        ["Domain & Hosting – 1 Year", 6500],
      ]),
      heading("5. APPROVAL"),
      approval(
        "I hereby agree to the above-mentioned Scope, Pricing, Payment Terms and Conditions.",
        ["Pondy Bienvenue Boating", "Client"],
      ),
    ],
    updatedAt: Date.now() - 86400000,
  });

  return [sgp, boating];
}
