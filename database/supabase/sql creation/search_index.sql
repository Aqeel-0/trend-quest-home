-- ============================================================
-- Phase 1: Search Index — table, indexes, RPCs, triggers, backfill
-- Run in Supabase SQL editor (all at once, in order).
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- 1. Table
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.search_index (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('variant', 'brand')),
  entity_id     UUID NOT NULL,

  -- Display fields (denormalized — no joins at query time)
  title         TEXT NOT NULL,
  subtitle      TEXT,
  image_url     TEXT,
  slug          TEXT,

  -- Search fields
  search_vector tsvector,
  search_text   TEXT NOT NULL,

  -- Ranking & filtering signals
  popularity    INTEGER NOT NULL DEFAULT 0,
  min_price     NUMERIC,
  max_price     NUMERIC,
  avg_rating    NUMERIC,
  has_in_stock  BOOLEAN DEFAULT FALSE,
  brand_id      UUID,
  brand_slug    TEXT,           -- denormalised from brands.slug for direct filter (no join)
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,

  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT search_index_entity_unique UNIQUE (entity_type, entity_id)
);

-- ─────────────────────────────────────────────────────────
-- 2. Indexes
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS search_idx_vector
  ON public.search_index USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS search_idx_trigram
  ON public.search_index USING GIN (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS search_idx_active_pop
  ON public.search_index (is_active, popularity DESC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS search_idx_entity_type
  ON public.search_index (entity_type)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS search_idx_brand
  ON public.search_index (brand_id)
  WHERE entity_type = 'variant' AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS search_idx_brand_slug
  ON public.search_index (brand_slug)
  WHERE entity_type = 'variant' AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS search_idx_price
  ON public.search_index (min_price)
  WHERE entity_type = 'variant' AND is_active = TRUE;

-- ─────────────────────────────────────────────────────────
-- 3. RPCs
-- ─────────────────────────────────────────────────────────

-- search_suggest: fast dropdown, mixed brand + variant, up to result_limit results
-- Brands and variants use separate pools so brand entities always surface even
-- when many high-scoring variants share the brand name.
CREATE OR REPLACE FUNCTION public.search_suggest(
  q TEXT,
  result_limit INT DEFAULT 8
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id   UUID,
  title       TEXT,
  subtitle    TEXT,
  image_url   TEXT,
  slug        TEXT,
  min_price   NUMERIC,
  rank        REAL
)
LANGUAGE SQL STABLE AS $$
  WITH n AS (SELECT trim(lower(q)) AS query),
  fts AS (
    SELECT s.*, ts_rank_cd(s.search_vector, websearch_to_tsquery('simple', n.query)) AS r
    FROM public.search_index s, n
    WHERE s.is_active
      AND length(n.query) > 0
      AND s.search_vector @@ websearch_to_tsquery('simple', n.query)
  ),
  fuzzy AS (
    SELECT s.*, similarity(s.search_text, n.query) AS r
    FROM public.search_index s, n
    WHERE s.is_active
      AND length(n.query) > 0
      AND s.search_text % n.query
      AND NOT EXISTS (SELECT 1 FROM fts f WHERE f.id = s.id)
  ),
  combined AS (
    SELECT id, entity_type, entity_id, title, subtitle, image_url, slug,
           min_price, popularity, r AS rank FROM fts
    UNION ALL
    SELECT id, entity_type, entity_id, title, subtitle, image_url, slug,
           min_price, popularity, r * 0.5 AS rank FROM fuzzy
  ),
  scored AS (
    SELECT entity_type, entity_id, title, subtitle, image_url, slug, min_price, popularity,
           (rank
             + CASE WHEN entity_type = 'brand' THEN 0.1 ELSE 0 END
             + LEAST(popularity::REAL / 10000.0, 0.2)
           )::REAL AS rank
    FROM combined
  ),
  brand_results AS (
    SELECT * FROM scored WHERE entity_type = 'brand'
    ORDER BY rank DESC, popularity DESC
    LIMIT 2
  ),
  brand_count AS (SELECT COUNT(*)::INT AS n FROM brand_results),
  variant_results AS (
    SELECT * FROM scored WHERE entity_type = 'variant'
    ORDER BY rank DESC, popularity DESC
    LIMIT (SELECT GREATEST(result_limit - n, 0) FROM brand_count)
  )
  -- brands always occupy their slots first; variants fill the remainder
  SELECT entity_type, entity_id, title, subtitle, image_url, slug, min_price, rank
  FROM (
    SELECT *, 0 AS sort_group FROM brand_results
    UNION ALL
    SELECT *, 1 AS sort_group FROM variant_results
  ) merged
  ORDER BY sort_group ASC, rank DESC, popularity DESC
  LIMIT result_limit;
$$;

-- search_full: paginated full-text search with server-side filters for /search page
CREATE OR REPLACE FUNCTION public.search_full(
  q TEXT,
  brand_filter TEXT DEFAULT NULL,
  min_price_filter NUMERIC DEFAULT NULL,
  max_price_filter NUMERIC DEFAULT NULL,
  min_rating_filter NUMERIC DEFAULT NULL,
  in_stock_only BOOLEAN DEFAULT FALSE,
  sort_by TEXT DEFAULT 'relevance',
  page_size INT DEFAULT 24,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  entity_id    UUID,
  title        TEXT,
  subtitle     TEXT,
  image_url    TEXT,
  slug         TEXT,
  min_price    NUMERIC,
  max_price    NUMERIC,
  avg_rating   NUMERIC,
  has_in_stock BOOLEAN,
  popularity   INTEGER,
  rank         REAL,
  total_count  BIGINT
)
LANGUAGE SQL STABLE AS $$
  WITH n AS (SELECT trim(lower(q)) AS query),
  fts AS (
    SELECT s.*, ts_rank_cd(s.search_vector, websearch_to_tsquery('simple', n.query)) AS r
    FROM public.search_index s, n
    WHERE s.is_active
      AND s.entity_type = 'variant'
      AND (length(n.query) = 0
           OR s.search_vector @@ websearch_to_tsquery('simple', n.query))
  ),
  fuzzy AS (
    SELECT s.*, similarity(s.search_text, n.query) AS r
    FROM public.search_index s, n
    WHERE s.is_active
      AND s.entity_type = 'variant'
      AND length(n.query) > 0
      AND s.search_text % n.query
      AND NOT EXISTS (SELECT 1 FROM fts f WHERE f.id = s.id)
  ),
  combined AS (
    SELECT id, entity_id, title, subtitle, image_url, slug,
           min_price, max_price, avg_rating, has_in_stock, popularity, brand_id, brand_slug,
           updated_at, r AS rank
      FROM fts
    UNION ALL
    SELECT id, entity_id, title, subtitle, image_url, slug,
           min_price, max_price, avg_rating, has_in_stock, popularity, brand_id, brand_slug,
           updated_at, r * 0.5 AS rank
      FROM fuzzy
  ),
  filtered AS (
    SELECT * FROM combined
    WHERE (brand_filter IS NULL OR brand_slug = brand_filter)
      AND (min_price_filter IS NULL OR min_price >= min_price_filter)
      AND (max_price_filter IS NULL OR min_price <= max_price_filter)
      AND (min_rating_filter IS NULL OR avg_rating >= min_rating_filter)
      AND (NOT in_stock_only OR has_in_stock)
  )
  SELECT entity_id, title, subtitle, image_url, slug,
         min_price, max_price, avg_rating, has_in_stock, popularity,
         (rank + LEAST(popularity::REAL / 10000.0, 0.2))::REAL AS rank,
         COUNT(*) OVER ()::BIGINT AS total_count
  FROM filtered
  ORDER BY
    CASE WHEN sort_by = 'relevance'  THEN rank END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_asc'  THEN min_price END ASC NULLS LAST,
    CASE WHEN sort_by = 'price_desc' THEN min_price END DESC NULLS LAST,
    CASE WHEN sort_by = 'popular'    THEN popularity END DESC NULLS LAST,
    CASE WHEN sort_by = 'newest'     THEN updated_at END DESC NULLS LAST,
    popularity DESC
  LIMIT page_size OFFSET page_offset;
$$;

-- Grant RPC execution to public roles
GRANT EXECUTE ON FUNCTION public.search_suggest(TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_full(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, TEXT, INT, INT) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────
-- 4. Trigger functions
-- ─────────────────────────────────────────────────────────

-- Sync brands to search_index
CREATE OR REPLACE FUNCTION public.sync_brand_to_search_index()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.search_index WHERE entity_type = 'brand' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.search_index (
    entity_type, entity_id, title, subtitle, image_url, slug,
    search_vector, search_text, popularity, is_active, updated_at
  )
  VALUES (
    'brand',
    NEW.id,
    NEW.name,
    NULL,
    NEW.logo_url,
    NEW.slug,
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A'),
    coalesce(NEW.name, ''),
    (SELECT COUNT(*) FROM public.products p WHERE p.brand_id = NEW.id AND p.is_active),
    coalesce(NEW.is_active, TRUE),
    NOW()
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title         = EXCLUDED.title,
    subtitle      = EXCLUDED.subtitle,
    image_url     = EXCLUDED.image_url,
    slug          = EXCLUDED.slug,
    search_vector = EXCLUDED.search_vector,
    search_text   = EXCLUDED.search_text,
    popularity    = EXCLUDED.popularity,
    is_active     = EXCLUDED.is_active,
    updated_at    = NOW();

  -- When brand name or slug changes, re-sync all variant rows that reference this brand
  IF TG_OP = 'UPDATE' AND (OLD.name IS DISTINCT FROM NEW.name OR OLD.slug IS DISTINCT FROM NEW.slug) THEN
    UPDATE public.search_index si
    SET
      subtitle      = NEW.name,
      brand_slug    = NEW.slug,
      search_vector = setweight(to_tsvector('simple', coalesce(si.title, '')), 'A')
                   || setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'B'),
      search_text   = concat_ws(' ', si.title, NEW.name),
      updated_at    = NOW()
    WHERE si.entity_type = 'variant'
      AND si.brand_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Helper: re-sync all variants of a product (called when product's brand_id changes)
CREATE OR REPLACE FUNCTION public.sync_variant_to_search_index_for_product(p_product_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_variant RECORD;
BEGIN
  FOR v_variant IN SELECT id FROM public.product_variants WHERE product_id = p_product_id LOOP
    UPDATE public.product_variants SET updated_at = NOW() WHERE id = v_variant.id;
  END LOOP;
END;
$$;

-- Sync product_variants to search_index
CREATE OR REPLACE FUNCTION public.sync_variant_to_search_index()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_brand_name     TEXT;
  v_brand_slug     TEXT;
  v_model_name     TEXT;
  v_model_number   TEXT;
  v_brand_id       UUID;
  v_product_slug   TEXT;
  v_product_active BOOLEAN;
  v_image_url      TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.search_index WHERE entity_type = 'variant' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT b.name, b.slug, b.id, p.model_name, p.model_number, p.slug, p.is_active
  INTO v_brand_name, v_brand_slug, v_brand_id, v_model_name, v_model_number, v_product_slug, v_product_active
  FROM public.products p
  JOIN public.brands b ON b.id = p.brand_id
  WHERE p.id = NEW.product_id;

  SELECT (img->>'url')
  INTO v_image_url
  FROM jsonb_array_elements(coalesce(NEW.images, '[]'::jsonb)) img
  WHERE img->>'type' = 'main'
  LIMIT 1;

  INSERT INTO public.search_index (
    entity_type, entity_id, title, subtitle, image_url, slug,
    search_vector, search_text, popularity, min_price, max_price,
    avg_rating, has_in_stock, brand_id, brand_slug, is_active, updated_at
  )
  VALUES (
    'variant',
    NEW.id,
    NEW.name,
    v_brand_name,
    v_image_url,
    v_product_slug,
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A')
      || setweight(to_tsvector('simple', coalesce(v_brand_name, '')), 'B')
      || setweight(to_tsvector('simple', coalesce(v_model_name, '')), 'B')
      || setweight(to_tsvector('simple', coalesce(v_model_number, '')), 'C'),
    concat_ws(' ', NEW.name, v_brand_name, v_model_name, v_model_number),
    (SELECT COUNT(*) FROM public.listings l WHERE l.variant_id = NEW.id AND l.is_active),
    (SELECT MIN(price) FROM public.listings l WHERE l.variant_id = NEW.id AND l.is_active),
    (SELECT MAX(price) FROM public.listings l WHERE l.variant_id = NEW.id AND l.is_active),
    (SELECT AVG(rating) FROM public.listings l WHERE l.variant_id = NEW.id AND l.is_active AND l.rating > 0),
    EXISTS (SELECT 1 FROM public.listings l WHERE l.variant_id = NEW.id AND l.is_active AND l.stock_status = 'in_stock'),
    v_brand_id,
    v_brand_slug,
    coalesce(NEW.is_active, TRUE) AND coalesce(v_product_active, TRUE),
    NOW()
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title         = EXCLUDED.title,
    subtitle      = EXCLUDED.subtitle,
    image_url     = EXCLUDED.image_url,
    slug          = EXCLUDED.slug,
    search_vector = EXCLUDED.search_vector,
    search_text   = EXCLUDED.search_text,
    popularity    = EXCLUDED.popularity,
    min_price     = EXCLUDED.min_price,
    max_price     = EXCLUDED.max_price,
    avg_rating    = EXCLUDED.avg_rating,
    has_in_stock  = EXCLUDED.has_in_stock,
    brand_id      = EXCLUDED.brand_id,
    brand_slug    = EXCLUDED.brand_slug,
    is_active     = EXCLUDED.is_active,
    updated_at    = NOW();

  RETURN NEW;
END;
$$;

-- Sync listing aggregates to search_index (no search_vector update)
CREATE OR REPLACE FUNCTION public.sync_listing_to_search_index()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_variant_id UUID;
BEGIN
  v_variant_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.variant_id ELSE NEW.variant_id END;

  UPDATE public.search_index
  SET
    popularity   = (SELECT COUNT(*) FROM public.listings l WHERE l.variant_id = v_variant_id AND l.is_active),
    min_price    = (SELECT MIN(price) FROM public.listings l WHERE l.variant_id = v_variant_id AND l.is_active),
    max_price    = (SELECT MAX(price) FROM public.listings l WHERE l.variant_id = v_variant_id AND l.is_active),
    avg_rating   = (SELECT AVG(rating) FROM public.listings l WHERE l.variant_id = v_variant_id AND l.is_active AND l.rating > 0),
    has_in_stock = EXISTS (SELECT 1 FROM public.listings l WHERE l.variant_id = v_variant_id AND l.is_active AND l.stock_status = 'in_stock'),
    updated_at   = NOW()
  WHERE entity_type = 'variant' AND entity_id = v_variant_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Re-sync variants when a product's brand_id changes
CREATE OR REPLACE FUNCTION public.sync_product_brand_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.brand_id IS DISTINCT FROM NEW.brand_id THEN
    PERFORM public.sync_variant_to_search_index_for_product(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────
-- 5. Attach triggers
-- ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_sync_brand_search ON public.brands;
CREATE TRIGGER trg_sync_brand_search
  AFTER INSERT OR UPDATE OR DELETE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.sync_brand_to_search_index();

DROP TRIGGER IF EXISTS trg_sync_variant_search ON public.product_variants;
CREATE TRIGGER trg_sync_variant_search
  AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_variant_to_search_index();

DROP TRIGGER IF EXISTS trg_sync_listing_search ON public.listings;
CREATE TRIGGER trg_sync_listing_search
  AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_to_search_index();

DROP TRIGGER IF EXISTS trg_sync_product_brand ON public.products;
CREATE TRIGGER trg_sync_product_brand
  AFTER UPDATE OF brand_id ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_brand_change();

-- ─────────────────────────────────────────────────────────
-- 6. Backfill from existing data
-- ─────────────────────────────────────────────────────────

-- Brands
INSERT INTO public.search_index (
  entity_type, entity_id, title, subtitle, image_url, slug,
  search_vector, search_text, popularity, is_active, updated_at
)
SELECT
  'brand',
  b.id,
  b.name,
  NULL,
  b.logo_url,
  b.slug,
  setweight(to_tsvector('simple', coalesce(b.name, '')), 'A'),
  coalesce(b.name, ''),
  (SELECT COUNT(*) FROM public.products p WHERE p.brand_id = b.id AND p.is_active),
  b.is_active,
  NOW()
FROM public.brands b
WHERE b.is_active
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
  title         = EXCLUDED.title,
  subtitle      = EXCLUDED.subtitle,
  image_url     = EXCLUDED.image_url,
  slug          = EXCLUDED.slug,
  search_vector = EXCLUDED.search_vector,
  search_text   = EXCLUDED.search_text,
  popularity    = EXCLUDED.popularity,
  is_active     = EXCLUDED.is_active,
  updated_at    = NOW();

-- Variants
INSERT INTO public.search_index (
  entity_type, entity_id, title, subtitle, image_url, slug,
  search_vector, search_text, popularity, min_price, max_price,
  avg_rating, has_in_stock, brand_id, brand_slug, is_active, updated_at
)
SELECT
  'variant',
  pv.id,
  pv.name,
  b.name,
  (SELECT (img->>'url')
   FROM jsonb_array_elements(coalesce(pv.images, '[]'::jsonb)) img
   WHERE img->>'type' = 'main'
   LIMIT 1),
  p.slug,
  setweight(to_tsvector('simple', coalesce(pv.name, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(b.name, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(p.model_name, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(p.model_number, '')), 'C'),
  concat_ws(' ', pv.name, b.name, p.model_name, p.model_number),
  (SELECT COUNT(*) FROM public.listings l WHERE l.variant_id = pv.id AND l.is_active),
  (SELECT MIN(price) FROM public.listings l WHERE l.variant_id = pv.id AND l.is_active),
  (SELECT MAX(price) FROM public.listings l WHERE l.variant_id = pv.id AND l.is_active),
  (SELECT AVG(rating) FROM public.listings l WHERE l.variant_id = pv.id AND l.is_active AND l.rating > 0),
  EXISTS (SELECT 1 FROM public.listings l WHERE l.variant_id = pv.id AND l.is_active AND l.stock_status = 'in_stock'),
  p.brand_id,
  b.slug,
  pv.is_active AND p.is_active,
  NOW()
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
JOIN public.brands b ON b.id = p.brand_id
WHERE pv.is_active AND p.is_active
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
  title         = EXCLUDED.title,
  subtitle      = EXCLUDED.subtitle,
  image_url     = EXCLUDED.image_url,
  slug          = EXCLUDED.slug,
  search_vector = EXCLUDED.search_vector,
  search_text   = EXCLUDED.search_text,
  popularity    = EXCLUDED.popularity,
  min_price     = EXCLUDED.min_price,
  max_price     = EXCLUDED.max_price,
  avg_rating    = EXCLUDED.avg_rating,
  has_in_stock  = EXCLUDED.has_in_stock,
  brand_id      = EXCLUDED.brand_id,
  brand_slug    = EXCLUDED.brand_slug,
  is_active     = EXCLUDED.is_active,
  updated_at    = NOW();

-- ─────────────────────────────────────────────────────────
-- Verification queries (run after above to confirm)
-- ─────────────────────────────────────────────────────────
-- SELECT COUNT(*), entity_type FROM search_index GROUP BY entity_type;
-- SELECT * FROM search_suggest('oneplus', 8);
-- EXPLAIN ANALYZE SELECT * FROM search_suggest('oneplus', 8);
