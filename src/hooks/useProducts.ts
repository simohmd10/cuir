import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';

export function useProducts(options?: {
  category?: string;
  search?: string;
  sortBy?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  limit?: number;
}) {
  return useQuery<Product[]>({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase.from('products').select('*');

      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,name_ar.ilike.%${options.search}%`
        );
      }
      if (options?.isFeatured) {
        query = query.eq('is_featured', true);
      }
      if (options?.isBestSeller) {
        query = query.eq('is_best_seller', true);
      }

      if (options?.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (options?.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (options?.sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });
}
