import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Loader2, LogOut, Lock } from "lucide-react";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import Logo3D from "./Logo3D";

interface GuardProps {
  children: React.ReactNode;
}

/**
 * حارس المسارات الخاصة بالمستخدم المسجل (مثل /account)
 */
export function ProtectedRoute({ children }: GuardProps) {
  const { user } = useStore();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(Boolean(user));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session?.user || user));
      setChecking(false);
    });
  }, [user]);

  if (checking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-xs font-bold text-burgundy">جاري التحقق من الجلسة الآمنة...</p>
      </div>
    );
  }

  if (!hasSession && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * حارس المسارات الإدارية للمشرفين فقط (/admin)
 */
export function AdminRoute({ children }: GuardProps) {
  const { user, isStaff, isAdmin, role, signOut } = useStore();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
    });
  }, [user, role]);

  if (checking) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
        <p className="text-sm font-bold text-burgundy font-alexandria">
          جاري التحقق من صلاحيات الإدارة الملكية...
        </p>
      </div>
    );
  }

  // Not logged in -> go to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but not staff or admin
  const isAuthorized = isStaff || isAdmin || user.email?.toLowerCase() === "ariaf@gmail.com";
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gold/30 shadow-luxury text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-burgundy font-alexandria">
            منطقة مخصصة للإدارة فقط
          </h2>

          <p className="text-xs text-darkText/70 leading-relaxed">
            الحساب المسجل حالياً (<span className="font-mono font-bold text-burgundy">{user.email}</span>) لا يمتلك صلاحيات إدارة المتجر.
          </p>

          <div className="pt-2 space-y-3">
            <button
              onClick={signOut}
              className="w-full py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والدخول بحساب الإدارة</span>
            </button>

            <Link
              to="/"
              className="w-full py-3 rounded-xl border border-gold/40 text-darkText hover:bg-beige/40 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 rotate-180 text-gold" />
              <span>العودة إلى متجر العطور</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
