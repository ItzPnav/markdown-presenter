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
  const [activeIndex, setActiveIndex] = useState(-1); // nothing selected by default
  const hasContent = markdown.trim().length > 0;

  /* ===== Keyboard navigation ===== */
  useEffect(() => {
    const handler = (e) => {
      if (!recentFiles.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          i < recentFiles.length - 1 ? i + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          i > 0 ? i - 1 : recentFiles.length - 1
        );
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
        .sort((a, b) => b.pinned - a.pinned)
    );
  };

  /* ===== Clear recent ===== */
  const clearRecent = () => {
    setRecentFiles([]);
  };

  /* ===== PDF ===== */
  const downloadPDF = () => {
    if (!hasContent) return;
    const el = document.getElementById("pdf-content");
    el.classList.add("pdf-mode");

    html2pdf()
      .set({
        filename: currentFile || "markdown-output.pdf",
        html2canvas: { scale: 2, backgroundColor: "#fff" },
        jsPDF: { unit: "mm", format: "a4" },
      })
      .from(el)
      .save()
      .then(() => el.classList.remove("pdf-mode"));
  };

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <span className={styles.title}>Markdown Presenter</span>
        {currentFile && <span className={styles.fileName}>{currentFile}</span>}
      </div>

      <select
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

        <button onClick={() => fileInputRef.current.click()}>Upload</button>
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
                  <span onClick={() => togglePin(f.name)}>
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
    </div>
  );
}
