import { MarkdownRenderer } from "../../MarkdownRenderer/MarkdownRenderer";
import styles from "./RightPanel.module.css";

export default function RightPanel({ markdown }) {
  const isEmpty = !markdown || markdown.trim().length === 0;

  return (
    <div className={styles.right}>
      <div id="pdf-content">
        {isEmpty ? (
          <div className={styles.emptyState}>
            <h2>Markdown Preview</h2>
            <p>
              Start typing markdown on the left to see a live preview here.
            </p>
            <p>
              This preview is exactly what will be exported to PDF.
            </p>
          </div>
        ) : (
          <MarkdownRenderer content={markdown} />
        )}
      </div>
    </div>
  );
}
