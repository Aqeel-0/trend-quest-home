import { getStoreStyle, getStoreFaviconUrl } from "@/utils/storeStyles";

export function StoreTag({ name }: { name: string }) {
  const s = getStoreStyle(name);
  const favicon = getStoreFaviconUrl(name);
  const isAmazon = name.toLowerCase().includes("amazon");
  const amazonLabel = s.domain.includes("amazon") ? s.domain : "amazon.in";

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-3 py-1">
      <span className="text-[10px] text-muted-foreground/60">at</span>
      {isAmazon ? (
        <div className="flex flex-col items-start leading-none gap-[1px]">
          <span className="text-[12px] font-bold text-foreground tracking-tight">{amazonLabel}</span>
          <svg width="38" height="6" viewBox="0 0 38 6" fill="none">
            <path d="M1 3.5 Q19 8.5 37 3.5" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M33 1.5 L37 3.5 L33 5.5" stroke="#FF9900" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5">
          {favicon && (
            <img
              src={favicon}
              alt={s.label}
              className="h-3.5 w-3.5 rounded-sm object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <span
            className="text-[12px] font-bold leading-none border-b-2 pb-px"
            style={{ color: s.color, borderColor: s.color }}
          >
            {s.label}
          </span>
        </div>
      )}
    </div>
  );
}
