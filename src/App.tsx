import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/NavBar";
import Index from "./pages/Index";
import Category from "./pages/Category";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
//import { ProductVariantsPage } from "./pages/ProductVariants";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/search" element={<SearchResults />} />
            {/* <Route path="/variants" element={<ProductVariantsPage />} /> */}
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
