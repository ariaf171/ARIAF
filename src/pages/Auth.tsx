import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { supabase, isSupabaseConfigured, getArabicAuthErrorMessage } from "../lib/supabase";
import { useStore } from "../lib/store";
import Logo3D from "../components/Logo3D";

type AuthMode = "login" | "register" | "forgot" | "reset_password";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Password Reset fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const { showToast, refreshProfile, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/account";
  const configured = isSupabaseConfigured();

  // Check for password recovery callback in URL
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (
      hash.includes("type=recovery") ||
      params.get("reset") === "1" ||
      hash.includes("access_token")
    ) {
      setMode("reset_password");
    }
  }, [location]);

  // If already logged in and not in reset mode, redirect to account or admin
  useEffect(() => {
    if (user && mode !== "reset_password") {
      navigate(from, { replace: true });
    }
  }, [user, mode, from, navigate]);

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast("يرجى إدخال البريد الإلكتروني وكلمة المرور", "error");
      return;
    }

    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        showToast("تم تسجيل الدخول بنجاح، مرحباً بك في أرياف!");
        await refreshProfile();

        // Check if user is the store administrator
        const isAdmin =
          cleanEmail === "ariaf@gmail.com" ||
          data.user.user_metadata?.role === "admin";

        if (isAdmin && (from === "/account" || from === "/")) {
          navigate("/admin", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      showToast(getArabicAuthErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  // 2. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast("يرجى إدخال الاسم الكامل", "error");
      return;
    }
    if (!phone.trim()) {
      showToast("يرجى إدخال رقم الهاتف / الجوال", "error");
      return;
    }
    if (!email.trim()) {
      showToast("يرجى إدخال بريد إلكتروني صالح", "error");
      return;
    }
    if (password.length < 6) {
      showToast("كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("كلمتا المرور غير متطابقتين، يرجى التأكد", "error");
      return;
    }

    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();

      let { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      let user = data?.user;
      
      if (error && (error.message.includes("rate limit") || error.message.includes("over_email_send_rate_limit"))) {
        console.warn("Bypassing rate limit error for demo purposes.");
        // Try to login directly in case the user was already created
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInData?.user) {
          user = signInData.user;
          data.session = signInData.session;
          error = null as any;
        }
      }
      
      if (error && !user) throw error;

      if (user) {
        // Fallback profile sync for instant consistency
        try {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          // Assign default customer role or admin if matching email
          const assignedRole = cleanEmail === "ariaf@gmail.com" ? "admin" : "customer";
          await supabase.from("user_roles").upsert(
            {
              user_id: user.id,
              role: assignedRole,
            },
            { onConflict: "user_id, role" }
          );
        } catch (dbErr) {
          // Non-blocking trigger fallback
          console.warn("Direct profile sync fallback caught:", dbErr);
        }

        // Automatically sign in immediately without any verification requirement
        let currentSession = data.session;
        if (!currentSession) {
          try {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            currentSession = signInData.session;
          } catch {
            // Ignore sign-in error if session already exists
          }
        }

        showToast("تم إنشاء حسابك الملكي بنجاح! مرحباً بك في أرياف.");
        await refreshProfile();
        if (cleanEmail === "ariaf@gmail.com") {
          navigate("/admin", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      showToast(getArabicAuthErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("يرجى إدخال بريدك الإلكتروني المسجل", "error");
      return;
    }

    setBusy(true);
    try {
      const redirectUrl = `${window.location.origin}/auth?reset=1`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      showToast("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.");
      setMode("login");
    } catch (err: any) {
      showToast(getArabicAuthErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  // 4. Handle Reset Password (Update Password)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("كلمتا المرور غير متطابقتين", "error");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      showToast("تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
      setNewPassword("");
      setConfirmNewPassword("");
      setMode("login");
    } catch (err: any) {
      showToast(getArabicAuthErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 flex items-center justify-center bg-cream/60">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gold/30 shadow-luxury relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-burgundy via-gold to-burgundy" />

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo3D size="sm" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-burgundy font-alexandria">
            {mode === "login" && "تسجيل الدخول"}
            {mode === "register" && "إنشاء حساب فاخر جديد"}
            {mode === "forgot" && "استعادة كلمة المرور"}
            {mode === "reset_password" && "تعيين كلمة المرور الجديدة"}
          </h2>
          <p className="text-xs text-darkText/60 mt-1.5 font-serif">
            بوابتك الحصرية إلى عالم العطور الملكية وسحر صلالة
          </p>
        </div>

        {/* Configuration notice if keys missing */}
        {!configured && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">تنبيه اتصال Supabase:</p>
              <p className="text-[11px] leading-relaxed text-amber-700">
                يرجى وضع المفتاح الحقيقي <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> في ملف <code className="font-mono">.env.local</code> لإتمام عمليات المصادقة وقاعدة البيانات بنجاح.
              </p>
            </div>
          </div>
        )}

        {/* Mode Tabs (Login / Register) */}
        {mode !== "forgot" && mode !== "reset_password" && (
          <div className="flex border-b border-graySoft mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                mode === "login" ? "text-burgundy" : "text-darkText/50 hover:text-burgundy"
              }`}
            >
              تسجيل الدخول
              {mode === "login" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                mode === "register" ? "text-burgundy" : "text-darkText/50 hover:text-burgundy"
              }`}
            >
              إنشاء حساب جديد
              {mode === "register" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />
              )}
            </button>
          </div>
        )}

        {/* ─── 1. LOGIN FORM ─── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-darkText">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[11px] text-gold-dark hover:underline font-semibold"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText/40 hover:text-darkText"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all duration-300 transform active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-3"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>جاري الدخول إلى حسابك...</span>
                </>
              ) : (
                <span>دخول إلى حسابي</span>
              )}
            </button>
          </form>
        )}

        {/* ─── 2. REGISTRATION FORM ─── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={busy}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: سالم الكندي"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none disabled:opacity-50"
                />
                <User className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">رقم الهاتف / الجوال</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  disabled={busy}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 96877414193"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 خانات على الأقل"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText/40 hover:text-darkText"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={busy}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <ShieldCheck className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText/40 hover:text-darkText"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all duration-300 transform active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-3"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>جاري إنشاء حسابك الفاخر...</span>
                </>
              ) : (
                <span>إنشاء الحساب الملكي</span>
              )}
            </button>
          </form>
        )}

        {/* ─── 3. FORGOT PASSWORD FORM ─── */}
        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-xs text-darkText/70 mb-4 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل، وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور فوراً.
            </p>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>جاري إرسال الرابط...</span>
                </>
              ) : (
                <span>إرسال رابط الاستعادة</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-center text-xs text-darkText/60 hover:text-burgundy pt-2 font-bold flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              <span>العودة إلى تسجيل الدخول</span>
            </button>
          </form>
        )}

        {/* ─── 4. RESET PASSWORD FORM (NEW PASSWORD) ─── */}
        {mode === "reset_password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم التحقق من الرابط بنجاح! أدخل كلمة المرور الجديدة لحسابك.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={busy}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 خانات على الأقل"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText/40 hover:text-darkText"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={busy}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left disabled:opacity-50"
                  dir="ltr"
                />
                <ShieldCheck className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText/40 hover:text-darkText"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>جاري حفظ كلمة المرور...</span>
                </>
              ) : (
                <span>تأكيد وحفظ كلمة المرور</span>
              )}
            </button>
          </form>
        )}

        {/* Back to store link */}
        <div className="mt-8 pt-4 border-t border-graySoft/60 text-center">
          <Link
            to="/"
            className="text-xs text-taupe hover:text-burgundy transition-colors inline-flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-gold" />
            <span>العودة إلى الصفحة الرئيسية للمتجر</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
