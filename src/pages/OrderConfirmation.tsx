import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle, MessageCircle, ArrowLeft, ShoppingBag, Copy, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import type { Order } from "../lib/types";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const { settings, formatPrice, showToast } = useStore();

  const [order, setOrder] = useState<Order | any>(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch gold & dark brown luxury confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C9A45C", "#2A1A17", "#D9B978", "#1A100E"],
      });
    } catch {
      // ignore
    }

    async function fetchOrder() {
      if (!orderNumber || order) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("order_number", orderNumber)
          .single();

        if (data && !error) {
          setOrder(data);
        }
      } catch (e) {
        console.error("Error fetching order:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      showToast("تم نسخ رقم الطلب إلى الحافظة");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Generate WhatsApp message exactly matching the requested format
  const handleOpenWhatsApp = () => {
    if (!order) return;
    const rawNumber = "96877414193"; // Using the strictly provided number

    const itemsText =
      order.order_items && order.order_items.length > 0
        ? order.order_items
            .map(
              (it: any) =>
                `${it.product_name} ${it.variant_name ? `(${it.variant_name})` : ""}\nالكمية: ${it.quantity}\nالسعر: ${formatPrice(it.total_price)}`
            )
            .join("\n\n")
        : order.items
        ? order.items
            .map(
              (it: any) =>
                `${it.product.name_ar} ${it.variant ? `(${it.variant.value})` : ""}\nالكمية: ${it.quantity}\nالسعر: ${formatPrice(it.price * it.quantity)}`
            )
            .join("\n\n")
        : "عطور أرياف الفاخرة";

    const message = `السلام عليكم،

أرغب في تأكيد طلبي من متجر أرياف.

رقم الطلب:
${order.order_number}

المنتجات:

${itemsText}

----------------

الإجمالي:
${formatPrice(order.total_amount)}

بيانات العميل:

الاسم:
${order.customer_name}

الهاتف:
${order.customer_phone}

المدينة:
${order.city}

العنوان:
${order.address}

شكراً لكم،
متجر أرياف ARAYAF`;

    window.open(
      `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FFFDF8] py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-bold text-[#2A1A17] tracking-widest uppercase">جاري استرجاع الطلب...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-16 sm:py-24 font-cairo">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <div className="bg-[#FAF8F5] p-8 sm:p-12 border border-gold/20 shadow-sm text-center relative overflow-hidden">
          
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
          <div className="absolute -top-10 -right-10 text-gold/5">
            <Sparkles className="w-32 h-32" />
          </div>

          {/* Success Icon */}
          <div className="w-16 h-16 bg-[#FFFDF8] border border-gold/30 text-emerald-700 flex items-center justify-center mx-auto mb-8 relative z-10">
            <CheckCircle className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#2A1A17] font-alexandria mb-4 relative z-10">
            تم استلام طلبك بنجاح
          </h1>
          <p className="text-sm text-taupe leading-relaxed max-w-sm mx-auto mb-10 relative z-10">
            شكراً لاختيارك دار أرياف للعطور. تم قيد طلبك بنجاح وسيتم تجهيز عطرك بكل عناية وفخامة.
          </p>

          {/* Order Number Box */}
          <div className="bg-[#FFFDF8] p-5 border border-gold/20 max-w-xs mx-auto mb-10 flex items-center justify-between relative z-10">
            <div className="text-right">
              <span className="text-[10px] text-taupe block font-bold mb-1 uppercase tracking-widest">رقم الطلب</span>
              <span className="text-lg font-black text-[#2A1A17] font-mono tracking-wider">
                {orderNumber}
              </span>
            </div>
            <button
              onClick={copyOrderNumber}
              className="p-2.5 bg-[#FAF8F5] border border-gold/20 text-[#2A1A17] hover:bg-gold/10 transition-colors"
              title="نسخ رقم الطلب"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Action: WhatsApp confirmation button */}
          <div className="space-y-4 max-w-sm mx-auto mb-12 relative z-10">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>متابعة الطلب عبر واتساب</span>
            </button>

            <Link
              to="/shop"
              className="w-full py-4 bg-[#2A1A17] hover:bg-gold text-cream font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>متابعة التسوق</span>
            </Link>
          </div>

          {/* Order Details Brief */}
          {order && (
            <div className="text-right border-t border-gold/10 pt-8 text-xs text-taupe space-y-3 relative z-10">
              <h3 className="text-sm font-bold text-[#2A1A17] mb-4 text-center font-alexandria">تفاصيل مختصرة</h3>
              
              <div className="flex justify-between items-center bg-[#FFFDF8] p-3 border border-gold/10">
                <span>المستلم</span>
                <span className="font-bold text-[#2A1A17]">{order.customer_name}</span>
              </div>
              <div className="flex justify-between items-center bg-[#FFFDF8] p-3 border border-gold/10">
                <span>رقم التواصل</span>
                <span className="font-bold text-[#2A1A17]" dir="ltr">{order.customer_phone}</span>
              </div>
              <div className="flex justify-between items-center bg-[#FFFDF8] p-3 border border-gold/10">
                <span>العنوان</span>
                <span className="font-bold text-[#2A1A17] truncate max-w-[60%]">{order.city} - {order.address}</span>
              </div>
              <div className="flex justify-between items-center bg-[#2A1A17] p-4 text-cream mt-4">
                <span className="font-bold">الإجمالي</span>
                <span className="font-black text-lg">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
