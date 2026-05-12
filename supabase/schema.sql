-- ============================================================
-- CUIR MAROC — Complete Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  parent_slug TEXT REFERENCES categories(slug) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  badge_ar TEXT,
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_ref TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 30,
  coupon_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  idempotency_key TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  notes TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  customer_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_name_ar TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10,2) NOT NULL,
  color TEXT DEFAULT '',
  size TEXT DEFAULT '',
  product_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON orders(order_ref);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────

-- Users can read/update their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- ── categories ────────────────────────────────────────────

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (TRUE);

CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (is_admin());

-- ── products ──────────────────────────────────────────────

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (TRUE);

CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (is_admin());

-- ── customers ─────────────────────────────────────────────

-- Customers have no auth — only admins and service-role can read
CREATE POLICY "customers_admin_all" ON customers
  FOR ALL USING (is_admin());

-- ── coupons ───────────────────────────────────────────────

-- Public needs to read active coupons to validate at checkout
CREATE POLICY "coupons_public_read_active" ON coupons
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL USING (is_admin());

-- ── orders ────────────────────────────────────────────────

-- Anyone can insert (place an order)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Order lookup via access_token (for customers tracking their order)
CREATE POLICY "orders_owner_select" ON orders
  FOR SELECT USING (
    is_admin()
    OR access_token = current_setting('request.jwt.claims', TRUE)::json->>'access_token'
  );

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (is_admin());

-- ── order_items ───────────────────────────────────────────

CREATE POLICY "order_items_public_insert" ON order_items
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
    )
  );

-- ── reviews ───────────────────────────────────────────────

-- Public can read approved reviews only
CREATE POLICY "reviews_public_read_approved" ON reviews
  FOR SELECT USING (status = 'approved' OR is_admin());

-- Anyone can insert (submit a review — guest checkout)
CREATE POLICY "reviews_public_insert" ON reviews
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "reviews_admin_update" ON reviews
  FOR UPDATE USING (is_admin());

CREATE POLICY "reviews_admin_delete" ON reviews
  FOR DELETE USING (is_admin());

-- ── settings ──────────────────────────────────────────────

CREATE POLICY "settings_public_read" ON settings
  FOR SELECT USING (TRUE);

CREATE POLICY "settings_admin_write" ON settings
  FOR ALL USING (is_admin());

-- ── contact_messages ──────────────────────────────────────

CREATE POLICY "contact_messages_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "contact_messages_admin_all" ON contact_messages
  FOR ALL USING (is_admin());

-- ============================================================
-- TRIGGER: auto-update product rating when review status changes
-- ============================================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_id UUID;
  v_avg DECIMAL(3,2);
  v_count INTEGER;
BEGIN
  -- Determine which product_id to update
  IF TG_OP = 'DELETE' THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  -- Recalculate from approved reviews only
  SELECT
    COALESCE(AVG(rating)::DECIMAL(3,2), 0),
    COUNT(*)::INTEGER
  INTO v_avg, v_count
  FROM reviews
  WHERE product_id = v_product_id
    AND status = 'approved';

  UPDATE products
  SET
    rating = v_avg,
    review_count = v_count,
    updated_at = NOW()
  WHERE id = v_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_product_rating ON reviews;
CREATE TRIGGER trg_update_product_rating
  AFTER INSERT OR UPDATE OF status OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- ============================================================
-- TRIGGER: auto-update orders.updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RPC: place_order
-- Verifies prices, checks stock, validates coupon,
-- creates/finds customer, creates order + items, decrements stock
-- Returns: { order_ref, access_token, total, discount_amount }
-- ============================================================

