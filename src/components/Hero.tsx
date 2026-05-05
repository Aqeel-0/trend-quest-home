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
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" aria-hidden />

      <div className="relative container pt-20 pb-16 md:pt-28 md:pb-24 lg:pt-32 lg:pb-28">
        {/* Eyebrow */}
        <div className="flex justify-center mb-8 animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
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
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <span className="text-xs uppercase tracking-wider">Popular:</span>
          {["Smartphones", "Laptops", "Headphones", "Watches"].map((q) => (
            <Link
              key={q}
              to={`/category/${q.toLowerCase()}`}
              className="hover:text-foreground transition-base underline-offset-4 hover:underline"
            >
              {q}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-16 mx-auto max-w-2xl text-center animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-base"
          >
            Compare products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
