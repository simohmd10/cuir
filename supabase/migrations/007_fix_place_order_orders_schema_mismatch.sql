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
  p_items JSONB DEFAULT '[]'::JSONB
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
  SELECT id INTO v_order_id FROM orders WHERE idempotency_key = p_idempotency_key;
  IF v_order_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'order_ref', order_ref,
      'access_token', access_token,
      'total', total,
      'discount_amount', discount_amount
    )
    INTO v_order_ref
    FROM orders WHERE id = v_order_id;
    RETURN v_order_ref;
  END IF;

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

  v_order_ref := 'CU-' || UPPER(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT)) || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 4));
  v_access_token := gen_random_uuid()::TEXT;

  INSERT INTO orders (
    order_ref, customer_id, status, total, discount_amount,
    delivery_fee, coupon_code, payment_method, idempotency_key,
    access_token, notes
  ) VALUES (
    v_order_ref, v_customer_id, 'pending', v_total, v_discount_amount,
    v_delivery_fee, UPPER(COALESCE(p_coupon_code, '')), 'cod', p_idempotency_key,
    v_access_token, p_notes
  ) RETURNING id INTO v_order_id;

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
