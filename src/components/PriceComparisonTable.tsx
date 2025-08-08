import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type Offer = {
  store: string;
  logo?: string; // optional logo URL
  price: string;
  delivery: string;
  url: string;
  inStock?: boolean;
};

export default function PriceComparisonTable({ offers }: { offers: Offer[] }) {
  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableCaption>Compare prices and delivery from multiple stores.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Store</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o) => (
              <TableRow key={o.store}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {o.logo ? (
                        <AvatarImage src={o.logo} alt={`${o.store} logo`} />
                      ) : (
                        <AvatarFallback>{o.store.slice(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium">{o.store}</span>
                  </div>
                </TableCell>
                <TableCell>{o.delivery}</TableCell>
                <TableCell>
                  <span className={o.inStock ? "text-foreground" : "text-muted-foreground"}>
                    {o.inStock ? "In stock" : "Out of stock"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">{o.price}</TableCell>
                <TableCell className="text-right">
                  <Button asChild>
                    <a href={o.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${o.store}`}>
                      Visit Store
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {offers.map((o) => (
          <div key={o.store} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {o.logo ? (
                    <AvatarImage src={o.logo} alt={`${o.store} logo`} />
                  ) : (
                    <AvatarFallback>{o.store.slice(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium leading-none">{o.store}</div>
                  <div className="text-sm text-muted-foreground">{o.delivery}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{o.price}</div>
                <div className="text-xs text-muted-foreground">
                  {o.inStock ? "In stock" : "Out of stock"}
                </div>
              </div>
            </div>
            <div className="mt-3 text-right">
              <Button className="w-full" asChild>
                <a href={o.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${o.store}`}>
                  Visit Store
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
