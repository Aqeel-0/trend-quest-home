# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build (no minification)
npm run lint         # ESLint across the project
npm run preview      # Preview production build locally
```

There is no test runner configured (vitest.config.ts exists but no `test` script in package.json).

## Architecture

**Stack**: React 18 + TypeScript + Vite, Supabase (database), TanStack React Query (server state), React Router v6, Tailwind CSS + shadcn/ui, next-themes (dark mode).

**Route structure** (`src/App.tsx`):
| Path | Page | Notes |
|---|---|---|
| `/` | Index | Home page with trending, recent, catalog carousels |
| `/search` | SearchResults | Full-text product search |
| `/compare` | Compare | Side-by-side variant comparison (max 4) |
| `/category/:slug` | Category | Filtered product listing by category |
| `/product/:id` | Product | **`:id` is a variant ID, not a product ID** |

**Data flow layers**:
1. `src/lib/queries/*.ts` — Raw Supabase query functions (select strings, filters, pagination)
2. `src/hooks/*.ts` — React Query wrappers (`useQuery`/`useInfiniteQuery`) with caching
3. Pages/components consume hooks directly

**Key architectural rules**:

- **Product detail page expects variant IDs**: `useVariantSelectionLogic(variantId)` in Product.tsx fetches a variant by its ID, then loads all sibling variants for the same product. Never pass a `products.id` (UUID from the `products` table) to `/product/:id` — use `product_variants.id`.

- **Images are JSON on variants**: `product_variants.images` stores an array of `{ url, type: 'main'|'other', source, scraped_at }`. Use `extractPrimaryImage()` or `extractAllImages()` from `useProductVariantsWithListings.ts` to parse them. Products in the `products` table have no image column.

- **Query pattern**: Queries in `lib/queries/` define a base select string as a template literal (e.g., `BASE_SMARTPHONE_SELECT`), then export functions that build and execute Supabase queries. Hooks in `hooks/` wrap these with `useQuery`.

- **Supabase joins use `!inner` syntax**: `products!inner (...)` forces an inner join. The relationship name matches the foreign key target table (e.g., `listings` maps to the `listings` table via `variant_id` FK).

- **CSS variables define the entire theme**: All colors in `src/index.css` use HSL values via CSS custom properties (`--background`, `--foreground`, `--accent`, etc.). The `dark` class overrides them for dark mode. shadcn/ui components reference these variables.

- **CompareProvider** stores variant IDs in localStorage (`tq-compare` key). The NavBar shows a count badge.

## Project conventions

- Path alias `@/` maps to `src/`
- Components in `src/components/ui/` are shadcn/ui primitives — do not hand-edit unless adding a new shadcn component
- `src/integrations/supabase/types.ts` is auto-generated from the database schema — do not edit directly
- `src/integrations/supabase/client.ts` is auto-generated — import `supabase` from there, don't create new clients
- Data fetching hooks belong in `src/hooks/`, raw query functions in `src/lib/queries/`
