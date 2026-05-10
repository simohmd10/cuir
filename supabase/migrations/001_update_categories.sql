-- ============================================================
-- Migration 001 — Replace legacy categories with 8 new ones
-- that match the CollectionsSection editorial grid.
--
-- Run this once on your live Supabase project via:
--   Dashboard → SQL Editor → paste & run
-- ============================================================

-- 1. Remove old categories that no longer exist in the collections
DELETE FROM categories
WHERE slug IN (
  'sacs-a-main',
  'sacs-voyage',
  'portefeuilles',
  'ceintures',
  'accessoires'
);

-- 2. Insert the 8 new categories (idempotent — safe to re-run)
INSERT INTO categories (name, name_ar, slug, image) VALUES
  ('Sacs & Maroquinerie',         'حقائب ومحافظ',         'handbags',           NULL),
  ('Bagagerie Cuir',              'حقائب السفر',           'travel-bags',        NULL),
  ('Accessoires & Essentiels',    'الإكسسوارات',           'accessories',        NULL),
  ('Mallettes & Sacoches',        'حقائب الأعمال',         'briefcases',         NULL),
  ('Porte-Cartes & Passeports',   'حاملات البطاقات',       'card-holders',       NULL),
  ('Ceintures Cuir',              'الأحزمة',               'belts',              NULL),
  ('Coffrets Cadeaux',            'صناديق الهدايا',        'gift-sets',          NULL),
  ('Collection Limitée',          'الإصدارات المحدودة',   'limited-collection', NULL)
ON CONFLICT (slug) DO UPDATE SET
  name    = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar;
