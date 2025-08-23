import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-semibold tracking-tight story-link">
            <span className="text-foreground">Shop</span>
            <span className="text-primary">Compare</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/variants" 
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <Link 
            to="/search" 
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Search
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
