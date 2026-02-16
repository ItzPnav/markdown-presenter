import styles from './LeftPanel.module.css';
import { useRef } from 'react';

export default function LeftPanel({ markdown, setMarkdown, images, setImages }) {

  const imageCounter = useRef(1);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith("image/")) {
        e.preventDefault();

        const file = item.getAsFile();
        const reader = new FileReader();

        reader.onload = (event) => {
          const base64 = event.target.result;

          const id = imageCounter.current++;
          const token = `![Image ${id}]`;

          // Store base64 separately
          setImages(prev => ({
            ...prev,
            [token]: {
              data: base64,
              expiresAt: Date.now() + IMAGE_EXPIRY_MS
            }
          }));

          // Insert clean token only
          setMarkdown((prev) => prev + `\n${token}\n`);
        };

        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className={styles.left}>
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        onPaste={handlePaste}
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
