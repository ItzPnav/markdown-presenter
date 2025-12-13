import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import styles from "./Header.module.css";

export default function Header({
  markdown,
  currentFile,
  recentFiles,
  setRecentFiles,
  importMode,
  setImportMode,
  loadFile,
  fileInputRef,
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const hasContent = markdown.trim().length > 0;

  /* ===== Keyboard navigation for recent files ===== */
  useEffect(() => {
    const handler = (e) => {
      if (!recentFiles.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < recentFiles.length - 1 ? i + 1 : 0));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : recentFiles.length - 1));
      }

      if (e.key === "Enter" && activeIndex >= 0) {
        loadFile(recentFiles[activeIndex]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [recentFiles, activeIndex, loadFile]);

  /* ===== Pin / Unpin ===== */
  const togglePin = (name) => {
    setRecentFiles((prev) =>
      [...prev]
        .map((f) =>
          f.name === name ? { ...f, pinned: !f.pinned } : f
        )
        .sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1))
    );
  };

  /* ===== Clear recent ===== */
  const clearRecent = () => {
    setRecentFiles([]);
    setActiveIndex(-1);
  };

  /* ===== PDF Export (FIXED) ===== */
  const downloadPDF = () => {
    if (!markdown.trim()) return;

    const el = document.getElementById("pdf-content");
    if (!el) return;

    // Enable print styling
    el.classList.add("pdf-mode");

    const options = {
      margin: 0, // margins handled via CSS
      filename: currentFile || "markdown-output.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794, // match A4 width
      },
      jsPDF: {
        unit: "pt",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(options)
      .from(el)
      .save()
      .finally(() => {
        el.classList.remove("pdf-mode");
      });
  };


  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.title}>Markdown Presenter</span>
        {currentFile && (
          <span className={styles.fileName}>{currentFile}</span>
        )}
      </div>

      <select
        className={styles.modeSelect}
        value={importMode}
        onChange={(e) => setImportMode(e.target.value)}
      >
        <option value="replace">Replace</option>
        <option value="append">Append</option>
      </select>

      <div className={styles.right}>
        <input
          type="file"
          accept=".md"
          hidden
          ref={fileInputRef}
          onChange={(e) => e.target.files[0] && loadFile(e.target.files[0])}
        />

        <button onClick={() => fileInputRef.current.click()}>
          Upload
        </button>

        <button disabled={!hasContent} onClick={downloadPDF}>
          PDF
        </button>

        {recentFiles.length > 0 && (
          <div className={styles.recentWrapper}>
            <span className={styles.recentLabel}>📂 Recent ▾</span>

            <ul className={styles.recentList}>
              {recentFiles.map((f, i) => (
                <li
                  key={f.name}
                  className={i === activeIndex ? styles.active : ""}
                  onClick={() => loadFile(f)}
                >
                  <span
                    className={styles.pin}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(f.name);
                    }}
                  >
                    {f.pinned ? "📌" : "📍"}
                  </span>
                  {f.name}
                </li>
              ))}

              <li className={styles.clear} onClick={clearRecent}>
                Clear Recent
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
