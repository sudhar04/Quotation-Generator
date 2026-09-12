# Quotation Craft

Build a production-quality web application called "Quotation Studio".

The purpose of this application is to replace the repetitive process of creating business quotations/proposals manually in Microsoft Word.

The user should be able to create a professional multi-page A4 quotation by entering content through a modern block/document editor, upload and position a company logo, format text, create pricing/timeline/custom tables, preview the final document, edit it, and export the exact quotation as both PDF and editable DOCX.

IMPORTANT:

This must NOT look like Microsoft Word.

This must NOT look like a generic admin dashboard.

The application UI should feel like a premium modern SaaS product inspired by the usability principles of Linear, Notion, Canva and modern document editors.

The generated quotation document itself should remain professional, corporate and print-friendly.

==================================================

1. TECHNOLOGY STACK

==================================================

Frontend:

- React

- TypeScript

- Vite

Styling:

- Tailwind CSS

- Use a clean custom design system

- Do not use excessive gradients

- Do not make the interface visually noisy

Editor:

- TipTap

Local persistence:

- IndexedDB

- No authentication

- No account system in version 1

- No cloud database required

Backend:

- Node.js

- Express

- TypeScript where practical

PDF:

- Server-side PDF generation

- Use Puppeteer/Chromium

- Render the same A4 document structure used by the preview

- PDF must preserve typography, spacing, logo positioning, tables, page breaks and page numbers

DOCX:

- Generate actual editable .docx files using the `docx` npm package or an equivalent reliable DOCX generation library

- Do NOT generate a screenshot/image-based Word document

- Text must remain editable

- Tables must remain editable

- Images/logos must remain actual images

==================================================

2. CORE PRODUCT IDEA

==================================================

The core workflow is:

Dashboard

   ↓

New Quotation

   ↓

Enter quotation content

   ↓

Format content

   ↓

Upload logo

   ↓

Configure logo position

   ↓

Create tables

   ↓

Preview A4 document

   ↓

Edit if necessary

   ↓

Download PDF / DOCX

The application should make quotation creation dramatically faster than manually editing a Word document.

The user should be able to create a professional quotation in approximately 5–10 minutes after the initial setup.

==================================================

3. IMPORTANT DESIGN PRINCIPLE

==================================================

Do NOT build a giant plain textarea.

Use a structured block-based document architecture.

A quotation consists of blocks.

Supported blocks:

1. Logo

2. Title

3. Subtitle

4. Metadata / client information

5. Heading

6. Paragraph

7. Rich text

8. Bullet list

9. Numbered list

10. Divider

11. Spacer

12. Pricing table

13. Timeline table

14. Custom table

15. Highlight/note block

16. Signature block

17. Approval block

18. Footer

19. Page break

Every block must be editable, reorderable and removable.

Blocks should be stored as structured JSON.

Do not make the preview itself the source of truth.

The structured quotation JSON must be the source of truth.

==================================================

4. APPLICATION STRUCTURE

==================================================

Create these main application views:

1. Dashboard

2. Quotation Editor

3. Full Preview

4. Export modal

5. Settings / Document Settings

Version 1 does not require authentication.

==================================================

5. DASHBOARD

==================================================

Create a premium minimal dashboard.

Header:

Quotation Studio

Subtitle:

Create professional quotations in minutes.

Primary button:

+ New Quotation

Secondary actions:

Import

Templates

Show recent quotations.

Each quotation card should display:

- Quotation title

- Client name

- Project type

- Last modified date

- Number of pages if available

- Edit

- Preview

- Duplicate

- Delete

Example:

SGP Promoters

Premium Static Website Development

Updated today

Actions:

Edit | Preview | Duplicate | Delete

Use a clean card layout.

Do not over-design the dashboard.

==================================================

6. NEW QUOTATION

==================================================

When the user clicks New Quotation, create a blank quotation.

Show optional initial information:

