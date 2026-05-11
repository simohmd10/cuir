import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search, Edit2, Trash2, X, Loader2, Upload, Star, Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import LazyImage from '../../components/ui/LazyImage';
import Badge from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { formatPrice, getImageUrl } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { Product, Category } from '../../types';
import { sortCategoriesByHierarchy } from '../../lib/categoryHierarchy';

// ─── Schema ──────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  name_ar: z.string().min(1, 'الاسم مطلوب'),
  description: z.string().default(''),
  description_ar: z.string().default(''),
  price: z.coerce.number().positive('Prix > 0'),
  original_price: z.coerce.number().optional(),
  category: z.string().min(1, 'Catégorie requise'),
  stock: z.coerce.number().int().min(0),
  colors: z.string().default(''),
  sizes: z.string().default(''),
  badge: z.string().default(''),
  badge_ar: z.string().default(''),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
});

type ProductForm = z.infer<typeof productSchema>;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchProducts(page: number, search: string, category: string) {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * 10, page * 10 - 1);

  if (search) query = query.ilike('name', `%${search}%`);
  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Product[], count: count ?? 0 };
}

async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return sortCategoriesByHierarchy((data ?? []) as Category[]);
}

// ─── Main component ───────────────────────────────────────────────────────────

const Products: React.FC = () => {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, categoryFilter],
    queryFn: () => fetchProducts(page, search, categoryFilter),
    staleTime: 30_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  const isFeatured = watch('is_featured');
  const isBestSeller = watch('is_best_seller');

  const openAdd = () => {
    setEditingProduct(null);
    setPreviewImages([]);
    reset({
      name: '', name_ar: '', description: '', description_ar: '',
      price: 0, original_price: undefined, category: '', stock: 0,
      colors: '', sizes: '', badge: '', badge_ar: '',
      is_featured: false, is_best_seller: false,
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setPreviewImages(p.images ?? []);
    reset({
      name: p.name, name_ar: p.name_ar,
      description: p.description ?? '',
      description_ar: p.description_ar ?? '',
      price: p.price,
      original_price: p.original_price,
      category: p.category, stock: p.stock,
      colors: (p.colors ?? []).join(', '),
      sizes: (p.sizes ?? []).join(', '),
      badge: p.badge ?? '', badge_ar: p.badge_ar ?? '',
      is_featured: p.is_featured,
      is_best_seller: p.is_best_seller,
    });
    setModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: false });
        if (error) throw error;
        uploaded.push(fileName);
      }
      setPreviewImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image(s) téléchargée(s)`);
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveMutation = useMutation({
    mutationFn: async (form: ProductForm) => {
      const payload = {
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        description_ar: form.description_ar,
        price: form.price,
        original_price: form.original_price || null,
        category: form.category,
        stock: form.stock,
        colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        badge: form.badge || null,
        badge_ar: form.badge_ar || null,
        is_featured: form.is_featured,
        is_best_seller: form.is_best_seller,
        images: previewImages,
        updated_at: new Date().toISOString(),
      };
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editingProduct ? 'Produit mis à jour' : 'Produit ajouté');
      setModalOpen(false);
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit supprimé');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const totalPages = Math.ceil((data?.count ?? 0) / 10);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-leather-800">
              {lang === 'ar' ? 'المنتجات' : 'Produits'}
            </h1>
            <p className="text-sm text-leather-400">{data?.count ?? 0} {lang === 'ar' ? 'منتج' : 'produits'}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors"
          >
            <Plus size={16} />
            {lang === 'ar' ? 'إضافة منتج' : 'Ajouter un produit'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={lang === 'ar' ? 'بحث...' : 'Rechercher...'}
              className="w-full pl-9 pr-3 py-2 border border-leather-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-leather-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 text-leather-700 bg-white"
          >
            <option value="">{lang === 'ar' ? 'كل الفئات' : 'Toutes catégories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{lang === 'ar' ? c.name_ar : c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-leather-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-leather-100 bg-leather-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الاسم' : 'Nom'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'السعر' : 'Prix'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الفئة' : 'Catégorie'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'شارات' : 'Badges'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-leather-50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Sk className="w-10 h-10 rounded-lg" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-12" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                  : (data?.data ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-leather-400 text-sm">
                        {lang === 'ar' ? 'لا توجد منتجات' : 'Aucun produit'}
                      </td>
                    </tr>
                  )
                  : (data?.data ?? []).map((product) => (
                    <tr key={product.id} className="hover:bg-leather-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <LazyImage
                          src={getImageUrl(product.images?.[0] ?? '')}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-leather-800 truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-leather-400 truncate max-w-[180px]" dir="rtl">{product.name_ar}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-leather-700">{formatPrice(product.price, 'fr')}</td>
                      <td className="px-4 py-3">
                        <span className={product.stock === 0 ? 'text-red-600 font-semibold' : 'text-leather-700'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-leather-500">{product.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {product.is_featured && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                              <Star size={10} /> {lang === 'ar' ? 'مميز' : 'Vedette'}
                            </span>
                          )}
                          {product.is_best_seller && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200">
                              <Zap size={10} /> {lang === 'ar' ? 'الأكثر مبيعاً' : 'Best-seller'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-leather-500 hover:bg-leather-100 hover:text-leather-700 transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-leather-100">
              <p className="text-xs text-leather-400">
                {lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} sur ${totalPages}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-leather-200 text-leather-600 disabled:opacity-40 hover:bg-leather-50 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-leather-200 text-leather-600 disabled:opacity-40 hover:bg-leather-50 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-leather-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-leather-800">
                  {editingProduct
                    ? (lang === 'ar' ? 'تعديل المنتج' : 'Modifier le produit')
                    : (lang === 'ar' ? 'إضافة منتج' : 'Ajouter un produit')}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-leather-50 text-leather-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-5">
                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Nom (FR) *</label>
                    <input {...register('name')} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">الاسم (AR) *</label>
                    <input {...register('name_ar')} dir="rtl" className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                    {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar.message}</p>}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Description (FR)</label>
                    <textarea {...register('description')} rows={3} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">الوصف (AR)</label>
                    <textarea {...register('description_ar')} dir="rtl" rows={3} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 resize-none" />
                  </div>
                </div>

                {/* Price + original price */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Prix (DH) *</label>
                    <input type="number" {...register('price')} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Prix original</label>
                    <input type="number" {...register('original_price')} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Stock *</label>
                    <input type="number" {...register('stock')} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-leather-600 mb-1">Catégorie *</label>
                  <select {...register('category')} className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 bg-white text-leather-700">
                    <option value="">Sélectionner...</option>
                    {(() => {
                      const parents  = categories.filter((c) => !c.parent_slug);
                      const orphans  = categories.filter((c) => c.parent_slug && !parents.find((p) => p.slug === c.parent_slug));
                      return (
                        <>
                          {parents.map((parent) => {
                            const pName = lang === 'ar' ? (parent.name_ar || parent.name) : parent.name;
                            const children = categories.filter((c) => c.parent_slug === parent.slug);
                            return children.length > 0 ? (
                              <optgroup key={parent.slug} label={`▸ ${pName}`}>
                                <option value={parent.slug}>{pName} ({lang === 'ar' ? 'عام' : 'général'})</option>
                                {children.map((c) => {
                                  const cName = lang === 'ar' ? (c.name_ar || c.name) : c.name;
                                  return <option key={c.id} value={c.slug}>{'  '}↳ {cName}</option>;
                                })}
                              </optgroup>
                            ) : (
                              <option key={parent.slug} value={parent.slug}>{pName}</option>
                            );
                          })}
                          {orphans.map((c) => {
                            const cName = lang === 'ar' ? (c.name_ar || c.name) : c.name;
                            return <option key={c.id} value={c.slug}>{cName}</option>;
                          })}
                        </>
                      );
                    })()}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>

                {/* Colors + sizes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Couleurs (séparées par virgule)</label>
                    <input {...register('colors')} placeholder="Marron, Noir, Camel" className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Tailles (séparées par virgule)</label>
                    <input {...register('sizes')} placeholder="S, M, L, XL" className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                  </div>
                </div>

                {/* Badge */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Badge (FR)</label>
                    <input {...register('badge')} placeholder="Nouveau" className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">الشارة (AR)</label>
                    <input {...register('badge_ar')} dir="rtl" placeholder="جديد" className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400" />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_featured')}
                      className="w-4 h-4 rounded border-leather-300 text-leather-500 focus:ring-leather-400"
                    />
                    <span className="text-sm text-leather-700">{lang === 'ar' ? 'مميز' : 'Mis en avant'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_best_seller')}
                      className="w-4 h-4 rounded border-leather-300 text-leather-500 focus:ring-leather-400"
                    />
                    <span className="text-sm text-leather-700">{lang === 'ar' ? 'الأكثر مبيعاً' : 'Best-seller'}</span>
                  </label>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-medium text-leather-600 mb-2">Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-leather-200 group">
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-leather-300 flex items-center justify-center text-leather-400 hover:border-leather-500 hover:text-leather-600 transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-leather-200 rounded-lg text-sm text-leather-600 hover:bg-leather-50 transition-colors"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || saveMutation.isPending || uploading}
                    className="flex-1 py-2.5 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {(isSubmitting || saveMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                    {lang === 'ar' ? 'حفظ' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setDeleteTarget(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-leather-800 mb-2">
                  {lang === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}
                </h3>
                <p className="text-sm text-leather-500 mb-6">
                  {lang === 'ar'
                    ? `هل أنت متأكد من حذف "${deleteTarget.name_ar}"؟`
                    : `Supprimer "${deleteTarget.name}" ? Cette action est irréversible.`}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-leather-200 rounded-lg text-sm text-leather-600 hover:bg-leather-50 transition-colors">
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteTarget.id)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    {lang === 'ar' ? 'حذف' : 'Supprimer'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Products;
