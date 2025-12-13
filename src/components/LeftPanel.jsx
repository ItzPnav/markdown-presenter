import styles from './LeftPanel.module.css';

export default function LeftPanel({ markdown, setMarkdown }) {
  return (
    <div className={styles.left}>
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder={`Start writing Markdown here...

Examples:

# Unit–1 : 5-Mark Answers

---

## 1️⃣ Explain Alphabet, String and Language

An **alphabet** is a finite, non-empty set of symbols.

| heading 1 | heading 2 |
|    ---    |   ---     |
|  data 1   |  data 2   |

---

Tip: Use **bold**, *italic*, tables, and --- as section dividers.

OR JUST Drag and Drop YOUR MD file
`}
      />

    </div>
  );
}
