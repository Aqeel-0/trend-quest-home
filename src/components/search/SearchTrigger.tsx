import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: Props) {
  return (
    <>
      {/* Desktop: pill-shaped search bar */}
      <button
        type="button"
        onClick={onClick}
        className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-4 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[200px] max-w-xs"
        aria-label="Search products and brands"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Mobile: icon-only button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="sm:hidden rounded-full"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  );
}
