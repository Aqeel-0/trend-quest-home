import { getStoreStyle, getStoreLogoUrl } from "@/utils/storeStyles";
import amazonLogo from "@/assets/amazon.webp";
import flipkartLogo from "@/assets/flipkart.svg";
import cromaLogo from "@/assets/croma.webp";
import relianceLogo from "@/assets/reliance.png";

const LOCAL_LOGOS: Record<string, string> = {
  amazon:   amazonLogo,
  flipkart: flipkartLogo,
  croma:    cromaLogo,
  reliance: relianceLogo,
};

function resolveLogoSrc(name: string): string {
  const key = name.toLowerCase();
  for (const [k, src] of Object.entries(LOCAL_LOGOS)) {
    if (key.includes(k)) return src;
  }
  return getStoreLogoUrl(name);
}

export function StoreTag({ name }: { name: string }) {
  const s = getStoreStyle(name);
  const logo = resolveLogoSrc(name);
  const isAmazon = name.toLowerCase().includes("amazon");

  return (
    <div className="inline-flex flex-nowrap items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground/60 shrink-0">at</span>
      {logo ? (
        <img
          src={logo}
          alt={s.label}
          className={[
            "h-auto w-auto max-h-[22px] max-w-[88px] object-contain shrink-0",
            isAmazon ? "dark:[filter:invert(1)_hue-rotate(180deg)]" : "",
          ].join(" ").trim()}
          style={isAmazon ? { transform: "translateY(3px)" } : undefined}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = "inline";
            }
          }}
        />
      ) : null}
      <span
        className="text-[12px] font-bold leading-none"
        style={{ color: s.color, display: logo ? "none" : "inline" }}
      >
        {s.label}
      </span>
    </div>
  );
}
