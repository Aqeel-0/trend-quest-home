create table public.products (
  id uuid not null default gen_random_uuid (),
  brand_id uuid not null,
  category_id uuid null,
  model_name character varying not null,
  model_number character varying(100) null,
  slug character varying not null,
  description text null,
  specifications jsonb null,
  status public.product_status not null default 'active'::product_status,
  variant_count integer not null default 0,
  is_featured boolean not null default false,
  launch_date date null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  original_model_name text null,
  "Store" text null,
  constraint products_pkey primary key (id),
  constraint products_slug_key unique (slug),
  constraint products_brand_id_fkey foreign KEY (brand_id) references brands (id) on update CASCADE on delete CASCADE,
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create index IF not exists products_brand_id_idx on public.products using btree (brand_id) TABLESPACE pg_default;

create index IF not exists products_category_id_idx on public.products using btree (category_id) TABLESPACE pg_default;

create index IF not exists products_model_name_idx on public.products using btree (model_name) TABLESPACE pg_default;

create index IF not exists products_model_number_idx on public.products using btree (model_number) TABLESPACE pg_default;

create unique INDEX IF not exists products_slug_idx on public.products using btree (slug) TABLESPACE pg_default;

create index IF not exists products_status_idx on public.products using btree (status) TABLESPACE pg_default;

create index IF not exists products_is_featured_idx on public.products using btree (is_featured) TABLESPACE pg_default;