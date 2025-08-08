import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";

const Hero = () => {
  const [query, setQuery] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // For now just redirect to home with query param
    const p = new URLSearchParams({ q: query }).toString();
    window.location.href = `/?${p}`;
  };

  return (
    <header className="w-full bg-hero-gradient">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center animate-enter">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Compare prices across stores instantly
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8">
            Search millions of products, find the best deals, and save time.
          </p>
          <form onSubmit={onSubmit} className="flex gap-2 items-center justify-center">
            <div className="flex w-full max-w-2xl items-center gap-2 rounded-lg bg-card p-2 shadow-subtle">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a product (e.g., wireless headphones)"
                className="flex-1 border-none focus-visible:ring-0"
              />
              <Button type="submit" className="px-6">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Hero;
