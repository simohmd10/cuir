-- 008 — expose product_image dans lookup_order()
--
-- La colonne order_items.product_image existe depuis la migration 005 et est
-- renseignée par place_order (migration 006), mais lookup_order ne la renvoyait
-- pas. La page de suivi de commande affichait donc toujours l'image de
-- remplacement au lieu de la photo du produit commandé.

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
      'size', oi.size,
      'product_image', oi.product_image
    )
    ORDER BY oi.created_at
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