Quotation Title

Client Name

Project Type

Prepared By

Date

Quotation Number

Example:

Quotation Title:

PREMIUM STATIC WEBSITE DEVELOPMENT – SOP PROPOSAL

Client:

SGP Promoters

Business Category:

Real Estate, Property & Financial Services

Project Type:

Premium Static Website

Prepared By:

New Jersey Freelancers

These fields should be editable later.

==================================================

7. MAIN EDITOR UI

==================================================

Use a three-part professional workspace.

Desktop layout:

-------------------------------------------------------

| Top Header                                         |

-------------------------------------------------------

| Document Outline | Editor Canvas | Inspector Panel |

|                  |               |                  |

|                  |               |                  |

-------------------------------------------------------

The editor canvas should feel like a document workspace.

The document should appear on an A4 white paper surface.

The surrounding application should use a subtle neutral background.

Do NOT make the entire application white.

The document itself should be white.

==================================================

8. TOP HEADER

==================================================

Top navigation should contain:

Quotation Studio

Document title

Auto Saved ✓

Undo

Redo

Preview

Save

Export

Export button should open:

Download PDF

Download Word (.docx)

Also include a small overflow menu.

==================================================

9. LEFT DOCUMENT OUTLINE

==================================================

Create a collapsible document outline.

Example:

DOCUMENT

Logo

Cover Information

1. BUSINESS UNDERSTANDING

   Business Goals

   Target Audience

2. WEBSITE SCOPE OF WORK

   Home Page

   About Us

   Properties

   Services

   Insurance & Investments

   Contact Page

3. TECHNICAL SPECIFICATIONS

4. DELIVERABLES

5. TIMELINE

6. COSTING

7. APPROVAL

Clicking an outline item should scroll the editor to the corresponding block.

The outline should automatically update when blocks are added or removed.

==================================================

10. CENTER DOCUMENT EDITOR

==================================================

The center area contains an A4 document.

Use realistic A4 proportions.

The document should have configurable:

- Page size

- Margins

- Header spacing

- Footer spacing

- Page numbering

Default:

A4

Portrait

Use professional margins.

The document should support multiple pages.

Do not make the document infinitely tall without page separation.

Render page boundaries visually.

Example:

PAGE 1

------------------------------

|                            |

|          LOGO              |

|                            |

|       QUOTATION TITLE      |

|                            |

|       CONTENT              |

|                            |

------------------------------

PAGE 2

------------------------------

|                            |

| 2. SCOPE OF WORK           |

|                            |

| CONTENT                    |

|                            |

------------------------------

Page numbers should appear in the footer.

==================================================

11. BLOCK EDITING

==================================================

Every block should show a subtle hover state.

On hover:

[Drag]

[Edit]

[Duplicate]

[Delete]

Do not show these controls permanently.

Use a drag handle for block reordering.

Allow blocks to be reordered using drag and drop.

Use smooth transitions.

==================================================

12. ADD BLOCK SYSTEM

==================================================

Provide:

+ Add Block

Clicking it opens a clean command/menu.

Categories:

CONTENT

- Heading

- Paragraph

- Bullet List

- Numbered List

- Rich Text

DOCUMENT

- Logo

- Divider

- Spacer

- Page Break

TABLES

- Pricing Table

- Timeline Table

- Custom Table

SIGNATURE

- Signature

- Approval

==================================================

13. TIPTAP EDITOR

==================================================

Use TipTap for rich text editing.

Support:

- Bold

- Italic

- Underline

- Strikethrough

- Font size

- Font family

- Text color

- Highlight

- Left alignment

- Center alignment

- Right alignment

- Justify

- Bullet lists

- Numbered lists

- Links

The toolbar should be contextual.

Do not create a giant permanent toolbar.

==================================================

14. TEXT FORMATTING

==================================================

Provide an inspector panel when a text block is selected.

Controls:

Font Family

Font Size

