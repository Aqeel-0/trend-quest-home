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
| `/search` | SearchResults | Full-text product search with URL-param filters |
| `/brand/:name` | Brand | Brand detail page — redirects into SearchResults with `?brand=` param |
| `/trending` | SearchResults | Reuses SearchResults with no initial query |
| `/deals` | SearchResults | Reuses SearchResults with no initial query |
| `/new-arrivals` | SearchResults | Reuses SearchResults with no initial query |
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

- **New RPCs require `(supabase as any).rpc(...)`**: `src/integrations/supabase/types.ts` is auto-generated and only knows about RPCs that were present at generation time. When calling `search_suggest` or `search_full` (or any other RPC added after generation), cast to `any` to bypass the type check: `(supabase as any).rpc('search_suggest', { q, result_limit })`.

- **CSS variables define the entire theme**: All colors in `src/index.css` use HSL values via CSS custom properties (`--background`, `--foreground`, `--accent`, etc.). The `dark` class overrides them for dark mode. shadcn/ui components reference these variables.

- **CompareProvider** stores variant IDs in localStorage (`tq-compare` key). The NavBar shows a count badge.

- **Code style**: Follow the existing code style and patterns. Use TypeScript for all new code. Use shadcn/ui components for UI elements. Always try to use existing components or create components that can be used multiple places instead of duplicating code.

## Search system

Search is powered by a denormalized Postgres table `search_index` with two RPCs — `search_suggest` (dropdown) and `search_full` (paginated /search page). See `docs/search-overview.md` for the full picture.

| Layer | File | Purpose |
|---|---|---|
| DB | `database/supabase/sql creation/search_index.sql` | Table, indexes, RPCs, triggers, backfill — single source of truth |
| Query | `src/lib/queries/searchQueries.ts` | RPC wrappers + TypeScript types |
| Hooks | `src/hooks/useSearchSuggest.ts` | Debounced dropdown hook (250ms, min 2 chars) |
| Hooks | `src/hooks/useSearchFull.ts` | Infinite paginated results hook |
| Hooks | `src/hooks/useRecentSearches.ts` | localStorage-backed last-5 recent searches |
| Context | `src/contexts/SearchDialogContext.tsx` | Global open/close state for the search dialog |
| UI | `src/components/search/SearchCommand.tsx` | cmdk dropdown (idle/loading/results/no-results) |
| UI | `src/components/search/SearchDialog.tsx` | Dialog wrapper |
| UI | `src/components/search/SearchResultItem.tsx` | Single result row with highlight |
| UI | `src/components/search/SearchTrigger.tsx` | NavBar trigger button |
| Lib | `src/lib/highlightMatch.tsx` | Splits text on query tokens, wraps matches in `<mark>` |
| Page | `src/pages/SearchResults.tsx` | `/search` page — all filters live in URL params |

`SearchDialogContext` is used by `GlobalSearchShortcut` in `App.tsx` to wire up `Cmd+K` / `Ctrl+K` / `/` globally. `SearchResults.tsx` calls `useSearchDialog().open` so the sticky search bar re-opens the dialog.

## Project conventions

- Path alias `@/` maps to `src/`
- Components in `src/components/ui/` are shadcn/ui primitives — do not hand-edit unless adding a new shadcn component
- `src/integrations/supabase/types.ts` is auto-generated from the database schema — do not edit directly
- `src/integrations/supabase/client.ts` is auto-generated — import `supabase` from there, don't create new clients
- Data fetching hooks belong in `src/hooks/`, raw query functions in `src/lib/queries/`
- `src/utils/currency.ts` exports `formatCurrency()` — use it for all price display
