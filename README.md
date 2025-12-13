
# 📝 **Markdown Presenter**

### *A Clean, Exam-Ready Markdown Preview & PDF Export Tool*

<div align="center">
<img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-yellow?style=for-the-badge">
<img src="https://img.shields.io/badge/Markdown-Live%20Preview-blue?style=for-the-badge">
<img src="https://img.shields.io/badge/PDF-Export%20Ready-green?style=for-the-badge">
<img src="https://img.shields.io/badge/UX-Keyboard%20%2B%20DragDrop-purple?style=for-the-badge">
</div>

---

# 📌 **Overview**

**Markdown Presenter** is a lightweight, distraction-free web app that helps you write, preview, and export Markdown content as clean PDFs.

It is built specifically for:
- 📚 exam preparation
- 📝 structured notes
- 📄 markdown-to-PDF conversion
- ⚡ fast, offline-friendly usage

The preview you see is **exactly what gets exported**.

---

# 🚀 **Key Features**

### 📝 Live Markdown Editor
Instant preview while typing, with clean formatting.

### 📂 File Import
- Upload `.md` files
- Drag & drop support
- Keyboard shortcut: **Ctrl + O**

### 🕘 Recent Files System
- Hover-based recent files list
- Pin important files
- Keyboard navigation (↑ ↓ Enter)
- Persistent across reloads

### 🔁 Import Modes
- **Replace** current content
- **Append** content to existing notes

### 📄 PDF Export
- One-click PDF download
- Clean white PDF output
- Exam-ready formatting

---

# 🧠 **Supported Markdown**

- Headings (`#` → `######`)
- Bold / Italic
- Lists
- Tables
- Code blocks & inline code
- Section dividers (`---`)

---

# 🧩 **Architecture**

```

Markdown Input
↓
Live Preview Renderer
↓
Styled HTML Output
↓
PDF Export (html2pdf)

````

Simple, fast, and frontend-only.

---

# ⚙️ **Tech Stack**

| Layer      | Technology      |
|-----------|------------------|
| Frontend  | React + Vite     |
| Styling   | CSS Modules      |
| PDF       | html2pdf.js      |
| State     | React Hooks      |

---

# 🛠️ **Setup & Run Locally**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
````

---

# 🌍 **Deployment**

Optimized for **Vercel**.

| Setting          | Value           |
| ---------------- | --------------- |
| Framework        | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

---

# 🎯 **Use Cases**

* Exam preparation notes
* Markdown documentation preview
* Clean PDF generation
* Lightweight presentation tool
* Developer note-taking

---

# 🛡️ **Design Philosophy**

* No backend
* No distractions
* Predictable UI
* Keyboard-friendly
* Exam-focused output

---

# 🤝 **Contributing**

Issues and PRs are welcome.

---

# 📜 **License**

MIT License — free to use and modify.

---

# 🚀 Built with focus by **Pnav**

Markdown → Preview → PDF.
Nothing more, nothing less.



