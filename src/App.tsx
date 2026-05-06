import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CompareProvider } from "@/components/CompareProvider";
import NavBar from "@/components/NavBar";
import Index from "./pages/Index";
import Category from "./pages/Category";
import Product from "./pages/Product";
import Compare from "./pages/Compare";
import Brand from "./pages/Brand";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Prevent browser scroll restoration so every page opens at the top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <NavBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/brand/:name" element={<Brand />} />
              <Route path="/trending" element={<SearchResults />} />
              <Route path="/deals" element={<SearchResults />} />
              <Route path="/new-arrivals" element={<SearchResults />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CompareProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
