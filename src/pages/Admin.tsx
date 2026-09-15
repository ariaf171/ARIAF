import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Boxes,
  Tag,
  Image as ImageIcon,
  Star,
  BarChart3,
  MessageCircle,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  ArrowUpDown,
  RefreshCw,
  Lock,
  Mail,
  Landmark,
  Sparkles,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Eye,
  CreditCard,
  MapPin,
  Receipt,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import type {
  Product,
  Category,
  Order,
  Coupon,
  Banner,
  Review,
  Profile,
  UserRoleRecord,
  OrderStatus,
  BankAccount,
} from "../lib/types";
import Logo3D from "../components/Logo3D";
import AdminProductModal from "../components/AdminProductModal";
import AdminReports from "../components/AdminReports";
export default function Admin() {
  const { user, role, isStaff, isAdmin, formatPrice, settings, showToast, reloadSettings, signOut, refreshProfile } = useStore();
  const navigate = useNavigate();

  // Active Sidebar Module
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "products"
    | "categories"
    | "orders"
    | "customers"
    | "inventory"
    | "coupons"
    | "logo"
    | "hero"
    | "banks"
    | "banners"
    | "announcement"
    | "reviews"
    | "reports"
    | "whatsapp"
    | "roles"
    | "settings"
  >("overview");

  // Global Admin Data States
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  // Search/Filter states inside modules
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Logo form state
  const [logoForm, setLogoForm] = useState({
    logo_url: settings.logo?.logo_url || "",
    light_logo_url: settings.logo?.light_logo_url || "",
  });
  const [savingLogo, setSavingLogo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Hero section form state
  const [heroForm, setHeroForm] = useState({
    image_url: settings.hero_section?.image_url || "/images/hero-perfume.jpg",
    badge_text: settings.hero_section?.badge_text || "مجموعة أرياف الفاخرة",
    headline_line1: settings.hero_section?.headline_line1 || "أصالة العود الظفاري",
    headline_line2: settings.hero_section?.headline_line2 || "وفخامة اللبان الحوجري",
    description: settings.hero_section?.description || "نبتكر أندر وأرقى التركيبات العطرية المستوحاة من سحر صلالة وجبال ظفار، لنأخذك في رحلة عطرية فريدة لا تُنسى تليق بذوقك الرفيع.",
    card_title: settings.hero_section?.card_title || "أمير العود",
    card_subtitle: settings.hero_section?.card_subtitle || "خلاصة دهن العود المعتق واللبان الحوجري الفاخر",
    card_origin: settings.hero_section?.card_origin || "ظفار، سلطنة عُمان",
    card_footer_text: settings.hero_section?.card_footer_text || "رشة عطر من صلالة... إلى روحك",
  });
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);

  // Bank Accounts state
  const [bankAccountsList, setBankAccountsList] = useState<BankAccount[]>(settings.bank_accounts || []);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [savingBanks, setSavingBanks] = useState(false);

  // Settings form state
  const [storeSettingsForm, setStoreSettingsForm] = useState({
    store_name_ar: settings.store_name.ar,
    store_name_en: settings.store_name.en,
    whatsapp: settings.whatsapp.number,
    phone: settings.phone.number,
    email: settings.email.email,
    shipping_default: settings.shipping.default,
    shipping_free: settings.shipping.free_shipping_threshold,
  });

  // Announcement bar state
  const [announcementForm, setAnnouncementForm] = useState({
    enabled: settings.announcement_bar?.enabled ?? true,
    text: settings.announcement_bar?.text || "رشة عطر من صلالة... لروحك",
    link: settings.announcement_bar?.link || "/shop",
    bg_color: settings.announcement_bar?.bg_color || "#3B0716",
    text_color: settings.announcement_bar?.text_color || "#FFFDF8",
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings.logo) {
      setLogoForm({
        logo_url: settings.logo.logo_url || "",
        light_logo_url: settings.logo.light_logo_url || "",
      });
    }
    if (settings.hero_section) {
      setHeroForm({
        image_url: settings.hero_section.image_url || "/images/hero-perfume.jpg",
        badge_text: settings.hero_section.badge_text || "مجموعة أرياف الفاخرة",
        headline_line1: settings.hero_section.headline_line1 || "أصالة العود الظفاري",
        headline_line2: settings.hero_section.headline_line2 || "وفخامة اللبان الحوجري",
        description: settings.hero_section.description || "نبتكر أندر وأرقى التركيبات العطرية المستوحاة من سحر صلالة وجبال ظفار، لنأخذك في رحلة عطرية فريدة لا تُنسى تليق بذوقك الرفيع.",
        card_title: settings.hero_section.card_title || "أمير العود",
        card_subtitle: settings.hero_section.card_subtitle || "خلاصة دهن العود المعتق واللبان الحوجري الفاخر",
        card_origin: settings.hero_section.card_origin || "ظفار، سلطنة عُمان",
        card_footer_text: settings.hero_section.card_footer_text || "رشة عطر من صلالة... إلى روحك",
      });
    }
    if (settings.bank_accounts) {
      setBankAccountsList(settings.bank_accounts);
    }
    if (settings.store_name) {
      setStoreSettingsForm({
        store_name_ar: settings.store_name.ar,
        store_name_en: settings.store_name.en,
        whatsapp: settings.whatsapp.number,
        phone: settings.phone.number,
        email: settings.email.email,
        shipping_default: settings.shipping.default,
        shipping_free: settings.shipping.free_shipping_threshold,
      });
    }
    if (settings.announcement_bar) {
      setAnnouncementForm({
        enabled: settings.announcement_bar.enabled ?? true,
        text: settings.announcement_bar.text || "رشة عطر من صلالة... لروحك",
        link: settings.announcement_bar.link || "/shop",
        bg_color: settings.announcement_bar.bg_color || "#3B0716",
        text_color: settings.announcement_bar.text_color || "#FFFDF8",
      });
    }
  }, [settings]);

  // Admin login states for sole admin ariaf@gmail.com
  const [adminEmail, setAdminEmail] = useState("ariaf@gmail.com");
  const [adminPassword, setAdminPassword] = useState("12345678");
  const [authBusy, setAuthBusy] = useState(false);

  // Load All Admin Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, oRes, custRes, coupRes, banRes, revRes, rolRes] =
        await Promise.all([
          supabase
            .from("products")
            .select("*, category:categories(name_ar, name_en), product_images(*), product_variants(*)")
            .order("created_at", { ascending: false }),
          supabase.from("categories").select("*").order("display_order"),
          supabase
            .from("orders")
            .select("*, order_items(*)")
            .order("created_at", { ascending: false }),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("coupons").select("*").order("created_at", { ascending: false }),
          supabase.from("banners").select("*").order("display_order"),
          supabase
            .from("reviews")
            .select("*, product:products(name_ar, name_en)")
            .order("created_at", { ascending: false }),
          supabase.from("user_roles").select("*"),
        ]);

      if (pRes.data) setProducts(pRes.data as Product[]);
      if (cRes.data) setCategories(cRes.data as Category[]);
      if (oRes.data) setOrders(oRes.data as Order[]);
      if (custRes.data) setCustomers(custRes.data as Profile[]);
      if (coupRes.data) setCoupons(coupRes.data as Coupon[]);
      if (banRes.data) setBanners(banRes.data as Banner[]);
      if (revRes.data) setReviews(revRes.data as Review[]);
      if (rolRes.data) setUserRoles(rolRes.data);
    } catch (e) {
      console.error("Admin data load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Set up real-time subscriptions for auto-refresh
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute Overview Analytics
  const analytics = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const today = new Date().toISOString().split("T")[0];
    const todaySales = orders
      .filter((o) => o.created_at?.startsWith(today))
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const lowStockCount = products.filter(
      (p) => p.stock_quantity <= (p.low_stock_threshold || 5)
    ).length;

    return {
      totalSales,
      todaySales,
      ordersCount: orders.length,
      customersCount: customers.length,
      productsCount: products.length,
      lowStockCount,
    };
  }, [orders, products, customers]);

  // Order Status update handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      showToast(`تم تحديث حالة الطلب إلى "${statusLabels[newStatus]?.label}"`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      showToast(err.message || "فشل تحديث الحالة", "error");
    }
  };

  // Review Status update handler
  const handleUpdateReviewStatus = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", reviewId);

      if (error) throw error;
      showToast(`تم ${status === "approved" ? "اعتماد" : "رفض"} التقييم بنجاح`);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
      );
    } catch {
      showToast("فشل تحديث التقييم", "error");
    }
  };

  // Quick Stock adjustment
  const handleQuickStock = async (productId: string, delta: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const newQty = Math.max(0, target.stock_quantity + delta);

    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: newQty })
        .eq("id", productId);

      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock_quantity: newQty } : p))
      );
      showToast("تم تحديث كمية المخزون");
    } catch {
      showToast("فشل تحديث المخزون", "error");
    }
  };

  // Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        supabase
          .from("settings")
          .update({ value: { ar: storeSettingsForm.store_name_ar, en: storeSettingsForm.store_name_en } })
          .eq("key", "store_name"),
        supabase
          .from("settings")
          .update({ value: { number: storeSettingsForm.whatsapp } })
          .eq("key", "whatsapp"),
        supabase
          .from("settings")
          .update({ value: { number: storeSettingsForm.phone } })
          .eq("key", "phone"),
        supabase
          .from("settings")
          .update({ value: { email: storeSettingsForm.email } })
          .eq("key", "email"),
        supabase
          .from("settings")
          .update({
            value: {
              default: Number(storeSettingsForm.shipping_default),
              free_shipping_threshold: Number(storeSettingsForm.shipping_free),
            },
          })
          .eq("key", "shipping"),
      ]);

      showToast("تم حفظ إعدادات المتجر بنجاح");
    } catch {
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error");
    }
  };

  // Save Announcement Bar
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      const payload = {
        enabled: Boolean(announcementForm.enabled),
        text: announcementForm.text.trim(),
        link: announcementForm.link.trim(),
        bg_color: announcementForm.bg_color,
        text_color: announcementForm.text_color,
      };

      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: "announcement_bar",
            value: payload,
            description: "الشريط الإعلاني العلوي",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (error) throw error;
      await reloadSettings();
      showToast("تم تحديث وحفظ الشريط الإعلاني بنجاح، وظهرت التغييرات فوراً!");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ الشريط الإعلاني", "error");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // Quick Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error) throw error;
      showToast("تم تسجيل الدخول بنجاح كمسؤول المتجر");
      if (data.user) {
        await refreshProfile();
        await loadAdminData();
      }
    } catch (err: any) {
      showToast(err.message || "فشل تسجيل الدخول، تأكد من صحة البيانات", "error");
    } finally {
      setAuthBusy(false);
    }
  };

  // Save Logo Settings
  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLogo(true);
    try {
      const payload = {
        logo_url: logoForm.logo_url.trim(),
        light_logo_url: logoForm.light_logo_url.trim(),
      };
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: "logo",
            value: payload,
            description: "شعار المتجر",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      if (error) throw error;
      await reloadSettings();
      showToast("تم تحديث وحفظ شعار المتجر بنجاح في جميع الصفحات!");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ الشعار", "error");
    } finally {
      setSavingLogo(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLight = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `branding/${fileName}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      if (isLight) {
        setLogoForm((prev) => ({ ...prev, light_logo_url: publicUrl }));
      } else {
        setLogoForm((prev) => ({ ...prev, logo_url: publicUrl }));
      }
      showToast("تم رفع صورة الشعار بنجاح");
    } catch (err: any) {
      showToast("فشل رفع الشعار: " + err.message, "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Hero & Ameer Al Oudh Settings
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      const payload = {
        image_url: heroForm.image_url.trim(),
        badge_text: heroForm.badge_text.trim(),
        headline_line1: heroForm.headline_line1.trim(),
        headline_line2: heroForm.headline_line2.trim(),
        description: heroForm.description.trim(),
        card_title: heroForm.card_title.trim(),
        card_subtitle: heroForm.card_subtitle.trim(),
        card_origin: heroForm.card_origin.trim(),
        card_footer_text: heroForm.card_footer_text.trim(),
      };
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: "hero_section",
            value: payload,
            description: "بيانات قسم الهيرو وعطر أمير العود في الصفحة الرئيسية",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      if (error) throw error;
      await reloadSettings();
      showToast("تم حفظ وتحديث واجهة أمير العود والهيرو بنجاح!");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ الهيرو", "error");
    } finally {
      setSavingHero(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImg(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `hero_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `ui/${fileName}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setHeroForm((prev) => ({ ...prev, image_url: publicUrl }));
      showToast("تم رفع صورة عطر أمير العود بنجاح");
    } catch (err: any) {
      showToast("فشل رفع الصورة: " + err.message, "error");
    } finally {
      setUploadingHeroImg(false);
    }
  };

  // Bank Accounts Handlers
  const handleSaveBank = async (bankData: BankAccount) => {
    setSavingBanks(true);
    try {
      let updated: BankAccount[];
      const exists = bankAccountsList.some((b) => b.id === bankData.id);
      if (exists) {
        updated = bankAccountsList.map((b) => (b.id === bankData.id ? bankData : b));
      } else {
        updated = [...bankAccountsList, bankData];
      }
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: "bank_accounts",
            value: updated,
            description: "قائمة الحسابات البنكية العمانية للمتجر",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      if (error) throw error;
      setBankAccountsList(updated);
      await reloadSettings();
      setShowBankModal(false);
      setEditingBank(null);
      showToast("تم حفظ الحساب البنكي بنجاح");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ الحساب البنكي", "error");
    } finally {
      setSavingBanks(false);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب البنكي؟")) return;
    setSavingBanks(true);
    try {
      const updated = bankAccountsList.filter((b) => b.id !== id);
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: "bank_accounts",
            value: updated,
            description: "قائمة الحسابات البنكية العمانية للمتجر",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      if (error) throw error;
      setBankAccountsList(updated);
      await reloadSettings();
      showToast("تم حذف الحساب البنكي بنجاح");
    } catch (err: any) {
      showToast(err.message || "فشل حذف الحساب البنكي", "error");
    } finally {
      setSavingBanks(false);
    }
  };

  const handleToggleBankActive = async (id: string, currentState: boolean) => {
    setSavingBanks(true);
    try {
      const updated = bankAccountsList.map((b) =>
        b.id === id ? { ...b, is_active: !currentState } : b
      );
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            key: "bank_accounts",
            value: updated,
            description: "قائمة الحسابات البنكية العمانية للمتجر",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      if (error) throw error;
      setBankAccountsList(updated);
      await reloadSettings();
      showToast(`تم ${!currentState ? "تفعيل" : "تعطيل"} الحساب البنكي`);
    } catch (err: any) {
      showToast("حدث خطأ أثناء تحديث حالة الحساب", "error");
    } finally {
      setSavingBanks(false);
    }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "bg-blue-100 text-blue-800" },
    contacted: { label: "تم التواصل", color: "bg-amber-100 text-amber-800" },
    processing: { label: "قيد التجهيز", color: "bg-purple-100 text-purple-800" },
    shipped: { label: "تم الشحن", color: "bg-indigo-100 text-indigo-800" },
    delivered: { label: "تم التسليم", color: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
  };

  const navMenuItems = [
    { id: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "products", label: "المنتجات", icon: Package },
    { id: "categories", label: "التصنيفات", icon: FolderTree },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
    { id: "customers", label: "العملاء", icon: Users },
    { id: "inventory", label: "المخزون", icon: Boxes },
    { id: "coupons", label: "العروض والكوبونات", icon: Tag },
    { id: "logo", label: "شعار المتجر", icon: Sparkles },
    { id: "hero", label: "أمير العود والواجهة", icon: Layers },
    { id: "banks", label: "الحسابات البنكية", icon: Landmark },
    { id: "announcement", label: "الشريط الإعلاني", icon: Megaphone },
    { id: "banners", label: "البانرات", icon: ImageIcon },
    { id: "reviews", label: "التقييمات", icon: Star },
    { id: "reports", label: "التقارير", icon: BarChart3 },
    { id: "whatsapp", label: "إعدادات واتساب", icon: MessageCircle },
    { id: "roles", label: "المستخدمين والصلاحيات", icon: ShieldCheck },
    { id: "settings", label: "الإعدادات العامة", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col pt-16">
      {/* Admin Bar */}
      <div className="bg-burgundy-dark text-cream px-6 py-3 border-b border-gold/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-cream font-alexandria">أرياف</span>
            <span className="text-xs text-gold font-serif">ARAYAF ADMIN</span>
          </Link>
          <span className="text-xs text-gold/60">|</span>
          <span className="text-xs text-cream/80">لوحة الإدارة الشاملة</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-burgundy/80 border border-gold/30 text-gold-soft">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[11px]">{user.email}</span>
            </div>
          )}
          <button
            onClick={loadAdminData}
            className="flex items-center gap-1 text-gold-soft hover:text-white"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
          <Link to="/" className="text-cream/80 hover:text-gold">
            زيارة المتجر ↗
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-1 text-red-300 hover:text-red-100 pr-2 border-r border-gold/30"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            <span className="text-xs text-darkText/60 font-semibold">جارِ تحميل لوحة الإدارة...</span>
          </div>
        </div>
      ) : !user || !isStaff ? (
        <div className="flex-1 flex items-center justify-center p-6 my-auto">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gold/30 shadow-luxury space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <Logo3D size="lg" />
              </div>
              <h2 className="text-2xl font-black text-burgundy font-alexandria">
                تسجيل الدخول إلى لوحة الإدارة
              </h2>
              <p className="text-xs text-darkText/60">
                أدخل بيانات حساب الإدارة المعتمد للوصول إلى لوحة التحكم والتحكم في المتجر.
              </p>
            </div>

            {user && !isStaff && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
                <p className="font-bold">تنبيه: الحساب الحالي ({user.email}) لا يملك صلاحيات الإدارة.</p>
                <p>
                  يرجى تسجيل الخروج والدخول بحساب الإدارة المعتمد الوحيد:{" "}
                  <span className="font-mono font-bold">ariaf@gmail.com</span>
                </p>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full py-2 rounded-lg bg-red-600 text-white font-bold text-xs"
                >
                  تسجيل الخروج من الحساب الحالي
                </button>
              </div>
            )}

            {(!user || !isStaff) && (
              <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-darkText mb-1">البريد الإلكتروني للإدارة</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="ariaf@gmail.com"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gold/30 bg-cream font-mono text-left"
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-gold absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-darkText mb-1">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gold/30 bg-cream font-mono text-left"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-gold absolute right-3 top-3.5" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-[11px] text-[#8C6721] space-y-1">
                  <span className="font-bold block">بيانات المشرف المعتمد الوحيد:</span>
                  <div className="flex justify-between items-center font-mono">
                    <span>{adminEmail}</span>
                    <span>12345678</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authBusy ? "جارِ التحقق والدخول..." : "تسجيل الدخول إلى لوحة التحكم"}
                </button>

                <div className="text-center pt-2">
                  <Link to="/" className="text-xs text-darkText/60 hover:text-burgundy">
                    ← العودة إلى المتجر الرئيسي
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Admin Luxury Sidebar */}
          <aside className="w-full lg:w-64 bg-[#3B0716] text-cream p-4 border-l border-gold/20 flex flex-col justify-between shrink-0">
            <div className="space-y-1">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${active
                        ? "bg-gold text-burgundy-dark shadow-sm"
                        : "text-cream/80 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-burgundy-dark" : "text-gold"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gold/20 mt-6 text-[11px] text-cream/50 text-center">
              أرياف ARAYAF v1.0 • Supabase Live
            </div>
          </aside>

          {/* Admin Content Viewport */}
          <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* 1. OVERVIEW / DASHBOARD */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <h1 className="text-2xl font-black text-burgundy font-alexandria">
                  نظرة عامة على أداء المتجر
                </h1>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white rounded-2xl p-5 border border-gold/25 shadow-card">
                    <span className="text-xs text-darkText/60 block font-bold">إجمالي المبيعات</span>
                    <span className="text-2xl font-black text-burgundy mt-1 block">
                      {formatPrice(analytics.totalSales)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-2 inline-block">
                      مبيعات اليوم: {formatPrice(analytics.todaySales)}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gold/25 shadow-card">
                    <span className="text-xs text-darkText/60 block font-bold">إجمالي الطلبات</span>
                    <span className="text-2xl font-black text-burgundy mt-1 block">
                      {analytics.ordersCount} طلب
                    </span>
                    <span className="text-[10px] text-darkText/50 mt-2 inline-block">
                      جميع الحالات المسجلة
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gold/25 shadow-card">
                    <span className="text-xs text-darkText/60 block font-bold">العملاء المسجلين</span>
                    <span className="text-2xl font-black text-burgundy mt-1 block">
                      {analytics.customersCount} عميل
                    </span>
                    <span className="text-[10px] text-gold-dark font-bold mt-2 inline-block">
                      قاعدة عملاء النخبة
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gold/25 shadow-card">
                    <span className="text-xs text-darkText/60 block font-bold">تنبيهات المخزون المنخفض</span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">
                      {analytics.lowStockCount} منتج
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold mt-2 inline-block">
                      أقل من 5 قطع بالمستودع
                    </span>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card">
                  <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-4">
                    <h3 className="text-base font-bold text-burgundy">أحدث الطلبات الواردة</h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-gold-dark hover:underline"
                    >
                      عرض جميع الطلبات ←
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="text-darkText/60 border-b border-graySoft pb-2">
                          <th className="py-2">رقم الطلب</th>
                          <th>العميل</th>
                          <th>المدينة</th>
                          <th>المبلغ</th>
                          <th>الحالة</th>
                          <th>التاريخ</th>
                          <th>الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-graySoft">
                        {orders.slice(0, 5).map((o) => {
                          const st = statusLabels[o.status] || {
                            label: o.status,
                            color: "bg-gray-100",
                          };
                          return (
                            <tr key={o.id} className="hover:bg-beige/30">
                              <td className="py-3 font-mono font-bold text-burgundy">
                                {o.order_number}
                              </td>
                              <td className="font-bold">{o.customer_name}</td>
                              <td>{o.city}</td>
                              <td className="font-bold">{formatPrice(o.total_amount)}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>
                                  {st.label}
                                </span>
                              </td>
                              <td className="text-darkText/60">
                                {new Date(o.created_at).toLocaleDateString("ar-SA")}
                              </td>
                              <td>
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="text-gold-dark font-bold hover:underline"
                                >
                                  معاينة
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS MANAGEMENT */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h1 className="text-2xl font-black text-burgundy">إدارة العطور والمنتجات</h1>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-burgundy text-cream text-xs font-bold flex items-center gap-2 shadow-gold"
                  >
                    <Plus className="w-4 h-4 text-gold" />
                    <span>إضافة عطر جديد</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">العطر</th>
                        <th>التصنيف</th>
                        <th>السعر</th>
                        <th>المخزون</th>
                        <th>التقييم</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-beige/30">
                          <td className="py-3 flex items-center gap-3">
                            <img
                              src={
                                p.product_images?.[0]?.image_url ||
                                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=150&q=80"
                              }
                              alt=""
                              className="w-10 h-10 object-contain rounded-lg bg-beige/40 p-1"
                            />
                            <div>
                              <p className="font-bold text-darkText">{p.name_ar}</p>
                              <p className="text-[10px] text-darkText/50 font-serif">{p.name_en}</p>
                            </div>
                          </td>
                          <td>{p.category?.name_ar || "-"}</td>
                          <td className="font-bold text-burgundy">
                            {formatPrice(p.sale_price ?? p.price)}
                          </td>
                          <td>
                            <span
                              className={`font-bold ${p.stock_quantity <= p.low_stock_threshold
                                  ? "text-red-600"
                                  : "text-emerald-700"
                                }`}
                            >
                              {p.stock_quantity} قطعة
                            </span>
                          </td>
                          <td>★ {p.average_rating || 5.0}</td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                }`}
                            >
                              {p.is_active ? "نشط" : "معطل"}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setShowProductModal(true);
                                }}
                                className="p-1.5 text-gold-dark hover:bg-beige rounded-lg"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. CATEGORIES MANAGEMENT */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-burgundy">إدارة التصنيفات</h1>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setShowCategoryModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-burgundy text-cream text-xs font-bold flex items-center gap-2 shadow-gold"
                  >
                    <Plus className="w-4 h-4 text-gold" />
                    <span>إضافة تصنيف</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-3xl p-5 border border-gold/25 shadow-card"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={c.image_url || ""}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-gold/20"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-burgundy">{c.name_ar}</h4>
                          <p className="text-[10px] text-darkText/60 font-serif">{c.name_en}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {c.is_active ? "فعال" : "معطل"} • ترتيب: {c.display_order}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingCategory(c); setShowCategoryModal(true); }}
                            className="p-1.5 rounded-lg text-gold-dark hover:bg-beige transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
                              const { error } = await supabase.from("categories").delete().eq("id", c.id);
                              if (error) { showToast("فشل حذف التصنيف", "error"); return; }
                              setCategories((prev) => prev.filter((cat) => cat.id !== c.id));
                              showToast("تم حذف التصنيف بنجاح");
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Modal */}
                {showCategoryModal && (
                  <CategoryModal
                    category={editingCategory}
                    onClose={() => setShowCategoryModal(false)}
                    onSaved={(saved: Category) => {
                      if (editingCategory) {
                        setCategories((prev) => prev.map((c) => c.id === saved.id ? saved : c));
                      } else {
                        setCategories((prev) => [...prev, saved]);
                      }
                      setShowCategoryModal(false);
                      showToast(editingCategory ? "تم تحديث التصنيف بنجاح" : "تم إضافة التصنيف بنجاح");
                    }}
                  />
                )}
              </div>
            )}

            {/* 4. ORDERS MANAGEMENT */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h1 className="text-2xl font-black text-burgundy">إدارة الطلبات والمبيعات</h1>

                  <div className="flex items-center gap-2">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs font-bold text-burgundy cursor-pointer"
                    >
                      <option value="all">كافة الحالات</option>
                      <option value="new">جديد</option>
                      <option value="contacted">تم التواصل</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">رقم الطلب</th>
                        <th>العميل</th>
                        <th>الهاتف</th>
                        <th>المدينة</th>
                        <th>المبلغ</th>
                        <th>طريقة الدفع</th>
                        <th>الحالة</th>
                        <th>تحديث الحالة</th>
                        <th>تفاصيل</th>
                        <th>واتساب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {orders
                        .filter((o) =>
                          orderStatusFilter === "all" ? true : o.status === orderStatusFilter
                        )
                        .map((o) => {
                          const st = statusLabels[o.status] || {
                            label: o.status,
                            color: "bg-gray-100",
                          };
                          return (
                            <tr key={o.id} className="hover:bg-beige/30">
                              <td className="py-3 font-mono font-bold text-burgundy">
                                {o.order_number}
                              </td>
                              <td className="font-bold">
                                <div className="flex items-center gap-1.5">
                                  <span>{o.customer_name}</span>
                                  {o.latitude && (
                                    <span title="محدد بواسطة GPS" className="text-emerald-600">
                                      <MapPin className="w-3.5 h-3.5 inline" />
                                    </span>
                                  )}
                                  {(o.receipt_image_url || o.transfer_reference_number) && (
                                    <span title="مرفق إشعار تحويل بنكي" className="text-amber-600">
                                      <Receipt className="w-3.5 h-3.5 inline" />
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td dir="ltr" className="text-left font-mono">
                                {o.customer_phone}
                              </td>
                              <td>{o.city}</td>
                              <td className="font-bold text-burgundy">{formatPrice(o.total_amount)}</td>
                              <td>{o.payment_method}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>
                                  {st.label}
                                </span>
                              </td>
                              <td>
                                <select
                                  value={o.status}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)
                                  }
                                  className="px-2 py-1 rounded-lg border border-gold/30 bg-cream text-[11px] font-bold cursor-pointer"
                                >
                                  <option value="new">جديد</option>
                                  <option value="contacted">تم التواصل</option>
                                  <option value="processing">قيد التجهيز</option>
                                  <option value="shipped">تم الشحن</option>
                                  <option value="delivered">تم التسليم</option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                              </td>
                              <td>
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="p-1.5 text-burgundy hover:bg-gold/20 rounded-lg inline-flex items-center gap-1 font-bold text-[11px]"
                                  title="معاينة تفاصيل الطلب والإشعار والموقع"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>عرض</span>
                                </button>
                              </td>
                              <td>
                                <a
                                  href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                    `السلام عليكم أخي ${o.customer_name}، نتواصل معك بخصوص طلبك من أرياف رقم: ${o.order_number}`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg inline-block"
                                  title="مراسلة العميل"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. CUSTOMERS */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-burgundy">دليل العملاء المسجلين</h1>
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>رقم الهاتف</th>
                        <th>المدينة</th>
                        <th>تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-beige/30">
                          <td className="py-3 font-bold text-burgundy">{c.full_name || "عميل"}</td>
                          <td dir="ltr" className="text-left font-mono">
                            {c.email || "-"}
                          </td>
                          <td dir="ltr" className="text-left font-mono">
                            {c.phone || "-"}
                          </td>
                          <td>{c.city || "-"}</td>
                          <td className="text-darkText/60">
                            {new Date(c.created_at || "").toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. INVENTORY */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-burgundy">المخزون والمستودع</h1>
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">العطر</th>
                        <th>الرمز (SKU)</th>
                        <th>الكمية المتوفرة</th>
                        <th>حد التنبيه</th>
                        <th>الحالة</th>
                        <th>تعديل سريع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {products.map((p) => {
                        const isLow = p.stock_quantity <= p.low_stock_threshold;
                        const isOut = p.stock_quantity === 0;
                        return (
                          <tr key={p.id} className="hover:bg-beige/30">
                            <td className="py-3 font-bold text-burgundy">{p.name_ar}</td>
                            <td className="font-mono">{p.sku || "-"}</td>
                            <td className="font-black text-sm">{p.stock_quantity}</td>
                            <td>{p.low_stock_threshold}</td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isOut
                                    ? "bg-red-100 text-red-800"
                                    : isLow
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                              >
                                {isOut ? "نفد المخزون" : isLow ? "مخزون حرج" : "متوفر"}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleQuickStock(p.id, 5)}
                                  className="px-2 py-1 rounded bg-beige hover:bg-gold hover:text-burgundy-dark font-bold text-[10px]"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleQuickStock(p.id, -1)}
                                  className="px-2 py-1 rounded bg-beige hover:bg-red-100 text-red-700 font-bold text-[10px]"
                                >
                                  -1
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. COUPONS */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-burgundy">العروض وكوبونات الخصم</h1>
                  <button
                    onClick={() => { setEditingCoupon(null); setShowCouponModal(true); }}
                    className="px-4 py-2.5 rounded-xl bg-burgundy text-cream text-xs font-bold flex items-center gap-2 shadow-gold"
                  >
                    <Plus className="w-4 h-4 text-gold" />
                    <span>إضافة كوبون</span>
                  </button>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">الكود</th>
                        <th>الوصف</th>
                        <th>النوع</th>
                        <th>قيمة الخصم</th>
                        <th>الحد الأدنى</th>
                        <th>مرات الاستخدام</th>
                        <th>الحالة</th>
                        <th>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {coupons.map((c) => (
                        <tr key={c.id} className="hover:bg-beige/30">
                          <td className="py-3 font-mono font-black text-burgundy text-sm">{c.code}</td>
                          <td>{c.description}</td>
                          <td>{c.discount_type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}</td>
                          <td className="font-bold">
                            {c.discount_type === "percentage"
                              ? `${c.discount_value}%`
                              : formatPrice(c.discount_value)}
                          </td>
                          <td>{formatPrice(c.minimum_order_amount || 0)}</td>
                          <td>{c.usage_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</td>
                          <td>
                            <button
                              onClick={async () => {
                                const newActive = !c.is_active;
                                const { error } = await supabase.from("coupons").update({ is_active: newActive }).eq("id", c.id);
                                if (error) { showToast("فشل تحديث الحالة", "error"); return; }
                                setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, is_active: newActive } : x));
                                showToast(newActive ? "تم تفعيل الكوبون" : "تم تعطيل الكوبون");
                              }}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                }`}
                            >
                              {c.is_active ? "فعال" : "معطل"}
                            </button>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setEditingCoupon(c); setShowCouponModal(true); }}
                                className="p-1.5 rounded-lg text-gold-dark hover:bg-beige transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
                                  const { error } = await supabase.from("coupons").delete().eq("id", c.id);
                                  if (error) { showToast("فشل حذف الكوبون", "error"); return; }
                                  setCoupons((prev) => prev.filter((x) => x.id !== c.id));
                                  showToast("تم حذف الكوبون بنجاح");
                                }}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Coupon Modal */}
                {showCouponModal && (
                  <CouponModal
                    coupon={editingCoupon}
                    onClose={() => setShowCouponModal(false)}
                    onSaved={(saved: Coupon) => {
                      if (editingCoupon) {
                        setCoupons((prev) => prev.map((c) => c.id === saved.id ? saved : c));
                      } else {
                        setCoupons((prev) => [saved, ...prev]);
                      }
                      setShowCouponModal(false);
                      showToast(editingCoupon ? "تم تحديث الكوبون بنجاح" : "تم إضافة الكوبون بنجاح");
                    }}
                  />
                )}
              </div>
            )}

            {/* 7.1. STORE LOGO MANAGEMENT */}
            {activeTab === "logo" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-burgundy font-alexandria">
                      تخصيص شعار المتجر (Store Logo)
                    </h1>
                    <p className="text-xs text-darkText/60 mt-1">
                      تغيير صورة الشعار لتظهر فوراً عبر كامل صفحات المتجر (الهيدر، الفوتر، واجهة الهيرو، وشاشة الدخول).
                    </p>
                  </div>

                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gold/40 text-burgundy text-xs font-bold hover:bg-beige transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <span>معاينة في المتجر</span>
                    <span>↗</span>
                  </a>
                </div>

                {/* Live Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dark Theme Header Preview */}
                  <div className="bg-burgundy-dark rounded-3xl p-6 border border-gold/40 shadow-xl text-center space-y-3">
                    <span className="text-[11px] font-bold text-gold-soft block">معاينة الشعار على الخلفية الداكنة (الهيدر والفوتر)</span>
                    <div className="py-8 flex justify-center items-center">
                      {logoForm.logo_url ? (
                        <img
                          src={logoForm.logo_url}
                          alt="معاينة الشعار"
                          className="max-h-24 max-w-full object-contain filter drop-shadow-md"
                        />
                      ) : (
                        <Logo3D size="lg" />
                      )}
                    </div>
                    <p className="text-[10px] text-cream/60">
                      {logoForm.logo_url ? "يتم استخدام صورة الشعار المخصصة" : "يتم استخدام الشعار ثلاثي الأبعاد المدمج"}
                    </p>
                  </div>

                  {/* Light Theme / Cream Preview */}
                  <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-gold/40 shadow-card text-center space-y-3">
                    <span className="text-[11px] font-bold text-burgundy block">معاينة الشعار على الخلفية الفاتحة (صفحات الدخول)</span>
                    <div className="py-8 flex justify-center items-center">
                      {logoForm.light_logo_url || logoForm.logo_url ? (
                        <img
                          src={logoForm.light_logo_url || logoForm.logo_url}
                          alt="معاينة الشعار الفاتح"
                          className="max-h-24 max-w-full object-contain filter drop-shadow-sm"
                        />
                      ) : (
                        <Logo3D size="lg" />
                      )}
                    </div>
                    <p className="text-[10px] text-darkText/60">
                      {logoForm.light_logo_url ? "شعار مخصص للخلفيات الفاتحة" : "يتم استخدام الشعار الأساسي"}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-card">
                  <form onSubmit={handleSaveLogo} className="space-y-6 text-xs">
                    {/* Main Logo URL / Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-darkText">
                        صورة الشعار الأساسية (للخلفيات الداكنة والوضع العام)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoForm.logo_url}
                          onChange={(e) => setLogoForm({ ...logoForm, logo_url: e.target.value })}
                          placeholder="مثال: /images/logo.png أو رابط صورة مباشر"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-mono text-xs focus:outline-none focus:border-burgundy"
                          dir="ltr"
                        />
                        {logoForm.logo_url && (
                          <button
                            type="button"
                            onClick={() => setLogoForm({ ...logoForm, logo_url: "" })}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                          >
                            مسح
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-beige border border-gold/30 hover:bg-gold hover:text-burgundy-dark font-bold text-xs transition-colors shadow-2xs">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingLogo ? "جاري رفع الشعار..." : "رفع صورة الشعار من الجهاز (Supabase Storage)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, false)}
                            className="hidden"
                            disabled={uploadingLogo}
                          />
                        </label>
                        <span className="text-[11px] text-darkText/50">يُفضل استخدام صورة بصيغة PNG وبخلفية شفافة</span>
                      </div>
                    </div>

                    {/* Light Logo URL / Upload (Optional) */}
                    <div className="space-y-2 pt-2 border-t border-graySoft">
                      <label className="block font-bold text-darkText">
                        صورة الشعار للوضع الفاتح (اختياري)
                      </label>
                      <input
                        type="text"
                        value={logoForm.light_logo_url}
                        onChange={(e) => setLogoForm({ ...logoForm, light_logo_url: e.target.value })}
                        placeholder="اتركه فارغاً لاستخدام نفس الشعار الأساسي"
                        className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-mono text-xs focus:outline-none focus:border-burgundy"
                        dir="ltr"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-graySoft">
                      <button
                        type="submit"
                        disabled={savingLogo}
                        className="flex-1 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-colors disabled:opacity-50"
                      >
                        {savingLogo ? "جاري حفظ الشعار..." : "حفظ الشعار وتطبيقه في جميع الصفحات"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 7.2. HERO & AMEER AL OUDH MANAGEMENT */}
            {activeTab === "hero" && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-burgundy font-alexandria">
                      تخصيص واجهة الهيرو وبطاقة أمير العود الملكية
                    </h1>
                    <p className="text-xs text-darkText/60 mt-1">
                      تحكم في الصورة الرئيسية، النصوص الترويجية، وعناصر بطاقة عطر أمير العود في الصفحة الرئيسية.
                    </p>
                  </div>

                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gold/40 text-burgundy text-xs font-bold hover:bg-beige transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <span>معاينة في المتجر</span>
                    <span>↗</span>
                  </a>
                </div>

                {/* Live Preview of the Hero Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2D0A14] via-[#1F070E] to-[#120307] border border-gold/40 shadow-2xl text-cream space-y-4">
                  <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                    <span className="text-xs font-bold text-gold-soft flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span>المعاينة الحية لبطاقة أمير العود (Live Card Preview)</span>
                    </span>
                    <span className="text-[11px] text-cream/50">تتحدث تلقائياً مع الكتابة</span>
                  </div>

                  <div className="max-w-md mx-auto relative rounded-3xl p-5 border border-gold/30 bg-black/40 backdrop-blur-md shadow-luxury text-center space-y-3">
                    <div className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold-soft text-[11px] font-bold border border-gold/30">
                      {heroForm.badge_text || "مجموعة أرياف الفاخرة"}
                    </div>
                    <h2 className="text-xl font-bold font-alexandria text-gold-light">
                      {heroForm.headline_line1} <br />
                      <span className="text-cream">{heroForm.headline_line2}</span>
                    </h2>

                    {/* Perfume Card Preview */}
                    <div className="relative rounded-2xl overflow-hidden border border-gold/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 mt-4">
                      <img
                        src={heroForm.image_url}
                        alt="معاينة أمير العود"
                        className="w-full h-48 object-cover rounded-xl mx-auto shadow-inner"
                      />
                      <div className="mt-3 text-right">
                        <span className="text-[10px] text-gold-soft font-bold block">{heroForm.card_origin}</span>
                        <h3 className="text-lg font-black text-cream font-alexandria">{heroForm.card_title}</h3>
                        <p className="text-xs text-cream/80 line-clamp-2 mt-1">{heroForm.card_subtitle}</p>
                        <div className="mt-3 pt-2 border-t border-gold/20 flex items-center justify-between">
                          <span className="text-[11px] text-gold font-serif italic">"{heroForm.card_footer_text}"</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold text-burgundy-dark font-bold">صلالة، عمان</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-card">
                  <form onSubmit={handleSaveHero} className="space-y-6 text-xs">
                    {/* Perfume Image */}
                    <div className="space-y-2">
                      <label className="block font-bold text-darkText">
                        صورة عطر أمير العود والواجهة الرئيسية (Hero Perfume Image) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={heroForm.image_url}
                          onChange={(e) => setHeroForm({ ...heroForm, image_url: e.target.value })}
                          placeholder="مثال: /images/hero-perfume.jpg أو رابط مباشر"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-mono text-xs focus:outline-none focus:border-burgundy"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-beige border border-gold/30 hover:bg-gold hover:text-burgundy-dark font-bold text-xs transition-colors shadow-2xs">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingHeroImg ? "جاري رفع الصورة..." : "رفع صورة من الجهاز إلى Supabase Storage"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageUpload}
                            className="hidden"
                            disabled={uploadingHeroImg}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Headlines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-darkText mb-1">شارة التميز العلوية (Badge)</label>
                        <input
                          type="text"
                          value={heroForm.badge_text}
                          onChange={(e) => setHeroForm({ ...heroForm, badge_text: e.target.value })}
                          placeholder="مجموعة أرياف الفاخرة"
                          className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-darkText mb-1">مصدر ومنشأ العطر (Origin)</label>
                        <input
                          type="text"
                          value={heroForm.card_origin}
                          onChange={(e) => setHeroForm({ ...heroForm, card_origin: e.target.value })}
                          placeholder="ظفار، سلطنة عُمان"
                          className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-darkText mb-1">العنوان الرئيسي (السطر الأول)</label>
                        <input
                          type="text"
                          value={heroForm.headline_line1}
                          onChange={(e) => setHeroForm({ ...heroForm, headline_line1: e.target.value })}
                          placeholder="أصالة العود الظفاري"
                          className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-darkText mb-1">العنوان الرئيسي (السطر الثاني)</label>
                        <input
                          type="text"
                          value={heroForm.headline_line2}
                          onChange={(e) => setHeroForm({ ...heroForm, headline_line2: e.target.value })}
                          placeholder="وفخامة اللبان الحوجري"
                          className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-darkText mb-1">النص الوصفي للعلامة التجارية في الهيرو</label>
                      <textarea
                        rows={2}
                        value={heroForm.description}
                        onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                        placeholder="نبتكر أندر وأرقى التركيبات العطرية المستوحاة من سحر صلالة وجبال ظفار..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream resize-none"
                      />
                    </div>

                    {/* Ameer Al Oudh Card Specifics */}
                    <div className="p-4 rounded-2xl bg-beige/40 border border-gold/30 space-y-4">
                      <h4 className="font-bold text-burgundy text-sm">بيانات بطاقة عطر "أمير العود" المميزة</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-darkText mb-1">اسم العطر في البطاقة</label>
                          <input
                            type="text"
                            value={heroForm.card_title}
                            onChange={(e) => setHeroForm({ ...heroForm, card_title: e.target.value })}
                            placeholder="أمير العود"
                            className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-darkText mb-1">العبارة الختامية بالبطاقة</label>
                          <input
                            type="text"
                            value={heroForm.card_footer_text}
                            onChange={(e) => setHeroForm({ ...heroForm, card_footer_text: e.target.value })}
                            placeholder="رشة عطر من صلالة... إلى روحك"
                            className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-white font-serif"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-darkText mb-1">الوصف الفرعي ومكونات عطر البطاقة</label>
                        <input
                          type="text"
                          value={heroForm.card_subtitle}
                          onChange={(e) => setHeroForm({ ...heroForm, card_subtitle: e.target.value })}
                          placeholder="خلاصة دهن العود المعتق واللبان الحوجري الفاخر"
                          className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-graySoft">
                      <button
                        type="submit"
                        disabled={savingHero}
                        className="flex-1 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-colors disabled:opacity-50"
                      >
                        {savingHero ? "جاري حفظ وتحديث الهيرو..." : "حفظ التغييرات وتحديث واجهة أمير العود فوراً"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 7.3. STORE BANK ACCOUNTS MANAGEMENT */}
            {activeTab === "banks" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-burgundy font-alexandria">
                      الحسابات البنكية العمانية للمتجر
                    </h1>
                    <p className="text-xs text-darkText/60 mt-1">
                      إدارة البنوك العمانية (بنك مسقط، بنك ظفار، بنك نزوى، صحار الدولي، إلخ) الظاهرة للعملاء في صفحة إتمام الطلب للتحويل المباشر.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingBank(null);
                      setShowBankModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-burgundy text-cream font-bold text-xs flex items-center gap-2 shadow-gold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة حساب بنكي جديد</span>
                  </button>
                </div>

                {/* Bank Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bankAccountsList.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gold/25 p-8 text-darkText/50">
                      <Landmark className="w-12 h-12 mx-auto text-gold mb-3 opacity-60" />
                      <p className="font-bold text-burgundy">لا توجد حسابات بنكية مضافة حالياً</p>
                      <p className="text-xs mt-1">انقر على زر "إضافة حساب بنكي جديد" لإضافة بيانات البنك الخاص بك.</p>
                    </div>
                  ) : (
                    bankAccountsList.map((bank) => (
                      <div
                        key={bank.id}
                        className={`rounded-3xl p-6 border transition-all duration-300 relative shadow-card ${bank.is_active
                            ? "bg-white border-gold/40 hover:shadow-luxury"
                            : "bg-gray-50/80 border-gray-200 opacity-60"
                          }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-cream border border-gold/30 p-2 flex items-center justify-center flex-shrink-0 shadow-xs">
                              {bank.bank_logo_url ? (
                                <img
                                  src={bank.bank_logo_url}
                                  alt={bank.bank_name_ar}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Landmark className="w-6 h-6 text-burgundy" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-black text-sm text-burgundy">{bank.bank_name_ar}</h3>
                              <p className="text-[10px] text-darkText/60 font-serif">{bank.bank_name_en}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bank.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {bank.is_active ? "نشط" : "معطل"}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2.5 text-xs bg-cream/50 rounded-2xl p-4 border border-gold/20">
                          <div>
                            <span className="text-[10px] text-darkText/60 block">اسم صاحب الحساب:</span>
                            <span className="font-bold text-darkText">{bank.account_name}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-darkText/60 block">رقم الحساب:</span>
                            <span className="font-mono font-bold text-burgundy" dir="ltr">
                              {bank.account_number}
                            </span>
                          </div>

                          {bank.iban && (
                            <div>
                              <span className="text-[10px] text-darkText/60 block">رقم الآيبان (IBAN):</span>
                              <span className="font-mono text-[11px] text-darkText font-bold break-all" dir="ltr">
                                {bank.iban}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-graySoft">
                          <button
                            onClick={() => handleToggleBankActive(bank.id, bank.is_active)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-colors ${bank.is_active
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                          >
                            {bank.is_active ? "تعطيل" : "تفعيل"}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingBank(bank);
                                setShowBankModal(true);
                              }}
                              className="p-2 rounded-xl text-gold-dark hover:bg-beige transition-colors"
                              title="تعديل الحساب"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBank(bank.id)}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bank Modal */}
                {showBankModal && (
                  <BankModal
                    bank={editingBank}
                    onClose={() => {
                      setShowBankModal(false);
                      setEditingBank(null);
                    }}
                    onSave={handleSaveBank}
                  />
                )}
              </div>
            )}

            {/* 7.5. ANNOUNCEMENT BAR */}
            {activeTab === "announcement" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-burgundy font-alexandria">
                      إدارة وتخصيص الشريط الإعلاني العلوي
                    </h1>
                    <p className="text-xs text-darkText/60 mt-1">
                      تحكم كامل في ظهور ونصوص وألوان الشريط الإعلاني الظاهر أعلى الموقع مباشرة.
                    </p>
                  </div>

                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gold/40 text-burgundy text-xs font-bold hover:bg-beige transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <span>معاينة في المتجر</span>
                    <span>↗</span>
                  </a>
                </div>

                {/* Live Interactive Preview Box */}
                <div className="bg-white rounded-3xl p-6 border border-gold/30 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-darkText/80 flex items-center gap-2">
                      <span>المعاينة الحية (Live Preview):</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${announcementForm.enabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {announcementForm.enabled ? "ظاهر ونشط حالياً" : "معطّل ومخفي"}
                      </span>
                    </span>
                    <span className="text-[11px] text-darkText/40">كما يظهر للزوار أعلى المتجر تماماً</span>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-gold/25 shadow-inner">
                    {announcementForm.enabled ? (
                      <div
                        style={{
                          backgroundColor: announcementForm.bg_color,
                          color: announcementForm.text_color,
                        }}
                        className="w-full py-2.5 px-4 text-center text-xs font-semibold tracking-wide transition-colors duration-200"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{announcementForm.text || "اكتب نص الإعلان هنا..."}</span>
                          {announcementForm.link && (
                            <span className="text-[10px] opacity-75 underline">({announcementForm.link})</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full py-5 text-center text-xs text-darkText/40 bg-gray-50 italic">
                        الشريط الإعلاني معطّل ولن يظهر للزوار في الوقت الحالي
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-card">
                  <form onSubmit={handleSaveAnnouncement} className="space-y-6 text-xs">
                    {/* Toggle Enabled */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-gold/25">
                      <div>
                        <h4 className="font-bold text-sm text-burgundy">تفعيل ظهور الشريط الإعلاني</h4>
                        <p className="text-[11px] text-darkText/60 mt-0.5">
                          عند التفعيل، سيظهر الشريط أعلى الهيدر في كافة صفحات المتجر تلقائياً.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announcementForm.enabled}
                          onChange={(e) =>
                            setAnnouncementForm({ ...announcementForm, enabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Announcement Text */}
                    <div>
                      <label className="block font-bold text-darkText mb-1.5">
                        نص الإعلان <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={announcementForm.text}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, text: e.target.value })
                        }
                        placeholder="مثال: رشة عطر من صلالة... لروحك | شحن مجاني للطلبات فوق 350 ريال"
                        className="w-full px-4 py-3 rounded-xl border border-gold/30 bg-cream text-darkText font-medium focus:outline-none focus:border-burgundy transition-colors"
                      />
                      <p className="text-[10px] text-darkText/50 mt-1">
                        النص الذي يراه العميل فور دخول المتجر (عروض خاصة، خصومات، أو رسائل ترحيبية).
                      </p>
                    </div>

                    {/* Announcement Link */}
                    <div>
                      <label className="block font-bold text-darkText mb-1.5">
                        رابط النقر (اختياري)
                      </label>
                      <input
                        type="text"
                        value={announcementForm.link}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, link: e.target.value })
                        }
                        placeholder="مثال: /shop أو /shop?sale=1 أو رابط ترويجي"
                        className="w-full px-4 py-3 rounded-xl border border-gold/30 bg-cream text-darkText font-mono text-left focus:outline-none focus:border-burgundy transition-colors"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-darkText/50 mt-1">
                        عند النقر على الشريط سيتم توجيه العميل إلى هذه الصفحة (اتركه فارغاً إن لم ترغب برابط).
                      </p>
                    </div>

                    {/* Color Pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      {/* Background Color */}
                      <div className="space-y-2">
                        <label className="block font-bold text-darkText">
                          لون خلفية الشريط (Background)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={announcementForm.bg_color}
                            onChange={(e) =>
                              setAnnouncementForm({ ...announcementForm, bg_color: e.target.value })
                            }
                            className="w-12 h-12 rounded-xl cursor-pointer border border-gold/30 p-1 bg-white"
                          />
                          <input
                            type="text"
                            value={announcementForm.bg_color}
                            onChange={(e) =>
                              setAnnouncementForm({ ...announcementForm, bg_color: e.target.value })
                            }
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-mono text-xs uppercase"
                            dir="ltr"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-[10px] text-darkText/60">ألوان سريعة:</span>
                          {[
                            { name: "عودي ملكي", hex: "#3B0716" },
                            { name: "أخضر زمردي", hex: "#15803D" },
                            { name: "أسود فاخر", hex: "#111827" },
                            { name: "برونزي عتيق", hex: "#78350F" },
                            { name: "كحلي هادئ", hex: "#1E293B" },
                          ].map((p) => (
                            <button
                              type="button"
                              key={p.hex}
                              onClick={() =>
                                setAnnouncementForm({ ...announcementForm, bg_color: p.hex })
                              }
                              style={{ backgroundColor: p.hex }}
                              title={p.name}
                              className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform shadow-2xs"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Text Color */}
                      <div className="space-y-2">
                        <label className="block font-bold text-darkText">
                          لون النص (Text Color)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={announcementForm.text_color}
                            onChange={(e) =>
                              setAnnouncementForm({ ...announcementForm, text_color: e.target.value })
                            }
                            className="w-12 h-12 rounded-xl cursor-pointer border border-gold/30 p-1 bg-white"
                          />
                          <input
                            type="text"
                            value={announcementForm.text_color}
                            onChange={(e) =>
                              setAnnouncementForm({ ...announcementForm, text_color: e.target.value })
                            }
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-mono text-xs uppercase"
                            dir="ltr"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-[10px] text-darkText/60">ألوان سريعة:</span>
                          {[
                            { name: "كريمي فاخر", hex: "#FFFDF8" },
                            { name: "ذهبي ناعم", hex: "#FDE68A" },
                            { name: "أبيض ناصع", hex: "#FFFFFF" },
                            { name: "ذهبي عتيق", hex: "#C9A45C" },
                          ].map((p) => (
                            <button
                              type="button"
                              key={p.hex}
                              onClick={() =>
                                setAnnouncementForm({ ...announcementForm, text_color: p.hex })
                              }
                              style={{ backgroundColor: p.hex }}
                              title={p.name}
                              className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform shadow-2xs"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Submit buttons */}
                    <div className="pt-4 border-t border-gold/20 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={savingAnnouncement}
                        className="px-8 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold shadow-gold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 text-gold-soft" />
                        <span>{savingAnnouncement ? "جارِ الحفظ..." : "حفظ وتطبيق التعديلات فوراً"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setAnnouncementForm({
                            enabled: true,
                            text: "رشة عطر من صلالة... لروحك",
                            link: "/shop",
                            bg_color: "#3B0716",
                            text_color: "#FFFDF8",
                          })
                        }
                        className="px-5 py-3.5 rounded-xl border border-gold/30 text-darkText/70 hover:bg-beige text-xs font-semibold transition-colors"
                      >
                        استعادة النص الافتراضي
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 7.8. BANNERS TAB */}
            {activeTab === "banners" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-burgundy font-alexandria">
                      البانرات والحملات الترويجية
                    </h1>
                    <p className="text-xs text-darkText/60 mt-1">
                      إدارة البانرات والشريط الإعلاني الترويجي في المتجر
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("announcement")}
                    className="px-4 py-2.5 rounded-xl bg-burgundy text-cream font-bold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Megaphone className="w-4 h-4 text-gold-soft" />
                    <span>تعديل الشريط الإعلاني</span>
                  </button>
                </div>

                {/* Announcement Quick Callout */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-burgundy to-burgundy-dark text-cream border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-luxury">
                  <div className="space-y-1">
                    <span className="text-xs text-gold-soft font-bold">الشريط الإعلاني العلوي الفوري</span>
                    <h3 className="text-lg font-bold">{announcementForm.text}</h3>
                    <p className="text-xs text-cream/70">
                      الحالة: {announcementForm.enabled ? "مفعّل ويظهر في أعلى المتجر" : "معطّل حالياً"}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("announcement")}
                    className="px-5 py-2.5 rounded-xl bg-gold text-burgundy-dark font-bold text-xs hover:bg-white transition-colors"
                  >
                    التحكم في الشريط ←
                  </button>
                </div>

                {/* Banners List */}
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">العنوان</th>
                        <th>الترتيب</th>
                        <th>الرابط</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {banners.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-darkText/40 italic">
                            لا توجد بانرات إضافية حالياً، يمكنك تفعيل وتعديل الشريط الإعلاني العلوي مباشرة.
                          </td>
                        </tr>
                      ) : (
                        banners.map((b) => (
                          <tr key={b.id} className="hover:bg-beige/30">
                            <td className="py-3 font-bold text-burgundy">{b.title_ar}</td>
                            <td>{b.display_order}</td>
                            <td className="font-mono text-darkText/60">{b.button_link || "-"}</td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {b.is_active ? "نشط" : "معطل"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. REVIEWS MODERATION */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-burgundy">تقييمات العملاء والمراجعات</h1>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-white border border-gold/25 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-burgundy">
                            {r.user_name || "عميل"}
                          </span>
                          <span className="text-amber-500">★ {r.rating}</span>
                          <span className="text-xs text-darkText/50">على عطر: {r.product?.name_ar}</span>
                        </div>
                        <p className="text-xs text-darkText/80 italic">"{r.comment}"</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {r.status === "approved"
                            ? "معتمد"
                            : r.status === "rejected"
                              ? "مرفوض"
                              : "بانتظار الموافقة"}
                        </span>

                        {r.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateReviewStatus(r.id, "approved")}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                          >
                            اعتماد
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateReviewStatus(r.id, "rejected")}
                            className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold"
                          >
                            رفض
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === "reports" && (
              <AdminReports orders={orders} products={products} customers={customers} />
            )}

            {/* 9. SETTINGS & WHATSAPP */}
            {(activeTab === "settings" || activeTab === "whatsapp") && (
              <div className="max-w-2xl bg-white rounded-3xl p-8 border border-gold/30 shadow-card space-y-6">
                <h1 className="text-2xl font-black text-burgundy">
                  {activeTab === "whatsapp" ? "إعدادات الواتساب والتواصل" : "الإعدادات العامة للمتجر"}
                </h1>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-darkText mb-1">رقم الواتساب الرسمي للطلبات</label>
                    <input
                      type="tel"
                      value={storeSettingsForm.whatsapp}
                      onChange={(e) =>
                        setStoreSettingsForm({ ...storeSettingsForm, whatsapp: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-left font-mono"
                      dir="ltr"
                    />
                    <p className="text-[10px] text-darkText/50 mt-1">
                      هذا الرقم هو الذي يتم إرسال تفاصيل وتأكيدات الطلبات إليه مباشرة.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-darkText mb-1">رقم الهاتف المباشر</label>
                    <input
                      type="tel"
                      value={storeSettingsForm.phone}
                      onChange={(e) =>
                        setStoreSettingsForm({ ...storeSettingsForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-darkText mb-1">البريد الإلكتروني للعلامة</label>
                    <input
                      type="email"
                      value={storeSettingsForm.email}
                      onChange={(e) =>
                        setStoreSettingsForm({ ...storeSettingsForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-darkText mb-1">رسوم الشحن الافتراضية (ر.ع)</label>
                      <input
                        type="number"
                        value={storeSettingsForm.shipping_default}
                        onChange={(e) =>
                          setStoreSettingsForm({ ...storeSettingsForm, shipping_default: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-darkText mb-1">عتبة الشحن المجاني (ر.ع)</label>
                      <input
                        type="number"
                        value={storeSettingsForm.shipping_free}
                        onChange={(e) =>
                          setStoreSettingsForm({ ...storeSettingsForm, shipping_free: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold shadow-gold"
                  >
                    حفظ الإعدادات
                  </button>
                </form>
              </div>
            )}

            {/* 10. ROLES & PERMISSIONS */}
            {activeTab === "roles" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-burgundy">المستخدمين والأدوار الإدارية</h1>
                <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-card overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-darkText/60 border-b border-graySoft pb-2">
                        <th className="py-2">معرف المستخدم</th>
                        <th>الدور الحالي</th>
                        <th>الصلاحيات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graySoft">
                      {userRoles.map((r) => (
                        <tr key={r.id} className="hover:bg-beige/30">
                          <td className="py-3 font-mono">{r.user_id}</td>
                          <td>
                            <span className="font-bold px-2 py-0.5 rounded-full bg-gold/20 text-burgundy">
                              {r.role}
                            </span>
                          </td>
                          <td className="text-darkText/60">
                            {r.role === "admin"
                              ? "صلاحيات النظام الكاملة"
                              : r.role === "manager"
                                ? "المنتجات، الطلبات، المخزون، والتقارير"
                                : "صلاحيات موظف محدودة"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Admin Product Modal */}
      <AdminProductModal
        isOpen={showProductModal}
        product={editingProduct}
        categories={categories}
        onClose={() => setShowProductModal(false)}
        onSaved={loadAdminData}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
              <div>
                <span className="text-xs text-darkText/60 block">معاينة الطلب</span>
                <h3 className="text-lg font-black text-burgundy font-mono">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-darkText/50 hover:text-burgundy"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-gold/20 space-y-1">
                <p><strong>العميل:</strong> {selectedOrder.customer_name}</p>
                <p><strong>الهاتف:</strong> <span dir="ltr">{selectedOrder.customer_phone}</span></p>
                <p><strong>الولاية / المدينة:</strong> {selectedOrder.city}</p>
                <p><strong>العنوان التفصيلي:</strong> {selectedOrder.address}</p>
                {selectedOrder.notes && <p><strong>ملاحظات:</strong> {selectedOrder.notes}</p>}
                <p><strong>وسيلة الدفع:</strong> {selectedOrder.payment_method}</p>
              </div>

              {/* Delivery & GPS Location */}
              {(selectedOrder.location_url || (selectedOrder.latitude && selectedOrder.longitude)) && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      موقع التوصيل المحدد بواسطة GPS:
                    </span>
                    <a
                      href={selectedOrder.location_url || `https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <span>فتح في خرائط Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {selectedOrder.latitude && selectedOrder.longitude && (
                    <p className="text-[11px] font-mono text-emerald-800">
                      الإحداثيات: {Number(selectedOrder.latitude).toFixed(6)}, {Number(selectedOrder.longitude).toFixed(6)}
                    </p>
                  )}
                </div>
              )}

              {/* Bank Transfer Details & Receipt Image */}
              {(selectedOrder.transfer_reference_number || selectedOrder.receipt_image_url) && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-800" />
                    بيانات الحوالة البنكية وإشعار الدفع:
                  </h4>
                  {selectedOrder.transfer_reference_number && (
                    <p className="text-xs">
                      <strong>رقم مرجع الحوالة:</strong>{" "}
                      <span className="font-mono font-bold text-burgundy bg-white px-2 py-0.5 rounded border border-amber-300">
                        {selectedOrder.transfer_reference_number}
                      </span>
                    </p>
                  )}
                  {selectedOrder.receipt_image_url && (
                    <div>
                      <span className="block text-xs font-bold text-darkText mb-1.5">صورة إشعار التحويل البنكي:</span>
                      <a
                        href={selectedOrder.receipt_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block group relative rounded-xl overflow-hidden border border-amber-300 bg-white max-w-xs"
                      >
                        <img
                          src={selectedOrder.receipt_image_url}
                          alt="إشعار التحويل"
                          className="w-full max-h-48 object-contain bg-white"
                        />
                        <div className="absolute inset-0 bg-burgundy/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs gap-1">
                          <Eye className="w-4 h-4" />
                          <span>عرض الصورة بالحجم الكامل ↗</span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="border border-gold/20 rounded-2xl p-4 bg-white space-y-2">
                <h4 className="font-bold text-burgundy mb-2">المنتجات المطلوبة:</h4>
                {selectedOrder.order_items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between items-center py-1 border-b border-graySoft last:border-0">
                    <span>{it.product_name} {it.variant_name ? `(${it.variant_name})` : ""} × {it.quantity}</span>
                    <span className="font-bold text-burgundy">{formatPrice(it.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Status change in modal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-beige">
                <span className="font-bold">تغيير حالة الطلب:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 rounded-xl border border-gold/30 bg-white font-bold cursor-pointer"
                >
                  <option value="new">جديد</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="processing">قيد التجهيز</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <a
                href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `السلام عليكم أخي ${selectedOrder.customer_name}، نتواصل معك من متجر أرياف بخصوص طلبك رقم: ${selectedOrder.order_number}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة العميل عبر واتساب</span>
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 rounded-xl border border-gold/40 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CategoryModal – Add/Edit Category
   ═══════════════════════════════════════════════════════ */
function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: (saved: Category) => void;
}) {
  const [form, setForm] = React.useState({
    name_ar: category?.name_ar || "",
    name_en: category?.name_en || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image_url: category?.image_url || "",
    display_order: category?.display_order ?? 0,
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = React.useState(false);
  const [uploadingImg, setUploadingImg] = React.useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `category_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `categories/${fileName}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      alert(err.message || "فشل رفع الصورة");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSave = async () => {
    if (!form.name_ar.trim()) return;
    setSaving(true);
    const slug = form.slug || form.name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { ...form, slug };

    try {
      if (category) {
        const { data, error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id)
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Category);
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Category);
      }
    } catch (err: any) {
      alert(err.message || "فشل حفظ التصنيف");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
          <h3 className="text-lg font-black text-burgundy">
            {category ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
          </h3>
          <button onClick={onClose} className="p-1 text-darkText/50 hover:text-burgundy">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">الاسم بالعربية *</label>
            <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">الاسم بالإنجليزية</label>
            <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">Slug (رابط)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">صورة التصنيف</label>
            <div className="flex gap-4 items-center">
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gold/30" />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white hover:bg-gold/5 flex items-center justify-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-burgundy" />
                  <span className="text-darkText font-medium">
                    {uploadingImg ? "جاري الرفع..." : "اختر صورة من الجهاز"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImg}
                />
              </label>
            </div>
            <div className="mt-2">
              <label className="text-xs text-darkText/60 mb-1 block">أو أدخل رابط الصورة مباشرة</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gold/30 text-xs bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">الوصف</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">ترتيب العرض</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-burgundy" />
                <span className="text-xs font-bold text-darkText">فعال</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-graySoft">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs disabled:opacity-50">
            {saving ? "جارٍ الحفظ..." : category ? "تحديث التصنيف" : "إضافة التصنيف"}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gold/40 text-xs font-semibold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CouponModal – Add/Edit Coupon
   ═══════════════════════════════════════════════════════ */
function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (saved: Coupon) => void;
}) {
  const [form, setForm] = React.useState({
    code: coupon?.code || "",
    description: coupon?.description || "",
    discount_type: coupon?.discount_type || "percentage" as "percentage" | "fixed",
    discount_value: coupon?.discount_value ?? 10,
    minimum_order_amount: coupon?.minimum_order_amount ?? 0,
    maximum_discount_amount: coupon?.maximum_discount_amount ?? null as number | null,
    usage_limit: coupon?.usage_limit ?? null as number | null,
    start_date: coupon?.start_date || "",
    end_date: coupon?.end_date || "",
    is_active: coupon?.is_active ?? true,
  });
  const [saving, setSaving] = React.useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "ARAYAF-";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, code });
  };

  const handleSave = async () => {
    if (!form.code.trim()) return;
    setSaving(true);

    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      maximum_discount_amount: form.maximum_discount_amount || null,
      usage_limit: form.usage_limit || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    try {
      if (coupon) {
        const { data, error } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", coupon.id)
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Coupon);
      } else {
        const { data, error } = await supabase
          .from("coupons")
          .insert({ ...payload, usage_count: 0 })
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Coupon);
      }
    } catch (err: any) {
      alert(err.message || "فشل حفظ الكوبون");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
          <h3 className="text-lg font-black text-burgundy">
            {coupon ? "تعديل الكوبون" : "إضافة كوبون جديد"}
          </h3>
          <button onClick={onClose} className="p-1 text-darkText/50 hover:text-burgundy">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">كود الكوبون *</label>
            <div className="flex gap-2">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ARAYAF-XXXX" className="flex-1 px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white font-mono focus:ring-2 focus:ring-gold/50 focus:outline-none" />
              <button type="button" onClick={generateCode} className="px-3 py-2 rounded-xl bg-gold/20 text-burgundy text-xs font-bold hover:bg-gold/30 border border-gold/30">توليد</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-darkText mb-1">الوصف</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">نوع الخصم</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-gold/50 focus:outline-none">
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ر.ع)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">قيمة الخصم</label>
              <input type="number" step="0.1" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">الحد الأدنى للطلب (ر.ع)</label>
              <input type="number" step="0.1" value={form.minimum_order_amount} onChange={(e) => setForm({ ...form, minimum_order_amount: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">حد الاستخدام (اختياري)</label>
              <input type="number" value={form.usage_limit || ""} onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })} placeholder="غير محدود" className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">تاريخ البداية</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">تاريخ الانتهاء</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gold/30 text-sm bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-burgundy" />
            <span className="text-xs font-bold text-darkText">الكوبون فعال</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-graySoft">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs disabled:opacity-50">
            {saving ? "جارٍ الحفظ..." : coupon ? "تحديث الكوبون" : "إضافة الكوبون"}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gold/40 text-xs font-semibold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BankModal – Add/Edit Store Bank Account
   ═══════════════════════════════════════════════════════ */
function BankModal({
  bank,
  onClose,
  onSave,
}: {
  bank: BankAccount | null;
  onClose: () => void;
  onSave: (bank: BankAccount) => void;
}) {
  const [form, setForm] = React.useState<BankAccount>({
    id: bank?.id || `bank_${Date.now()}`,
    bank_name_ar: bank?.bank_name_ar || "بنك مسقط",
    bank_name_en: bank?.bank_name_en || "Bank Muscat",
    account_name: bank?.account_name || "متجر أرياف للعطور",
    account_number: bank?.account_number || "",
    iban: bank?.iban || "",
    bank_logo_url: bank?.bank_logo_url || "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Bank_Muscat_Logo.svg/512px-Bank_Muscat_Logo.svg.png",
    is_active: bank?.is_active ?? true,
    display_order: bank?.display_order ?? 1,
  });

  const [uploadingLogo, setUploadingLogo] = React.useState(false);

  const bankPresets = [
    {
      name_ar: "بنك مسقط",
      name_en: "Bank Muscat",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Bank_Muscat_Logo.svg/512px-Bank_Muscat_Logo.svg.png",
    },
    {
      name_ar: "بنك ظفار",
      name_en: "Bank Dhofar",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/17/BankDhofar_logo.png/512px-BankDhofar_logo.png",
    },
    {
      name_ar: "بنك نزوى",
      name_en: "Bank Nizwa",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Bank_Nizwa_Logo.svg/512px-Bank_Nizwa_Logo.svg.png",
    },
    {
      name_ar: "صحار الدولي",
      name_en: "Sohar International",
      logo: "https://soharinternational.com/wp-content/uploads/2021/04/logo.svg",
    },
    {
      name_ar: "البنك الوطني العماني",
      name_en: "National Bank of Oman (NBO)",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/National_Bank_of_Oman_Logo.svg/512px-National_Bank_of_Oman_Logo.svg.png",
    },
    {
      name_ar: "بنك عمان العربي",
      name_en: "Oman Arab Bank (OAB)",
      logo: "https://www.oman-arabbank.com/wp-content/themes/oab/assets/img/logo.png",
    },
    {
      name_ar: "البنك الأهلي العماني",
      name_en: "Ahli Bank Oman",
      logo: "https://ahlibank.om/wp-content/themes/ahli-bank/images/logo.png",
    },
  ];

  const handleApplyPreset = (preset: (typeof bankPresets)[0]) => {
    setForm((prev) => ({
      ...prev,
      bank_name_ar: preset.name_ar,
      bank_name_en: preset.name_en,
      bank_logo_url: preset.logo,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `bank_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `branding/${fileName}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, bank_logo_url: publicUrl }));
    } catch (err: any) {
      alert("فشل رفع أيقونة البنك: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bank_name_ar.trim() || !form.account_number.trim() || !form.account_name.trim()) {
      alert("يرجى ملء جميع الحقول الإلزامية");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-burgundy" />
            <h3 className="text-lg font-black text-burgundy">
              {bank ? "تعديل الحساب البنكي" : "إضافة حساب بنكي عماني جديد"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-darkText/50 hover:text-burgundy">
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-gold/25 space-y-2">
          <span className="text-[11px] font-bold text-darkText/70 block">
            اختيار بنك عماني شهير بسرعة (Autofill):
          </span>
          <div className="flex flex-wrap gap-2">
            {bankPresets.map((p) => (
              <button
                key={p.name_ar}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${form.bank_name_ar === p.name_ar
                    ? "bg-burgundy text-cream border-burgundy shadow-xs"
                    : "bg-beige/60 text-darkText border-gold/30 hover:bg-gold/20"
                  }`}
              >
                {p.name_ar}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">اسم البنك بالعربية *</label>
              <input
                type="text"
                required
                value={form.bank_name_ar}
                onChange={(e) => setForm({ ...form, bank_name_ar: e.target.value })}
                placeholder="بنك مسقط"
                className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-bold focus:ring-2 focus:ring-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">اسم البنك بالإنجليزية</label>
              <input
                type="text"
                value={form.bank_name_en}
                onChange={(e) => setForm({ ...form, bank_name_en: e.target.value })}
                placeholder="Bank Muscat"
                className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-serif focus:ring-2 focus:ring-gold/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">اسم صاحب الحساب (المستفيد) *</label>
            <input
              type="text"
              required
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              placeholder="مثال: متجر أرياف للعطور"
              className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-bold focus:ring-2 focus:ring-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">رقم الحساب البنكي *</label>
            <input
              type="text"
              required
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              placeholder="مثال: 0315012345678001"
              className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-mono font-bold focus:ring-2 focus:ring-gold/50 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">رقم الآيبان (IBAN) - اختياري</label>
            <input
              type="text"
              value={form.iban || ""}
              onChange={(e) => setForm({ ...form, iban: e.target.value.toUpperCase() })}
              placeholder="OM120315000000000000000"
              className="w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white font-mono uppercase focus:ring-2 focus:ring-gold/50 focus:outline-none"
              dir="ltr"
            />
          </div>

          {/* Bank Logo / Icon */}
          <div className="space-y-2 pt-1">
            <label className="block font-bold text-darkText">شعار / أيقونة البنك</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-gold/30 p-1 flex items-center justify-center flex-shrink-0">
                {form.bank_logo_url ? (
                  <img src={form.bank_logo_url} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Landmark className="w-6 h-6 text-darkText/40" />
                )}
              </div>
              <input
                type="text"
                value={form.bank_logo_url || ""}
                onChange={(e) => setForm({ ...form, bank_logo_url: e.target.value })}
                placeholder="رابط أيقونة البنك أو ارفع صورة"
                className="flex-1 px-3 py-2 rounded-xl border border-gold/30 bg-white font-mono text-[11px]"
                dir="ltr"
              />
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-beige border border-gold/30 hover:bg-gold hover:text-burgundy-dark font-bold text-[11px] transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingLogo ? "جاري الرفع..." : "رفع شعار البنك من الجهاز"}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-burgundy"
            />
            <span className="text-xs font-bold text-darkText">الحساب البنكي نشط ويظهر للعملاء في الدفع</span>
          </label>

          <div className="flex gap-3 mt-6 pt-4 border-t border-graySoft">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold"
            >
              {bank ? "تحديث بيانات الحساب" : "إضافة الحساب البنكي"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gold/40 text-xs font-semibold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
