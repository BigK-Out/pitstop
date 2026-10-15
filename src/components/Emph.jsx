import { Fragment } from "react";

// Renders copy segments from content.js: { text } as plain text, { em } as <em>,
// { nowrap } as a span that never breaks across lines.
export default function Emph({ parts }) {
  return parts.map((part, i) => {
    if (part.em) return <em key={i}>{part.em}</em>;
    if (part.nowrap) {
      return (
        <span key={i} className="nowrap">
          {part.nowrap}
        </span>
      );
    }
    return <Fragment key={i}>{part.text}</Fragment>;
  });
}