Font Weight

Text Alignment

Line Height

Paragraph Spacing

Text Color

Font sizes should include:

8

9

10

11

12

14

16

18

20

24

28

32

36

Default body text should be approximately 10–11pt.

Default document font should be professional and highly readable.

Provide a small set of professional fonts rather than hundreds.

Suggested:

Arial

Helvetica

Georgia

Times New Roman

Inter

==================================================

15. LOGO UPLOAD

==================================================

Logo is a first-class block.

Allow:

Upload image

Supported:

PNG

JPG

JPEG

SVG where safe

After upload, show a logo configuration panel.

Ask:

Logo Alignment

[ Left ] [ Center ] [ Right ]

Logo Width

Slider or numeric input.

Also allow:

- Logo height auto

- Top spacing

- Bottom spacing

- Replace

- Remove

When the user uploads a logo, immediately show it in the A4 document.

The preview must exactly reflect the configured logo position.

==================================================

16. CLIENT INFORMATION BLOCK

==================================================

Create a reusable structured metadata block.

Fields:

Client

Business Category

Project Type

Prepared By

Quotation Date

Quotation Number

Example:

Client: SGP Promoters

Business Category: Real Estate, Property & Financial Services

Project Type: Premium Static Website

Prepared By: New Jersey Freelancers

Allow users to add/remove custom fields.

The labels should be bold and values normal.

Allow left alignment and custom formatting.

==================================================

17. HEADINGS

==================================================

Support:

Document Title

Heading 1

Heading 2

Heading 3

Example:

1. BUSINESS UNDERSTANDING & NEED ANALYSIS

2. WEBSITE SCOPE OF WORK

3. TECHNICAL SPECIFICATIONS

4. DELIVERABLES

5. TIMELINE

6. COSTING

7. APPROVAL

Allow automatic section numbering as an optional setting.

==================================================

18. BULLET LISTS

==================================================

Support bullet lists.

Example:

Business Goals:

• Build a premium corporate online presence.

• Showcase property listings and services professionally.

• Generate quality customer enquiries.

• Increase direct phone and WhatsApp enquiries.

• Improve search engine visibility through SEO.

• Promote financial, insurance and investment services.

Users should be able to:

- Add item

- Delete item

- Reorder item

- Change indentation

- Change bullet style

==================================================

19. PRICING TABLE

==================================================

Create a dedicated Pricing Table block.

Default columns:

Description

Amount

Example:

Description                         Amount

Static Website Design & Development ₹30,000

Domain Registration – 3 Years       ₹3,200

Total Payable                       ₹33,200

Features:

- Add row

- Delete row

- Duplicate row

- Drag row

- Edit cell

- Currency selector

- Amount formatting

- Bold total

- Subtotal

- Discount

- Tax

- Final total

Support Indian Rupee formatting.

Example:

₹30,000

₹3,200

₹33,200

Allow users to choose whether calculations are automatic or manual.

==================================================

20. TIMELINE TABLE

==================================================

Create a Timeline Table.

Columns:

Task

Duration

Example:

Requirement Discussion       1 Day

Design & UI Approval         2 Days

Frontend Development         8 Days

SEO Setup                    2 Days

Testing & Optimization      2 Days

Deployment                   3 Days

Total Estimated Time         18–21 Days

Allow a final summary row.

==================================================

21. CUSTOM TABLE

==================================================

Allow:

+ Add Custom Table

User chooses number of rows and columns.

Allow:

- Add row

- Delete row

- Add column

- Delete column

- Merge cells if practical

- Bold cells

- Alignment

- Column width

- Cell padding

- Border settings

Keep the default styling professional and subtle.

==================================================

22. SIGNATURE BLOCK

==================================================

Create reusable Signature block.

Example:

Client Name          Signature          Date

SGP Promoters        __________         ________

Allow:

1 signature

2 signatures

Client + Company

==================================================

