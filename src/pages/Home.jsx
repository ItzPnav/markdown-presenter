import { useState, useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import LeftPanel from "../components/Panel/Left-Panel/LeftPanel";
import RightPanel from "../components/Panel/Right-Panel/RightPanel";
import styles from "./Home.module.css";

const RECENT_KEY = "md-presenter-recent-files";
const DRAFT_KEY = "md-presenter-draft";

export default function Home() {
  const [toast, setToast] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [currentFile, setCurrentFile] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [importMode, setImportMode] = useState("replace");
  const [isDragging, setIsDragging] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const [showMobileResult, setShowMobileResult] = useState(false);

  const fileInputRef = useRef(null);

  /* ===== LOAD localStorage ===== */
  useEffect(() => {
    const savedRecent = localStorage.getItem(RECENT_KEY);
    if (savedRecent) {
      try {
        setRecentFiles(JSON.parse(savedRecent));
      } catch {
        setRecentFiles([]);
      }
    }

    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      setMarkdown(savedDraft);
    }

    setHydrated(true);
  }, []);

  /* ===== SAVE recent files ===== */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentFiles));
  }, [recentFiles, hydrated]);

  /* ===== SAVE draft markdown ===== */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DRAFT_KEY, markdown);
  }, [markdown, hydrated]);

  /* ===== FILE LOADER ===== */
  const loadFile = (fileObj) => {
    if (fileObj.content) {
      setMarkdown((prev) =>
        importMode === "append"
          ? prev + "\n\n" + fileObj.content
          : fileObj.content
      );
      setCurrentFile(fileObj.name);
      setShowMobileResult(true);
      return;
    }

    if (!fileObj.name.toLowerCase().endsWith(".md")) {
      alert("Only .md files supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;

      setMarkdown((prev) =>
        importMode === "append" ? prev + "\n\n" + text : text
      );

      setCurrentFile(fileObj.name);
      setShowMobileResult(true);

      setRecentFiles((prev) => {
        const filtered = prev.filter((f) => f.name !== fileObj.name);
        return [
          { name: fileObj.name, content: text, pinned: false },
          ...filtered,
        ].slice(0, 5);
      });
    };

    reader.readAsText(fileObj);
  };

  /* ===== CTRL + O ===== */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ===== MOBILE ACTIONS ===== */
  const copyMarkdown = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setToast("Markdown copied to clipboard");

    setTimeout(() => {
      setToast("");
    }, 2000);
  };

  const resetMarkdown = () => {
    setMarkdown("");
    setShowMobileResult(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  return (
    <div
      className={styles.container}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) loadFile(file);
      }}
    >
      <Header
        markdown={markdown}
        currentFile={currentFile}
        recentFiles={recentFiles}
        setRecentFiles={setRecentFiles}
        importMode={importMode}
        setImportMode={setImportMode}
        loadFile={loadFile}
        fileInputRef={fileInputRef}
      />

      {/* ===== DESKTOP ===== */}
      <div className={styles.desktopContent}>
        <LeftPanel markdown={markdown} setMarkdown={setMarkdown} />
        <RightPanel markdown={markdown} />
      </div>

      {/* ===== MOBILE ===== */}
      <div className={styles.mobileContent}>
        <h1 className={styles.mobileTitle}>Markdown Presenter</h1>
        <p className={styles.mobileSubtitle}>
          Paste markdown and instantly see a clean preview
        </p>

        <textarea
          className={styles.mobileTextarea}
          placeholder="Paste your markdown here..."
          value={markdown}
          onChange={(e) => {
            setMarkdown(e.target.value);
            setShowMobileResult(false);
          }}
        />

        <div className={styles.mobileActions}>
          <button
            className={styles.secondaryButton}
            onClick={copyMarkdown}
            disabled={!markdown.trim()}
          >
            Copy
          </button>

          <button
            className={styles.secondaryButton}
            onClick={resetMarkdown}
            disabled={!markdown.trim()}
          >
            Reset
          </button>
        </div>

        <button
          className={styles.mobileButton}
          disabled={!markdown.trim()}
          onClick={() => setShowMobileResult(true)}
        >
          Show Result
        </button>

        {showMobileResult && (
          <div className={styles.mobilePreview}>
            <RightPanel markdown={markdown} />
          </div>
        )}
      </div>

      {isDragging && (
        <div className={styles.dropOverlay}>
          Drop your <strong>.md</strong> file
        </div>
      )}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
