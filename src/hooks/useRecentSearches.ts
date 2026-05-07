import { useState } from "react";

const KEY = "tq-recent-searches";
const MAX = 5;

function readLS(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLS(items: string[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(readLS);

  const add = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX);
      writeLS(next);
      return next;
    });
  };

  const remove = (q: string) => {
    setRecent((prev) => {
      const next = prev.filter((x) => x.toLowerCase() !== q.toLowerCase());
      writeLS(next);
      return next;
    });
  };

  const clear = () => {
    setRecent([]);
    writeLS([]);
  };

  return { recent, add, remove, clear };
}
