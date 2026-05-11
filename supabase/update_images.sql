-- ============================================================
-- Wild Vana — Real Wildlife Image Update
-- All images sourced from Unsplash (free licence)
-- Run in Supabase SQL Editor
-- ============================================================

-- ── TOUR HERO & TILE IMAGES ──────────────────────────────────

-- Ranthambore — Bengal Tiger (Bandhavgarh/India, Donnie Ray Crisp)
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1605092676920-8ac5ae40c7c8?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1605092676920-8ac5ae40c7c8?w=600&h=900&q=80&fit=crop'
WHERE location = 'Ranthambore';

-- Kaziranga — Indian One-Horned Rhinoceros, Assam
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1776601797873-396d38b7a1a9?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1776601797873-396d38b7a1a9?w=600&h=900&q=80&fit=crop'
WHERE location = 'Kaziranga';

-- Bharatpur — Peacock, Keoladeo Bird Sanctuary, India
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1536338490299-da62c7be85de?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1536338490299-da62c7be85de?w=600&h=900&q=80&fit=crop'
WHERE location = 'Bharatpur';

-- Jim Corbett — Bengal Tiger on Forest Road, Dhikala Zone
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1771922365997-8e687eda46b0?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1771922365997-8e687eda46b0?w=600&h=900&q=80&fit=crop'
WHERE location = 'Jim Corbett';

-- Gir Forest — Asiatic Lion, Sasan Gir, Gujarat (Siddharth Shah)
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1638250084708-86b50a2404f4?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1638250084708-86b50a2404f4?w=600&h=900&q=80&fit=crop'
WHERE location = 'Gir Forest';

-- Masai Mara — Lion striding across the Mara plains (David Clode)
-- Update first Masai Mara row (The Great Migration)
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1536539021558-1c10ce35dc23?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1536539021558-1c10ce35dc23?w=600&h=900&q=80&fit=crop'
WHERE location = 'Masai Mara' AND tagline = 'The Great Migration Awaits';

-- Masai Mara — Lion pair resting at Masai Mara Springs (Zed Cee)
-- Update second Masai Mara row (Golden Light on the Savanna)
UPDATE tours SET
  hero_image = 'https://images.unsplash.com/photo-1639221652297-f0ce04992bb4?w=1920&q=85',
  tile_image = 'https://images.unsplash.com/photo-1639221652297-f0ce04992bb4?w=600&h=900&q=80&fit=crop'
WHERE location = 'Masai Mara' AND tagline = 'Golden Light on the Savanna';


-- ── GALLERY IMAGES ───────────────────────────────────────────
-- Clear existing gallery and insert curated wildlife shots
-- Spans use Tailwind grid classes for masonry layout

DELETE FROM gallery_images;

INSERT INTO gallery_images (src, alt, span, sort_order) VALUES

-- Row 1 — wide tiger hero + rhino portrait
(
  'https://images.unsplash.com/photo-1771922365997-8e687eda46b0?w=1200&q=85',
  'Bengal Tiger on forest road — Jim Corbett National Park, India',
  'col-span-2',
  1
),
(
  'https://images.unsplash.com/photo-1776601797873-396d38b7a1a9?w=800&q=85',
  'Indian One-Horned Rhinoceros — Kaziranga National Park, Assam',
  'col-span-1',
  2
),

-- Row 2 — lion pride + cheetah + leopard
(
  'https://images.unsplash.com/photo-1536539021558-1c10ce35dc23?w=800&q=85',
  'Male lion striding across the plains — Masai Mara, Kenya',
  'col-span-1',
  3
),
(
  'https://images.unsplash.com/photo-1692642943316-2b8de23f9049?w=800&q=85',
  'Cheetah on the Kenyan savanna',
  'col-span-1',
  4
),
(
  'https://images.unsplash.com/photo-1569691105751-88df003de7a4?w=800&q=85',
  'Leopard on a tree branch — Masai Mara, Kenya',
  'col-span-1',
  5
),

-- Row 3 — tiger close-up hero + Gir lion + wildebeest
(
  'https://images.unsplash.com/photo-1605092676920-8ac5ae40c7c8?w=800&q=85',
  'Bengal Tiger — Ranthambore National Park, India',
  'col-span-1',
  6
),
(
  'https://images.unsplash.com/photo-1638250084708-86b50a2404f4?w=1200&q=85',
  'Asiatic Lion resting in lush grassland — Gir Forest, Gujarat',
  'col-span-2',
  7
),

-- Row 4 — wildebeest + elephant + lion pair
(
  'https://images.unsplash.com/photo-1517118828960-de5ea37d8ae6?w=800&q=85',
  'Wildebeest on the open plains — Masai Mara National Reserve, Kenya',
  'col-span-1',
  8
),
(
  'https://images.unsplash.com/photo-1544211412-2a32426e7fd5?w=800&q=85',
  'Elephant in the wild — African safari',
  'col-span-1',
  9
),
(
  'https://images.unsplash.com/photo-1639221652297-f0ce04992bb4?w=800&q=85',
  'Lion pair resting at sunset — Masai Mara Springs Camp, Kenya',
  'col-span-1',
  10
),

-- Row 5 — Jim Corbett tiger 2 + peacock
(
  'https://images.unsplash.com/photo-1771922365762-1b0a5adbe7d1?w=1200&q=85',
  'Bengal Tiger on jungle path — Jim Corbett National Park, Uttarakhand',
  'col-span-2',
  11
),
(
  'https://images.unsplash.com/photo-1536338490299-da62c7be85de?w=800&q=85',
  'Peacock in full display — Bharatpur Bird Sanctuary, India',
  'col-span-1',
  12
);
