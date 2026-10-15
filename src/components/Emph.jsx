import { Fragment } from "react";

// Renders copy segments from content.js: { text } as plain text, { em } as <em>.
export default function Emph({ parts }) {
  return parts.map((part, i) =>
    part.em ? <em key={i}>{part.em}</em> : <Fragment key={i}>{part.text}</Fragment>,
  );
}
