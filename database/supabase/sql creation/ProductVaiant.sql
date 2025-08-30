create table public.product_variants (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  sku character varying(100) null,
  name character varying(255) not null,
  attributes jsonb not null default '{}'::jsonb,
  images jsonb null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  listing_count integer null default 0,
  constraint product_variants_pkey primary key (id),
  constraint product_variants_sku_key unique (sku),
  constraint product_variants_product_id_fkey foreign KEY (product_id) references products (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists product_variants_product_id_idx on public.product_variants using btree (product_id) TABLESPACE pg_default;

create index IF not exists product_variants_sku_idx on public.product_variants using btree (sku) TABLESPACE pg_default;

create index IF not exists product_variants_active_idx on public.product_variants using btree (is_active) TABLESPACE pg_default;

create index IF not exists product_variants_attributes_idx on public.product_variants using gin (attributes) TABLESPACE pg_default;