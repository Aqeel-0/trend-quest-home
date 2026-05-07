import { Fragment, type ReactNode } from "react";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMatch(text: string, query: string): ReactNode {
  if (!query || !text) return text;
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegex);
  if (tokens.length === 0) return text;
  const re = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(re);
  // split() with a capture group returns [nonmatch, match, nonmatch, match, ...]
  // so odd indices are the captured matches — no re.test() needed (avoids lastIndex state bug)
  return parts.map((part, i) =>
    i % 2 !== 0 ? (
      <mark key={i} className="bg-accent/40 rounded-sm px-0.5 not-italic text-foreground">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}
