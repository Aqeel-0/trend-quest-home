import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingSection from "@/components/TrendingSection";
import DealsSection from "@/components/DealsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <main className="flex-1">
        <CategoryGrid />
        <TrendingSection />
        <DealsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
