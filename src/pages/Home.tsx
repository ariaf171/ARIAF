import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Award,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import type { Product, Category, Banner, Review } from "../lib/types";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import Logo3D from "../components/Logo3D";
import { Star } from "lucide-react";
import { useSEO } from "../lib/useSEO";

export default function Home() {
  useSEO({
    title: "الرئيسية",
    description: "أرياف ARAYAF - تجربة استثنائية من العطور الشرقية والطبيعية الفاخرة.",
    url: window.location.href,
  });

  const { settings } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Parallax Setup
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catRes, prodRes, revRes] = await Promise.all([
          supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true }),
          supabase
            .from("products")
            .select("*, category:categories(name_ar, name_en), product_images(*), product_variants(*)")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("reviews")
            .select("*")
            .eq("status", "approved")
            .limit(5),
        ]);

        let fetchedCategories = catRes.data || [];
        let fetchedProducts = prodRes.data || [];
        let fetchedReviews = revRes.data || [];

        // --- MOCK DATA FOR ARAYAF PREVIEW ---
        if (fetchedCategories.length === 0) {
          fetchedCategories = [
            { id: '1', name_ar: 'العود الفاخر', name_en: 'LUXURY OUD', slug: 'oud' },
            { id: '2', name_ar: 'لبان ظفار', name_en: 'DHOFAR FRANKINCENSE', slug: 'frankincense' },
            { id: '3', name_ar: 'مسك وعنبر', name_en: 'MUSK & AMBER', slug: 'musk' },
            { id: '4', name_ar: 'حصرية', name_en: 'EXCLUSIVE', slug: 'exclusive' },
          ];
        }

        if (fetchedProducts.length === 0) {
          fetchedProducts = [
            {
              id: 'p1',
              name_ar: 'أمير العود الملكي',
              name_en: 'AMEER AL OUDH',
              slug: 'ameer-al-oudh',
              price: 65,
              sale_price: 45,
              stock_quantity: 10,
              is_active: true,
              is_best_seller: true,
              is_new: false,
              average_rating: 4.9,
              total_reviews: 124,
              product_images: [{ is_primary: true, image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80' }]
            },
            {
              id: 'p2',
              name_ar: 'سحر اللبان الحوجري',
              name_en: 'MAGIC OF FRANKINCENSE',
              slug: 'magic-frankincense',
              price: 35,
              sale_price: null,
              stock_quantity: 20,
              is_active: true,
              is_best_seller: false,
              is_new: true,
              average_rating: 5.0,
              total_reviews: 42,
              product_images: [{ is_primary: true, image_url: 'https://images.unsplash.com/photo-1594034184171-18a4ebc52119?auto=format&fit=crop&w=800&q=80' }]
            },
            {
              id: 'p3',
              name_ar: 'مسك ظفار الأبيض',
              name_en: 'WHITE DHOFAR MUSK',
              slug: 'white-musk',
              price: 28,
              sale_price: null,
              stock_quantity: 5,
              is_active: true,
              is_best_seller: false,
              is_new: false,
              average_rating: 4.7,
              total_reviews: 89,
              product_images: [{ is_primary: true, image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' }]
            },
            {
              id: 'p4',
              name_ar: 'ليل مسقط الدافئ',
              name_en: 'MUSCAT NIGHTS',
              slug: 'muscat-nights',
              price: 75,
              sale_price: null,
              stock_quantity: 0, // Out of stock!
              is_active: true,
              is_best_seller: true,
              is_new: false,
              average_rating: 4.8,
              total_reviews: 210,
              product_images: [{ is_primary: true, image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80' }]
            },
          ];
        }

        if (fetchedReviews.length === 0) {
          fetchedReviews = [
            { id: 'r1', user_name: 'أحمد البلوشي', rating: 5, comment: 'عطر أمير العود لا يُعلى عليه، ثبات وفوحان استثنائي يملأ المكان.' },
            { id: 'r2', user_name: 'سارة الكندي', rating: 5, comment: 'أفضل رائحة لبان جربتها، تعكس أصالة صلالة بكل تفاصيلها.' }
          ];
        }

        setCategories(fetchedCategories as any);
        setBestSellers(fetchedProducts as any);
        setReviews(fetchedReviews as any);
      } catch (e) {
        console.error("Error loading home data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const rawWhatsApp = settings.whatsapp.number.replace(/[^0-9]/g, "") || "96891234567";
  const whatsappHeroMessage = encodeURIComponent(
    "السلام عليكم، أود الاستفسار والطلب المباشر من تشكيلة عطور أرياف (صلالة)."
  );

  const hero = settings.hero_section || {};
  const heroImg = hero.image_url || "/images/arayaf_salalah_hero.jpg";
  const badgeText = hero.badge_text || "صناعة عطرية عُمانية من قلب صلالة 🇴🇲";
  const headline1 = hero.headline_line1 || "رشة عطر من صلالة";
  const headline2 = hero.headline_line2 || "لروحك";
  const heroDesc =
    hero.description ||
    "عطور فاخرة مستوحاة من لبان ظفار الحوجري وضباب الخريف الساحر، تُـمزج يدوياً بحرفية عُمانية وتراكيز زيتية ملكية تدوم معك طوال اليوم لتمنحك حضوراً آسراً لا يُنسى.";
  const cardTitle = hero.card_title || "أمير العود";
  const cardSubtitle = hero.card_subtitle || "Ameer Al Oudh";
  const cardOrigin = hero.card_origin || "لبان ظفار النادر • 100% نقي";
  const cardFooterText = hero.card_footer_text || "ثبات 24 ساعة • فوحان استثنائي";

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-darkText overflow-hidden">
      {/* 1. HERO SECTION (Luxury Perfume Campaign) */}
      <section ref={heroRef} className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center bg-cream overflow-hidden">
        
        {/* --- Background ARAYAF Decorations --- */}
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]), opacity: opacityParallax }} className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Organic Frankincense / Smoke glows - Scaled down for mobile */}
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] bg-gold/15 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 left-0 w-[400px] h-[300px] lg:w-[800px] lg:h-[500px] bg-burgundy/10 rounded-tr-full blur-[90px]" />
          
          {/* Outline Rings - Scaled down heavily on mobile */}
          <div className="absolute top-[5%] left-[5%] lg:left-[10%] w-48 h-48 lg:w-[28rem] lg:h-[28rem] rounded-full border-[1.5px] border-gold/25 opacity-70 scale-100 lg:scale-150" />
          <div className="absolute top-[10%] left-[10%] lg:left-[15%] w-36 h-36 lg:w-[22rem] lg:h-[22rem] rounded-full border-[1.5px] border-burgundy/15 opacity-60 scale-100 lg:scale-150" />
          <div className="hidden lg:block absolute top-[15%] left-[20%] w-[16rem] h-[16rem] rounded-full border border-gold/30 opacity-50 scale-150" />
          
          {/* Elegant smoke line SVG - Thinner on mobile */}
          <svg className="absolute top-0 right-0 w-full h-full opacity-[0.10] lg:opacity-[0.15]" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M-100,1100 C200,800 300,300 1100,-100" fill="none" stroke="#3E2723" strokeWidth="2" className="lg:stroke-[4px]" />
            <path d="M0,900 C300,750 400,250 1000,100" fill="none" stroke="#C2A878" strokeWidth="1.5" className="lg:stroke-[2.5px]" />
            <path d="M100,1000 C400,850 500,350 1100,200" fill="none" stroke="#E8DCC4" strokeWidth="1" className="lg:stroke-[1.5px]" />
          </svg>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* RIGHT COLUMN (RTL): Typography & Brand Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 80]), opacity: opacityParallax }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-right order-1"
            >
              {/* Main Headline */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl text-gold-dark font-serif tracking-[0.2em] uppercase mb-4 opacity-90">
                  Arayaf
                </h2>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-medium tracking-tight leading-[1.2] font-alexandria text-burgundy">
                  {headline1}
                  <span className="block mt-2 text-burgundy-light font-light">{headline2}</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-taupe text-sm sm:text-base leading-[2] max-w-md mb-12 font-light">
                {heroDesc}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-10 py-4 rounded-[2px] text-sm font-medium bg-burgundy text-cream hover:bg-burgundy-light transition-all duration-500 relative overflow-hidden group"
                >
                  <span className="relative z-10">اكتشف المجموعة</span>
                  <div className="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-in-out" />
                </Link>
                {/* Secondary CTA: Clean Text Link */}
                <a
                  href={`https://wa.me/${rawWhatsApp}?text=${whatsappHeroMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-4 text-sm font-medium text-burgundy/80 hover:text-burgundy transition-all duration-300 flex items-center justify-center gap-2 border-b border-transparent hover:border-burgundy/30"
                >
                  <MessageCircle className="w-4 h-4 opacity-70" />
                  <span>الطلب المباشر</span>
                </a>
              </div>
            </motion.div>

            {/* LEFT COLUMN: Editorial Card Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ y: yParallax, opacity: opacityParallax }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="lg:col-span-6 flex items-center justify-center lg:justify-end mt-4 lg:mt-0 order-2"
            >
              {/* slightly asymmetrical framing: taller on right, rounded corners */}
              <div className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[480px] aspect-[4/5] sm:aspect-[3/4] rounded-t-[100px] rounded-br-[100px] rounded-bl-[20px] overflow-hidden shadow-luxury border border-gold/20 group bg-beige">
                {/* Hero Card Image */}
                <img
                  src={heroImg}
                  alt={cardTitle}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85";
                  }}
                />

                {/* Subtle Inner Shadow & Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-dark/90 via-burgundy-dark/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(62,39,35,0.2)] rounded-t-[100px] rounded-br-[100px] rounded-bl-[20px] pointer-events-none border-[0.5px] border-white/20" />

                {/* Top Badge on Card */}
                {cardOrigin && (
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 rounded-full bg-cream/90 backdrop-blur-md text-burgundy text-[10px] font-bold shadow-sm border border-gold/30">
                      {cardOrigin}
                    </span>
                  </div>
                )}

                {/* Elegant Overlay Label & Info */}
                <div className="absolute bottom-8 left-6 right-6 text-center text-cream space-y-1.5">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-gold-soft opacity-90 font-serif">
                    Signature Collection
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-alexandria text-white drop-shadow-md">
                    {cardTitle}
                  </h3>
                  {cardSubtitle && (
                    <p className="text-xs text-cream/80 line-clamp-2 font-serif italic">
                      {cardSubtitle}
                    </p>
                  )}
                  {cardFooterText && (
                    <div className="pt-2 text-[11px] text-gold font-bold">
                      {cardFooterText}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. OUR FRAGRANCE COLLECTION ("مجموعتنا العطرية") */}
      <section className="relative py-24 sm:py-32 bg-[#FFFDF8] overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none flex justify-center opacity-[0.03]">
          <div className="w-[800px] h-[800px] rounded-full border border-gold/40 scale-150 absolute top-[-20%]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-burgundy font-alexandria mb-4 tracking-tight">
              مجموعتنا العطرية
            </h2>
            <p className="text-taupe text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed">
              توليفة استثنائية من أفخم العطور المستوحاة من أصالة اللبان الحوجري وسحر الطبيعة العمانية.
            </p>
          </motion.div>

          {/* Elegant Tabs (Horizontal scroll on mobile) */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 mb-16 pb-4">
            <Link
              to="/shop"
              className="snap-start whitespace-nowrap text-sm font-medium text-burgundy border-b border-burgundy pb-2 px-1 transition-all"
            >
              المجموعة الكاملة
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="snap-start whitespace-nowrap text-sm font-light text-taupe border-b border-transparent pb-2 px-1 hover:text-burgundy hover:border-burgundy/30 transition-all"
              >
                {c.name_ar}
              </Link>
            ))}
          </div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory hide-scrollbar pb-8 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {loading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="snap-center shrink-0 w-[85vw] sm:w-auto max-w-sm sm:max-w-none">
                  <ProductSkeleton />
                </div>
              ))
            ) : (
              bestSellers.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className="snap-center shrink-0 w-[75vw] sm:w-auto max-w-sm sm:max-w-none"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>

          {/* Final CTA */}
          <div className="mt-12 sm:mt-16 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-medium border-b border-burgundy/30 text-burgundy hover:border-burgundy hover:bg-burgundy/5 transition-all duration-500"
            >
              <span>استكشف مجموعتنا كاملاً</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BRAND STORY ("من لبان ظفار تبدأ الحكاية") */}
      <section className="relative bg-burgundy-dark text-cream overflow-hidden py-24 sm:py-32 mt-12 sm:mt-0">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
          <div className="w-[1200px] h-[1200px] rounded-full border-[1.5px] border-gold scale-150 absolute right-[-20%]" />
          <div className="w-[800px] h-[800px] rounded-full border-[1px] border-gold scale-125 absolute left-[-10%]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Visual Side */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="w-full lg:w-1/2 order-1 lg:order-2" 
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-t-[120px] rounded-b-[24px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80" 
                  alt="لبان ظفار الأصيل" 
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-dark/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 border border-gold/20 rounded-t-[120px] rounded-b-[24px] pointer-events-none" />
              </div>
            </motion.div>

            {/* Story Content Side */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-right"
            >
              <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold-soft mb-6 opacity-90">
                أصالة اللبان والعود
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 leading-[1.3] font-alexandria">
                من لبان ظفار <span className="text-gold-soft block mt-2">تبدأ الحكاية</span>
              </h2>
              
              <div className="text-[#E6DED3] text-sm sm:text-base leading-[2.2] font-light space-y-6 max-w-lg mx-auto lg:mx-0">
                <p>
                  نستحضر من سحر صلالة أزكى قطرات اللبان الحوجري النادر، نمزجه مع عبير الورد الطائفي وأصالة دهن العود المعتق.
                </p>
                <p>
                  لنقدم لك زجاجة عطر تفيض بالسكينة والهيبة الملكية، تُصنع يدوياً بحرفية عُمانية وشغف لا ينضب لتكون بصمتك العطرية الخاصة.
                </p>
              </div>

              <div className="mt-12">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 text-gold hover:text-cream transition-colors duration-300 font-bold text-sm border-b border-gold/30 hover:border-cream pb-1"
                >
                  <span>تعرف على قصة أرياف</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Transition Gradient into Reviews */}
      <div className="h-32 bg-gradient-to-b from-burgundy-dark via-[#E6DED3] to-[#FFFDF8]" />

      {/* 4. CUSTOMER EXPERIENCES ("تجارب أرياف") */}
      <section className="py-20 sm:py-24 bg-[#FFFDF8] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold text-taupe uppercase tracking-widest mb-4 opacity-80">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>تجارب أرياف</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-burgundy font-alexandria">
              ماذا يقول عملاؤنا
            </h2>
          </motion.div>

          {reviews.length > 0 ? (
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory hide-scrollbar pb-8 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="snap-center shrink-0 w-[85vw] sm:w-auto bg-[#FAF8F5] border border-gold/10 rounded-2xl p-8 sm:p-10 flex flex-col shadow-[0_4px_20px_rgba(62,39,35,0.02)]"
                >
                  <div className="text-gold opacity-40 mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                  </div>
                  <p className="text-taupe leading-relaxed font-light mb-8 text-sm sm:text-base flex-grow">
                    "{review.comment}"
                  </p>
                  <div className="mt-auto pt-4 border-t border-gold/10">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? "fill-gold text-gold" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <div className="text-xs font-bold text-burgundy">{review.user_name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-taupe text-sm">لا توجد تقييمات حالياً.</div>
          )}

        </div>
      </section>

      {/* 5. FINAL CTA SECTION */}
      <section className="py-24 sm:py-32 bg-[#F4EFEA] relative overflow-hidden">
        {/* Subtle Perfume Visual Background */}
        <div 
          className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none mix-blend-multiply grayscale"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594034184171-18a4ebc52119?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-burgundy font-alexandria mb-6">
            اكتشف بصمتك العطرية
          </h2>
          <p className="text-taupe mb-10 font-light text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            تصفح مجموعتنا الكاملة من العطور الفاخرة والمستوحاة من تراث صلالة، واكتشف العطر الذي يعبر عن شخصيتك.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-10 py-4 rounded-sm text-sm font-bold bg-burgundy text-cream hover:bg-burgundy-dark transition-colors duration-300 shadow-md"
            >
              استكشاف العطور
            </Link>
            <a
              href={`https://wa.me/${rawWhatsApp}?text=${whatsappHeroMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-4 rounded-sm text-sm font-bold border border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-cream transition-colors duration-300"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </section>

      {/* 5. ADD YOUR REVIEW (Authenticated Users Only) */}
      <ReviewFormSection user={useStore().user} showToast={useStore().showToast} />
    </div>
  );
}

