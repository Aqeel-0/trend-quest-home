import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Smartphone, Monitor, Headphones, Shirt, Armchair, Watch, Gamepad2, Camera } from "lucide-react";

type Category = {
  name: string;
  Icon: LucideIcon;
};

const categories: Category[] = [
  { name: "Smartphones", Icon: Smartphone },
  { name: "Laptops & PCs", Icon: Monitor },
  { name: "Audio", Icon: Headphones },
  { name: "Fashion", Icon: Shirt },
  { name: "Home", Icon: Armchair },
  { name: "Wearables", Icon: Watch },
  { name: "Gaming", Icon: Gamepad2 },
  { name: "Cameras", Icon: Camera },
];

const CategoryGrid = () => {
  return (
    <section aria-labelledby="categories" className="py-12 md:py-16">
      <div className="container">
        <h2 id="categories" className="text-2xl md:text-3xl font-semibold mb-6">Browse categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map(({ name, Icon }) => (
            <Card key={name} className="hover-scale cursor-pointer shadow-subtle hover:shadow-elevated transition-shadow">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                <div className="rounded-xl bg-secondary p-4">
                  <Icon className="h-6 w-6 text-foreground" aria-hidden />
                </div>
                <span className="text-sm md:text-base font-medium">{name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
