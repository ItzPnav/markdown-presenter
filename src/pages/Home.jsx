import { useState, useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import styles from "./Home.module.css";

const RECENT_KEY = "md-presenter-recent-files";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [currentFile, setCurrentFile] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [importMode, setImportMode] = useState("replace");
  const [isDragging, setIsDragging] = useState(false);

  const [hydrated, setHydrated] = useState(false); // ✅ IMPORTANT
  const fileInputRef = useRef(null);

  /* ===== LOAD FROM localStorage (ONCE) ===== */
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_KEY);
    if (saved) {
      try {
        setRecentFiles(JSON.parse(saved));
      } catch {
        setRecentFiles([]);
      }
    }
    setHydrated(true); // ✅ mark done
  }, []);

  /* ===== SAVE TO localStorage (ONLY AFTER HYDRATION) ===== */
  useEffect(() => {
    if (!hydrated) return; // ❌ prevent wiping on first render
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentFiles));
  }, [recentFiles, hydrated]);

  /* ===== FILE LOADER ===== */
  const loadFile = (fileObj) => {
    // From Recent list
    if (fileObj.content) {
      setMarkdown((prev) =>
        importMode === "append"
          ? prev + "\n\n" + fileObj.content
          : fileObj.content
      );
      setCurrentFile(fileObj.name);
      return;
    }

    // From Upload / Drop
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

      <div className={styles.content}>
        <LeftPanel markdown={markdown} setMarkdown={setMarkdown} />
        <RightPanel markdown={markdown} />
      </div>

      {isDragging && (
        <div className={styles.dropOverlay}>
          Drop your <strong>.md</strong> file
        </div>
      )}
    </div>
  );
}
