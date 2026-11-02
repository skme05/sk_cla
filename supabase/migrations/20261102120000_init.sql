-- Mariage Gaël & Clarisse — schéma initial
-- Toutes les lectures/écritures passent par le serveur Next.js avec la clé service_role.
-- Le RLS est activé sans aucune politique : les clés anon/authenticated n'ont accès à rien.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Codes d'invitation : 6 caractères, sans caractères ambigus (pas de 0/O ni 1/I)
create or replace function public.generate_household_code() returns text
language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  bytes bytea;
  i int;
begin
  loop
    candidate := '';
    bytes := gen_random_bytes(6);
    for i in 0..5 loop
      candidate := candidate || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.households h where h.code = candidate);
  end loop;
  return candidate;
end $$;

-- ---------------------------------------------------------------------------
-- Plan de table
-- ---------------------------------------------------------------------------
create table public.seating_tables (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (length(trim(name)) > 0),
  capacity    int  not null check (capacity between 1 and 30),
  -- position sur le plan de salle affiché à l'invité (repère 0–320 x 0–210)
  pos_x       int  check (pos_x between 0 and 320),
  pos_y       int  check (pos_y between 0 and 210),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger seating_tables_updated_at before update on public.seating_tables
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Foyers invités : un code WhatsApp par foyer
-- ---------------------------------------------------------------------------
create table public.households (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  display_name        text not null check (length(trim(display_name)) > 0),
  phone               text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  seats               int  not null default 1 check (seats between 1 and 20),
  table_id            uuid references public.seating_tables(id) on delete set null,
  language            text not null default 'fr' check (language in ('fr', 'en')),
  notes               text,
  invitation_sent_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint households_code_format check (code ~ '^[A-HJ-NP-Z2-9]{6}$')
);
alter table public.households alter column code set default public.generate_household_code();
create index households_table_id_idx on public.households(table_id);
create trigger households_updated_at before update on public.households
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Réponses (une par foyer, modifiable jusqu'à la date limite)
-- ---------------------------------------------------------------------------
create type public.diet as enum ('none', 'vegetarian', 'no_pork', 'no_seafood', 'allergy');

create table public.rsvps (
  household_id  uuid primary key references public.households(id) on delete cascade,
  attending     boolean not null,
  guest_count   int  not null default 0,
  diet          public.diet not null default 'none',
  message       text check (message is null or length(message) <= 1000),
  responded_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint rsvps_guest_count_consistent check (
    (attending and guest_count >= 1) or (not attending and guest_count = 0)
  )
);
create trigger rsvps_updated_at before update on public.rsvps
  for each row execute function public.set_updated_at();

-- Le nombre de personnes ne peut pas dépasser les places du foyer
create or replace function public.check_rsvp_seats() returns trigger
language plpgsql as $$
declare
  max_seats int;
begin
  select seats into max_seats from public.households where id = new.household_id;
  if new.guest_count > max_seats then
    raise exception 'guest_count % dépasse les % place(s) du foyer', new.guest_count, max_seats
      using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger rsvps_check_seats before insert or update on public.rsvps
  for each row execute function public.check_rsvp_seats();

-- Historique de chaque réponse (utile si un invité change d'avis)
create table public.rsvp_log (
  id            bigint generated always as identity primary key,
  household_id  uuid not null references public.households(id) on delete cascade,
  attending     boolean not null,
  guest_count   int not null,
  diet          public.diet not null,
  message       text,
  created_at    timestamptz not null default now()
);
create index rsvp_log_household_idx on public.rsvp_log(household_id, created_at desc);

create or replace function public.log_rsvp() returns trigger
language plpgsql as $$
begin
  insert into public.rsvp_log (household_id, attending, guest_count, diet, message)
  values (new.household_id, new.attending, new.guest_count, new.diet, new.message);
  return new;
end $$;
create trigger rsvps_log after insert or update on public.rsvps
  for each row execute function public.log_rsvp();

-- ---------------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------------
create type public.course as enum ('cocktail', 'starter', 'main', 'dessert', 'drinks');

create table public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  course       public.course not null,
  name         text not null,
  description  text,
  tags         text[] not null default '{}',
  image_url    text,
  sort_order   int  not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index menu_items_course_idx on public.menu_items(course, sort_order);
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Anti-devinette des codes : tentatives par IP anonymisée
-- ---------------------------------------------------------------------------
create table public.code_attempts (
  id            bigint generated always as identity primary key,
  ip_hash       text not null,
  success       boolean not null,
  attempted_at  timestamptz not null default now()
);
create index code_attempts_ip_time_idx on public.code_attempts(ip_hash, attempted_at desc);

-- ---------------------------------------------------------------------------
-- Vues pour l'espace mariés
-- ---------------------------------------------------------------------------
create view public.guest_overview with (security_invoker = true) as
select
  h.id, h.code, h.display_name, h.phone, h.seats, h.invitation_sent_at,
  t.name as table_name,
  case when r.household_id is null then 'pending'
       when r.attending then 'attending'
       else 'declined' end as status,
  coalesce(r.guest_count, 0) as guest_count,
  r.diet, r.message, r.responded_at
from public.households h
left join public.rsvps r on r.household_id = h.id
left join public.seating_tables t on t.id = h.table_id;

create view public.table_occupancy with (security_invoker = true) as
select
  t.id, t.name, t.capacity, t.pos_x, t.pos_y, t.sort_order,
  coalesce(sum(h.seats), 0)::int as seats_assigned,
  coalesce(sum(case when r.attending then r.guest_count else 0 end), 0)::int as guests_confirmed
from public.seating_tables t
left join public.households h on h.table_id = t.id
left join public.rsvps r on r.household_id = h.id
group by t.id;

-- ---------------------------------------------------------------------------
-- Sécurité : RLS activé partout, aucun accès pour anon / authenticated
-- ---------------------------------------------------------------------------
alter table public.seating_tables enable row level security;
alter table public.households     enable row level security;
alter table public.rsvps          enable row level security;
alter table public.rsvp_log       enable row level security;
alter table public.menu_items     enable row level security;
alter table public.code_attempts  enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
