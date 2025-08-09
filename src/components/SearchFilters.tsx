import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export type FiltersState = {
  price: [number, number];
  min: number;
  max: number;
  selectedBrands: string[];
  minRating: number | null;
  inStockOnly: boolean;
  selectedStores: string[];
};

export default function SearchFilters({
  brands,
  stores,
  state,
  onChange,
}: {
  brands: string[];
  stores: string[];
  state: FiltersState;
  onChange: (next: Partial<FiltersState>) => void;
}) {
  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((b) => b !== value) : [...list, value];

  return (
    <div className="animate-fade-in">
      <Accordion type="multiple" defaultValue={["price", "brand", "rating", "availability", "store"]} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2">
              <Slider
                value={[state.price[0], state.price[1]]}
                onValueChange={(val) => onChange({ price: [val[0], val[1]] as [number, number] })}
                min={state.min}
                max={state.max}
                step={100}
              />
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>₹{state.price[0].toLocaleString("en-IN")}</span>
                <span>₹{state.price[1].toLocaleString("en-IN")}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-2">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-3">
                  <Checkbox
                    checked={state.selectedBrands.includes(b)}
                    onCheckedChange={() => onChange({ selectedBrands: toggleInList(state.selectedBrands, b) })}
                    aria-label={`Filter by brand ${b}`}
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Ratings</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={state.minRating?.toString() ?? "any"}
              onValueChange={(v) => onChange({ minRating: v === "any" ? null : parseInt(v) })}
              className="pt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="any" id="r-any" />
                <Label htmlFor="r-any">Any rating</Label>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <RadioGroupItem value="4" id="r-4" />
                <Label htmlFor="r-4">4★ & up</Label>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <RadioGroupItem value="3" id="r-3" />
                <Label htmlFor="r-3">3★ & up</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center justify-between pt-2">
              <span>In stock only</span>
              <Switch checked={state.inStockOnly} onCheckedChange={(v) => onChange({ inStockOnly: Boolean(v) })} />
            </label>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="store">
          <AccordionTrigger>Store</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-2">
              {stores.map((s) => (
                <label key={s} className="flex items-center gap-3">
                  <Checkbox
                    checked={state.selectedStores.includes(s)}
                    onCheckedChange={() => onChange({ selectedStores: toggleInList(state.selectedStores, s) })}
                    aria-label={`Filter by store ${s}`}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
