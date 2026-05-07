import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import { useCompare } from "@/components/CompareProvider";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { useSearchDialog } from "@/contexts/SearchDialogContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/compare", label: "Compare" },
];

export default function NavBar() {
  const { count } = useCompare();
  const navigate = useNavigate();
  const { open: openSearch } = useSearchDialog();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-foreground text-background font-semibold text-base tracking-tight transition-base group-hover:bg-accent">
            T
          </span>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            Trend<span className="text-accent">Quest</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-full text-sm font-medium transition-base ${
                  isActive
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger onClick={openSearch} />
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-1 mt-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `px-3 py-3 rounded-xl text-base font-medium transition-base flex items-center justify-between ${
                        isActive
                          ? "text-foreground bg-secondary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.to === "/compare" && count > 0 && (
                      <Badge className="bg-accent text-accent-foreground border-0">{count}</Badge>
                    )}
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button
            size="sm"
            onClick={() => navigate("/compare")}
            className="hidden sm:inline-flex rounded-full bg-foreground text-background hover:bg-foreground/90 h-9 px-4"
          >
            <ArrowLeftRight className="h-4 w-4 mr-1.5" />
            Compare
            {count > 0 && (
              <span className="ml-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-accent text-accent-foreground text-[11px] font-bold">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
