import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";

export const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/search");
    }
  };

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

        {/* Search */}
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card shadow-card p-1.5 animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search smartphones, laptops, headphones…"
              className="border-0 bg-transparent pl-10 h-11 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="rounded-full h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
          >
            Search
          </Button>
        </form>

        {/* Quick links */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <span className="text-xs uppercase tracking-wider">Popular:</span>
          {[
            { label: "Smartphones", slug: "smartphones" },
            { label: "Laptops", slug: "laptops" },
            { label: "Headphones", slug: "headphones" },
            { label: "Watches", slug: "smartwatches" },
          ].map((q) => (
            <Link
              key={q.slug}
              to={`/category/${q.slug}`}
              className="hover:text-foreground transition-base underline-offset-4 hover:underline"
            >
              {q.label}
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
