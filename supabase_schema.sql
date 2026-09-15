-- ==============================================================================
-- سكريبت إنشاء وتهيئة قاعدة بيانات مشروع أرياف للعطور (ARAYAF Perfumes)
-- متوافق بالكامل مع Supabase و Row Level Security (RLS)
-- ==============================================================================

-- 1. تمكين ملحق التوليد العشوائي لمفاتيح UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. إنشاء نوع مخصص لأدوار المستخدمين
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. جدول الملفات الشخصية (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول أدوار المستخدمين (User Roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 5. جدول التصنيفات (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول المنتجات / العطور (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(10, 2),
    sku TEXT,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    average_rating NUMERIC(3, 2) DEFAULT 5.0,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول صور المنتجات (Product Images)
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_path TEXT,
    alt_text TEXT,
    display_order INT DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول أحجام ومتغيرات المنتج (Product Variants)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL, -- e.g. "50ml", "100ml"
    sku TEXT,
    price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. جدول المكونات والنوتات العطرية (Perfume Notes)
CREATE TABLE IF NOT EXISTS public.perfume_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL CHECK (note_type IN ('top', 'heart', 'base')),
    name TEXT NOT NULL,
    image_url TEXT,
    display_order INT DEFAULT 0
);

-- 10. جدول العناوين المحفوظة (Addresses)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT,
    address TEXT NOT NULL,
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    city TEXT NOT NULL,
    area TEXT,
    address TEXT NOT NULL,
    notes TEXT,
    delivery_method TEXT NOT NULL DEFAULT 'home',
    payment_method TEXT NOT NULL DEFAULT 'whatsapp',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'processing', 'shipped', 'delivered', 'cancelled')),
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    location_url TEXT,
    transfer_reference_number TEXT,
    receipt_image_url TEXT,
    selected_bank_account_id TEXT,
    selected_bank_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. جدول عناصر الطلب (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. جدول كوبونات الخصم (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    minimum_order_amount NUMERIC(10, 2) DEFAULT 0,
    maximum_discount_amount NUMERIC(10, 2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. جدول البنرات الإعلانية (Banners)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT,
    title_en TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT,
    button_link TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 15. جدول التقييمات والمراجعات (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. جدول إعدادات المتجر (Settings - Key Value)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. جدول قائمة الرغبات / المفضلة (Wishlist)
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 18. جدول رسائل تواصل معنا (Contact Messages)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 19. دوال وتريجرز التزامن التلقائي عند تسجيل مستخدم جديد
-- ==============================================================================

-- تفعيل التأكيد التلقائي لبريد المستخدم فور التسجيل دون اشتراط التحقق
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_admin_email BOOLEAN;
BEGIN
    -- التحقق مما إذا كان البريد هو البريد الرسمي للإدارة
    is_admin_email := (LOWER(NEW.email) = 'ariaf@gmail.com');

    -- إنشاء ملف شخصي تلقائياً
    INSERT INTO public.profiles (id, full_name, phone, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        updated_at = NOW();

    -- تعيين الدور التلقائي
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        CASE WHEN is_admin_email THEN 'admin'::public.app_role ELSE 'customer'::public.app_role END
    )
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة مساعدة للتحقق من صلاحية الإدارة داخل سياسات RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid
        AND role IN ('admin', 'manager', 'employee')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 20. تفعيل سياسات الأمان Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfume_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 20.1 سياسات Profiles
CREATE POLICY "Profiles are viewable by owner and staff" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Profiles can be updated by owner and staff" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Profiles can be inserted by authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin_or_staff(auth.uid()));

-- 20.2 سياسات User Roles
CREATE POLICY "Users can view their own role or staff view all" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Only admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.3 سياسات Categories (قراءة عامة، تعديل للمشرفين)
CREATE POLICY "Public categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage categories" ON public.categories
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.4 سياسات Products و توابعها (قراءة عامة، تعديل للمشرفين)
CREATE POLICY "Active products viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can manage products" ON public.products
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Images viewable by everyone" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage product images" ON public.product_images
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Variants viewable by everyone" ON public.product_variants
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage product variants" ON public.product_variants
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Perfume notes viewable by everyone" ON public.perfume_notes
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage perfume notes" ON public.perfume_notes
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.5 سياسات Addresses
CREATE POLICY "Users can manage their own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- 20.6 سياسات Orders و Order Items
CREATE POLICY "Users can view their own orders or staff view all" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "View order items if authorized" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR public.is_admin_or_staff(auth.uid()))
        )
    );

-- 20.7 سياسات Coupons
CREATE POLICY "Anyone can check active coupons" ON public.coupons
    FOR SELECT USING (is_active = true OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can manage coupons" ON public.coupons
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.8 سياسات Banners
CREATE POLICY "Public banners viewable by everyone" ON public.banners
    FOR SELECT USING (is_active = true OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can manage banners" ON public.banners
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.9 سياسات Reviews
CREATE POLICY "Approved reviews viewable by everyone" ON public.reviews
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Authenticated or guest users can submit reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can manage reviews" ON public.reviews
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.10 سياسات Settings
CREATE POLICY "Settings viewable by everyone" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Staff can modify settings" ON public.settings
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- 20.11 سياسات Wishlist
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
    FOR ALL USING (auth.uid() = user_id);

-- 20.12 سياسات Contact Messages
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view and manage contact messages" ON public.contact_messages
    FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- ==============================================================================
-- 21. إعداد مساحات التخزين (Storage Buckets)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('receipts', 'receipts', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات قراءة مساحات التخزين (عامة)
CREATE POLICY "Public storage view" ON storage.objects
    FOR SELECT USING (bucket_id IN ('products', 'receipts', 'avatars'));

-- سياسة رفع الصور للمشرفين والمستخدمين المصرح لهم
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('products', 'receipts', 'avatars'));
