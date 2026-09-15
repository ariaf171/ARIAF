import React, { useMemo } from "react";
import { Order, Product, Profile } from "../lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, Users, Package, ShoppingCart, DollarSign } from "lucide-react";

interface AdminReportsProps {
  orders: Order[];
  products: Product[];
  customers: Profile[];
}

export default function AdminReports({ orders, products, customers }: AdminReportsProps) {
  // Aggregate data for reports
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === "delivered" || o.status === "processing" || o.status === "shipped")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  }, [orders]);

  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  // Monthly Sales Chart Data
  const monthlySales = useMemo(() => {
    const months: Record<string, number> = {};
    const currentYear = new Date().getFullYear();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }

    orders.forEach(order => {
      if (order.status === "cancelled" || order.status === "new") return;
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) {
        months[key] += order.total_amount || 0;
      }
    });

    return Object.keys(months).map(key => ({
      name: key,
      المبيعات: months[key]
    }));
  }, [orders]);

  // Order Status Distribution
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      new: 0,
      contacted: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    orders.forEach(o => {
      if (statusCounts[o.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[o.status as keyof typeof statusCounts]++;
      }
    });
    return [
      { name: "جديد", value: statusCounts.new, color: "#f59e0b" },
      { name: "تم التواصل", value: statusCounts.contacted, color: "#eab308" },
      { name: "قيد التنفيذ", value: statusCounts.processing, color: "#3b82f6" },
      { name: "تم الشحن", value: statusCounts.shipped, color: "#8b5cf6" },
      { name: "مستلم", value: statusCounts.delivered, color: "#10b981" },
      { name: "ملغي", value: statusCounts.cancelled, color: "#ef4444" }
    ];
  }, [orders]);

  // Top Products
  const topProducts = useMemo(() => {
    // In a real scenario, we'd aggregate from order_items.
    // For now, let's just sort products by stock or create mock data.
    return products.slice(0, 5).map(p => ({
      name: p.name_ar,
      المخزون: p.stock_quantity
    }));
  }, [products]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-burgundy flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-gold" />
          التقارير والإحصائيات
        </h1>
        <p className="text-darkText/70">نظرة شاملة على أداء المتجر والمبيعات والمخزون.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-darkText/60 text-sm font-bold">إجمالي المبيعات</p>
          <h3 className="text-2xl font-black text-burgundy">{totalRevenue.toLocaleString()} ر.ع</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-darkText/60 text-sm font-bold">إجمالي الطلبات</p>
          <h3 className="text-2xl font-black text-burgundy">{totalOrders}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-darkText/60 text-sm font-bold">إجمالي العملاء</p>
          <h3 className="text-2xl font-black text-burgundy">{totalCustomers}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-2">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-darkText/60 text-sm font-bold">إجمالي المنتجات</p>
          <h3 className="text-2xl font-black text-burgundy">{totalProducts}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20">
          <h3 className="text-lg font-bold text-burgundy mb-6">المبيعات (آخر 6 أشهر)</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="المبيعات" stroke="#8b1836" strokeWidth={3} dot={{ r: 4, fill: '#cf9f5e' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20">
          <h3 className="text-lg font-bold text-burgundy mb-6">حالة الطلبات</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {orderStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
                <span className="font-bold">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products / Inventory */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20">
        <h3 className="text-lg font-bold text-burgundy mb-6">حالة المخزون لأبرز المنتجات</h3>
        <div className="h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="name" fontSize={12} tickMargin={10} />
              <YAxis fontSize={12} />
              <RechartsTooltip />
              <Bar dataKey="المخزون" fill="#cf9f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
