create table public.listings (
  id uuid not null default gen_random_uuid (),
  variant_id uuid not null,
  store_name character varying(100) not null,
  store_product_id character varying(255) null,
  title text not null,
  url text not null,
  price numeric(10, 2) not null,
  original_price numeric(10, 2) null,
  discount_percentage numeric(5, 2) null,
  currency character varying(3) not null default 'INR'::character varying,
  stock_status public.stock_status_type not null default 'unknown'::stock_status_type,
  stock_quantity integer null,
  seller_name character varying(100) null,
  seller_rating numeric(3, 2) null,
  shipping_info jsonb null,
  images jsonb null,
  rating numeric(3, 2) null,
  review_count integer not null default 0,
  features jsonb null,
  scraped_at timestamp with time zone not null default now(),
  is_active boolean not null default true,
  is_sponsored boolean not null default false,
  affiliate_url text null,
  price_history jsonb null default '[]'::jsonb,
  last_seen_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint listings_pkey primary key (id),
  constraint listings_url_key unique (url),
  constraint listings_variant_id_fkey foreign KEY (variant_id) references product_variants (id) on update CASCADE on delete CASCADE,
  constraint listings_rating_check check (
    (
      (rating >= (0)::numeric)
      and (rating <= (5)::numeric)
    )
  ),
  constraint listings_discount_percentage_check check (
    (
      (discount_percentage >= (0)::numeric)
      and (discount_percentage <= (100)::numeric)
    )
  ),
  constraint listings_seller_rating_check check (
    (
      (seller_rating >= (0)::numeric)
      and (seller_rating <= (5)::numeric)
    )
  ),
  constraint listings_stock_quantity_check check ((stock_quantity >= 0)),
  constraint listings_review_count_check check ((review_count >= 0)),
  constraint listings_original_price_check check ((original_price >= (0)::numeric)),
  constraint listings_price_check check ((price >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists listings_variant_id_idx on public.listings using btree (variant_id) TABLESPACE pg_default;

create index IF not exists listings_store_name_idx on public.listings using btree (store_name) TABLESPACE pg_default;

create index IF not exists listings_store_product_id_idx on public.listings using btree (store_product_id) TABLESPACE pg_default;

create index IF not exists listings_price_idx on public.listings using btree (price) TABLESPACE pg_default;

create index IF not exists listings_stock_status_idx on public.listings using btree (stock_status) TABLESPACE pg_default;

create index IF not exists listings_active_idx on public.listings using btree (is_active) TABLESPACE pg_default;

create index IF not exists listings_scraped_at_idx on public.listings using btree (scraped_at) TABLESPACE pg_default;

create index IF not exists listings_last_seen_at_idx on public.listings using btree (last_seen_at) TABLESPACE pg_default;

create index IF not exists listings_rating_idx on public.listings using btree (rating) TABLESPACE pg_default;

create index IF not exists listings_discount_idx on public.listings using btree (discount_percentage) TABLESPACE pg_default;

create index IF not exists listings_composite_idx on public.listings using btree (variant_id, store_name, is_active) TABLESPACE pg_default;

create index IF not exists listings_price_range_idx on public.listings using btree (price, stock_status, is_active) TABLESPACE pg_default;