23. APPROVAL BLOCK

==================================================

Support:

Approval

I hereby agree to the above-mentioned Scope,

Pricing, Payment Terms, and Conditions.

Client Name          Signature          Date

SGP Promoters        __________         ________

Also support:

Company Acceptance

We hereby accept and approve the above project

on behalf of the company.

Company Name         Authorized Signature         Date

New Jersey Freelancers

==================================================

24. QUICK TEXT IMPORT

==================================================

This is one of the most important features.

Create a "Quick Text" mode.

The user can paste an entire quotation into a large text box.

Example:

1. BUSINESS UNDERSTANDING & NEED ANALYSIS

SGP Promoters provides real estate...

Business Goals:

• Build a premium corporate online presence.

• Showcase property listings professionally.

2. WEBSITE SCOPE OF WORK

1. Home Page

• Premium Hero Section

• Company Introduction

• Featured Properties

Costing

Description                    Amount

Static Website                 ₹30,000

Domain                         ₹3,200

The application should attempt to convert this into structured blocks.

Recognize:

- headings

- paragraphs

- bullet lists

- numbered lists

- simple tables

- pricing tables

- timeline tables

After parsing, show:

"Review Imported Structure"

The user can approve or modify the generated blocks.

IMPORTANT:

Do not claim AI-level perfect parsing.

Build a deterministic parser for common formatting patterns in version 1.

==================================================

25. LIVE PREVIEW

==================================================

Create a dedicated Preview mode.

Preview should remove editor controls.

Show only the professional A4 document.

Top preview toolbar:

Back to Edit

Zoom -

Zoom %

Zoom +

Previous Page

Next Page

Download PDF

Download Word

The document should look like the final exported document.

==================================================

26. PDF GENERATION

==================================================

Use server-side PDF generation with Puppeteer.

Important:

The PDF output must be based on the same document data and styling rules as the preview.

Use:

A4

Portrait

Print CSS

Preserve:

- Margins

- Fonts

- Logo

- Headings

- Tables

- Spacing

- Page numbers

- Page breaks

Do not simply screenshot the browser.

Do not create low-resolution PDFs.

The generated PDF must be suitable for sending to clients.

==================================================

27. DOCX GENERATION

==================================================

Generate actual editable DOCX files.

Map the structured quotation blocks to DOCX components.

Examples:

Heading → Word heading

Paragraph → Word paragraph

Bullet → Word bullet

Table → Word table

Logo → Word image

Signature → Word table/layout

Divider → paragraph border or equivalent

The DOCX should remain editable after downloading.

Use A4 page size and professional margins.

Try to maintain visual consistency between PDF and DOCX.

==================================================

28. DOCUMENT SETTINGS

==================================================

Create a Document Settings panel.

Settings:

Page:

A4

Portrait

Margins:

Normal

Compact

Wide

Custom

Typography:

Font

Default body size

Heading sizes

Line spacing

Footer:

Page number ON/OFF

Header:

ON/OFF

Logo:

Default alignment

Default width

Color:

Primary document color

Secondary color

Text color

Keep default styling conservative and professional.

==================================================

29. PREMIUM DESIGN SYSTEM

==================================================

The APPLICATION UI should feel premium.

Design language:

- Minimal

- Elegant

- Modern

- Calm

- Professional

- Natural

- High readability

- Subtle shadows

- Subtle borders

- Rounded corners

- Excellent spacing

- Smooth micro-interactions

Avoid:

- Excessive gradients

- Neon colors

- Huge rounded cards

- Excessive glassmorphism

- Excessive animations

- Cartoonish icons

- Generic Bootstrap styling

- Old-fashioned admin UI

Use a neutral application background.

The A4 paper should be bright white.

The document should visually resemble a professionally designed business proposal.

==================================================

30. RESPONSIVE DESIGN

==================================================

Desktop is the primary experience.

At tablet width:

