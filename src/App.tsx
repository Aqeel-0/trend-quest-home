import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CompareProvider } from "@/components/CompareProvider";
import NavBar from "@/components/NavBar";
import Index from "./pages/Index";
import Category from "./pages/Category";
import Product from "./pages/Product";
import Compare from "./pages/Compare";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NavBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchResults />} />
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
