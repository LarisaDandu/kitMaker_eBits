create table if not exists public.universities (
  id text primary key,
  name text not null,
  professor_name text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  ean text,
  login_code text not null unique,
  status text not null,
  last_updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.orders (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  name text not null,
  quote_id text,
  status text not null,
  stats jsonb not null default '{}'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  progress_step integer default 0,
  notes text,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  order_id text references public.orders(id) on delete cascade,
  name text not null,
  subtitle text,
  status text not null,
  pcs_per_kit integer default 1,
  quote_row integer,
  order_quantity integer,
  variant text,
  pack text,
  quote_line text,
  supplier_link text,
  customer_reply jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.kit_catalog_products (
  id text primary key,
  name text not null,
  full_name text,
  subtitle text,
  category text not null,
  price numeric not null default 0,
  link text,
  details jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz default now()
);

create index if not exists products_order_id_idx on public.products(order_id);
create index if not exists products_university_id_idx on public.products(university_id);
create index if not exists orders_university_id_idx on public.orders(university_id);
create index if not exists universities_login_code_idx on public.universities(login_code);

alter table public.universities enable row level security;
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.kit_catalog_products enable row level security;

drop policy if exists "prototype read universities" on public.universities;
drop policy if exists "prototype write universities" on public.universities;
drop policy if exists "prototype read orders" on public.orders;
drop policy if exists "prototype write orders" on public.orders;
drop policy if exists "prototype read products" on public.products;
drop policy if exists "prototype write products" on public.products;
drop policy if exists "prototype read catalog" on public.kit_catalog_products;
drop policy if exists "prototype write catalog" on public.kit_catalog_products;

create policy "prototype read universities"
on public.universities for select
to anon
using (true);

create policy "prototype write universities"
on public.universities for all
to anon
using (true)
with check (true);

create policy "prototype read orders"
on public.orders for select
to anon
using (true);

create policy "prototype write orders"
on public.orders for all
to anon
using (true)
with check (true);

create policy "prototype read products"
on public.products for select
to anon
using (true);

create policy "prototype write products"
on public.products for all
to anon
using (true)
with check (true);

create policy "prototype read catalog"
on public.kit_catalog_products for select
to anon
using (true);

create policy "prototype write catalog"
on public.kit_catalog_products for all
to anon
using (true)
with check (true);
