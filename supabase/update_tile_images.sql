-- ============================================================
-- Wild Vana — Portrait Tile Image Update (Your Tours section)
-- These are separate portrait-oriented shots optimised for the
-- 280×620 vertical tour cards in the TourTiles carousel.
-- Run in Supabase SQL Editor after update_images.sql
-- ============================================================

-- Ranthambore — Bengal Tiger face, direct gaze into lens
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1760408340442-b183ba3f9160?w=600&h=900&q=85&fit=crop'
WHERE location = 'Ranthambore';

-- Kaziranga — Indian Rhino head close-up, horn detail
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1767008450763-09dae0cbce98?w=600&h=900&q=85&fit=crop'
WHERE location = 'Kaziranga';

-- Bharatpur — Peacock in full feather display, naturally vertical
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1668354690433-fb0aea52a82c?w=600&h=900&q=85&fit=crop'
WHERE location = 'Bharatpur';

-- Jim Corbett — Tiger face close-up on jungle dirt road
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1726688355874-9307de791844?w=600&h=900&q=85&fit=crop'
WHERE location = 'Jim Corbett';

-- Gir Forest — Asiatic Lion in lush grass, Sasan Gir Gujarat
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1638250084708-86b50a2404f4?w=600&h=900&q=85&fit=crop'
WHERE location = 'Gir Forest';

-- Masai Mara (The Great Migration) — Female lion standing alert in savanna
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1738505803781-00c8641bd282?w=600&h=900&q=85&fit=crop'
WHERE location = 'Masai Mara' AND tagline = 'The Great Migration Awaits';

-- Masai Mara (Golden Light) — Two lions alert in forest
UPDATE tours SET
  tile_image = 'https://images.unsplash.com/photo-1761471321968-4c15cc483ca9?w=600&h=900&q=85&fit=crop'
WHERE location = 'Masai Mara' AND tagline = 'Golden Light on the Savanna';
