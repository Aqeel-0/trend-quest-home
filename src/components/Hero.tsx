import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useSearchDialog } from "@/contexts/SearchDialogContext";

export const Hero = () => {
  const { open: openSearch } = useSearchDialog();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" aria-hidden />

      <div className="relative container pt-20 pb-20 md:pt-28 md:pb-28 lg:pt-32 lg:pb-32">
        {/* Eyebrow */}
        <div className="flex justify-center mb-8 animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live prices across top retailers · updated daily
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mx-auto max-w-5xl text-center font-semibold tracking-[-0.04em] leading-[0.95] text-foreground text-5xl sm:text-6xl md:text-7xl lg:text-[5.75rem] animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          Find the best deals,
          <br />
          <span className="italic font-normal text-accent">every time</span>.
        </h1>

        <p
          className="mx-auto mt-6 max-w-xl text-center text-base md:text-lg text-muted-foreground leading-relaxed animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Compare real-time prices across top retailers. One search. Every store. Zero noise.
        </p>

        {/* Search trigger */}
        <div
          className="mx-auto mt-10 max-w-xl animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-3 rounded-full border border-border bg-card shadow-card px-5 h-14 text-sm text-muted-foreground hover:border-border/80 hover:bg-card/80 transition-colors"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search smartphones, laptops, headphones…</span>
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Quick links */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <span className="text-xs uppercase tracking-wider">Popular:</span>
          {[
            { label: "Smartphones", q: "smartphone" },
            { label: "Laptops", q: "laptop" },
            { label: "Headphones", q: "headphones" },
            { label: "Watches", q: "smartwatch" },
          ].map((item) => (
            <Link
              key={item.q}
              to={`/search?q=${encodeURIComponent(item.q)}`}
              className="hover:text-foreground transition-base underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Stats strip */}
        <div
          className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          {[
            { v: "10k+", l: "Products tracked" },
            { v: "30+", l: "Retailers compared" },
            { v: "24/7", l: "Live price updates" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur px-4 py-4 text-center"
            >
              <div className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                {s.v}
              </div>
              <div className="mt-1 text-[11px] md:text-xs uppercase tracking-wider text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Compare CTA */}
        <div
          className="mt-10 flex justify-center animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-base"
          >
            Or compare products side-by-side <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
