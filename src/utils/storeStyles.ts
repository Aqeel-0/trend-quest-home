export interface StoreStyle {
  label: string;
  color: string;
  domain: string;
}

const STORE_MAP: [string, StoreStyle][] = [
  ["amazon",           { label: "amazon.in",           color: "#FF9900", domain: "amazon.in"          }],
  ["flipkart",         { label: "flipkart.com",         color: "#2874F0", domain: "flipkart.com"       }],
  ["croma",            { label: "croma.com",            color: "#97C93D", domain: "croma.com"          }],
  ["reliance digital", { label: "reliancedigital.in",   color: "#C8102E", domain: "reliancedigital.in" }],
  ["tata cliq",        { label: "tatacliq.com",         color: "#6A0DAD", domain: "tatacliq.com"       }],
  ["myntra",           { label: "myntra.com",           color: "#FF3F6C", domain: "myntra.com"         }],
  ["snapdeal",         { label: "snapdeal.com",         color: "#E40046", domain: "snapdeal.com"       }],
  ["paytm mall",       { label: "paytmmall.com",        color: "#00BAF2", domain: "paytmmall.com"      }],
  ["samsung",          { label: "samsung.com/in",       color: "#1428A0", domain: "samsung.com"       }],
  ["vijay sales",      { label: "vijaysales.com",       color: "#003087", domain: "vijaysales.com"     }],
  ["oneplus",          { label: "oneplus.com/in",       color: "#F5010C", domain: "oneplus.com"        }],
  ["mi store",         { label: "mi.com/in",            color: "#FF6900", domain: "mi.com"             }],
  ["meesho",           { label: "meesho.com",           color: "#8F00FF", domain: "meesho.com"         }],
  ["jiomart",          { label: "jiomart.com",          color: "#0076BE", domain: "jiomart.com"        }],
  ["nykaa",            { label: "nykaa.com",            color: "#FC2779", domain: "nykaa.com"          }],
];

export function getStoreStyle(storeName: string): StoreStyle {
  const key = storeName.toLowerCase().trim();
  for (const [k, v] of STORE_MAP) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { label: storeName, color: "#6b7280", domain: "" };
}

export function getStoreLogoUrl(storeName: string): string {
  const { domain } = getStoreStyle(storeName);
  if (!domain) return "";
  return `https://logo.clearbit.com/${domain}`;
}
