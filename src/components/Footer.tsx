import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    toast({
      title: "Subscribed!",
      description: "You'll receive our best deals weekly.",
    });
    setEmail("");
  };

  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/30">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-foreground text-background font-semibold text-base tracking-tight">
                T
              </span>
              <span className="font-semibold text-lg tracking-tight text-foreground">
                Trend<span className="text-accent">Quest</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Track prices across every major retailer in one place. Compare,
              save, and never overpay again.
            </p>

            {/* Newsletter */}
            <form
              onSubmit={onSubmit}
              className="mt-8 flex max-w-sm items-center gap-2 rounded-full border border-border bg-card p-1.5"
            >
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="border-0 bg-transparent pl-4 h-10 focus-visible:ring-0"
                aria-label="Email address"
              />
              <Button
                type="submit"
                className="rounded-full h-10 px-5 bg-foreground text-background hover:bg-foreground/90"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Deals in your inbox, weekly. Unsubscribe anytime.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Browse
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/search?q=smartphone" className="hover:text-foreground transition-base">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link to="/search?q=laptop" className="hover:text-foreground transition-base">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/search?q=headphones" className="hover:text-foreground transition-base">
                  Headphones
                </Link>
              </li>
              <li>
                <Link to="/search?q=smartwatch" className="hover:text-foreground transition-base">
                  Watches
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-foreground transition-base">
                  All products
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-base">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-base">
                  Partnerships
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-base">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-base">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} TrendQuest. All rights reserved.</span>
          <span>Prices updated continuously · India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