CREATE OR REPLACE FUNCTION place_order(
  p_idempotency_key TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_customer_address TEXT,
  p_customer_city TEXT,
  p_notes TEXT,
  p_coupon_code TEXT,
  p_payment_method TEXT DEFAULT 'cod',
  p_items JSONB DEFAULT '[]'::JSONB  -- array of { product_id, quantity, color, size }
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_order_id UUID;
  v_order_ref TEXT;
  v_access_token TEXT;
  v_subtotal DECIMAL(10,2) := 0;
  v_discount_amount DECIMAL(10,2) := 0;
  v_delivery_fee DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_item JSONB;
  v_product RECORD;
  v_coupon RECORD;
  v_free_threshold DECIMAL(10,2);
BEGIN
  -- ── Idempotency check ───────────────────────────────────
  SELECT id INTO v_order_id FROM orders WHERE idempotency_key = p_idempotency_key;
  IF v_order_id IS NOT NULL THEN
    SELECT
      jsonb_build_object(
        'order_ref', order_ref,
        'access_token', access_token,
        'total', total,
        'discount_amount', discount_amount
      )
    INTO v_order_ref
    FROM orders WHERE id = v_order_id;
    RETURN v_order_ref;
  END IF;

  -- ── Validate items & calculate subtotal ─────────────────
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Panier vide';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, price, stock, name, name_ar, images
    INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit introuvable: %', (v_item->>'product_id');
    END IF;

    IF v_product.stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Stock insuffisant pour: %', v_product.name;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  -- ── Validate coupon ─────────────────────────────────────
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    SELECT * INTO v_coupon
    FROM coupons
    WHERE code = UPPER(p_coupon_code)
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Code promo invalide ou expiré';
    END IF;

    IF v_subtotal < COALESCE(v_coupon.min_order_amount, 0) THEN
      RAISE EXCEPTION 'Montant minimum de commande non atteint (min: % DH)', v_coupon.min_order_amount;
    END IF;

    IF v_coupon.discount_type = 'percentage' THEN
      v_discount_amount := ROUND(v_subtotal * v_coupon.discount_value / 100, 2);
    ELSE
      v_discount_amount := LEAST(v_coupon.discount_value, v_subtotal);
    END IF;

    UPDATE coupons SET usage_count = usage_count + 1 WHERE id = v_coupon.id;
  END IF;

  -- ── Delivery fee ─────────────────────────────────────────
  SELECT COALESCE(value::DECIMAL, 30)
  INTO v_delivery_fee
  FROM settings WHERE key = 'delivery_fee';

  SELECT COALESCE(value::DECIMAL, 500)
  INTO v_free_threshold
  FROM settings WHERE key = 'free_delivery_threshold';

  IF (v_subtotal - v_discount_amount) >= v_free_threshold THEN
    v_delivery_fee := 0;
  END IF;

  v_total := v_subtotal - v_discount_amount + v_delivery_fee;

  -- ── Find or create customer ──────────────────────────────
  SELECT id INTO v_customer_id
  FROM customers WHERE phone = p_customer_phone
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO customers (name, email, phone, address, city)
    VALUES (p_customer_name, p_customer_email, p_customer_phone, p_customer_address, p_customer_city)
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE customers
    SET name = p_customer_name,
        address = p_customer_address,
        city = p_customer_city,
        email = COALESCE(NULLIF(p_customer_email, ''), email)
    WHERE id = v_customer_id;
  END IF;

  -- ── Generate order reference & token ────────────────────
  v_order_ref := 'CU-' || UPPER(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT)) || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 4));
  v_access_token := gen_random_uuid()::TEXT;

  -- ── Create order ─────────────────────────────────────────
  INSERT INTO orders (
    order_ref, customer_id, status, total, discount_amount,
    delivery_fee, coupon_code, payment_method, idempotency_key,
    access_token, notes
  ) VALUES (
    v_order_ref, v_customer_id, 'pending', v_total, v_discount_amount,
    v_delivery_fee, UPPER(COALESCE(p_coupon_code, '')), 'cod', p_idempotency_key,
    v_access_token, p_notes
  ) RETURNING id INTO v_order_id;

  -- ── Create order items + decrement stock ─────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, price, name, name_ar, images INTO v_product
    FROM products WHERE id = (v_item->>'product_id')::UUID;

    INSERT INTO order_items (
      order_id, product_id, product_name, product_name_ar,
      quantity, price_at_purchase, color, size, product_image
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_product.name,
      v_product.name_ar,
      (v_item->>'quantity')::INTEGER,
      v_product.price,
      COALESCE(v_item->>'color', ''),
      COALESCE(v_item->>'size', ''),
      CASE WHEN array_length(v_product.images, 1) > 0 THEN v_product.images[1] ELSE NULL END
    );

    UPDATE products
    SET stock = stock - (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  -- ── Return result ─────────────────────────────────────────
  RETURN jsonb_build_object(
    'order_ref', v_order_ref,
    'access_token', v_access_token,
    'total', v_total,
    'discount_amount', v_discount_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- ============================================================
-- RPC: lookup_order
-- Returns order with items and customer, verified by access_token
-- ============================================================

CREATE OR REPLACE FUNCTION lookup_order(
  p_order_ref TEXT,
  p_access_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
  v_customer JSONB;
BEGIN
  SELECT o.*,
         COALESCE(o.customer_name, c.name) AS customer_name,
         COALESCE(o.customer_phone, c.phone) AS customer_phone,
         COALESCE(o.customer_email, c.email) AS customer_email,
         COALESCE(o.customer_address, c.address) AS customer_address,
         COALESCE(o.customer_city, c.city) AS customer_city
  INTO v_order
  FROM orders o
  LEFT JOIN customers c ON c.id = o.customer_id
  WHERE o.order_ref = p_order_ref
    AND o.access_token = p_access_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commande introuvable ou accès refusé';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'product_name', oi.product_name,
      'product_name_ar', oi.product_name_ar,
      'quantity', oi.quantity,
      'price_at_purchase', oi.price_at_purchase,
      'color', oi.color,
      'size', oi.size
    )
  )
  INTO v_items
  FROM order_items oi
  WHERE oi.order_id = v_order.id;

  v_customer := jsonb_build_object(
    'name', v_order.customer_name,
    'phone', v_order.customer_phone,
    'email', v_order.customer_email,
    'address', v_order.customer_address,
    'city', v_order.customer_city
  );

  RETURN jsonb_build_object(
    'id', v_order.id,
    'order_ref', v_order.order_ref,
    'status', v_order.status,
    'total', v_order.total,
    'discount_amount', v_order.discount_amount,
    'delivery_fee', v_order.delivery_fee,
    'coupon_code', v_order.coupon_code,
    'payment_method', v_order.payment_method,
    'notes', v_order.notes,
    'created_at', v_order.created_at,
    'customer', v_customer,
    'order_items', COALESCE(v_items, '[]'::JSONB)
  );
END;
$$;

-- ============================================================
-- DEFAULT SETTINGS
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('store_name',               'Cuir Maroc'),
  ('whatsapp_number',          '+212691553120'),
  ('delivery_fee',             '30'),
  ('free_delivery_threshold',  '500'),
  ('store_email',              'contact@cuir.ma'),
  ('store_phone',              '0691553120')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SAMPLE CATEGORIES (optional — remove if not needed)
-- ============================================================

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
