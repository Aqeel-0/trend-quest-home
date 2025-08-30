import { LucideIcon, Smartphone, Laptop, Zap, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedCategories } from "@/hooks/useCategories";

// Icon mapping for categories
const iconMap: Record<string, LucideIcon> = {
  "smartphones": Smartphone,
  "laptops": Laptop,
  "electronics": Zap,
  "coming-soon": MoreHorizontal,
};

// Categories to display
const categories = [
  { name: "Smartphones", slug: "smartphones", icon: "smartphones" },
  { name: "Electronics", slug: "electronics", icon: "electronics" },
  { name: "Laptops", slug: "laptops", icon: "laptops" },
  { name: "Gaming Consoles", slug: "gaming-consoles", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-1", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-2", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-3", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-4", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-5", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-6", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-7", icon: "coming-soon" },
  { name: "Coming Soon...", slug: "coming-soon-8", icon: "coming-soon" },
];

const CategoryGrid = () => {
  const { isLoading } = useFeaturedCategories();

  if (isLoading) {
    return (
      <section aria-labelledby="categories" className="py-12 md:py-16">
        <div className="container px-0">
          <h2 id="categories" className="text-2xl md:text-3xl font-semibold mb-6">Browse categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 justify-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="inline-flex flex-col items-center gap-1">
                <div className="h-6 w-6 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="categories" className="py-12 md:py-16">
      <div className="container px-0">
        <h2 id="categories" className="text-2xl md:text-3xl font-semibold mb-6">Browse categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 justify-items-center">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Smartphone;
            return (
              <Link 
                key={category.slug}
                to={category.slug === 'coming-soon' ? '#' : `/category/${category.slug}`}
                aria-label={category.slug === 'coming-soon' ? 'Coming soon' : `Browse ${category.name} deals`}
                className={`flex flex-col items-center gap-1 hover-scale transition-transform ${
                  category.slug === 'coming-soon' ? 'opacity-50 cursor-default' : 'cursor-pointer'
                }`}
              >
                <Icon className="h-8 w-8 text-foreground" aria-hidden />
                <span className="text-sm md:text-base font-medium">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
