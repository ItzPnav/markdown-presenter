import React from "react";
import styles from "./MarkdownRenderer.module.css";

export const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];

  let currentParagraph = [];
  let inCodeBlock = false;
  let codeBlockContent = [];

  let listItems = [];
  let inList = false;

  const isTableRow = (line) =>
    line.trim().startsWith("|") && line.trim().endsWith("|");
  const isTableDivider = (line) =>
    /^\|\s*-+/.test(line.trim()) && line.trim().endsWith("|");

  const processParagraph = (para) => {
    if (!para.length) return null;
    const text = para.join(" ").trim();
    if (!text) return null;
    return (
      <p className={styles.paragraph}>
        {processInlineMarkdown(text)}
      </p>
    );
  };

  const processInlineMarkdown = (text) => {
    const parts = [];

    // Order matters: image first so it doesn't collide with other patterns
    const patterns = [
      {
        // captures the src attribute
        regex: /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g,
        type: "image",
      },
      { regex: /\*\*(.*?)\*\*/g, type: "strong" },
      { regex: /`(.*?)`/g, type: "code" },
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: "link" },
      { regex: /\*(.*?)\*/g, type: "em" },
    ];

    const matches = [];
    patterns.forEach(({ regex, type }) => {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          href: match[2],
          type,
        });
      }
    });

    // Sort by appearance
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches
    const filtered = [];
    for (const m of matches) {
      const last = filtered[filtered.length - 1];
      if (!last || m.start >= last.end) {
        filtered.push(m);
      }
    }

    let cursor = 0;

    // Build output
    filtered.forEach((m, i) => {
      if (m.start > cursor) {
        parts.push(text.slice(cursor, m.start));
      }

      switch (m.type) {
        case "image": {
          const src = m.content;
          parts.push(
            <img
              key={`img-${i}-${src}`}
              src={src}
              alt=""
              className={styles.inlineImage}
            />
          );
          break;
        }
        case "strong":
          parts.push(
            <strong key={`strong-${i}`} className={styles.strong}>
              {m.content}
            </strong>
          );
          break;
        case "code":
          parts.push(
            <code key={`code-${i}`} className={styles.inlineCode}>
              {m.content}
            </code>
          );
          break;
        case "link":
          parts.push(
            <a
              key={`link-${i}`}
              href={m.href}
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              {m.content}
            </a>
          );
          break;
        case "em":
          parts.push(
            <em key={`em-${i}`} className={styles.em}>
              {m.content}
            </em>
          );
          break;
        default:
          break;
      }

      cursor = m.end;
    });

    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }

    return parts;
  };

  /* 🔥 IMPORTANT: classic for-loop */
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();

    /* Code blocks */
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className={styles.codeBlock}>
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        if (currentParagraph.length) {
          elements.push(processParagraph(currentParagraph));
          currentParagraph = [];
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    /* Tables */
    if (
      isTableRow(trimmed) &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1])
    ) {
      const headers = trimmed
        .split("|")
        .slice(1, -1)
        .map((h) => h.trim());

      const rows = [];
      index += 2;

      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(
          lines[index]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );
        index++;
      }

      // step back one so for-loop increment lands correctly
      index--;

      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }

      elements.push(
        <table key={`table-${index}`} className={styles.table}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={`th-${i}`}>{processInlineMarkdown(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={`tr-${ri}`}>
                {row.map((cell, ci) => (
                  <td key={`td-${ri}-${ci}`}>
                    {processInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    /* Headings */
    if (/^#{1,6}\s+/.test(trimmed)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }

      const level = trimmed.match(/^#{1,6}/).length;
      const text = trimmed.replace(/^#{1,6}\s+/, "");
      const headingClass =
        level === 1
          ? styles.h1
          : level === 2
          ? styles.h2
          : level === 3
          ? styles.h3
          : level === 4
          ? styles.h4
          : level === 5
          ? styles.h5
          : styles.h6;

      elements.push(
        <div key={`h-${index}`} className={headingClass}>
          {processInlineMarkdown(text)}
        </div>
      );
      continue;
    }

    /* Horizontal rule (section divider) */
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      elements.push(
        <hr key={`hr-${index}`} className={styles.hr} />
      );
      continue;
    }

    /* Lists */
    if (/^[-*+]\s+/.test(trimmed)) {
      if (!inList) {
        if (currentParagraph.length) {
          elements.push(processParagraph(currentParagraph));
          currentParagraph = [];
        }
        inList = true;
        listItems = [];
      }

      const itemText = trimmed.replace(/^[-*+]\s+/, "");
      listItems.push(
        <li key={`li-${index}`} className={styles.listItem}>
          {processInlineMarkdown(itemText)}
        </li>
      );
      continue;
    } else if (inList) {
      // list just ended
      elements.push(
        <ul key={`ul-${index}`} className={styles.list}>
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }

    /* Blank line = paragraph break */
    if (!trimmed) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      continue;
    }

    /* Default: accumulate paragraph text */
    currentParagraph.push(line);
  }

  // Flush remaining paragraph or list
  if (currentParagraph.length) {
    elements.push(processParagraph(currentParagraph));
  }
  if (inList && listItems.length) {
    elements.push(
      <ul key="ul-final" className={styles.list}>
        {listItems}
      </ul>
    );
  }

  return <div className={styles.markdown}>{elements}</div>;
};
