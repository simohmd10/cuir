-- ============================================================
-- Migration 002 — Re-map existing products to new category slugs
--
-- Run AFTER migration 001 (which created the 8 new categories).
-- Safe to re-run (all UPDATEs are idempotent).
--
-- Dashboard → SQL Editor → paste & run
-- ============================================================

-- Old slug → New slug mapping
UPDATE products SET category = 'handbags'           WHERE category IN ('sacs-a-main', 'sacs_a_main', 'handbag', 'sac', 'sacs');
UPDATE products SET category = 'travel-bags'        WHERE category IN ('sacs-voyage', 'sacs_voyage', 'voyage', 'travel', 'travel_bags');
UPDATE products SET category = 'accessories'        WHERE category IN ('accessoires', 'accessoire', 'accessory');
UPDATE products SET category = 'briefcases'         WHERE category IN ('briefcase', 'mallette', 'mallettes', 'sacoche', 'sacoches');
UPDATE products SET category = 'card-holders'       WHERE category IN ('portefeuilles', 'portefeuille', 'porte-cartes', 'porte_cartes', 'card_holders', 'cardholder');
UPDATE products SET category = 'belts'              WHERE category IN ('ceintures', 'ceinture', 'belt');
UPDATE products SET category = 'gift-sets'          WHERE category IN ('coffrets', 'coffret', 'cadeaux', 'gift', 'gifts', 'gift_sets');
UPDATE products SET category = 'limited-collection' WHERE category IN ('limited', 'limite', 'collection-limitee', 'collection_limitee', 'limited_edition');

-- Show the current state after remapping
SELECT category, COUNT(*) as product_count
FROM products
GROUP BY category
ORDER BY category;