/* ─── Inline Review Form Component ─── */
function ReviewFormSection({ user, showToast }: { user: any; showToast: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [hoverRating, setHoverRating] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) {
      showToast("يرجى كتابة تعليق", "error");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "عميل أرياف",
        rating,
        comment: comment.trim(),
        status: "pending",
        product_id: null,
      });

      if (error) throw error;
      showToast("تم إرسال تقييمك بنجاح! سيظهر بعد مراجعة الإدارة.");
      setComment("");
      setRating(5);
      setSubmitted(true);
    } catch (err: any) {
      showToast(err.message || "فشل إرسال التقييم", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-16 max-w-2xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-burgundy mb-2">شاركنا رأيك</h2>
        <p className="text-darkText/60 text-sm">نسعد بسماع تجربتك مع عطور أرياف</p>
      </div>

      {submitted ? (
        <div className="text-center py-10 bg-white/80 rounded-3xl border border-gold/25 shadow-card">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-bold text-burgundy mb-2">شكراً لتقييمك!</h3>
          <p className="text-sm text-darkText/60">سيظهر تقييمك بعد مراجعة فريق أرياف.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview} className="bg-white/80 rounded-3xl p-8 border border-gold/25 shadow-card space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <label className="block text-sm font-bold text-darkText mb-3">تقييمك</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`text-3xl transition-transform duration-200 hover:scale-125 ${
                    star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-darkText mb-2">تعليقك</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تجربتك مع عطور أرياف..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gold/30 bg-beige/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-bold bg-burgundy hover:bg-burgundy-light text-cream border border-gold/30 shadow-md transition-all duration-300 disabled:opacity-50"
          >
            {submitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
          </button>
        </form>
      )}
    </motion.section>
  );
}
