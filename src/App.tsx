import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  Outlet,
} from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CompareProvider } from "@/components/CompareProvider";
import { SearchDialogProvider, useSearchDialog } from "@/contexts/SearchDialogContext";
import { SearchDialog } from "@/components/search/SearchDialog";
import NavBar from "@/components/NavBar";
import Index from "./pages/Index";
import Product from "./pages/Product";
import Compare from "./pages/Compare";
import Brand from "./pages/Brand";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import { useEffect } from "react";

const queryClient = new QueryClient();

function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = (el as HTMLElement).tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
}

function GlobalSearchShortcut() {
  const { toggle, open } = useSearchDialog();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, open]);
  return null;
}

function AppShell() {
  const { isOpen, close } = useSearchDialog();
  return (
    <>
      <GlobalSearchShortcut />
      <NavBar />
      <SearchDialog open={isOpen} onOpenChange={(v) => !v && close()} />
      <Outlet />
    </>
  );
}

function RootLayout() {
  return (
    <SearchDialogProvider>
      <ScrollRestoration />
      <AppShell />
    </SearchDialogProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/search", element: <SearchResults /> },
      { path: "/brand/:name", element: <Brand /> },
      { path: "/trending", element: <SearchResults /> },
      { path: "/deals", element: <SearchResults /> },
      { path: "/new-arrivals", element: <SearchResults /> },
      { path: "/compare", element: <Compare /> },
      { path: "/product/:id", element: <Product /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </CompareProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
