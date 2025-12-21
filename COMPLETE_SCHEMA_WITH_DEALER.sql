-- Customers
create table if not exists public.customers (
    id bigserial primary key,
    name text not null,
    contact text not null,
    email text not null,
    address text not null,
    city text not null,
    created_at timestamptz default now()
);

-- Vehicles
create table if not exists public.vehicles (
    id bigserial primary key,
    customer_id bigint not null references public.customers(id) on delete cascade,
    name text not null,
    model text not null,
    year integer not null,
    engine_no text not null,
    chassis_no text,
    gearbox_no text,
    battery_no text,
    tire_front text,
    tire_rear_left text,
    tire_rear_right text,
    tire_stepney text,
    price numeric(12, 2) not null,
    created_at timestamptz default now()
);

-- Sub Dealers
create table if not exists public.sub_dealers (
    id bigserial primary key,
    dealer_code text unique not null,
    name text not null,
    location text not null,
    contact text not null,
    created_at timestamptz default now()
);

-- Purchases (WITH dealer_id column added)
create table if not exists public.purchases (
    id bigserial primary key,
    vehicle_id bigint not null references public.vehicles(id) on delete cascade,
    dealer_id bigint references public.sub_dealers(id) on delete set null,
    payment_method text not null,
    bank_name text,
    loan_amount numeric(12, 2),
    loan_tenure integer,
    interest_rate numeric(5, 2),
    emi_amount numeric(12, 2),
    down_payment numeric(12, 2),
    insurance_start date not null,
    insurance_end date not null,
    delivery_address text not null,
    delivery_date date not null,
    owner_name text not null,
    purchase_date date not null,
    created_at timestamptz default now()
);

-- Services
create table if not exists public.services (
    id bigserial primary key,
    vehicle_id bigint not null references public.vehicles(id) on delete cascade,
    service_count integer not null,
    status text not null,
    service_type text not null default 'free',
    date date not null,
    created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_vehicles_customer_id on public.vehicles(customer_id);
create index if not exists idx_purchases_vehicle_id on public.purchases(vehicle_id);
create index if not exists idx_purchases_dealer_id on public.purchases(dealer_id);
create index if not exists idx_services_vehicle_id on public.services(vehicle_id);

-- Optional: disable RLS for local testing (Supabase enables it by default)
alter table public.customers disable row level security;
alter table public.vehicles disable row level security;
alter table public.purchases disable row level security;
alter table public.services disable row level security;
alter table public.sub_dealers disable row level security;
