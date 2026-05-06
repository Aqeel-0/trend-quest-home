# Graph Report - .  (2026-05-06)

## Corpus Check
- 135 files · ~51,547 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 382 nodes · 406 edges · 69 communities (51 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Product Pages & Hooks|Product Pages & Hooks]]
- [[_COMMUNITY_shadcnui Components|shadcn/ui Components]]
- [[_COMMUNITY_Architecture & Tech Stack|Architecture & Tech Stack]]
- [[_COMMUNITY_Docs & Project Identity|Docs & Project Identity]]
- [[_COMMUNITY_Offer Model|Offer Model]]
- [[_COMMUNITY_Category Page Logic|Category Page Logic]]
- [[_COMMUNITY_Category Model|Category Model]]
- [[_COMMUNITY_Brand Model|Brand Model]]
- [[_COMMUNITY_Toast Notification System|Toast Notification System]]
- [[_COMMUNITY_Sidebar & Mobile UI|Sidebar & Mobile UI]]
- [[_COMMUNITY_Category Data Queries|Category Data Queries]]
- [[_COMMUNITY_Product Variant Queries|Product Variant Queries]]
- [[_COMMUNITY_Listing Model|Listing Model]]
- [[_COMMUNITY_Product Variant Model|Product Variant Model]]
- [[_COMMUNITY_Route Definitions|Route Definitions]]
- [[_COMMUNITY_Coffee Maker Image|Coffee Maker Image]]
- [[_COMMUNITY_Headphones Image|Headphones Image]]
- [[_COMMUNITY_Product Model|Product Model]]
- [[_COMMUNITY_Category Variant Queries|Category Variant Queries]]
- [[_COMMUNITY_Product Gallery|Product Gallery]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Sneakers Image|Sneakers Image]]
- [[_COMMUNITY_Laptop Image|Laptop Image]]
- [[_COMMUNITY_Watch Image|Watch Image]]
- [[_COMMUNITY_Placeholder SVG|Placeholder SVG]]
- [[_COMMUNITY_Camera Icon|Camera Icon]]
- [[_COMMUNITY_Crosshair Overlay|Crosshair Overlay]]
- [[_COMMUNITY_Placeholder Purpose|Placeholder Purpose]]
- [[_COMMUNITY_Controller Image|Controller Image]]
- [[_COMMUNITY_Controller Depiction|Controller Depiction]]
- [[_COMMUNITY_Controller Fallback|Controller Fallback]]
- [[_COMMUNITY_Controller Fallback Set|Controller Fallback Set]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 51 edges
2. `Offer` - 16 edges
3. `Category` - 13 edges
4. `Brand` - 10 edges
5. `extractPrimaryImage()` - 9 edges
6. `formatCurrency()` - 7 edges
7. `Listing` - 6 edges
8. `ProductVariant` - 6 edges
9. `Badge()` - 6 edges
10. `useToast()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Footer()` --calls--> `useToast()`  [INFERRED]
  src/components/Footer.tsx → src/hooks/use-toast.ts
- `onQuickView()` --calls--> `toast()`  [INFERRED]
  src/pages/Category.tsx → src/hooks/use-toast.ts
- `mapVariantToProduct()` --calls--> `extractPrimaryImage()`  [INFERRED]
  src/pages/Index.tsx → src/hooks/useProductVariantsWithListings.ts
- `getColorVariantImage()` --calls--> `extractPrimaryImage()`  [INFERRED]
  src/pages/Product.tsx → src/hooks/useProductVariantsWithListings.ts
- `mapVariantToSearchProduct()` --calls--> `extractPrimaryImage()`  [INFERRED]
  src/pages/SearchResults.tsx → src/hooks/useProductVariantsWithListings.ts

## Hyperedges (group relationships)
- **hyper-route-structure** —  [INFERRED 1.00]
- **hyper-database-schema** —  [INFERRED 1.00]
- **hyper-tech-stack** —  [INFERRED 1.00]
- **hyper-fallback-image-set** —  [INFERRED 0.95]

## Communities (69 total, 18 thin omitted)

### Community 0 - "Product Pages & Hooks"
Cohesion: 0.05
Nodes (14): useCompare(), ProductCarousel(), useHomePageProducts(), useProducts(), extractAllImages(), extractPrimaryImage(), formatPrice(), useSearchVariants() (+6 more)

### Community 2 - "Architecture & Tech Stack"
Cohesion: 0.09
Nodes (23): @-path-alias, auto-generated-supabase-types, claude-md, compare-provider, css-variables-theme, data-flow-three-tier, graphify-out, hooks-layer (+15 more)

### Community 3 - "Docs & Project Identity"
Cohesion: 0.14
Nodes (19): database-brands, database-categories, database-listings, database-product-variants, database-products, extract-all-images, extract-primary-image, index.html (+11 more)

### Community 5 - "Category Page Logic"
Cohesion: 0.17
Nodes (8): useCategoryData(), useCategoryVariantsTotalCount(), useInfiniteCategoryVariants(), useProductVariantsByCategory(), useProductVariantSelection(), useVariantSelectionLogic(), formatIndianRupee(), onQuickView()

### Community 8 - "Toast Notification System"
Cohesion: 0.29
Nodes (7): Footer(), addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast()

### Community 10 - "Category Data Queries"
Cohesion: 0.36
Nodes (4): getCategoryBySlug(), getCategoryLevel(), getCategoryNameFromSlug(), getCategoryWithProductCount()

### Community 11 - "Product Variant Queries"
Cohesion: 0.36
Nodes (4): getAllVariantsForProduct(), getProductVariantById(), getVariantByExactAttributes(), getVariantSelectionData()

### Community 15 - "Route Definitions"
Cohesion: 0.29
Nodes (7): route-category, route-compare, route-index, route-product, route-search, route-structure, use-variant-selection-logic

### Community 16 - "Coffee Maker Image"
Cohesion: 0.33
Nodes (7): Coffee Maker Product, Fallback Images Array (6 images), Fallback Images (Category page set), prod-coffeemaker.jpg, ProductCard.tsx, RelatedProductsSection.tsx, Category.tsx

### Community 17 - "Headphones Image"
Cohesion: 0.38
Nodes (7): Incorrect Image Imports in Product.tsx, Fallback Image Pattern, Headphones Product Category, Headphones Product Image, RelatedProductsSection Component, Category Listing Page, Product Detail Page

### Community 20 - "Category Variant Queries"
Cohesion: 0.6
Nodes (5): getAllCategoryVariants(), getCategoryConfig(), getCategoryVariantsCount(), getPaginatedCategoryVariants(), getRelatedProducts()

### Community 24 - "Sneakers Image"
Cohesion: 0.5
Nodes (5): FallbackProductImages, prod-sneakers.jpg, CategoryPage, RelatedProductsSection, FallbackImagePattern

### Community 25 - "Laptop Image"
Cohesion: 0.83
Nodes (4): asset:prod-laptop.jpg, component:RelatedProductsSection.tsx, concept:fallback_image_set, page:Category.tsx

### Community 26 - "Watch Image"
Cohesion: 1.0
Nodes (4): Static placeholder image pattern, prod-watch.jpg (watch product image asset), RelatedProductsSection.tsx, Category.tsx

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `shadcn/ui Components` to `Product Pages & Hooks`, `Chart Component`, `Category Page Logic`, `Calendar UI`, `Carousel UI`, `Sidebar & Mobile UI`, `Pagination Component`, `Product Gallery`, `Search Filters`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Product Pages & Hooks` to `Category Page Logic`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `Product Pages & Hooks` to `Category Page Logic`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `Product Pages & Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `shadcn/ui Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Architecture & Tech Stack` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Docs & Project Identity` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._