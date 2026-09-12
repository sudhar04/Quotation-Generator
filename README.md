# 📄 Quotation Craft

> ✨ A modern quotation & proposal builder for creating professional, print-ready business documents.

**Quotation Craft** is a production-quality web application designed to replace the repetitive process of creating business quotations and proposals manually in Microsoft Word.

Create structured quotations, customize them with reusable blocks, preview them as realistic A4 documents, and export them as **PDF** or **editable DOCX** files.

---

## 🚀 Features

### 📝 Powerful Document Editor
- 🧩 Block-based document editing
- ✍️ Rich text formatting
- 🔤 Font family and font size controls
- **Bold**, *italic*, underline and text highlighting
- 📐 Text alignment and spacing controls
- 📋 Bullet and numbered lists
- 🔄 Drag-and-drop block reordering

### 🏢 Professional Quotation Building
- 🖼️ Company logo upload and positioning
- 👤 Client information blocks
- 📑 Headings, paragraphs and rich text
- 💰 Pricing tables
- 🗓️ Timeline tables
- 📊 Custom tables
- ✍️ Signature blocks
- ✅ Approval blocks
- ➖ Dividers and spacers
- 📄 Page breaks

### 👀 A4 Document Preview
- 📄 Realistic A4 page layout
- 🔢 Page numbering
- 📐 Configurable margins
- 🖨️ Print-friendly styling
- 🔍 Zoom controls
- ◀️▶️ Page navigation
- 🎨 Preview closely matches the final document

### 📤 Export
- 📕 Export professional **PDF** documents
- 📝 Export editable **Microsoft Word (.docx)** documents
- 🖼️ Logos remain actual images
- 📊 Tables remain editable in DOCX
- 🖨️ A4 print formatting

### 💾 Local Persistence
- 💽 Automatic local saving
- ⚡ IndexedDB-based persistence
- 🔄 Quotations remain available after refreshing the browser
- 📋 Duplicate existing quotations
- 📦 Import/export quotation JSON data

### 🎨 Premium UI
- ✨ Modern SaaS-inspired interface
- 🧘 Minimal and distraction-free workspace
- 📐 Clean document canvas
- 🌙 Subtle borders and shadows
- 🖱️ Smooth micro-interactions
- 📱 Responsive design

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ React | Frontend UI |
| 📘 TypeScript | Type-safe development |
| ⚡ Vite | Development & build tooling |
| 🎨 Tailwind CSS | Styling |
| ✍️ TipTap | Rich text editor |
| 💾 IndexedDB | Local data persistence |
| 🟢 Node.js | Backend runtime |
| 🚂 Express | Backend API |
| 📄 Puppeteer | PDF generation |
| 📝 DOCX | Editable Word document generation |

---

## 🧩 How It Works

```text
🏠 Dashboard
      ↓
➕ Create Quotation
      ↓
📝 Add Content
      ↓
🧩 Arrange Blocks
      ↓
🖼️ Add Company Logo
      ↓
💰 Add Pricing & Timeline
      ↓
👀 Preview A4 Document
      ↓
✏️ Make Final Changes
      ↓
📤 Export PDF / DOCX
```

---

## 📂 Project Structure

```text
src/
├── components/
├── features/
│   ├── editor/
│   ├── blocks/
│   ├── preview/
│   ├── dashboard/
│   ├── export/
│   └── settings/
├── hooks/
├── lib/
├── models/
├── stores/
├── utils/
└── styles/

server/
├── routes/
├── services/
│   ├── pdf/
│   └── docx/
├── templates/
└── utils/
```

---

## 📋 Supported Blocks

Quotation Craft supports a flexible block-based document architecture:

- 🖼️ Logo
- 🏷️ Title
- 🔖 Subtitle
- 👤 Client Information
- 📌 Heading
- 📝 Paragraph
- ✍️ Rich Text
- 🔵 Bullet List
- 🔢 Numbered List
- ➖ Divider
- ↕️ Spacer
- 💰 Pricing Table
- 🗓️ Timeline Table
- 📊 Custom Table
- ✍️ Signature
- ✅ Approval
- 📄 Page Break
- 💡 Highlight / Note

---

## 💰 Pricing Tables

Create professional pricing sections with:

- ➕ Add rows
- 🗑️ Delete rows
- 📋 Duplicate rows
- 💱 Currency selection
- 🔢 Amount formatting
- 🧮 Subtotal
- 🏷️ Discount
- 🧾 Tax
- 💵 Final total

Indian Rupee formatting is supported:

```text
₹30,000
₹3,200
₹33,200
```

---

## 🗓️ Timeline Tables

Create project schedules such as:

| Task | Duration |
|---|---:|
| Requirement Discussion | 1 Day |
| Design & UI Approval | 2 Days |
| Frontend Development | 8 Days |
| SEO Setup | 2 Days |
| Testing & Optimization | 2 Days |
| Deployment | 3 Days |

---

## 💾 Data Model

Quotations are stored as structured data rather than one large HTML document.

```typescript
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
```

Each document block follows a structured model:

```typescript
Block {
  id
  type
  content
  settings
}
```

This makes quotations easier to edit, reorder, duplicate and export.

---

## 🖥️ Getting Started

### 1️⃣ Clone the repository

```bash
git clone <your-repository-url>
cd quotation-craft
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

---

## 🎯 Example Use Cases

Quotation Craft can be used to create:

- 🌐 Website development proposals
- 💻 Software development quotations
- 🏢 Business service proposals
- 🏠 Real estate proposals
- 📈 Digital marketing quotations
- 🎨 Design service proposals
- 🛠️ Consulting proposals

---

## 🔮 Future Improvements

- 🤖 AI-assisted quotation generation
- 📚 More professional templates
- ☁️ Cloud synchronization
- 👥 Team collaboration
- 🔐 User authentication
- 📧 Email quotation directly to clients
- 📊 Quotation analytics
- 🎨 Advanced document themes
- 🌍 Multi-language support

---

## 🤝 Contributing

Contributions, suggestions and improvements are welcome.

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💻 Make your changes
4. ✅ Test your changes
5. 📤 Submit a pull request

---

## 📜 License

This project is currently intended for personal and demonstration purposes.

---

## 🧑‍💻 Built With

This project was built using **Lovable** and synchronized with GitHub.

🔗 **Live Project:** [Quotation Craft](https://lovable.dev/)

⭐ If you find this project useful, consider giving the repository a star!

---

### 💡 The Goal

> **Turn quotation creation from a repetitive document-editing task into a fast, structured and professional workflow.**

Made with ❤️ and modern web technologies.
