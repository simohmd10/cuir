export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  original_price?: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  review_count?: number;
  badge?: string;
  badge_ar?: string;
  colors: string[];
  sizes: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  image: string;
  parent_slug: string | null;
  product_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
  size: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_name_ar: string;
  quantity: number;
  price_at_purchase: number;
  color: string;
  size: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_ref: string;
  customer_id: string;
  status: OrderStatus;
  total: number;
  discount_amount: number;
  delivery_fee?: number;
  coupon_code?: string;
  payment_method: 'cod';
  idempotency_key: string;
  access_token: string;
  notes?: string;
  created_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  expires_at: string;
  is_active: boolean;
  usage_count?: number;
  usage_limit?: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  product?: Product;
}

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  coupon_code?: string;
}

export interface PlaceOrderResult {
  order_ref: string;
  access_token: string;
  total: number;
  discount_amount: number;
}

export interface DashboardStats {
  total_sales: number;
  today_sales: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  new_customers_today: number;
  daily_sales: { date: string; amount: number; orders: number }[];
}
