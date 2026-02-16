import React from "react";
import katex from "katex";
import styles from "./MarkdownRenderer.module.css";

export const MarkdownRenderer = ({ content, images }) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];

  let currentParagraph = [];
  let inCodeBlock = false;
  let codeBlockContent = [];

  let listItems = [];
  let inList = false;

  /* blockquote */
  let inBlockquote = false;
  let blockquoteLines = [];
  let blockquoteLevel = 1; // 🔽 ADDED

  /* callout */
  let inCallout = false;
  let calloutType = "";
  let calloutTitle = ""; // 🔽 ADDED
  let calloutLines = [];

  const isTableRow = (line) =>
    line.trim().startsWith("|") && line.trim().endsWith("|");
  const isTableDivider = (line) =>
    /^\|\s*-+/.test(line.trim()) && line.trim().endsWith("|");

  const processParagraph = (para) => {
    if (!para.length) return null;
    // const text = para.join(" ").trim();
    // new fix for single click of enter
    // const text = para.join("\n").trim();
    // better single click enter
    // const text = para.join("<br />").trim();
    // if (!text) return null;
    return (
      <p className={styles.paragraph}>
        {para.map((line, i) => (
          <React.Fragment key={i}>
            {processInlineMarkdown(line)}
            {i !== para.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  };

  const processInlineMarkdown = (text) => {
    const parts = [];

    const patterns = [
      {
        regex: /!\[Image (\d+)\]/g,
        type: "stored-image",
      },
      { regex: /\$\$(.*?)\$\$/g, type: "block-math" },
      { regex: /\$(.*?)\$/g, type: "inline-math" },
      {
        regex: /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g,
        type: "image",
      },
      {
        regex: /!\[([^\]]*)\]\(([^)]+)\)/g,
        type: "markdown-image",
      },
      { regex: /\*\*(.*?)\*\*/g, type: "strong" },
      { regex: /`(.*?)`/g, type: "code" },
      { regex: /(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g, type: "link" },
      { regex: /\*(?!\*)([^*]+)\*(?!\*)/g, type: "em" },
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

    matches.sort((a, b) => a.start - b.start);

    let cursor = 0;

    matches.forEach((m, i) => {
      if (m.start > cursor) {
        parts.push(text.slice(cursor, m.start));
      }

      switch (m.type) {
        case "stored-image": {
          const token = `![Image ${m.content}]`;
          const src = images?.[token];

          if (src) {
            parts.push(
              <img
                key={`stored-${i}`}
                src={src}
                alt=""
                className={styles.inlineImage}
              />
            );
          }
          break;
        }
        case "markdown-image":
          parts.push(
            <img
              key={`md-img-${i}`}
              src={m.href}
              alt={m.content}
              className={styles.inlineImage}
            />
          );
          break;

        case "block-math": {
          const html = katex.renderToString(m.content, {
            displayMode: true,
            throwOnError: false,
          });
          parts.push(
            <div
              key={`bm-${i}`}
              className={styles.mathBlock}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
          break;
        }
        case "inline-math": {
          const html = katex.renderToString(m.content, {
            throwOnError: false,
          });
          parts.push(
            <span
              key={`im-${i}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
          break;
        }
        case "image":
          parts.push(
            <img
              key={`img-${i}`}
              src={m.content}
              alt=""
              className={styles.inlineImage}
            />
          );
          break;
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

  const isCenteredDiv = (line) =>
    /^<div\s+align=["'](center|centre)["']>.*<\/div>\s*$/i.test(line.trim());

  const renderCenteredDiv = (line, index) => {
    const match = line.trim().match(
      /^<div\s+align=["'](center|centre)["']>(.*)<\/div>\s*$/i
    );
    if (!match) return null;
    const inner = match[2].trim();
    return (
      <div key={`center-${index}`} className={styles.centeredBlock}>
        {processInlineMarkdown(inner)}
      </div>
    );
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();

    /* CODE BLOCKS */
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

    /* CALLOUT ::: */
    if (trimmed.startsWith(":::")) {
      if (inCallout) {
        elements.push(
          <div
            key={`callout-${index}`}
            className={`${styles.callout} ${styles[calloutType] || ""}`}
          >
            {calloutTitle && (
              <div className={styles.calloutTitle}>
                {processInlineMarkdown(calloutTitle)}
              </div>
            )}
            {calloutLines.map((l, i) => (
              <p key={i} className={styles.paragraph}>
                {processInlineMarkdown(l)}
              </p>
            ))}
          </div>
        );
        inCallout = false;
        calloutLines = [];
        calloutType = "";
        calloutTitle = "";
      } else {
        if (currentParagraph.length) {
          elements.push(processParagraph(currentParagraph));
          currentParagraph = [];
        }
        const meta = trimmed.replace(":::", "").trim();
        const [type, ...titleParts] = meta.split(" ");
        calloutType = type;
        calloutTitle = titleParts.join(" ");
        inCallout = true;
      }
      continue;
    }

    if (inCallout) {
      calloutLines.push(line);
      continue;
    }

    /* BLOCKQUOTE GROUP (FIXED) */
    if (/^>+/.test(trimmed)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }

      const match = trimmed.match(/^(>+)\s?(.*)$/);
      blockquoteLines.push({
        level: match[1].length,
        text: match[2],
      });
      inBlockquote = true;
      continue;
    } else if (inBlockquote) {
      elements.push(
        <blockquote key={`bq-${index}`} className={styles.blockquote}>
          {blockquoteLines.map((line, i) => (
            <div
              key={i}
              className={styles.blockquoteLine}
              style={{ "--bq-level": line.level }}
            >
              {processInlineMarkdown(line.text)}
            </div>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
      inBlockquote = false;
    }



    /* TABLES */
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

    /* CENTERED DIV */
    if (isCenteredDiv(line)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      elements.push(renderCenteredDiv(line, index));
      continue;
    }

    /* HEADINGS */
    if (/^#{1,6}\s+/.test(trimmed)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }

      const match = trimmed.match(/^#{1,6}/);
      const level = match[0].length;
      const text = trimmed.replace(/^#{1,6}\s+/, "");

      const HeadingTag = `h${level}`;

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
        React.createElement(
          HeadingTag,
          {
            key: `h-${index}`,
            className: headingClass,
          },
          processInlineMarkdown(text)
        )
      );

      continue;
    }


    /* HR */
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      elements.push(<hr key={`hr-${index}`} className={styles.hr} />);
      continue;
    }

    /* LISTS */
    if (/^[-*+]\s+/.test(trimmed)) {
      if (!inList) {
        if (currentParagraph.length) {
          elements.push(processParagraph(currentParagraph));
          currentParagraph = [];
        }
        inList = true;
        listItems = [];
      }

      listItems.push(
        <li key={`li-${index}`} className={styles.listItem}>
          {processInlineMarkdown(trimmed.replace(/^[-*+]\s+/, ""))}
        </li>
      );
      continue;
    } else if (inList) {
      elements.push(
        <ul key={`ul-${index}`} className={styles.list}>
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }

    /* BLANK LINE */
    if (!trimmed) {
      if (currentParagraph.length) {
        elements.push(processParagraph(currentParagraph));
        currentParagraph = [];
      }
      continue;
    }

    currentParagraph.push(line);
  }

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

  if (inBlockquote && blockquoteLines.length) {
    elements.push(
      <blockquote key="bq-final" className={styles.blockquote}>
        {processInlineMarkdown(blockquoteLines.join(" "))}
      </blockquote>
    );
  }

  return <div className={styles.markdown}>{elements}</div>;
};
