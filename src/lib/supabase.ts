import { createClient } from "@supabase/supabase-js";

// Support both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) env variable conventions
const envUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined);

const envAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

export const supabaseUrl = envUrl || "https://sglageesshilrpbybtpk.supabase.co";
export const supabaseAnonKey = envAnonKey || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseAnonKey !== "YOUR_ANON_KEY_HERE" &&
      !supabaseAnonKey.includes("dummy") &&
      supabaseAnonKey.length > 20
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    "[Supabase] تحذير: لم يتم تعيين مفتاح VITE_SUPABASE_ANON_KEY بشكل صالح في ملف .env.local أو بيئة التشغيل. يرجى إضافة المفتاح الحقيقي من لوحة تحكم Supabase."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_fallback_key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * دالة مساعدة لترجمة رسائل وأكواد أخطاء Supabase Auth إلى اللغة العربية بشكل واضح ومبسط
 */
export function getArabicAuthErrorMessage(err: any): string {
  if (!err) return "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.";

  const message = (err.message || err.error_description || "").toLowerCase();
  const code = (err.code || "").toLowerCase();

  if (message.includes("invalid login credentials") || message.includes("invalid_grant")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى التأكد والمحاولة مجدداً.";
  }
  if (message.includes("user already registered") || message.includes("already registered") || code === "user_already_exists") {
    return "هذا البريد الإلكتروني مسجل بالفعل، يمكنك تسجيل الدخول إلى حسابك مباشرة.";
  }
  if (message.includes("password should be at least 6 characters") || message.includes("weak_password")) {
    return "كلمة المرور ضعيفة، يجب أن تحتوي على 6 خانات على الأقل.";
  }
  if (message.includes("email not confirmed") || code === "email_not_confirmed") {
    return "يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل إلى صندوق الوارد الخاص بك.";
  }
  if (message.includes("rate limit") || message.includes("over_email_send_rate_limit") || code === "over_email_send_rate_limit") {
    // Return a generic network error or ignore
    return "يرجى المحاولة مرة أخرى لاحقاً (أو قم بإلغاء حدود التسجيل من إعدادات Supabase).";
  }
  if (message.includes("invalid email") || message.includes("validation_failed")) {
    return "صيغة البريد الإلكتروني غير صحيحة، يرجى التأكد من كتابتها بشكل سليم.";
  }
  if (message.includes("network") || message.includes("failed to fetch")) {
    return "تعذر الاتصال بخادم قاعدة البيانات. يرجى التحقق من اتصال الإنترنت ومفاتيح الاتصال.";
  }
  if (message.includes("signup disabled") || message.includes("signups not allowed")) {
    return "إنشاء الحسابات الجديدة معطل حالياً في إعدادات المنصة.";
  }
  if (message.includes("token has expired") || message.includes("invalid token")) {
    return "انتهت صلاحية رابط الاستعادة أو التحقق، يرجى طلب رابط جديد.";
  }

  // Fallback to original message if not matched
  return err.message || "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.";
}

