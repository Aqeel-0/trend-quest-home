import { Link } from "react-router-dom";
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Tablet,
  Cable,
} from "lucide-react";

const categories = [
  { slug: "smartphones", label: "Smartphones", Icon: Smartphone },
  { slug: "laptops", label: "Laptops", Icon: Laptop },
  { slug: "headphones", label: "Headphones", Icon: Headphones },
  { slug: "smartwatches", label: "Watches", Icon: Watch },
  { slug: "tablets", label: "Tablets", Icon: Tablet },
  { slug: "accessories", label: "Accessories", Icon: Cable },
];

export default function CategoryStrip() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-6">
      {categories.map(({ slug, label, Icon }) => (
        <Link
          key={slug}
          to={`/category/${slug}`}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-xs font-medium tracking-tight text-foreground sm:text-sm">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