Collapse the outline and inspector into drawers.

At mobile:

Do not attempt to show the complete three-column editor.

Instead:

- Document editor

- Bottom/sheet controls

- Preview mode

Mobile should still be usable, but desktop should receive the most attention.

==================================================

31. AUTO SAVE

==================================================

Use IndexedDB.

Automatically save quotation changes.

Display:

Saving...

Saved ✓

Do not require a manual save after every change.

If the browser is refreshed, the quotation should remain available.

==================================================

32. QUOTATION DUPLICATION

==================================================

Allow:

Duplicate quotation

This is important because users often create similar quotations for multiple clients.

Example:

SGP Promoters quotation

Duplicate

Change:

Client

Project

Price

Timeline

Logo

==================================================

33. TEMPLATES

==================================================

Build the architecture so templates can be added.

Version 1 should include:

Blank Quotation

Website Development Proposal

Service Proposal

Real Estate Proposal

Templates should simply be predefined structured quotation JSON.

Do not hard-code the editor around one quotation.

==================================================

34. SAMPLE DATA

==================================================

Preload sample quotation data based on the style/content structure of the examples supplied during development.

Create examples such as:

SGP Promoters

Premium Static Website Development

and:

Pondy Bienvenue Boating

Dynamic Website + Online Ride Booking System

Use these only as demonstration/sample data.

Do not hard-code these clients into the application's core logic.

==================================================

35. IMPORT/EXPORT PROJECT DATA

==================================================

Add optional project data export/import.

Export:

quotation.json

Import:

quotation.json

This allows users to back up quotations without requiring cloud storage.

==================================================

36. ARCHITECTURE

==================================================

Use a clean architecture.

Suggested:

src/

  components/

  features/

    editor/

    blocks/

    preview/

    dashboard/

    export/

    settings/

  hooks/

  lib/

  models/

  stores/

  utils/

  styles/

Backend:

server/

  routes/

  services/

    pdf/

    docx/

  templates/

  utils/

Create clear TypeScript interfaces.

==================================================

37. DATA MODEL

==================================================

Use a structured model similar to:

Quotation {

  id

  title

  client

  projectType

  preparedBy

  quotationNumber

  date

  logo

  settings

  blocks[]

  createdAt

  updatedAt

}

Block:

{

  id,

  type,

  content,

  settings

}

Types:

logo

title

metadata

heading

paragraph

richText

bulletList

numberedList

divider

spacer

pricingTable

timelineTable

customTable

signature

approval

pageBreak

Do not store the document as one giant HTML string.

==================================================

38. PAGE BREAK LOGIC

==================================================

Implement proper A4 pagination.

The preview must visually show page boundaries.

Avoid:

- headings stranded at the bottom

- table rows split incorrectly when possible

- signature blocks separated from their heading

- awkward empty pages

Use CSS:

break-inside

page-break-before

page-break-after

orphans

widows

where appropriate.

For tables, repeat table headers on subsequent pages where supported.

==================================================

39. PRINT CSS

==================================================

Create dedicated print CSS.

The browser print layout and Puppeteer PDF layout should use the same print-oriented document styles.

Do not allow the application sidebar or toolbar to appear in the PDF.

==================================================

40. ACCESSIBILITY

==================================================

Use:

- Semantic HTML

- Keyboard navigation

- Accessible buttons

- aria-labels

- Focus states

- Proper contrast

Keyboard shortcuts:

Ctrl/Cmd + S

Save

Ctrl/Cmd + Z

Undo

Ctrl/Cmd + Shift + Z

Redo

Ctrl/Cmd + P

Preview / Print action if appropriate

==================================================

41. ERROR HANDLING

==================================================

Show useful error messages.

Examples:

Logo upload failed.

PDF generation failed.

DOCX generation failed.

Invalid quotation data.

Do not silently fail.

==================================================

42. PERFORMANCE

==================================================

The editor should feel responsive.

