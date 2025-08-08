import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "./ProductCard";

import headphones from "@/assets/prod-headphones.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import controller from "@/assets/prod-controller.jpg";

type Deal = Product & { discount: number };

const deals: Deal[] = [
  { id: "d1", title: "Wireless Headphones", image: headphones, lowestPrice: "$119.99", store: "NovaMart", discount: 20 },
  { id: "d2", title: "Ultra Slim 14" + " Laptop", image: laptop, lowestPrice: "$829.00", store: "QuickBuy", discount: 8 },
  { id: "d3", title: "Wireless Controller Pro", image: controller, lowestPrice: "$49.00", store: "Shoply", discount: 15 },
];

const DealsSection = () => {
  return (
    <section aria-labelledby="deals" className="py-12 md:py-16">
      <div className="container">
        <h2 id="deals" className="text-2xl md:text-3xl font-semibold mb-6">Top deals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((d) => (
            <Card key={d.id} className="overflow-hidden hover-scale shadow-subtle hover:shadow-elevated transition-shadow">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
                <img src={d.image} alt={d.title + " deal image"} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-3 top-3">
                  <Badge variant="secondary">Save {d.discount}%</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium leading-tight">{d.title}</h3>
                    <p className="text-sm text-muted-foreground">from {d.store}</p>
                  </div>
                  <div className="text-lg font-semibold">{d.lowestPrice}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
