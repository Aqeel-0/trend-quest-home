import { Link } from "react-router-dom";

const brands = [
  { name: "Samsung", logo: "/brands/samsung.svg" },
  { name: "Apple",   logo: "/brands/apple.svg" },
  { name: "OnePlus", logo: "/brands/oneplus.svg" },
  { name: "Xiaomi",  logo: "/brands/xiaomi.svg" },
  { name: "Sony",    logo: "/brands/sony.svg" },
  { name: "Realme",  logo: "/brands/realme.svg" },
  { name: "Motorola",logo: "/brands/motorola.svg" },
  { name: "Google",  logo: "/brands/google.svg" },
];

export default function BrandStrip() {
  return (
    <div className="flex items-center justify-center gap-6 overflow-x-auto no-scrollbar sm:gap-8 md:grid md:grid-cols-8">
      {brands.map(({ name, logo }) => (
        <Link
          key={name}
          to={`/brand/${encodeURIComponent(name.toLowerCase())}`}
          className="group flex shrink-0 items-center justify-center p-2 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label={name}
        >
          <img
            src={logo}
            alt=""
            className="h-10 w-10 object-contain transition-all duration-300 dark:brightness-0 dark:invert"
          />
        </Link>
      ))}
    </div>
  );
}
