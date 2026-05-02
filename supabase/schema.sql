-- ============================================================
-- Wild Vana — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database
-- ============================================================

-- Tours (also used as hero slides)
create table if not exists tours (
  id              uuid primary key default gen_random_uuid(),
  destination     text not null,
  location        text not null,
  tagline         text not null,
  description     text,
  duration        text,
  group_size      text,
  best_time       text,
  price           text,
  hero_image      text,             -- full-width hero background URL
  tile_image      text,             -- vertical card thumbnail URL
  trip_dates      text,             -- e.g. "July 12th – July 18th, 2026"
  seats_left      int default 1,    -- shown as "(01 Seat Left)"
  itinerary       jsonb default '[]'::jsonb,  -- [{day,title,body}, …]
  inclusions      jsonb default '[]'::jsonb,  -- [text, …]
  exclusions      jsonb default '[]'::jsonb,  -- [text, …]
  faqs            jsonb default '[]'::jsonb,  -- [{q,a}, …]
  gallery_images  jsonb default '[]'::jsonb,  -- [url, …] extra gallery photos
  sort_order      int default 0,
  published       boolean default true,
  created_at      timestamptz default now()
);

-- Migration: run this if table already exists
-- alter table tours add column if not exists trip_dates     text;
-- alter table tours add column if not exists seats_left     int default 1;
-- alter table tours add column if not exists itinerary      jsonb default '[]'::jsonb;
-- alter table tours add column if not exists inclusions     jsonb default '[]'::jsonb;
-- alter table tours add column if not exists exclusions     jsonb default '[]'::jsonb;
-- alter table tours add column if not exists faqs           jsonb default '[]'::jsonb;
-- alter table tours add column if not exists gallery_images jsonb default '[]'::jsonb;

-- Gallery images
create table if not exists gallery_images (
  id         uuid primary key default gen_random_uuid(),
  src        text not null,
  alt        text,
  span       text default '',   -- Tailwind col/row span classes
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Booking enquiries submitted via Contact form
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  destination text,
  message     text,
  status      text default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table tours          enable row level security;
alter table gallery_images enable row level security;
alter table bookings       enable row level security;

-- Public: anyone can read published tours and gallery
create policy "Public can read tours"
  on tours for select using (published = true);

create policy "Public can read gallery"
  on gallery_images for select using (true);

-- Public: anyone can insert a booking (contact form)
create policy "Public can submit bookings"
  on bookings for insert with check (true);

-- Admin: full access for authenticated users with admin role
create policy "Admin full access to tours"
  on tours for all using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin full access to gallery"
  on gallery_images for all using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin can read bookings"
  on bookings for select using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin can update bookings"
  on bookings for update using (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- Seed: existing tour data
-- ============================================================

insert into tours (destination, location, tagline, description, duration, group_size, best_time, price, hero_image, tile_image, sort_order) values
('India',  'Ranthambore', 'Where Tigers Rule the Wild',       'Track the majestic Royal Bengal Tiger through ancient fortress ruins and dry deciduous forests. Our expert naturalists guide you through one of India''s premier tiger reserves.',          '7 Days', '6 Max', 'Oct – Apr', '$4,200', 'https://images.unsplash.com/photo-1561731216-c3a4d514e396?w=1920&q=80', 'https://images.unsplash.com/photo-1561731216-c3a4d514e396?w=600&h=900&q=80&fit=crop', 1),
('India',  'Kaziranga',   'Realm of the One-Horned Rhino',    'Explore the UNESCO World Heritage grasslands home to the world''s largest population of Indian one-horned rhinoceros, alongside wild elephants and water buffalo.',                        '5 Days', '8 Max', 'Nov – Mar', '$3,800', 'https://images.unsplash.com/photo-1535338454528-1b4a56484cd2?w=1920&q=80', 'https://images.unsplash.com/photo-1535338454528-1b4a56484cd2?w=600&h=900&q=80&fit=crop', 2),
('India',  'Bharatpur',   'A Paradise for Bird Photographers','Keoladeo National Park hosts over 350 species of birds including rare Siberian cranes. Perfect for capturing stunning avian portraits in golden light.',                                  '4 Days', '8 Max', 'Oct – Feb', '$2,900', 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80', 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&h=900&q=80&fit=crop', 3),
('Kenya',  'Masai Mara',  'The Great Migration Awaits',       'Witness the greatest wildlife spectacle on Earth — millions of wildebeest crossing crocodile-infested rivers, surrounded by big cats and African elephants.',                              '9 Days', '6 Max', 'Jul – Oct', '$5,500', 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1920&q=80', 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&h=900&q=80&fit=crop', 4),
('Kenya',  'Masai Mara',  'Golden Light on the Savanna',      'Chase the perfect golden hour across endless plains. Photograph lions, cheetahs, and leopards in their natural habitat with unparalleled access.',                                          '9 Days', '6 Max', 'Jul – Oct', '$5,500', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=900&q=80&fit=crop', 5),
('India',  'Jim Corbett', 'Into the Heart of the Jungle',     'India''s oldest national park offers unmatched tiger sightings amid sal forests, river valleys, and grasslands. A photographer''s dream at dawn.',                                        '6 Days', '6 Max', 'Nov – Jun', '$3,600', 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=1920&q=80', 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=600&h=900&q=80&fit=crop', 6),
('India',  'Gir Forest',  'Last Refuge of the Asiatic Lion',  'The only place on Earth where Asiatic lions roam free. Capture these magnificent big cats in the dry deciduous forests of Gujarat.',                                                        '5 Days', '6 Max', 'Dec – Mar', '$3,200', 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=1920&q=80', 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&h=900&q=80&fit=crop', 7);

insert into gallery_images (src, alt, span, sort_order) values
('https://images.unsplash.com/photo-1561731216-c3a4d514e396?w=600&h=400&q=80&fit=crop', 'Bengal Tiger in Ranthambore',       'col-span-2 row-span-2', 1),
('https://images.unsplash.com/photo-1535338454528-1b4a56484cd2?w=400&h=400&q=80&fit=crop','Indian Rhinoceros in Kaziranga',   '',                      2),
('https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=400&q=80&fit=crop', 'Birds at Bharatpur',                '',                      3),
('https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400&h=600&q=80&fit=crop', 'Wildebeest migration in Masai Mara','row-span-2',            4),
('https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=400&h=400&q=80&fit=crop','Tiger at Jim Corbett',             '',                      5),
('https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&h=400&q=80&fit=crop','Asiatic Lion in Gir Forest',       'col-span-2',            6);

-- ============================================================
-- Admin role: set role claim for a user after they sign up
-- Run this after creating the admin user in Supabase Auth:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--   where email = 'admin@wildvana.com';
-- ============================================================
