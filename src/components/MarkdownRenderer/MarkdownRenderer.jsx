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
      <p key={elements.length} className={styles.paragraph}>
        {processInlineMarkdown(text)}
      </p>
    );
  };

  const processInlineMarkdown = (text) => {
  const parts = [];

  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, type: "strong" },
    { regex: /`(.*?)`/g, type: "code" },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: "link" },
    { regex: /\*(.*?)\*/g, type: "em" },
  ];

  const matches = [];

  // Collect all matches
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
      case "strong":
        parts.push(<strong key={i}>{m.content}</strong>);
        break;
      case "em":
        parts.push(<em key={i}>{m.content}</em>);
        break;
      case "code":
        parts.push(
          <code key={i} className={styles.inlineCode}>
            {m.content}
          </code>
        );
        break;
      case "link":
        parts.push(
          <a
            key={i}
            href={m.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {m.content}
          </a>
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
          <pre key={elements.length} className={styles.codeBlock}>
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

      index--; // step back one

      elements.push(
        <table key={elements.length} className={styles.table}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{processInlineMarkdown(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{processInlineMarkdown(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

      continue;
    }

    /* Headers */
    if (trimmed.startsWith("#")) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }

      const level = trimmed.match(/^#+/)[0].length;
      const text = trimmed.replace(/^#+\s*/, "");
      const Tag = `h${Math.min(level, 6)}`;

      elements.push(
        React.createElement(
          Tag,
          { key: elements.length, className: styles[`h${level}`] },
          processInlineMarkdown(text)
        )
      );
      continue;
    }

    /* Divider */
    if (trimmed === "---") {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      elements.push(<hr key={elements.length} className={styles.hr} />);
      continue;
    }

    /* Lists */
    if (/^[-*•]\s/.test(trimmed)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }

      listItems.push(
        <li key={listItems.length} className={styles.listItem}>
          {processInlineMarkdown(trimmed.replace(/^[-*•]\s/, ""))}
        </li>
      );
      inList = true;
      continue;
    }

    /* Empty line */
    if (!trimmed) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      if (inList) {
        elements.push(
          <ul key={elements.length} className={styles.list}>
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      continue;
    }

    currentParagraph.push(trimmed);
  }

  if (currentParagraph.length) {
    elements.push(processParagraph(currentParagraph));
  }

  if (inList) {
    elements.push(
      <ul key={elements.length} className={styles.list}>
        {listItems}
      </ul>
    );
  }

  return <div className={styles.markdown}>{elements}</div>;
};
