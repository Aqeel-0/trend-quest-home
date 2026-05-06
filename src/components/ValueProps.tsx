import { BarChart3, Bell, ShieldCheck } from "lucide-react";

const items = [
  {
    Icon: BarChart3,
    title: "Live price tracking",
    body: "We refresh prices across retailers multiple times a day so you never pay more than you should.",
  },
  {
    Icon: Bell,
    title: "Drop alerts, not spam",
    body: "Follow a product, set your target, and only hear from us when the number moves.",
  },
  {
    Icon: ShieldCheck,
    title: "Every retailer, one page",
    body: "Compare prices, stock, and ratings side-by-side without hopping between tabs.",
  },
];

export default function ValueProps() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ Icon, title, body }) => (
        <div
          key={title}
          className="rounded-2xl border border-border/60 bg-card p-7 transition-shadow duration-300 hover:shadow-card"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-foreground">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}
