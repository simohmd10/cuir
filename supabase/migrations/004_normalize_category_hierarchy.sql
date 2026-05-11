-- Normalize category tree to the canonical main/subcategory structure.
-- Safe to re-run.

-- Ensure root categories exist
INSERT INTO categories (name, name_ar, slug, parent_slug)
VALUES
  ('Sacs & Maroquinerie', 'حقائب ومحافظ', 'handbags', NULL),
  ('Bagagerie Cuir', 'حقائب السفر', 'travel-bags', NULL),
  ('Mallettes & Sacoches', 'حقائب الأعمال', 'briefcases', NULL),
  ('Accessoires & Essentiels', 'الإكسسوارات', 'accessories', NULL),
  ('Coffrets Cadeaux', 'صناديق الهدايا', 'gift-sets', NULL),
  ('Collection Limitée', 'الإصدارات المحدودة', 'limited-collection', NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  parent_slug = NULL;

-- Ensure all required children are attached to the right parent
INSERT INTO categories (name, name_ar, slug, parent_slug)
VALUES
  ('Sacs à Main', 'حقائب اليد', 'sacs-a-main', 'handbags'),
  ('Cabas & Totes', 'حقائب الكتف', 'cabas-totes', 'handbags'),
  ('Pochettes & Clutches', 'المحافظ الصغيرة', 'pochettes', 'handbags'),
  ('Sacs de Voyage', 'حقائب الرحلات', 'sacs-voyage', 'travel-bags'),
  ('Sacs Week-end', 'حقائب العطلة', 'sacs-weekend', 'travel-bags'),
  ('Mallettes Business', 'حقائب المكتب', 'mallettes', 'briefcases'),
  ('Sacoches', 'الحقائب الناعمة', 'sacoches', 'briefcases'),
  ('Ceintures Cuir', 'الأحزمة', 'belts', 'accessories'),
  ('Petite Maroquinerie', 'إكسسوارات صغيرة', 'petite-maroquinerie', 'accessories'),
  ('Porte-Cartes & Passeports', 'حاملات البطاقات', 'card-holders', 'accessories')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  parent_slug = EXCLUDED.parent_slug;
