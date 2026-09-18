import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Product, CartItem, Profile, AppRole, StoreSettings } from "./types";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface StoreContextType {
  user: User | null;
  profile: Profile | null;
  role: AppRole;
  isStaff: boolean;
  isAdmin: boolean;
  cart: CartItem[];
  wishlist: string[];
  settings: StoreSettings;
  cartSubtotal: number;
  cartCount: number;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  addToCart: (product: Product, variantId?: string, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  refreshProfile: () => Promise<void>;
  reloadSettings: () => Promise<void>;
  signOut: () => Promise<void>;
  formatPrice: (amount: number) => string;
}

const defaultSettings: StoreSettings = {
  store_name: { ar: "أرياف", en: "ARAYAF" },
  whatsapp: { number: "968 77414193" },
  phone: { number: "968 77414193" },
  email: { email: "contact@arayaf.com" },
  currency: { code: "OMR", symbol: "ر.ع" },
  shipping: { default: 2, free_shipping_threshold: 25 },
  seo: { title: "أرياف ARAYAF | عبق الطبيعة في كل نفحة", description: "مجموعة عطور فاخرة مستوحاة من جمال الطبيعة وأصالة الشرق" },
  logo: {
    logo_url: "",
    light_logo_url: "",
  },
  hero_section: {
    image_url: "/images/arayaf_salalah_hero.jpg",
    badge_text: "صناعة عطرية عُمانية من قلب صلالة 🇴🇲",
    headline_line1: "رشة عطر من صلالة",
    headline_line2: "لروحك",
    description: "عطور فاخرة مستوحاة من لبان ظفار الحوجري وضباب الخريف الساحر، تُـمزj يدوياً بحرفية عُمانية وتراكيز زيتية ملكية تدوم معك طوال اليوم لتمنحك حضوراً آسراً لا يُنسى.",
    card_title: "أمير العود",
    card_subtitle: "Ameer Al Oudh",
    card_origin: "لبان ظفار النادر • 100% نقي",
    card_footer_text: "ثبات 24 ساعة • فوحان استثنائي",
  },
  bank_accounts: [
    {
      id: "bank-1",
      bank_name: "حساب محلي داخل سلطنة عُمان",
      account_holder: "LAILA MURAD SALEH SAID AL SHAUSHI",
      account_number: "0397054283770013",
      iban: "OM430270397054283770013",
      bank_icon: "oman",
      is_active: true,
      display_order: 1,
    },
    {
      id: "bank-2",
      bank_name: "اليمن - بنك الكريمي (ريال يمني)",
      account_holder: "حساب جاري",
      account_number: "3000627495",
      iban: "",
      bank_icon: "yemen",
      is_active: true,
      display_order: 2,
    },
    {
      id: "bank-3",
      bank_name: "اليمن - بنك الكريمي (ريال سعودي)",
      account_holder: "حساب جاري",
      account_number: "3000627500",
      iban: "",
      bank_icon: "yemen",
      is_active: true,
      display_order: 3,
    },
  ],
  announcement_bar: {
    enabled: true,
    text: "رشة عطر من صلالة... لروحك",
    link: "/shop",
    bg_color: "#3B0716",
    text_color: "#FFFDF8",
  },
};

const StoreContext = createContext<StoreContextType | null>(null);

const CART_KEY = "arayaf_cart";
const WISHLIST_KEY = "arayaf_wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole>("customer");
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Cart & Wishlist local state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 2500); // Minimal duration
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Load Settings from Supabase
  const reloadSettings = async () => {
    try {
      const { data, error } = await supabase.from("settings").select("key, value");
      if (data && !error) {
        const newSettings = { ...defaultSettings };
        data.forEach((row) => {
          if (row.key in newSettings) {
            (newSettings as any)[row.key] = row.value;
          }
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  useEffect(() => {
    reloadSettings();

    // Subscribe to realtime changes on settings table
    const channel = supabase
      .channel("settings-realtime-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          reloadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
        setRole("customer");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadUserProfile(userId: string) {
    try {
      // 1. Load Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (profileData) setProfile(profileData);

      // 2. Load Role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleData?.role) {
        setRole(roleData.role as AppRole);
      } else {
        // Fallback: Check if user email is ariaf@gmail.com
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.email?.toLowerCase() === "ariaf@gmail.com") {
          setRole("admin");
        } else {
          setRole("customer");
        }
      }

      // 3. Sync Wishlist from Supabase
      const { data: wishData } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", userId);

      if (wishData) {
        const dbWishlist = wishData.map((w) => w.product_id);
        const combined = Array.from(new Set([...wishlist, ...dbWishlist]));
        setWishlist(combined);
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  }

  const refreshProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }
    } catch (e) {
      console.error("Error in refreshProfile:", e);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error during signOut:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole("customer");
      showToast("تم تسجيل الخروج بنجاح", "info");
    }
  };

  // Cart operations
  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const selectedVariant = product.product_variants?.find((v) => v.id === variantId);
    const effectivePrice = selectedVariant
      ? (selectedVariant.sale_price ?? selectedVariant.price)
      : (product.sale_price ?? product.price);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variantId === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          product,
          variantId,
          variant: selectedVariant,
          quantity,
          price: effectivePrice,
        },
      ];
    });

    showToast(`تمت الإضافة للسلة`);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.variantId === variantId))
    );
    showToast("تم حذف المنتج من السلة", "info");
  };

  const updateQty = (productId: string, variantId: string | undefined, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variantId === variantId
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = async (productId: string) => {
    const exists = wishlist.includes(productId);
    const updated = exists
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);

    if (exists) {
      showToast("تمت الإزالة من المفضلة", "info");
      if (user) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      }
    } else {
      showToast("تمت الإضافة للمفضلة");
      if (user) {
        await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );

  const isStaff = useMemo(
    () => ["admin", "manager", "employee"].includes(role),
    [role]
  );

  const isAdmin = role === "admin";

  const formatPrice = (amount: number) => {
    const sym = settings.currency?.symbol || "ر.ع";
    // Check if whole number or decimals
    const formatted = Number.isInteger(amount)
      ? amount.toLocaleString("ar-OM")
      : amount.toLocaleString("ar-OM", { minimumFractionDigits: 1, maximumFractionDigits: 3 });
    return `${formatted} ${sym}`;
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        profile,
        role,
        isStaff,
        isAdmin,
        cart,
        wishlist,
        settings,
        cartSubtotal,
        cartCount,
        toasts,
        showToast,
        removeToast,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        refreshProfile,
        reloadSettings,
        signOut,
        formatPrice,
      }}
    >
      {children}

      {/* Global Luxury Toast Stack */}
      <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50 flex flex-col gap-2 max-w-sm w-[90vw] md:w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#FFFDF8] text-[#2A1A17] border border-gold/20 px-4 py-3 rounded-md shadow-[0_4px_15px_rgba(42,26,23,0.05)] flex items-center justify-between text-xs font-bold transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in"
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && (
                <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <span className="text-[10px] text-emerald-600">✓</span>
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-4 h-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <span className="text-[10px] text-red-600">!</span>
                </div>
              )}
              {toast.type === "info" && (
                <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <span className="text-[10px] text-blue-600">i</span>
                </div>
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="mr-3 text-taupe/60 hover:text-taupe transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