Avoid unnecessary re-renders.

Debounce IndexedDB saves.

Lazy-load heavy export functionality.

Do not load Puppeteer into the browser bundle.

Keep PDF/DOCX generation on the server.

==================================================

43. SECURITY

==================================================

Validate uploaded image types.

Limit uploaded image size.

Sanitize rich text.

Do not execute arbitrary HTML or scripts from imported quotation content.

Since there is no authentication, do not expose quotation data through a public server database.

==================================================

44. EXPORT UX

==================================================

When user clicks Export:

Show a premium modal:

Export Quotation

PDF

Professional A4 PDF

[Download PDF]

Word

Editable Microsoft Word document

[Download DOCX]

Also:

[Cancel]

Show loading state:

Preparing document...

Then:

PDF ready ✓

or:

Word document ready ✓

==================================================

45. IMPORTANT UX DETAIL

==================================================

The user should NEVER feel like they are filling out a boring form.

The experience should feel like:

"Designing a professional document."

The document is the main focus.

The controls should remain secondary.

==================================================

46. FIRST-RUN EXPERIENCE

==================================================

When the application opens for the first time:

Show:

Quotation Studio

Create your first professional quotation.

[Start from Blank]

[Use Template]

Also show a small example preview.

==================================================

47. EMPTY STATES

==================================================

When there are no quotations:

No quotations yet.

Create your first quotation in minutes.

[+ New Quotation]

When editor is empty:

Start building your quotation.

[+ Add Block]

==================================================

48. VISUAL QUALITY REQUIREMENT

==================================================

The implementation must look finished.

Do not produce:

- placeholder boxes

- unfinished components

- excessive default browser styling

- inconsistent spacing

- random colors

- oversized buttons

- generic dashboard cards

Use polished typography.

Use subtle transitions.

Use consistent spacing.

Use a cohesive icon system such as Lucide icons.

==================================================

49. DEVELOPMENT REQUIREMENT

==================================================

Build the application incrementally.

First implement:

1. App shell

2. Dashboard

3. Editor

4. Block system

5. A4 document preview

6. Logo upload

7. Typography controls

8. Tables

9. Signature/approval

10. IndexedDB persistence

11. Full preview

12. PDF backend

13. DOCX backend

14. Export UX

15. Polish

Do not create fake buttons.

Every visible major action should work.

==================================================

50. FINAL ACCEPTANCE CRITERIA

==================================================

The application is considered successful only if I can perform this workflow:

1. Open application.

2. Click New Quotation.

3. Upload company logo.

4. Choose logo:

   Left / Center / Right.

5. Change logo size.

6. Enter client information.

7. Add document title.

8. Add headings.

9. Add paragraphs.

10. Add bullet lists.

11. Change font size.

12. Make text bold.

13. Change alignment.

14. Add pricing table.

15. Add timeline table.

16. Add signature block.

17. Reorder blocks.

18. Delete blocks.

19. Duplicate blocks.

20. Preview complete A4 document.

21. Navigate between pages.

22. Edit document.

23. Preview again.

24. Download PDF.

25. Download editable DOCX.

26. Refresh browser.

27. Document remains saved locally.

28. Duplicate quotation.

29. Change client details.

30. Create another quotation quickly.

The final product should demonstrate that the application genuinely replaces repetitive quotation editing in Microsoft Word.

==================================================

51. MOST IMPORTANT PRODUCT PRINCIPLE

==================================================

The application is NOT primarily a text editor.

It is a:

"Professional quotation generation system."

Therefore prioritize:

1. Speed

2. Professional document output

3. Easy formatting

4. Reusable blocks

5. A4 accuracy

6. PDF/DOCX export

7. Simple UX

8. Visual quality

Do not over-engineer unnecessary features in version 1.

Build the core quotation workflow extremely well.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8a64e2b-97fe-4e41-b2eb-46474c1760c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
