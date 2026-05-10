-- ============================================================
-- Migration 003 — Add parent_slug to categories + insert sub-categories
--
-- Run AFTER migration 001 and 002.
-- Safe to re-run (idempotent).
--
-- Dashboard → SQL Editor → paste & run
-- ============================================================

-- 1. Add parent_slug column (no-op if already exists)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_slug TEXT REFERENCES categories(slug) ON DELETE SET NULL;

-- 2. Mark card-holders and belts as children of accessories
UPDATE categories SET parent_slug = 'accessories'
WHERE slug IN ('card-holders', 'belts') AND parent_slug IS NULL;

-- 3. Insert sub-categories (11 new entries)
INSERT INTO categories (name, name_ar, slug, parent_slug) VALUES
  -- ── Sacs & Maroquinerie ───────────────────────────────────────────────────
  ('Sacs à Main',          'حقائب اليد',          'sacs-a-main',         'handbags'),
  ('Pochettes & Clutches', 'المحافظ الصغيرة',     'pochettes',           'handbags'),
  ('Cabas & Totes',        'حقائب الكتف',          'cabas-totes',         'handbags'),
  -- ── Bagagerie Cuir ────────────────────────────────────────────────────────
  ('Sacs de Voyage',       'حقائب الرحلات',        'sacs-voyage',         'travel-bags'),
  ('Sacs Week-end',        'حقائب العطلة',          'sacs-weekend',        'travel-bags'),
  -- ── Mallettes & Sacoches ─────────────────────────────────────────────────
  ('Mallettes Business',   'حقائب المكتب',         'mallettes',           'briefcases'),
  ('Sacoches',             'الحقائب الناعمة',      'sacoches',            'briefcases'),
  -- ── Accessoires & Essentiels ─────────────────────────────────────────────
  ('Petite Maroquinerie',  'إكسسوارات صغيرة',     'petite-maroquinerie', 'accessories')
ON CONFLICT (slug) DO UPDATE SET
  parent_slug = EXCLUDED.parent_slug,
  name        = EXCLUDED.name,
  name_ar     = EXCLUDED.name_ar;

-- 4. Verify result
SELECT
  COALESCE(c.parent_slug, '— root —') AS parent,
  c.slug,
  c.name
FROM categories c
ORDER BY COALESCE(c.parent_slug, c.slug), c.parent_slug NULLS FIRST, c.name;
