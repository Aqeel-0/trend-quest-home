import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FiltersState = {
  price: [number, number];
  min: number;
  max: number;
  selectedBrands: string[];
  minRating: number | null;
  inStockOnly: boolean;
  selectedStores: string[];
};

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function SearchFilters({
  brands,
  stores,
  state,
  onChange,
  onClear,
}: {
  brands: string[];
  stores: string[];
  state: FiltersState;
  onChange: (next: Partial<FiltersState>) => void;
  onClear?: () => void;
}) {
  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((b) => b !== value) : [...list, value];

  const activeCount =
    (state.selectedBrands.length > 0 ? 1 : 0) +
    (state.selectedStores.length > 0 ? 1 : 0) +
    (state.minRating ? 1 : 0) +
    (state.inStockOnly ? 1 : 0) +
    (state.price[0] > state.min || state.price[1] < state.max ? 1 : 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Filters</h2>
        {activeCount > 0 && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["price", "brand", "rating", "availability", "store"]}
        className="w-full"
      >
        <AccordionItem value="price" className="border-border/60">
          <AccordionTrigger className="text-sm font-medium hover:no-underline">
            Price
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-3">
              <Slider
                value={[state.price[0], state.price[1]]}
                onValueChange={(val) => onChange({ price: [val[0], val[1]] as [number, number] })}
                min={state.min}
                max={state.max}
                step={500}
              />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatINR(state.price[0])}</span>
                <span>{formatINR(state.price[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {brands.length > 0 && (
          <AccordionItem value="brand" className="border-border/60">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              Brand
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2.5 pt-1 max-h-64 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <label
                    key={b}
                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <Checkbox
                      checked={state.selectedBrands.includes(b)}
                      onCheckedChange={() =>
                        onChange({ selectedBrands: toggleInList(state.selectedBrands, b) })
                      }
                      aria-label={`Filter by brand ${b}`}
                    />
                    <span className="text-foreground/90">{b}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="rating" className="border-border/60">
          <AccordionTrigger className="text-sm font-medium hover:no-underline">
            Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { v: null, label: "Any" },
                { v: 4, label: "4★ & up" },
                { v: 3, label: "3★ & up" },
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  type="button"
                  onClick={() => onChange({ minRating: opt.v })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    state.minRating === opt.v
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground/80 hover:border-foreground/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-border/60">
          <AccordionTrigger className="text-sm font-medium hover:no-underline">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center justify-between pt-1 text-sm">
              <span className="text-foreground/90">In stock only</span>
              <Switch
                checked={state.inStockOnly}
                onCheckedChange={(v) => onChange({ inStockOnly: Boolean(v) })}
              />
            </label>
          </AccordionContent>
        </AccordionItem>

        {stores.length > 0 && (
          <AccordionItem value="store" className="border-border/60">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              Store
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2.5 pt-1 max-h-56 overflow-y-auto pr-1">
                {stores.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <Checkbox
                      checked={state.selectedStores.includes(s)}
                      onCheckedChange={() =>
                        onChange({ selectedStores: toggleInList(state.selectedStores, s) })
                      }
                      aria-label={`Filter by store ${s}`}
                    />
                    <span className="text-foreground/90">{s}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
