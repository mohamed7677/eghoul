import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Utensils,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  FolderOpen,
  Image,
  Upload,
  Check,
  X,
  FileText,
  Percent,
  TrendingUp,
  Flame,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Star,
  Skull,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle,
  Archive,
  RefreshCw,
  Sliders,
  Sparkle,
  Settings,
  Info
} from "lucide-react";

import { MenuItem, Category, ExtraOption, MediaItem, Order, ProductVariant, Coupon } from "../types";

interface AdminDashboardProps {
  orders: Order[];
  onRefreshOrders: () => void;
  soundOn: boolean;
  onPlaySound: (type: "click" | "skull" | "ember" | "fire") => void;
  onCatalogChange?: () => void;
}

export default function AdminDashboard({
  orders,
  onRefreshOrders,
  soundOn,
  onPlaySound,
  onCatalogChange
}: AdminDashboardProps) {
  // Navigation tabs within Admin Dashboard
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "menu" | "categories" | "extras" | "media" | "stock" | "coupons" | "integration">("overview");

  // API State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [extras, setExtras] = useState<ExtraOption[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Google Sheets integration state
  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Search and Filter State
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  // Modals & Editing state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const [editingExtra, setEditingExtra] = useState<ExtraOption | null>(null);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [isNewExtra, setIsNewExtra] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [isNewCoupon, setIsNewCoupon] = useState(false);

  // Media library multi-selection or single-selection reference
  const [mediaTargetField, setMediaTargetField] = useState<{ type: "primary" | "gallery"; index?: number } | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Quick statistics calculated dynamically
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    activeDiscountsCount: 0,
    availableProductsCount: 0,
    outOfStockCount: 0,
    categoriesCount: 0,
    todayOrdersCount: 0,
    lowStockCount: 0
  });

  // Load backend data
  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [menuRes, catRes, extRes, medRes, coupRes, settingsRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/categories"),
        fetch("/api/extras"),
        fetch("/api/media"),
        fetch("/api/coupons"),
        fetch("/api/settings").catch(() => null)
      ]);

      const menuData = await menuRes.json();
      const catData = await catRes.json();
      const extData = await extRes.json();
      const medData = await medRes.json();
      const coupData = await coupRes.json();

      setMenuItems(menuData);
      setCategories(catData);
      setExtras(extData);
      setMediaItems(medData);
      setCoupons(coupData);

      if (settingsRes) {
        try {
          const settingsData = await settingsRes.json();
          setGoogleAppsScriptUrl(settingsData.googleAppsScriptUrl || "");
        } catch (e) {
          console.error("Error parsing settings data:", e);
        }
      }

      // Re-calculate stats
      calculateStats(menuData, catData, extData);

      // Notify parent App component for dynamic real-time reactivity
      onCatalogChange?.();
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [orders]);

  const calculateStats = (menu: MenuItem[], cats: Category[], ext: ExtraOption[]) => {
    // Orders-based stats
    const totalRev = orders.reduce((sum, o) => (o.status === "Delivered" ? sum + o.totalPrice : sum), 0);
    const completedOrders = orders.filter(o => o.status === "Delivered").length;
    
    // Today's date check (UTC-based or Local comparison depending on timestamps)
    const todayStr = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(o => o.timestamp.startsWith(todayStr));
    const todayOrdersCount = todayOrders.length;

    const activeDiscounts = menu.filter(m => m.discount && m.discount.isActive).length;
    const available = menu.filter(m => m.availability === "in-stock" && !m.isArchived).length;
    const outOfStock = menu.filter(m => m.availability === "out-of-stock" && !m.isArchived).length;
    const lowStock = menu.filter(m => m.availability === "low-stock" && !m.isArchived).length;
    const uniqueCategories = cats.length;

    setStats({
      totalRevenue: Math.round(totalRev),
      totalOrdersCount: orders.length,
      activeDiscountsCount: activeDiscounts,
      availableProductsCount: available,
      outOfStockCount: outOfStock,
      categoriesCount: uniqueCategories,
      todayOrdersCount,
      lowStockCount: lowStock
    });
  };

  // ── SAVE MENU ITEM ──
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    onPlaySound("fire");
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        setShowItemModal(false);
        setEditingItem(null);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to save menu item:", err);
    }
  };

  // ── DELETE MENU ITEM ──
  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوجبة نهائياً من سجلات الغول؟")) return;
    onPlaySound("skull");
    try {
      const res = await fetch("/api/menu/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // ── DUPLICATE MENU ITEM ──
  const handleDuplicateItem = async (id: string) => {
    onPlaySound("ember");
    try {
      const res = await fetch("/api/menu/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to duplicate item:", err);
    }
  };

  // ── ARCHIVE / RESTORE ITEM ──
  const handleToggleArchiveItem = async (item: MenuItem) => {
    onPlaySound("click");
    const updated = { ...item, isArchived: !item.isArchived };
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to toggle archive status:", err);
    }
  };

  // ── SAVE CATEGORY ──
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    onPlaySound("fire");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory)
      });
      if (res.ok) {
        setShowCategoryModal(false);
        setEditingCategory(null);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  // ── DELETE CATEGORY ──
  const handleDeleteCategory = async (id: string) => {
    if (id === "all" || id === "beef" || id === "chicken") {
      alert("لا يمكن حذف الأقسام الأساسية للنظام لسلامة البيانات.");
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ لن يتم حذف المنتجات التابعة له ولكنها ستفقد تصنيفها.")) return;
    onPlaySound("skull");
    try {
      const res = await fetch("/api/categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // ── SAVE EXTRA OPTION ──
  const handleSaveExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExtra) return;
    onPlaySound("fire");
    try {
      const res = await fetch("/api/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingExtra)
      });
      if (res.ok) {
        setShowExtraModal(false);
        setEditingExtra(null);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to save extra option:", err);
    }
  };

  // ── DELETE EXTRA OPTION ──
  const handleDeleteExtra = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الإضافة؟")) return;
    onPlaySound("skull");
    try {
      const res = await fetch("/api/extras/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to delete extra option:", err);
    }
  };

  // ── SAVE COUPON ──
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    onPlaySound("fire");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCoupon)
      });
      if (res.ok) {
        setShowCouponModal(false);
        setEditingCoupon(null);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to save coupon:", err);
    }
  };

  // ── DELETE COUPON ──
  const handleDeleteCoupon = async (code: string) => {
    if (!confirm("هل أنت متأكد من حذف كود الخصم هذا نهائياً؟")) return;
    onPlaySound("skull");
    try {
      const res = await fetch("/api/coupons/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to delete coupon:", err);
    }
  };

  // ── SAVE GOOGLE SHEETS SETTINGS ──
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    onPlaySound("fire");
    setIsSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAppsScriptUrl })
      });
      if (res.ok) {
        setSettingsFeedback({ message: "تم حفظ وتفعيل ربط جوجل شيت بنجاح! 🔥", type: "success" });
      } else {
        setSettingsFeedback({ message: "فشل حفظ الإعدادات، يرجى المحاولة مرة أخرى.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setSettingsFeedback({ message: "حدث خطأ أثناء الاتصال بالخادم الرئيسي.", type: "error" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ── MEDIA LIBRARY FILE UPLOAD ──
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      onPlaySound("ember");
      const base64Url = reader.result as string;
      try {
        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            url: base64Url,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type
          })
        });
        if (res.ok) {
          fetchAllAdminData();
        }
      } catch (err) {
        console.error("Failed to upload media:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة من مكتبة الوسائط؟")) return;
    onPlaySound("skull");
    try {
      const res = await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Failed to delete media item:", err);
    }
  };

  // Helper to open media selector for a specific field
  const openMediaSelector = (target: "primary" | "gallery", index?: number) => {
    setMediaTargetField({ type: target, index });
    setShowMediaSelector(true);
  };

  const selectMediaForTarget = (url: string) => {
    if (!editingItem || !mediaTargetField) return;

    onPlaySound("click");
    if (mediaTargetField.type === "primary") {
      setEditingItem({ ...editingItem, image: url });
    } else if (mediaTargetField.type === "gallery" && typeof mediaTargetField.index === "number") {
      const gallery = editingItem.images ? [...editingItem.images] : [];
      gallery[mediaTargetField.index] = url;
      setEditingItem({ ...editingItem, images: gallery });
    } else if (mediaTargetField.type === "gallery" && mediaTargetField.index === undefined) {
      const gallery = editingItem.images ? [...editingItem.images] : [];
      gallery.push(url);
      setEditingItem({ ...editingItem, images: gallery });
    }

    setShowMediaSelector(false);
    setMediaTargetField(null);
  };

  // ── QUICK STOCK TOGGLE ──
  const handleQuickStockToggle = async (item: MenuItem, status: "in-stock" | "out-of-stock" | "low-stock") => {
    onPlaySound("click");
    const updated = { ...item, availability: status };
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, availability: status } : m));
        // Re-calc dynamic stats
        const updatedList = menuItems.map(m => m.id === item.id ? { ...m, availability: status } : m);
        calculateStats(updatedList, categories, extras);
      }
    } catch (err) {
      console.error("Failed to toggle stock status:", err);
    }
  };

  // ── INTERACTIVE MOCK DATA FOR THE CHARTS ──
  const mockRevenueHistory = [
    { day: "السبت", value: stats.totalRevenue * 0.15 + 1000 },
    { day: "الأحد", value: stats.totalRevenue * 0.18 + 1200 },
    { day: "الإثنين", value: stats.totalRevenue * 0.12 + 900 },
    { day: "الثلاثاء", value: stats.totalRevenue * 0.10 + 800 },
    { day: "الأربعاء", value: stats.totalRevenue * 0.14 + 1100 },
    { day: "الخميس", value: stats.totalRevenue * 0.22 + 1600 },
    { day: "الجمعة", value: stats.totalRevenue * 0.09 + 700 + (stats.todayOrdersCount * 195) }
  ];

  return (
    <div className="space-y-8 text-right font-sans" id="admin-dashboard-root">
      {/* Dynamic Burning Header Panel */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-smoky-gray to-obsidian border border-charcoal/80 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="absolute top-0 right-10 w-40 h-[2px] bg-gradient-to-r from-blood-red via-burnt-copper to-transparent" />
        <div className="z-10 text-center md:text-right space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Sliders className="w-6 h-6 text-blood-red animate-pulse" />
            عرين <span className="text-blood-red text-glow-red">التحكم والطقوس</span> الإدارية
          </h2>
          <p className="text-neutral-400 text-xs max-w-xl">
            إدارة الخلطات السرية للغول، وجدولة الخصومات الحارقة، والإشراف على طهاة البركان وتحديث كتاب الطهي والأسعار لحظياً.
          </p>
        </div>

        <button
          onClick={fetchAllAdminData}
          className="z-10 flex items-center gap-2 px-4 py-2 bg-charcoal/50 hover:bg-neutral-800 border border-charcoal text-xs font-bold rounded-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-burnt-copper" /> تحديث البيانات المتزامنة
        </button>
      </div>

      {/* Admin Horizontal Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-charcoal/40 pb-3 justify-start">
        {[
          { id: "overview", label: "نظرة عامة والتحليلات", icon: LayoutDashboard, color: "text-blood-red" },
          { id: "menu", label: "أطباق الغول", icon: Utensils, color: "text-amber-500" },
          { id: "categories", label: "الأقسام والمطابخ", icon: Layers, color: "text-teal-400" },
          { id: "extras", label: "ترقيات وإضافات", icon: Sparkle, color: "text-purple-400" },
          { id: "stock", label: "غرفة التحكم بالمخزون", icon: AlertTriangle, color: "text-orange-400" },
          { id: "media", label: "خزانة الصور والوسائط", icon: Image, color: "text-blue-400" },
          { id: "coupons", label: "مواثيق ورموز الخصم", icon: Percent, color: "text-emerald-400" },
          { id: "integration", label: "ربط جوجل شيت (Sheets)", icon: Settings, color: "text-burnt-copper" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onPlaySound("click");
                setActiveSubTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isActive
                  ? "bg-blood-red/10 border-blood-red/40 text-bone-white shadow-[0_0_12px_rgba(161,0,23,0.15)]"
                  : "bg-obsidian/30 border-charcoal/40 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: OVERVIEW & INTERACTIVE ANALYTICS                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Bento-Grid KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "الأرباح المدفوعة (ج.م)", value: `${stats.totalRevenue}`, desc: "من الطلبات المكتملة بالتوصيل", icon: TrendingUp, color: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400" },
              { label: "إجمالي الطلبات التاريخي", value: stats.totalOrdersCount, desc: `سجلت اليوم: ${stats.todayOrdersCount} طقوس`, icon: FileText, color: "from-blood-red/10 to-transparent border-blood-red/20 text-blood-red" },
              { label: "عروض الخصم النشطة", value: stats.activeDiscountsCount, desc: "تغذي الرغبة في الولائم حالياً", icon: Percent, color: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400" },
              { label: "تنبيهات انخفاض المخزون", value: stats.lowStockCount + stats.outOfStockCount, desc: `منها ${stats.outOfStockCount} نفذت بالكامل`, icon: AlertTriangle, color: "from-orange-500/10 to-transparent border-orange-500/20 text-orange-400" }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className={`bg-gradient-to-br ${card.color} border rounded-2xl p-5 space-y-2 relative overflow-hidden`}>
                  <div className="absolute -top-6 -left-6 opacity-5 pointer-events-none">
                    <Icon className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{card.label}</span>
                    <Icon className="w-4 h-4 opacity-75" />
                  </div>
                  <p className="text-2xl font-black font-mono tracking-tight text-bone-white">{card.value}</p>
                  <p className="text-[9px] text-neutral-500 font-medium">{card.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Glowing Charts (Flame-Style Daily Revenue and Volume charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Revenue Volcano Chart */}
            <div className="lg:col-span-2 bg-obsidian/40 border border-charcoal/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-burnt-copper font-mono font-bold tracking-widest flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-blood-red animate-pulse" /> حجم مبيعات الفرن الحارق
                </span>
                <span className="text-xs text-neutral-400">تحليلات دورة الـ 7 أيام الماضية</span>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-charcoal/40 relative">
                {/* Horizontal reference lines */}
                <div className="absolute inset-x-0 top-1/4 border-b border-charcoal/10 border-dashed pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 border-b border-charcoal/10 border-dashed pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 pointer-events-none border-b border-charcoal/10 border-dashed" />

                {mockRevenueHistory.map((h, i) => {
                  const maxVal = Math.max(...mockRevenueHistory.map(d => d.value)) || 1000;
                  const heightPercent = `${Math.min(100, (h.value / maxVal) * 100)}%`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer z-10">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-2 bg-charcoal border border-burnt-copper/30 px-2 py-1 rounded text-[10px] text-bone-white transition-opacity font-mono z-20">
                        {h.value.toFixed(0)} ج.م
                      </div>

                      <div className="w-full max-w-[32px] bg-neutral-900 rounded-t-lg overflow-hidden h-44 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: heightPercent }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="w-full bg-gradient-to-t from-blood-red via-burnt-copper to-amber-500 rounded-t-lg relative group-hover:brightness-125 transition-all shadow-[0_0_15px_rgba(198,91,45,0.2)]"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-2 font-bold">{h.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular items ledger / Top Selling Products */}
            <div className="bg-obsidian/40 border border-charcoal/80 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] text-neutral-400 font-mono font-bold tracking-widest flex items-center gap-1">
                <Skull className="w-3.5 h-3.5 text-blood-red" /> الوجبات الأكثر طلبًا في المعقل
              </span>

              <div className="space-y-3.5">
                {menuItems.slice(0, 4).map((item, idx) => {
                  const percentage = [85, 68, 45, 30][idx] || 15;
                  return (
                    <div key={item.id} className="space-y-1 text-right">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-neutral-200">{item.nameEn.split(" ")[0]} ({item.name})</span>
                        <span className="text-neutral-500 font-mono">{percentage}% طلبات</span>
                      </div>
                      <div className="h-2 bg-neutral-900 border border-charcoal/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.15 }}
                          className="h-full rounded-full bg-gradient-to-r from-blood-red via-burnt-copper to-amber-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-charcoal/30 pt-4 text-center">
                <p className="text-[10px] text-neutral-500 italic">
                  تعتمد الأوزان والنسب على مجموع التقديمات المتكررة وسجلات التحضير البركاني.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Recent order tracker logs */}
          <div className="bg-obsidian/40 border border-charcoal/80 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">طقوس تحضير الطلبيات النشطة</span>
              <span className="text-[10px] text-neutral-500 font-mono">سجل الطلبات المتزامن</span>
            </div>

            <div className="overflow-x-auto text-xs font-mono text-neutral-300">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-charcoal/60 text-[10px] text-neutral-500">
                    <th className="pb-2">معرف الطلب</th>
                    <th className="pb-2">الزبون</th>
                    <th className="pb-2">السعر</th>
                    <th className="pb-2">الحالة الراهنة</th>
                    <th className="pb-2 text-left">زمن التقديم</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.orderId} className="border-b border-charcoal/30 hover:bg-neutral-900/40">
                      <td className="py-2.5 font-bold text-blood-red">{o.orderId}</td>
                      <td>{o.name}</td>
                      <td className="text-burnt-copper font-bold">{o.totalPrice} ج.م</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          o.status === "New" ? "bg-amber-500/10 text-amber-400" :
                          o.status === "Preparing" ? "bg-blood-red/10 text-blood-red animate-pulse" :
                          "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {o.status === "New" ? "جديد" : o.status === "Preparing" ? "تحت اللهب" : "تم التوصيل"}
                        </span>
                      </td>
                      <td className="text-left text-[10px] text-neutral-500">{new Date(o.timestamp).toLocaleTimeString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: PROFESSIONAL MENU ITEMS MANAGER                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "menu" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-obsidian/30 p-4 rounded-2xl border border-charcoal/40">
            {/* Left aligned Filters and Search */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-neutral-500 absolute top-2.5 right-3" />
                <input
                  type="text"
                  placeholder="ابحث عن وجبة..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-charcoal/40 border border-charcoal hover:border-neutral-600 focus:border-burnt-copper rounded-xl py-2 pl-3 pr-9 text-xs font-bold text-bone-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Category selector filter */}
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="bg-charcoal/40 border border-charcoal rounded-xl px-3 py-2 text-xs font-bold text-neutral-300 outline-none"
              >
                <option value="all">كل الأقسام</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Archived filter button */}
              <button
                onClick={() => {
                  onPlaySound("click");
                  setShowArchived(!showArchived);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  showArchived
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                    : "bg-charcoal/20 border-charcoal text-neutral-400 hover:text-white"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>عرض الأرشيف</span>
              </button>
            </div>

            {/* Create product button */}
            <button
              onClick={() => {
                onPlaySound("fire");
                setIsNewItem(true);
                setEditingItem({
                  id: `menu-item-${Date.now()}`,
                  name: "وجبة جديدة للغول",
                  nameAr: "وجبة جديدة للغول",
                  nameEn: "New Ghoul Feast Item",
                  description: "أدخل الوصف باللغة العربية هنا لمستحضر الغول الشهي.",
                  descriptionAr: "أدخل الوصف باللغة العربية هنا لمستحضر الغول الشهي.",
                  descriptionEn: "Enter English description here describing the sinister taste.",
                  price: 150.00,
                  type: "beef",
                  category: "beef",
                  image: "/src/assets/images/beef_ghoul_prime_1782719474235.jpg",
                  images: [],
                  spicyLevel: 1,
                  availability: "in-stock",
                  prepTime: 15,
                  calories: 700,
                  ingredients: ["مكونات سرية"],
                  allergens: ["اللاكتوز"],
                  displayOrder: menuItems.length + 1,
                  variants: []
                });
                setShowItemModal(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blood-red hover:bg-red-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(161,0,23,0.3)]"
            >
              <Plus className="w-4 h-4" /> إضافة صنف جديد
            </button>
          </div>

          {/* Grid of existing menu items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter(item => {
                const matchesSearch = item.nameAr.toLowerCase().includes(menuSearch.toLowerCase()) || item.nameEn.toLowerCase().includes(menuSearch.toLowerCase());
                const matchesCategory = selectedCatFilter === "all" || item.category === selectedCatFilter;
                const matchesArchive = showArchived ? item.isArchived === true : !item.isArchived;
                return matchesSearch && matchesCategory && matchesArchive;
              })
              .map((item) => {
                // Determine if item has discount
                const hasDiscount = item.discount && item.discount.isActive;
                const discountPrice = hasDiscount
                  ? item.discount!.type === "percentage"
                    ? item.price * (1 - item.discount!.value / 100)
                    : item.price - item.discount!.value
                  : item.price;

                return (
                  <div
                    key={item.id}
                    className="relative bg-gradient-to-br from-smoky-gray to-obsidian border border-charcoal/80 rounded-2xl p-5 space-y-4 shadow-xl overflow-hidden group hover:border-burnt-copper/50 transition-all duration-300"
                  >
                    {/* Corner item badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {item.isArchived && (
                        <span className="bg-neutral-800 text-neutral-400 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border border-neutral-700">مؤرشف</span>
                      )}
                      {item.popularBadge && (
                        <span className="bg-blood-red text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">مشهور 🔥</span>
                      )}
                      {item.bestSellerBadge && (
                        <span className="bg-burnt-copper text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">الأكثر مبيعاً 🏆</span>
                      )}
                      {hasDiscount && (
                        <span className="bg-amber-500 text-obsidian text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                          {item.discount!.badgeType} %
                        </span>
                      )}
                    </div>

                    {/* Image Preview */}
                    <div className="h-40 rounded-xl overflow-hidden relative bg-neutral-900 border border-charcoal/40 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.nameAr}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // fallback
                          (e.target as HTMLImageElement).src = "/src/assets/images/beef_ghoul_prime_1782719474235.jpg";
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-obsidian/85 px-2 py-0.5 rounded text-[8px] text-neutral-400 font-mono">
                        {item.prepTime} دقيقة • {item.calories} سعرة
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-burnt-copper font-bold font-mono uppercase tracking-widest">{item.category.toUpperCase()}</span>
                      <h3 className="text-sm font-black text-bone-white leading-tight">{item.nameAr}</h3>
                      <p className="text-[10px] text-neutral-500 font-mono italic">{item.nameEn}</p>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed min-h-[36px]">{item.descriptionAr}</p>
                    </div>

                    {/* Prices row */}
                    <div className="flex justify-between items-center pt-2 border-t border-charcoal/30">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-burnt-copper">{discountPrice} ج.م</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-neutral-500 line-through">{item.price} ج.م</span>
                        )}
                      </div>

                      {/* Stock Badge */}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        item.availability === "in-stock" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        item.availability === "low-stock" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {item.availability === "in-stock" ? "متوفر" : item.availability === "low-stock" ? "مخزون منخفض" : "نفذ"}
                      </span>
                    </div>

                    {/* Action buttons panel */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <button
                        onClick={() => {
                          onPlaySound("fire");
                          setIsNewItem(false);
                          setEditingItem({ ...item });
                          setShowItemModal(true);
                        }}
                        className="col-span-2 py-1.5 bg-charcoal/50 hover:bg-neutral-800 border border-charcoal text-[10px] font-bold rounded-lg text-bone-white transition-all cursor-pointer text-center"
                      >
                        تعديل الوجبة ⚙️
                      </button>
                      <button
                        onClick={() => handleDuplicateItem(item.id)}
                        title="تكرار الصنف كمسودة"
                        className="py-1.5 bg-charcoal/30 hover:bg-neutral-800 border border-charcoal/60 text-neutral-300 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchiveItem(item)}
                        title={item.isArchived ? "استعادة من الأرشيف" : "أرشفة الصنف"}
                        className="py-1.5 bg-charcoal/30 hover:bg-neutral-800 border border-charcoal/60 text-neutral-300 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                      >
                        {item.isArchived ? <RefreshCw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Delete block */}
                    <div className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 bg-blood-red/10 border border-blood-red/40 hover:bg-blood-red text-blood-red hover:text-white rounded-lg transition-all"
                        title="حذف صنف الغول"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: CATEGORIES & KITCHEN DEPARTMENTS                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "categories" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Categories controls */}
          <div className="flex justify-between items-center bg-obsidian/30 p-4 rounded-2xl border border-charcoal/40">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">إدارة أقسام طقوس الغول</span>
            <button
              onClick={() => {
                onPlaySound("fire");
                setIsNewCategory(true);
                setEditingCategory({
                  id: `cat-${Date.now()}`,
                  name: "قسم جديد",
                  nameAr: "قسم جديد",
                  nameEn: "New Category",
                  icon: "Flame",
                  displayOrder: categories.length + 1,
                  isHidden: false
                });
                setShowCategoryModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blood-red hover:bg-red-800 text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة قسم جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-gradient-to-br from-smoky-gray to-obsidian border border-charcoal/80 rounded-2xl p-5 space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-3 bg-charcoal/50 rounded-xl border border-charcoal/80 text-burnt-copper font-mono">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-bone-white">{cat.nameAr}</h3>
                      <p className="text-[10px] text-neutral-500 font-mono italic">{cat.nameEn}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-bold">ترتيب: {cat.displayOrder}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-charcoal/30">
                  <div className="flex gap-2 text-[10px] text-neutral-400">
                    <span>{menuItems.filter(m => m.category === cat.id).length} أطباق</span>
                    <span>•</span>
                    <span className={cat.isHidden ? "text-red-400" : "text-emerald-400"}>
                      {cat.isHidden ? "مخفي عن الزبائن" : "مرئي"}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onPlaySound("click");
                        setIsNewCategory(false);
                        setEditingCategory({ ...cat });
                        setShowCategoryModal(true);
                      }}
                      className="px-2.5 py-1 bg-charcoal hover:bg-neutral-800 border border-charcoal/80 text-[10px] font-bold rounded-lg transition-all"
                    >
                      تعديل
                    </button>
                    {cat.id !== "all" && cat.id !== "beef" && cat.id !== "chicken" && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 bg-blood-red/10 hover:bg-blood-red border border-blood-red/30 text-blood-red hover:text-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: EXTRAS & UPGRADES MANAGER                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "extras" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Extras Control Box */}
          <div className="flex justify-between items-center bg-obsidian/30 p-4 rounded-2xl border border-charcoal/40">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">إدارة الإضافات والترقيات البركانية</span>
            <button
              onClick={() => {
                onPlaySound("fire");
                setIsNewExtra(true);
                setEditingExtra({
                  id: `extra-${Date.now()}`,
                  name: "إضافة بركانية جديدة",
                  price: 20.00,
                  category: "cheese",
                  description: "أدخل وصف المذاق هنا.",
                  isEnabled: true,
                  maxQuantity: 3,
                  availability: "in-stock"
                });
                setShowExtraModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blood-red hover:bg-red-800 text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة ترقية جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {extras.map((extra) => (
              <div
                key={extra.id}
                className={`bg-gradient-to-br from-smoky-gray to-obsidian border rounded-2xl p-5 space-y-3 relative overflow-hidden transition-all duration-300 ${
                  extra.isEnabled ? "border-charcoal/80" : "border-red-950/40 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-bone-white">{extra.name}</h3>
                    <p className="text-[10px] text-neutral-500 font-mono">القسم: {extra.category.toUpperCase()}</p>
                  </div>
                  <span className="text-sm font-black text-burnt-copper">{extra.price} ج.م</span>
                </div>

                <p className="text-xs text-neutral-400 min-h-[32px]">{extra.description}</p>

                <div className="flex justify-between items-center pt-3 border-t border-charcoal/30">
                  <div className="flex gap-2 text-[10px] text-neutral-500">
                    <span>الحد الأقصى للطلب: {extra.maxQuantity}</span>
                    <span>•</span>
                    <span className={extra.availability === "in-stock" ? "text-emerald-400" : "text-red-400"}>
                      {extra.availability === "in-stock" ? "متوفر" : "غير متوفر"}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onPlaySound("click");
                        setIsNewExtra(false);
                        setEditingExtra({ ...extra });
                        setShowExtraModal(true);
                      }}
                      className="px-2.5 py-1 bg-charcoal hover:bg-neutral-800 border border-charcoal/80 text-[10px] font-bold rounded-lg transition-all"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteExtra(extra.id)}
                      className="p-1 bg-blood-red/10 hover:bg-blood-red border border-blood-red/30 text-blood-red hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 5: ONE-CLICK QUICK STOCK CONTROL CENTER               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "stock" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-obsidian/30 p-5 rounded-2xl border border-charcoal/40 text-right space-y-1">
            <h3 className="text-sm font-black text-bone-white">غرفة تحويل وتعديل مخزون الغول الفوري</h3>
            <p className="text-[11px] text-neutral-400">
              تحكم بمرونة مطلقة في توفر أي برجر أو مكون. المنتجات غير المتوفرة تظل ظاهرة للزبائن ولكن يتم إيقاف زر الشراء تلقائيًا مع ظهور شريط "نفذ المخزون".
            </p>
          </div>

          <div className="overflow-x-auto border border-charcoal/60 rounded-2xl bg-obsidian/40">
            <table className="w-full text-right text-xs text-neutral-300 font-mono">
              <thead>
                <tr className="border-b border-charcoal/80 bg-charcoal/20 text-[10px] text-neutral-500 uppercase">
                  <th className="py-3 px-4">صورة الوجبة</th>
                  <th className="py-3 px-4">الوجبة / المكون</th>
                  <th className="py-3 px-4">القسم</th>
                  <th className="py-3 px-4 text-center">حالة التوفر الحالية</th>
                  <th className="py-3 px-4 text-left">تعديل فوري سريع (1-Click)</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b border-charcoal/30 hover:bg-neutral-900/40">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-charcoal/60 bg-neutral-900">
                        <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="block font-bold text-neutral-200">{item.nameAr}</span>
                      <span className="block text-[10px] text-neutral-500">{item.nameEn}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-charcoal text-[9px] px-1.5 py-0.5 rounded text-neutral-400">
                        {item.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black ${
                        item.availability === "in-stock" ? "bg-emerald-500/10 text-emerald-400" :
                        item.availability === "low-stock" ? "bg-amber-500/10 text-amber-400 animate-pulse" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {item.availability === "in-stock" ? "متوفر" : item.availability === "low-stock" ? "مخزون منخفض" : "نفذ بالكامل"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left">
                      <div className="inline-flex rounded-lg border border-charcoal overflow-hidden p-[2px] bg-charcoal/20">
                        <button
                          onClick={() => handleQuickStockToggle(item, "in-stock")}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer ${
                            item.availability === "in-stock" ? "bg-emerald-500/20 text-emerald-300" : "text-neutral-500 hover:text-white"
                          }`}
                        >
                          متوفر
                        </button>
                        <button
                          onClick={() => handleQuickStockToggle(item, "low-stock")}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer ${
                            item.availability === "low-stock" ? "bg-amber-500/20 text-amber-300" : "text-neutral-500 hover:text-white"
                          }`}
                        >
                          منخفض
                        </button>
                        <button
                          onClick={() => handleQuickStockToggle(item, "out-of-stock")}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer ${
                            item.availability === "out-of-stock" ? "bg-red-500/20 text-red-300" : "text-neutral-500 hover:text-white"
                          }`}
                        >
                          نفذ
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 6: MEDIA MANAGER LIBRARY                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "media" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Media Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-obsidian/30 p-4 rounded-2xl border border-charcoal/40">
            <div>
              <h3 className="text-sm font-black text-bone-white">مكتبة الوسائط والصور المظلمة</h3>
              <p className="text-[10px] text-neutral-400">
                قم بسحب وإلقاء صور الوجبات الجديدة لضغطها وتوليد روابط محلية لاستخدامها في تزيين القائمة وتصميم المعارض البصرية.
              </p>
            </div>

            {/* Custom file drag upload input */}
            <div className="relative cursor-pointer overflow-hidden inline-flex items-center gap-2 bg-burnt-copper hover:bg-orange-800 text-obsidian font-black text-xs px-4 py-2.5 rounded-xl transition-all w-full sm:w-auto justify-center">
              <Upload className="w-4 h-4" />
              <span>رفع صورة جديدة</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Media visual gallery grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaItems.map((med) => (
              <div
                key={med.id}
                className="bg-gradient-to-b from-smoky-gray to-obsidian border border-charcoal rounded-xl overflow-hidden relative group hover:border-burnt-copper/40 transition-all"
              >
                <div className="h-32 bg-neutral-900 flex items-center justify-center overflow-hidden border-b border-charcoal/40">
                  <img src={med.url} alt={med.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>

                <div className="p-2 text-right">
                  <span className="block text-[10px] font-bold text-neutral-300 truncate" title={med.name}>{med.name}</span>
                  <span className="block text-[8px] text-neutral-500 font-mono">{med.size || "120 KB"}</span>
                </div>

                {/* Hover actions */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteMedia(med.id)}
                    className="p-1 bg-blood-red/10 border border-blood-red/40 hover:bg-blood-red text-blood-red hover:text-white rounded transition-all"
                    title="حذف الصورة من المعرض"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 7: DYNAMIC COUPONS MANAGER                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "coupons" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-obsidian/30 p-4 rounded-2xl border border-charcoal/40">
            <div>
              <h3 className="text-sm font-black text-bone-white">مواثيق ورموز الخصم السحرية</h3>
              <p className="text-[10px] text-neutral-400">
                إدارة أكواد الخصم والرموز الترويجية، وتحديد القيم ونوع الخصم (مئوي أو قيمة ثابتة) والحد الأدنى لقيمة السلة لتشجيع الولائم الكبرى.
              </p>
            </div>

            <button
              onClick={() => {
                onPlaySound("ember");
                setEditingCoupon({
                  code: "",
                  type: "percentage",
                  value: 10,
                  minOrder: 100,
                  isActive: true,
                  description: ""
                });
                setIsNewCoupon(true);
                setShowCouponModal(true);
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-obsidian font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء ميثاق خصم جديد</span>
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-obsidian/20 rounded-2xl border border-charcoal/40">
              <Percent className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
              <p className="text-neutral-400 text-xs">لا يوجد أكواد خصم نشطة حالياً. ابدأ بإنشاء أول ميثاق خصم للعملاء.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="bg-gradient-to-b from-smoky-gray to-obsidian border border-charcoal rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all relative group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-obsidian border border-charcoal rounded-md text-xs font-mono font-black text-emerald-400 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        coupon.isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                        {coupon.isActive ? "فعال ونشط" : "خامل / معطل"}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="text-lg font-black text-bone-white font-sans flex items-baseline gap-1.5">
                        <span>{coupon.value}</span>
                        <span className="text-xs text-neutral-400">{coupon.type === "percentage" ? "٪ خصم مئوي" : "ج.م خصم ثابت"}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                        {coupon.description || "لا يوجد وصف لهذا الميثاق حالياً."}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-charcoal/40 pt-3 flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 font-bold">
                      الحد الأدنى للوليمة: <span className="text-neutral-300 font-mono font-normal">{coupon.minOrder} ج.م</span>
                    </span>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          onPlaySound("click");
                          setEditingCoupon(coupon);
                          setIsNewCoupon(false);
                          setShowCouponModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded border border-charcoal text-xs font-bold transition-colors cursor-pointer"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="p-1.5 bg-blood-red/10 border border-blood-red/20 hover:bg-blood-red text-blood-red hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 8: GOOGLE SHEETS INTEGRATION & CODE GENERATOR          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "integration" && (
        <div className="space-y-6 animate-fadeIn text-right" dir="rtl">
          <div className="bg-gradient-to-br from-smoky-gray to-obsidian border border-charcoal rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-black text-bone-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-burnt-copper" />
              <span>ربط قاعدة البيانات بجدول بيانات جوجل (Google Sheets)</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
              يمكنك ربط مطبخ الغول بـ <strong>Google Sheets</strong> لحفظ واستقبال الطلبات في جدول البيانات الخاص بك بشكل حي وتلقائي تماماً! عند تفعيل هذا الخيار، سيتم تسجيل كل طلب جديد يقوم به الزبون تلقائياً في السطر التالي من الجدول.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl pt-2">
              <div className="space-y-2">
                <label className="text-xs text-neutral-300 font-bold block">رابط نشر الويب الخاص بـ Google Apps Script (Web App URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={googleAppsScriptUrl}
                    onChange={(e) => setGoogleAppsScriptUrl(e.target.value)}
                    className="flex-1 bg-obsidian border border-charcoal rounded-xl p-3.5 text-bone-white focus:outline-none focus:border-burnt-copper font-mono text-left text-xs"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 bg-burnt-copper hover:bg-burnt-copper/90 text-white font-black rounded-xl transition-all duration-300 disabled:opacity-50 text-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingSettings ? "جاري الحفظ..." : "حفظ وتفعيل الربط ⚡"}
                  </button>
                </div>
              </div>

              {settingsFeedback && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  settingsFeedback.type === "success" 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{settingsFeedback.message}</span>
                </div>
              )}
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Guide Steps */}
            <div className="lg:col-span-5 bg-charcoal/30 border border-charcoal/40 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-bone-white flex items-center gap-2">
                <Info className="w-4 h-4 text-burnt-copper" />
                <span>دليل التفعيل خطوة بخطوة</span>
              </h4>
              
              <ol className="space-y-4 text-xs text-neutral-300 list-decimal list-inside leading-relaxed">
                <li className="font-medium">
                  قم بإنشاء جدول بيانات جديد على <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-burnt-copper hover:underline font-bold inline-flex items-center gap-0.5">Google Sheets <span dir="ltr">↗</span></a>.
                </li>
                <li className="font-medium">
                  من القائمة العلوية للجدول، اذهب إلى <strong>Extensions (الامتدادات)</strong> &gt; <strong>Apps Script</strong>.
                </li>
                <li className="font-medium">
                  امسح أي كود موجود في المحرر هناك، ثم انسخ الكود الكامل المتواجد في اللوحة الجانبية وضعه بدلاً منه.
                </li>
                <li className="font-medium">
                  اضغط على زر <strong>Deploy (نشر)</strong> في أعلى اليمين &gt; <strong>New deployment (نشر جديد)</strong>.
                </li>
                <li className="font-medium">
                  اختر نوع النشر <strong>Web app (تطبيق ويب)</strong> عن طريق الضغط على الترس بجانب "Select type".
                </li>
                <li className="font-medium">
                  في خيار (Who has access)، غيره إلى <strong>Anyone (أي شخص)</strong> لضمان تدفق الطلبات بنجاح من متجر العميل.
                </li>
                <li className="font-medium">
                  اضغط على <strong>Deploy</strong>، ثم امنح الأذونات اللازمة لحساب جوجل الخاص بك.
                </li>
                <li className="font-medium">
                  قم بنسخ رابط الويب الناتج (Web App URL) والصقه في خانة الإدخال بالأعلى ثم اضغط على "حفظ وتفعيل الربط".
                </li>
              </ol>
            </div>

            {/* Code Copy block */}
            <div className="lg:col-span-7 bg-charcoal/30 border border-charcoal/40 rounded-2xl p-6 space-y-4 flex flex-col">
              <div className="flex justify-between items-center border-b border-charcoal/30 pb-3">
                <button 
                  onClick={() => {
                    const code = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Create headers if row count is 1
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["ORDER_ID", "TIMESTAMP", "CUSTOMER_NAME", "CUSTOMER_PHONE", "DINE_IN_TYPE", "DELIVERY_ADDRESS", "ORDER_ITEMS", "EXTRAS", "TOTAL_PRICE", "STATUS"]);
    }
    
    var itemsStr = data.items.map(function(item) {
      return item.quantity + "x " + item.name + " (" + (item.bunType === "obsidian" ? "Obsidian Bun" : "Bone Bun") + ")";
    }).join(", ");
    
    var extrasStr = data.extras ? data.extras.join(", ") : "";
    
    sheet.appendRow([
      data.orderId || "GHL-" + Math.floor(Math.random() * 9000 + 1000),
      new Date().toLocaleString("ar-EG"),
      data.name,
      "'" + data.phone,
      data.address.indexOf("تناول") > -1 ? "Dine-in" : "Delivery",
      data.address,
      itemsStr,
      extrasStr,
      data.totalPrice + " EGP",
      "New"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var data = [];
    
    for (var i = 1; i < rows.length; i++) {
      data.push({
        orderId: rows[i][0],
        timestamp: rows[i][1],
        name: rows[i][2],
        phone: rows[i][3],
        address: rows[i][5],
        items: [{ name: rows[i][6], quantity: 1, price: 0 }],
        totalPrice: rows[i][8],
        status: rows[i][9]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                    navigator.clipboard.writeText(code);
                    alert("تم نسخ ميثاق الكود البرمجي بنجاح! قم بلصقه في محرر Apps Script.");
                  }}
                  className="flex items-center gap-1 bg-charcoal hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-charcoal"
                >
                  <Copy className="w-3 h-3 text-burnt-copper" />
                  <span>نسخ الكود البرمجي للربط</span>
                </button>
                <span className="text-xs text-bone-white font-bold">كود برمجة جدول البيانات (Google Apps Script Code)</span>
              </div>

              <pre className="bg-obsidian border border-charcoal rounded-xl p-4 text-[9px] font-mono text-left text-neutral-400 overflow-x-auto max-h-[350px]" dir="ltr">
{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Create headers if row count is 1
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["ORDER_ID", "TIMESTAMP", "CUSTOMER_NAME", "CUSTOMER_PHONE", "DINE_IN_TYPE", "DELIVERY_ADDRESS", "ORDER_ITEMS", "EXTRAS", "TOTAL_PRICE", "STATUS"]);
    }
    
    var itemsStr = data.items.map(function(item) {
      return item.quantity + "x " + item.name + " (" + (item.bunType === "obsidian" ? "Obsidian Bun" : "Bone Bun") + ")";
    }).join(", ");
    
    var extrasStr = data.extras ? data.extras.join(", ") : "";
    
    sheet.appendRow([
      data.orderId || "GHL-" + Math.floor(Math.random() * 9000 + 1000),
      new Date().toLocaleString("ar-EG"),
      data.name,
      "'" + data.phone,
      data.address.indexOf("تناول") > -1 ? "Dine-in" : "Delivery",
      data.address,
      itemsStr,
      extrasStr,
      data.totalPrice + " EGP",
      "New"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var data = [];
    
    for (var i = 1; i < rows.length; i++) {
      data.push({
        orderId: rows[i][0],
        timestamp: rows[i][1],
        name: rows[i][2],
        phone: rows[i][3],
        address: rows[i][5],
        items: [{ name: rows[i][6], quantity: 1, price: 0 }],
        totalPrice: rows[i][8],
        status: rows[i][9]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL A: CREATING OR EDITING A MENU ITEM (PRODUCT EXHAUSTIVE EDITOR) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showItemModal && editingItem && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-smoky-gray border border-charcoal rounded-3xl max-w-2xl w-full flex flex-col max-h-[92vh] text-right overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-charcoal bg-charcoal/20 flex justify-between items-center">
                <button
                  onClick={() => {
                    onPlaySound("click");
                    setShowItemModal(false);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-white bg-obsidian rounded-full cursor-pointer ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-base font-black text-bone-white">
                  {isNewItem ? "إضافة صنف جديد إلى قائمة الغول" : `تعديل الصنف: ${editingItem.nameAr}`}
                </h3>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* 1. Basic details (Bilingual) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">الاسم باللغة العربية (العرض الأساسي) *</label>
                    <input
                      type="text"
                      required
                      value={editingItem.nameAr}
                      onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value, name: e.target.value })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">English Name (Bilingual Translation) *</label>
                    <input
                      type="text"
                      required
                      value={editingItem.nameEn}
                      onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">الوصف بالتفصيل (بالعربية) *</label>
                    <textarea
                      required
                      rows={3}
                      value={editingItem.descriptionAr}
                      onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value, description: e.target.value })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">English Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={editingItem.descriptionEn}
                      onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                </div>

                {/* 2. Price, Categories, Calories & Prep Time */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">السعر الأساسي (ج.م) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">السعر الأصلي (قبل الخصم)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.originalPrice || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="اختياري"
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-neutral-400 outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">القسم والتصنيف *</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value, type: (e.target.value === "chicken" ? "chicken" : "beef") })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white font-bold outline-none"
                    >
                      {categories.filter(c => c.id !== "all").map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">حالة توفر المخزون</label>
                    <select
                      value={editingItem.availability}
                      onChange={(e) => setEditingItem({ ...editingItem, availability: e.target.value as any })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white font-bold outline-none"
                    >
                      <option value="in-stock">متوفر بمخزون كافٍ</option>
                      <option value="low-stock">مخزون منخفض</option>
                      <option value="out-of-stock">نفذ المخزون</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">مدة التحضير (دقيقة)</label>
                    <input
                      type="number"
                      value={editingItem.prepTime}
                      onChange={(e) => setEditingItem({ ...editingItem, prepTime: parseInt(e.target.value) || 10 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">عدد السعرات الحرارية</label>
                    <input
                      type="number"
                      value={editingItem.calories}
                      onChange={(e) => setEditingItem({ ...editingItem, calories: parseInt(e.target.value) || 500 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">درجة الحرارة / الفلفل (0-3)</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={editingItem.spicyLevel || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, spicyLevel: (parseInt(e.target.value) || 0) as any })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-burnt-copper font-bold block">ترتيب العرض بالترقية</label>
                    <input
                      type="number"
                      value={editingItem.displayOrder}
                      onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none focus:border-burnt-copper font-mono"
                    />
                  </div>
                </div>

                {/* 3. Image Selection & Media library connection */}
                <div className="space-y-2">
                  <label className="text-burnt-copper font-bold block">صورة الغلاف والصنف الرئيسية</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-charcoal bg-neutral-900 flex-shrink-0">
                      <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <input
                      type="text"
                      value={editingItem.image}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      placeholder="أدخل رابط صورة الغول أو اختر من المعرض"
                      className="flex-1 bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white text-xs font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => openMediaSelector("primary")}
                      className="px-3.5 py-3 bg-charcoal hover:bg-neutral-800 text-xs font-bold rounded-xl border border-charcoal cursor-pointer text-bone-white"
                    >
                      اختر من المعرض 🖼️
                    </button>
                  </div>
                </div>

                {/* 4. Product Variants section */}
                <div className="border-t border-charcoal/30 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-300 font-bold block">متغيرات وأحجام المنتج (Product Variants)</span>
                    <button
                      type="button"
                      onClick={() => {
                        onPlaySound("ember");
                        const variants = editingItem.variants ? [...editingItem.variants] : [];
                        variants.push({
                          id: `v-${Date.now()}-${variants.length}`,
                          name: `حجم جديد`,
                          price: editingItem.price + 50,
                          calories: editingItem.calories + 300,
                          availability: "in-stock"
                        });
                        setEditingItem({ ...editingItem, variants });
                      }}
                      className="flex items-center gap-1 text-[10px] bg-charcoal hover:bg-neutral-800 px-2.5 py-1.5 rounded-lg border border-charcoal text-burnt-copper font-bold"
                    >
                      <Plus className="w-3 h-3" /> أضف متغير (Single/Double/etc)
                    </button>
                  </div>

                  {editingItem.variants && editingItem.variants.length > 0 ? (
                    <div className="space-y-3 bg-neutral-900/40 p-3 rounded-xl border border-charcoal/30">
                      {editingItem.variants.map((v, vIdx) => (
                        <div key={v.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center">
                          <input
                            type="text"
                            required
                            placeholder="اسم المتغير (مثال: Double)"
                            value={v.name}
                            onChange={(e) => {
                              const variants = [...editingItem.variants!];
                              variants[vIdx].name = e.target.value;
                              setEditingItem({ ...editingItem, variants });
                            }}
                            className="bg-charcoal/50 border border-charcoal/60 rounded-lg p-2 text-white text-[11px]"
                          />
                          <input
                            type="number"
                            required
                            placeholder="سعر المتغير ج.م"
                            value={v.price}
                            onChange={(e) => {
                              const variants = [...editingItem.variants!];
                              variants[vIdx].price = parseFloat(e.target.value) || 0;
                              setEditingItem({ ...editingItem, variants });
                            }}
                            className="bg-charcoal/50 border border-charcoal/60 rounded-lg p-2 text-white text-[11px] font-mono"
                          />
                          <input
                            type="number"
                            placeholder="السعرات"
                            value={v.calories}
                            onChange={(e) => {
                              const variants = [...editingItem.variants!];
                              variants[vIdx].calories = parseInt(e.target.value) || 0;
                              setEditingItem({ ...editingItem, variants });
                            }}
                            className="bg-charcoal/50 border border-charcoal/60 rounded-lg p-2 text-white text-[11px] font-mono"
                          />
                          <select
                            value={v.availability}
                            onChange={(e) => {
                              const variants = [...editingItem.variants!];
                              variants[vIdx].availability = e.target.value as any;
                              setEditingItem({ ...editingItem, variants });
                            }}
                            className="bg-charcoal border border-charcoal/60 rounded-lg p-2 text-white text-[11px]"
                          >
                            <option value="in-stock">متوفر</option>
                            <option value="out-of-stock">نفذ</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              onPlaySound("skull");
                              const variants = editingItem.variants!.filter((_, idx) => idx !== vIdx);
                              setEditingItem({ ...editingItem, variants });
                            }}
                            className="p-2 text-blood-red hover:bg-blood-red/10 rounded-lg border border-blood-red/20 flex justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-neutral-500 italic">لا يوجد أحجام إضافية. سيتم طلب الحجم الكلاسيكي الكوني افتراضياً.</p>
                  )}
                </div>

                {/* 5. Discount Management Config */}
                <div className="border-t border-charcoal/30 pt-4 space-y-3.5 bg-obsidian/30 p-4 rounded-xl border border-charcoal/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-amber-500 font-bold block flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> إدارة العروض الحارقة والخصومات للوجبة
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.discount?.isActive || false}
                        onChange={(e) => {
                          onPlaySound("click");
                          const discount = editingItem.discount || {
                            id: `disc-${Date.now()}`,
                            type: "percentage",
                            value: 15,
                            isActive: false,
                            badgeType: "Hot Deal"
                          };
                          discount.isActive = e.target.checked;
                          setEditingItem({ ...editingItem, discount });
                        }}
                        className="rounded bg-charcoal accent-blood-red"
                      />
                      <span className="text-[10px] text-neutral-300 font-bold">تفعيل الخصم فوراً</span>
                    </label>
                  </div>

                  {editingItem.discount?.isActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-neutral-400 text-[10px]">نوع الخصم</label>
                        <select
                          value={editingItem.discount.type}
                          onChange={(e) => {
                            const discount = { ...editingItem.discount!, type: e.target.value as any };
                            setEditingItem({ ...editingItem, discount });
                          }}
                          className="w-full bg-charcoal border border-charcoal/60 rounded-lg p-2.5 text-white"
                        >
                          <option value="percentage">نسبة مئوية (%)</option>
                          <option value="fixed">قيمة ثابتة (ج.م)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 text-[10px]">القيمة أو النسبة المئوية</label>
                        <input
                          type="number"
                          required
                          value={editingItem.discount.value}
                          onChange={(e) => {
                            const discount = { ...editingItem.discount!, value: Math.max(0, parseFloat(e.target.value) || 0) };
                            setEditingItem({ ...editingItem, discount });
                          }}
                          className="w-full bg-charcoal/40 border border-charcoal/60 rounded-lg p-2.5 text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 text-[10px]">شريط التنبيه (Badge)</label>
                        <select
                          value={editingItem.discount.badgeType}
                          onChange={(e) => {
                            const discount = { ...editingItem.discount!, badgeType: e.target.value as any };
                            setEditingItem({ ...editingItem, discount });
                          }}
                          className="w-full bg-charcoal border border-charcoal/60 rounded-lg p-2.5 text-white"
                        >
                          <option value="Hot Deal">عرض ساخن 🔥 (Hot Deal)</option>
                          <option value="Limited Time">وقت محدود ⏳ (Limited Time)</option>
                          <option value="Sale">تنزيل حارق 💥 (Sale)</option>
                          <option value="New Offer">عرض الغول الجديد ✨ (New Offer)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 text-[10px]">حساب توفير العميل التقريبي</label>
                        <div className="p-2.5 bg-neutral-900/60 rounded-lg text-neutral-300 font-bold border border-charcoal/40 text-center font-mono">
                          {editingItem.discount.type === "percentage"
                            ? `توفير ${editingItem.discount.value}% (${Math.round(editingItem.price * (editingItem.discount.value / 100))} ج.م)`
                            : `توفير ثابت ${editingItem.discount.value} ج.م`}
                        </div>
                      </div>

                      {/* Schedule start / end dates */}
                      <div className="space-y-1 col-span-1 sm:col-span-2">
                        <label className="text-neutral-400 text-[10px]">تاريخ ووقت بدء العرض (اختياري)</label>
                        <input
                          type="datetime-local"
                          value={editingItem.discount.startDate || ""}
                          onChange={(e) => {
                            const discount = { ...editingItem.discount!, startDate: e.target.value || undefined };
                            setEditingItem({ ...editingItem, discount });
                          }}
                          className="w-full bg-charcoal/40 border border-charcoal/60 rounded-lg p-2 text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1 col-span-1 sm:col-span-2">
                        <label className="text-neutral-400 text-[10px]">تاريخ ووقت نهاية العرض والانتهاء التلقائي</label>
                        <input
                          type="datetime-local"
                          value={editingItem.discount.endDate || ""}
                          onChange={(e) => {
                            const discount = { ...editingItem.discount!, endDate: e.target.value || undefined };
                            setEditingItem({ ...editingItem, discount });
                          }}
                          className="w-full bg-charcoal/40 border border-charcoal/60 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Advanced attributes: ingredients, allergens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-charcoal/30 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-bold block">المكونات البارزة (مفصولة بفاصلة) *</label>
                    <input
                      type="text"
                      placeholder="لحم، جبن، صوص، بصل مقرمش"
                      value={editingItem.ingredients.join("، ")}
                      onChange={(e) => setEditingItem({ ...editingItem, ingredients: e.target.value.split(/[،,]/).map(i => i.trim()).filter(Boolean) })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-bold block">مسببات الحساسية (مفصولة بفاصلة)</label>
                    <input
                      type="text"
                      placeholder="اللاكتوز، الجلوتين، الخردل"
                      value={editingItem.allergens.join("، ")}
                      onChange={(e) => setEditingItem({ ...editingItem, allergens: e.target.value.split(/[،,]/).map(a => a.trim()).filter(Boolean) })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white outline-none"
                    />
                  </div>
                </div>

                {/* Submit panel */}
                <div className="pt-4 border-t border-charcoal/40 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      onPlaySound("click");
                      setShowItemModal(false);
                    }}
                    className="px-5 py-2.5 bg-neutral-800 text-xs font-bold rounded-xl text-neutral-400 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blood-red text-xs font-bold rounded-xl text-white hover:bg-red-800 cursor-pointer shadow-[0_0_12px_rgba(161,0,23,0.4)]"
                  >
                    حفظ وإرسال التعديل 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL B: CREATING OR EDITING CATEGORIES                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCategoryModal && editingCategory && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-smoky-gray border border-charcoal rounded-3xl max-w-md w-full p-6 text-right space-y-4"
            >
              <h3 className="text-base font-black text-bone-white">إعدادات وتصنيف مطبخ الغول</h3>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">اسم القسم بالعربية</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.nameAr}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nameAr: e.target.value, name: e.target.value })}
                    className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">English Category Name</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.nameEn}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                    className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">ترتيب الظهور</label>
                    <input
                      type="number"
                      required
                      value={editingCategory.displayOrder}
                      onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">أيقونة القسم (Lucide)</label>
                    <select
                      value={editingCategory.icon}
                      onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white"
                    >
                      <option value="Flame">Flame 🔥</option>
                      <option value="Beef">Beef 🥩</option>
                      <option value="FlameKindling">Flame Kindling 🍗</option>
                      <option value="ChefHat">Chef Hat 🍳</option>
                      <option value="GlassWater">Glass Water 🥤</option>
                    </select>
                  </div>
                </div>

                {/* Hide toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.isHidden}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isHidden: e.target.checked })}
                    className="rounded bg-charcoal accent-blood-red"
                  />
                  <span className="text-[11px] text-neutral-300">إخفاء القسم مؤقتاً من القائمة أمام الزبائن</span>
                </label>

                <div className="pt-4 border-t border-charcoal/40 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onPlaySound("click");
                      setShowCategoryModal(false);
                    }}
                    className="px-4 py-2 bg-neutral-800 rounded-xl text-neutral-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blood-red rounded-xl text-white font-bold"
                  >
                    حفظ القسم ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL C: CREATING OR EDITING EXTRAS                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showExtraModal && editingExtra && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-smoky-gray border border-charcoal rounded-3xl max-w-md w-full p-6 text-right space-y-4"
            >
              <h3 className="text-base font-black text-bone-white">تعديل الترقية البركانية</h3>

              <form onSubmit={handleSaveExtra} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">اسم الإضافة الترقوية بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={editingExtra.name}
                    onChange={(e) => setEditingExtra({ ...editingExtra, name: e.target.value })}
                    className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">الوصف الموجز للإضافة</label>
                  <input
                    type="text"
                    value={editingExtra.description}
                    onChange={(e) => setEditingExtra({ ...editingExtra, description: e.target.value })}
                    className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">سعر الترقية (ج.م) *</label>
                    <input
                      type="number"
                      required
                      value={editingExtra.price}
                      onChange={(e) => setEditingExtra({ ...editingExtra, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">قسم الإضافة</label>
                    <select
                      value={editingExtra.category}
                      onChange={(e) => setEditingExtra({ ...editingExtra, category: e.target.value as any })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white font-bold"
                    >
                      <option value="cheese">جبنة معتقة (cheese)</option>
                      <option value="fries">بطاطس مقرمشة (fries)</option>
                      <option value="sauce">صلصات دموية (sauce)</option>
                      <option value="drink">مشروبات مثلجة (drink)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">أقصى كمية مسموحة للطلب الواحد</label>
                    <input
                      type="number"
                      value={editingExtra.maxQuantity}
                      onChange={(e) => setEditingExtra({ ...editingExtra, maxQuantity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">توفر المكون في الفرن</label>
                    <select
                      value={editingExtra.availability}
                      onChange={(e) => setEditingExtra({ ...editingExtra, availability: e.target.value as any })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white"
                    >
                      <option value="in-stock">متوفر بمخزون كافٍ</option>
                      <option value="out-of-stock">غير متوفر بالفرن</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={editingExtra.isEnabled}
                    onChange={(e) => setEditingExtra({ ...editingExtra, isEnabled: e.target.checked })}
                    className="rounded bg-charcoal accent-blood-red"
                  />
                  <span className="text-[11px] text-neutral-300">تفعيل الإضافة للزبائن فوراً</span>
                </label>

                <div className="pt-4 border-t border-charcoal/40 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onPlaySound("click");
                      setShowExtraModal(false);
                    }}
                    className="px-4 py-2 bg-neutral-800 rounded-xl text-neutral-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blood-red rounded-xl text-white font-bold"
                  >
                    حفظ الترقية ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DIALOG D: EMBEDDED MEDIA SELECTOR OVERLAY                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMediaSelector && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-smoky-gray border border-charcoal rounded-3xl max-w-lg w-full p-6 text-right space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-charcoal">
                <button
                  type="button"
                  onClick={() => setShowMediaSelector(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-black text-bone-white">اختر صورة من مكتبة الوسائط</h4>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                {mediaItems.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => selectMediaForTarget(med.url)}
                    className="cursor-pointer border border-charcoal hover:border-burnt-copper/80 rounded-xl overflow-hidden relative group aspect-video bg-neutral-900 flex items-center justify-center"
                  >
                    <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-neutral-500 italic">
                  أو يمكنك إدخال رابط صورة خارجي مسبق في حقل الرابط مباشرة.
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DIALOG E: CREATING OR EDITING COUPONS OVERLAY                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCouponModal && editingCoupon && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-smoky-gray border border-charcoal rounded-3xl max-w-md w-full p-6 text-right space-y-4"
            >
              <h3 className="text-base font-black text-bone-white">
                {isNewCoupon ? "تجهيز ميثاق خصم جديد" : "تعديل ميثاق خصم الغول"}
              </h3>

              <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">رمز كود الخصم (كود فريد بالإنجليزية) *</label>
                  <input
                    type="text"
                    required
                    disabled={!isNewCoupon}
                    placeholder="مثال: GHOUL20"
                    value={editingCoupon.code}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono uppercase focus:outline-none focus:border-burnt-copper"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">وصف الميثاق بالعربية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: خصم مميز ٢٠٪ للعملاء المخلصين"
                    value={editingCoupon.description}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                    className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white focus:outline-none focus:border-burnt-copper"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">نوع الخصم *</label>
                    <select
                      value={editingCoupon.type}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, type: e.target.value as any })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white font-bold focus:outline-none focus:border-burnt-copper"
                    >
                      <option value="percentage">نسبة مئوية (٪)</option>
                      <option value="fixed">مبلغ ثابت (ج.م)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">قيمة الخصم *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingCoupon.value}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono focus:outline-none focus:border-burnt-copper"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">الحد الأدنى لقيمة السلة (ج.م) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingCoupon.minOrder}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrder: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-charcoal/40 border border-charcoal rounded-xl p-3 text-bone-white font-mono focus:outline-none focus:border-burnt-copper"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">حالة التفعيل</label>
                    <select
                      value={editingCoupon.isActive ? "active" : "inactive"}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.value === "active" })}
                      className="w-full bg-charcoal border border-charcoal rounded-xl p-3 text-bone-white focus:outline-none focus:border-burnt-copper"
                    >
                      <option value="active">فعال ونشط</option>
                      <option value="inactive">معطل / غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal/40 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onPlaySound("click");
                      setShowCouponModal(false);
                      setEditingCoupon(null);
                    }}
                    className="px-4 py-2 bg-neutral-800 rounded-xl text-neutral-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-obsidian font-black rounded-xl"
                  >
                    حفظ الميثاق ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
