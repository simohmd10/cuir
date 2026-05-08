import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, color: string, size: string) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = 'cuir-cart';
const DELIVERY_FEE_THRESHOLD = 500;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number, color: string, size: string) => {
    setItems(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.color === color && item.size === size
      );

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          toast.error('الكمية المطلوبة تتجاوز المخزون المتاح');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id && item.color === color && item.size === size
            ? { ...item, quantity: newQty }
            : item
        );
      }

      if (quantity > product.stock) {
        toast.error('الكمية المطلوبة تتجاوز المخزون المتاح');
        return prev;
      }

      return [...prev, { product, quantity, color, size }];
    });
  };

  const removeItem = (productId: string, color: string, size: string) => {
    setItems(prev =>
      prev.filter(
        item => !(item.product.id === productId && item.color === color && item.size === size)
      )
    );
  };

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, color, size);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.color === color && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export { DELIVERY_FEE_THRESHOLD };
