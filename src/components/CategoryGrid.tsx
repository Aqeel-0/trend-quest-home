import { LucideIcon, Smartphone, Monitor, Headphones, Shirt, Armchair, Watch, Gamepad2, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedCategories } from "@/hooks/useCategories";

// Icon mapping for categories
const iconMap: Record<string, LucideIcon> = {
  "smartphones": Smartphone,
  "laptops": Monitor,
  "audio": Headphones,
  "fashion": Shirt,
  "home": Armchair,
  "wearables": Watch,
  "gaming": Gamepad2,
  "cameras": Camera,
};

// Fallback categories if no data from Supabase
const fallbackCategories = [
  { name: "Smartphones", slug: "smartphones", icon: "smartphones" },
  { name: "Laptops & PCs", slug: "laptops", icon: "laptops" },
  { name: "Audio", slug: "audio", icon: "audio" },
  { name: "Fashion", slug: "fashion", icon: "fashion" },
  { name: "Home", slug: "home", icon: "home" },
  { name: "Wearables", slug: "wearables", icon: "wearables" },
  { name: "Gaming", slug: "gaming", icon: "gaming" },
  { name: "Cameras", slug: "cameras", icon: "cameras" },
];

const CategoryGrid = () => {
  const { data: categories, isLoading } = useFeaturedCategories();

  // Use Supabase data if available, otherwise fallback to hardcoded data
  const displayCategories = categories?.length ? categories : fallbackCategories;

  if (isLoading) {
    return (
      <section aria-labelledby="categories" className="py-12 md:py-16">
        <div className="container px-0">
          <h2 id="categories" className="text-2xl md:text-3xl font-semibold mb-6">Browse categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
          {displayCategories.map((category) => {
            const Icon = iconMap[category.slug] || iconMap[category.icon || ""] || Smartphone;
            return (
              <Link 
                key={category.slug} 
                to={`/category/${category.slug}`} 
                aria-label={`Browse ${category.name} deals`} 
                className="inline-flex flex-col items-center gap-1 hover-scale cursor-pointer transition-transform"
              >
                <Icon className="h-6 w-6 text-foreground" aria-hidden />
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
