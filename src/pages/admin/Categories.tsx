import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, Loader2, Upload, Tag } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import LazyImage from '../../components/ui/LazyImage';
import { supabase } from '../../lib/supabase';
import { getImageUrl } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { Category } from '../../types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  name_ar: z.string().min(1, 'الاسم مطلوب'),
  slug: z.string().min(1, 'Slug requis').regex(/^[a-z0-9-]+$/, 'Slug: lettres minuscules, chiffres et tirets uniquement'),
});

type CategoryForm = z.infer<typeof categorySchema>;

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select(`*, products:products(count)`)
    .order('name');
  if (error) throw error;
  return (data ?? []) as (Category & { products: { count: number }[] })[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Auto-slug ────────────────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Main component ───────────────────────────────────────────────────────────

const Categories: React.FC = () => {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
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
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  const nameValue = watch('name');

  const openAdd = () => {
    setEditingCategory(null);
    setImageFile('');
    reset({ name: '', name_ar: '', slug: '' });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setImageFile(cat.image ?? '');
    reset({ name: cat.name, name_ar: cat.name_ar, slug: cat.slug });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: false });
      if (error) throw error;
      setImageFile(fileName);
      toast.success('Image téléchargée');
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (form: CategoryForm) => {
      const payload = { ...form, image: imageFile || null };
      if (editingCategory) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editingCategory ? 'Catégorie mise à jour' : 'Catégorie ajoutée');
      setModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Erreur lors de la sauvegarde'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie supprimée');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-leather-800">
              {lang === 'ar' ? 'الفئات' : 'Catégories'}
            </h1>
            <p className="text-sm text-leather-400">{categories.length} {lang === 'ar' ? 'فئة' : 'catégories'}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors"
          >
            <Plus size={16} />
            {lang === 'ar' ? 'إضافة فئة' : 'Ajouter une catégorie'}
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-leather-100 rounded-xl p-4">
                <Sk className="h-28 w-full rounded-lg mb-3" />
                <Sk className="h-4 w-3/4 mb-1.5" />
                <Sk className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-leather-100 rounded-xl p-12 text-center">
            <Tag size={32} className="text-leather-300 mx-auto mb-3" />
            <p className="text-leather-500 text-sm">
              {lang === 'ar' ? 'لا توجد فئات بعد' : 'Aucune catégorie pour le moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const productCount = cat.products?.[0]?.count ?? 0;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-leather-100 rounded-xl overflow-hidden shadow-sm group"
                >
                  <div className="relative h-32">
                    <LazyImage
                      src={getImageUrl(cat.image ?? '')}
                      alt={cat.name}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 bg-white rounded-lg shadow text-leather-600 hover:text-leather-800 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 bg-white rounded-lg shadow text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-leather-800 text-sm">{cat.name}</p>
                    <p className="text-xs text-leather-400" dir="rtl">{cat.name_ar}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-xs text-leather-400">{cat.slug}</span>
                      <span className="text-xs text-leather-500">
                        {productCount} {lang === 'ar' ? 'منتج' : 'produits'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-leather-100">
                  <h2 className="text-lg font-semibold text-leather-800">
                    {editingCategory
                      ? (lang === 'ar' ? 'تعديل الفئة' : 'Modifier la catégorie')
                      : (lang === 'ar' ? 'إضافة فئة' : 'Ajouter une catégorie')}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-leather-50 text-leather-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
                  className="p-6 space-y-4"
                >
                  {/* Image upload */}
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-2">Image</label>
                    <div className="flex items-center gap-3">
                      {imageFile ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-leather-200 flex-shrink-0">
                          <img src={getImageUrl(imageFile)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImageFile('')}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-leather-300 flex items-center justify-center text-leather-400 flex-shrink-0">
                          <Tag size={20} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-3 py-2 border border-leather-200 rounded-lg text-sm text-leather-600 hover:bg-leather-50 transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {lang === 'ar' ? 'رفع صورة' : 'Télécharger'}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Nom (FR) *</label>
                    <input
                      {...register('name', {
                        onChange: (e) => {
                          if (!editingCategory) setValue('slug', toSlug(e.target.value));
                        },
                      })}
                      className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Name AR */}
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">الاسم (AR) *</label>
                    <input
                      {...register('name_ar')}
                      dir="rtl"
                      className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
                    />
                    {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar.message}</p>}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Slug *</label>
                    <input
                      {...register('slug')}
                      className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-leather-400"
                    />
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-1">
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
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
                  ? `حذف الفئة "${deleteTarget.name_ar}"؟`
                  : `Supprimer la catégorie "${deleteTarget.name}" ?`}
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
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Categories;
