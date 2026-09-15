import React, { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Product, Category } from "../lib/types";

interface AdminProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85";

export default function AdminProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onSaved,
}: AdminProductModalProps) {
  if (!isOpen) return null;

  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    slug: "",
    short_description: "",
    description: "",
    category_id: "",
    price: 45,
    sale_price: "" as string | number,
    sku: "",
    stock_quantity: 30,
    low_stock_threshold: 5,
    is_featured: true,
    is_best_seller: false,
    is_new: true,
    is_active: true,
  });

  const [imageUrl, setImageUrl] = useState(DEFAULT_FALLBACK_IMAGE);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Synchronize state when opening modal or changing product
  useEffect(() => {
    if (product) {
      setFormData({
        name_ar: product.name_ar || "",
        name_en: product.name_en || "",
        slug: product.slug || "",
        short_description: product.short_description || "",
        description: product.description || "",
        category_id: product.category_id || categories[0]?.id || "",
        price: product.price ?? 45,
        sale_price: product.sale_price ?? "",
        sku: product.sku || `ARY-${Math.floor(1000 + Math.random() * 9000)}`,
        stock_quantity: product.stock_quantity ?? 30,
        low_stock_threshold: product.low_stock_threshold ?? 5,
        is_featured: product.is_featured ?? false,
        is_best_seller: product.is_best_seller ?? false,
        is_new: product.is_new ?? false,
        is_active: product.is_active ?? true,
      });

      const initialImg =
        product.product_images?.find((img) => img.is_primary)?.image_url ||
        product.product_images?.[0]?.image_url ||
        (product as any).image_url ||
        DEFAULT_FALLBACK_IMAGE;

      setImageUrl(initialImg);
    } else {
      setFormData({
        name_ar: "",
        name_en: "",
        slug: "",
        short_description: "",
        description: "",
        category_id: categories[0]?.id || "",
        price: 45,
        sale_price: 35,
        sku: `ARY-${Math.floor(1000 + Math.random() * 9000)}`,
        stock_quantity: 30,
        low_stock_threshold: 5,
        is_featured: true,
        is_best_seller: false,
        is_new: true,
        is_active: true,
      });
      setImageUrl(DEFAULT_FALLBACK_IMAGE);
    }
  }, [product, isOpen, categories]);

  // Clean image URLs (e.g. missing https:// or leading / on unsplash)
  const sanitizeImageUrl = (url: string): string => {
    let clean = url.trim();
    if (clean.startsWith("/images.unsplash.com") || clean.startsWith("//images.unsplash.com")) {
      clean = "https://" + clean.replace(/^\/+/, "");
    } else if (clean.startsWith("images.unsplash.com")) {
      clean = "https://" + clean;
    }
    return clean || DEFAULT_FALLBACK_IMAGE;
  };

  // Handle image upload to Supabase storage `products` bucket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview for immediate user feedback
    const localPreviewUrl = URL.createObjectURL(file);
    setImageUrl(localPreviewUrl);
    setUploadingImage(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `perfume_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      if (publicUrl) {
        setImageUrl(publicUrl);
      }
    } catch (err: any) {
      console.warn("Storage upload failed, retaining image preview:", err);
      alert(
        "تنبيه رفع الصورة: تعذر الرفع إلى حاوية Supabase Storage مباشرة (" +
          (err.message || "تأكد من وجود bucket باسم products وسياسات الرفع") +
          "). يمكنك أيضاً وضع رابط الصورة المباشر في الحقل النصي."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name_ar.trim() || !formData.name_en.trim()) {
      alert("يرجى ملء اسم العطر بالعربية والإنجليزية");
      return;
    }

    setSaving(true);
    try {
      const cleanImg = sanitizeImageUrl(imageUrl);

      const generatedSlug =
        formData.slug.trim() ||
        formData.name_en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        `perfume-${Date.now()}`;

      const payload = {
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim(),
        slug: generatedSlug,
        short_description: formData.short_description?.trim() || null,
        description: formData.description?.trim() || null,
        category_id: formData.category_id || null,
        price: Number(formData.price) || 0,
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        sku: formData.sku?.trim() || null,
        stock_quantity: Number(formData.stock_quantity) || 0,
        low_stock_threshold: Number(formData.low_stock_threshold) || 5,
        is_featured: Boolean(formData.is_featured),
        is_best_seller: Boolean(formData.is_best_seller),
        is_new: Boolean(formData.is_new),
        is_active: Boolean(formData.is_active),
        updated_at: new Date().toISOString(),
      };

      let productId = product?.id;

      // 1. Update or Insert into products table
      if (isEditing && productId) {
        const { error: updateErr } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);

        if (updateErr) throw updateErr;
      } else {
        const { data: newProd, error: insertErr } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (insertErr) throw insertErr;
        productId = newProd.id;
      }

      // 2. Persist image in product_images table
      if (productId && cleanImg) {
        try {
          const { data: existingImgs } = await supabase
            .from("product_images")
            .select("id")
            .eq("product_id", productId);

          if (existingImgs && existingImgs.length > 0) {
            // Update the primary image record
            const { error: imgUpErr } = await supabase
              .from("product_images")
              .update({
                image_url: cleanImg,
                is_primary: true,
                display_order: 1,
              })
              .eq("id", existingImgs[0].id);

            if (imgUpErr) console.warn("Failed to update product image record:", imgUpErr);
          } else {
            // Insert new image record
            const { error: imgInErr } = await supabase.from("product_images").insert({
              product_id: productId,
              image_url: cleanImg,
              is_primary: true,
              display_order: 1,
            });

            if (imgInErr) console.warn("Failed to insert product image record:", imgInErr);
          }
        } catch (imgCatchErr) {
          console.error("Error managing product_images:", imgCatchErr);
        }
      }

      onSaved();
      onClose();
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ بيانات العطر: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-black text-burgundy font-alexandria">
              {isEditing ? "تعديل بيانات العطر والصورة" : "إضافة عطر فاخر جديد"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-darkText/50 hover:text-burgundy hover:bg-beige transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">اسم العطر بالعربية *</label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="مثال: أمير العود"
                className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-bold text-darkText focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">اسم العطر بالإنجليزية *</label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="AMEER AL OUDH"
                className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-serif text-darkText focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
          </div>

          {/* Slug & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">الرابط الفريد (Slug)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="اتركه فارغاً للتوليد التلقائي"
                className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-mono text-left focus:ring-1 focus:ring-gold outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">التصنيف</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white cursor-pointer font-bold focus:ring-1 focus:ring-gold outline-none"
              >
                <option value="">بدون تصنيف محدد</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-darkText mb-1">السعر الأصلي (ر.ع) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-bold text-darkText focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">سعر العرض (ر.ع)</label>
              <input
                type="number"
                step="0.1"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="اختياري"
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-bold text-darkText focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">الكمية بالمخزن *</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-bold text-darkText focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">رمز SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-mono text-left focus:ring-1 focus:ring-gold outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block font-bold text-darkText mb-1">الوصف المختصر</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="وصف سريع يظهر في بطاقة المنتج"
              className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white focus:ring-1 focus:ring-gold outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">الوصف الكامل</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="تفاصيل العطر، النوتات العطرية، وقصة الابتكار"
              className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white resize-none focus:ring-1 focus:ring-gold outline-none"
            />
          </div>

          {/* Image Upload & Live Preview */}
          <div className="p-4 rounded-2xl bg-beige/40 border border-gold/30 space-y-2">
            <label className="block font-bold text-darkText">
              صورة العطر الرئيسية (تظهر في البطاقة والمتجر) *
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-gold/40 bg-white shadow-sm flex items-center justify-center">
                <img
                  src={sanitizeImageUrl(imageUrl)}
                  alt="معاينة العطر"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                  }}
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-gold" />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="رابط مباشر للصورة (URL) أو ارفع من جهازك"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs font-mono text-left focus:ring-1 focus:ring-gold outline-none"
                  dir="ltr"
                />

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-gold" />
                    <span>
                      {uploadingImage ? "جاري الرفع إلى Supabase..." : "رفع من الجهاز إلى Supabase Storage"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <span className="text-[11px] text-darkText/60">
                    PNG أو JPG أو WebP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_best_seller}
                onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                className="w-4 h-4 accent-burgundy"
              />
              <span>الأكثر طلباً ومبيعاً</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                className="w-4 h-4 accent-burgundy"
              />
              <span>منتج جديد</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 accent-burgundy"
              />
              <span>عطر مميز في الواجهة</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 accent-burgundy"
              />
              <span>مفعل بالمتجر</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-graySoft">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>جاري حفظ بيانات وصورة العطر...</span>
                </>
              ) : (
                <span>{isEditing ? "حفظ تعديلات العطر والصورة" : "إضافة وحفظ العطر في المتجر"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl border border-gold/40 text-darkText hover:bg-beige text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
