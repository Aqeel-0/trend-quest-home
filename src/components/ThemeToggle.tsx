import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border-input hover:bg-accent hover:text-accent-foreground"
    >
      <Sun className="rotate-0 scale-100 transition-all duration-300 data-[dark=true]:-rotate-90 data-[dark=true]:scale-0" data-dark={isDark} />
      <Moon className="absolute rotate-90 scale-0 transition-all duration-300 data-[dark=true]:rotate-0 data-[dark=true]:scale-100" data-dark={isDark} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
