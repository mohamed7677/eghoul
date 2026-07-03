import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  Trash2, 
  Send, 
  Clock, 
  Settings, 
  ChevronRight, 
  X, 
  Menu,
  FileText,
  AlertTriangle,
  Info,
  ChevronDown,
  HelpCircle,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MENU_ITEMS, EXTRA_OPTIONS, DEFAULT_CATEGORIES } from "../data";
import { MenuItem, ExtraOption, CartItem, Order, Category, ProductVariant } from "../types";
import { audioSynth } from "../utils/audio";
import WolfLogo from "./WolfLogo";
import HorrorSmokeOverlay from "./HorrorSmokeOverlay";
import HorrorCountdownTimer from "./HorrorCountdownTimer";

interface ClientStoreProps {
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  ordersHistory: Order[];
  fetchOrdersHistory: () => void;
}

function MiniTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("انتهى العرض");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      
      const hrStr = hours > 0 ? `${hours}س ` : "";
      setTimeLeft(`${hrStr}${mins}د ${secs}ث`);
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return <span className="font-mono text-xs font-bold text-amber-500">{timeLeft}</span>;
}

export default function ClientStore({ 
  soundOn, 
  setSoundOn, 
  ordersHistory, 
  fetchOrdersHistory 
}: ClientStoreProps) {
  // Status translation map
  const translatedStatus: Record<string, string> = {
    "New": "طلب جديد",
    "Preparing": "جاري التحضير",
    "Delivered": "تم التوصيل"
  };

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]); // names of extras selected globally
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Dynamic Size/Variant selection states
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);

  // Price & Discount calculation helper
  const calculateItemPrice = (item: MenuItem, variant: ProductVariant | null) => {
    const basePrice = variant ? variant.price : item.price;
    const hasDiscount = item.discount && item.discount.isActive;
    if (!hasDiscount) return basePrice;
    
    if (item.discount!.type === "percentage") {
      return basePrice * (1 - item.discount!.value / 100);
    } else {
      return Math.max(0, basePrice - item.discount!.value);
    }
  };

  // Cosmic Horror Quiz Setup
  const quizQuestions = [
    {
      question: "ما هو الجو المفضل لديك عندما تتضور جوعاً؟",
      desc: "اختر بيئتك المفضلة لاستدعاء النكهات الماورائية.",
      options: [
        { key: "beef", text: "الظلام الحالك والرياح العاصفة (لحوم بقريّة فاخرة)", icon: "🥩" },
        { key: "chicken", text: "الغسق الهادئ والشموع الخافتة (دجاج كوزمي مقرمش)", icon: "🍗" },
        { key: "spicy_beef", text: "لهيب بركاني حارق ورماد متطاير (برجر بقري حار ومشتعل)", icon: "🌶️" }
      ]
    },
    {
      question: "أي نوع من الأسلحة والدروع تفضل لحسم معاركك الكبرى؟",
      desc: "سلاحك الروحي يحدد نوع الخبز المستدعى لحماية وليمك.",
      options: [
        { key: "obsidian", text: "الخبز الأسود البركاني (طاقة الفحم النشط)", icon: "🥯" },
        { key: "bone", text: "خبز العظام العاجي النادر (فخامة المظهر)", icon: "🦴" },
        { key: "brioche", text: "خبز البريوش الذهبي المكرمل والناعم", icon: "🍞" }
      ]
    },
    {
      question: "ما هي التعويذة أو القوة الإضافية التي ترغب بصبها في الوعاء؟",
      desc: "الإضافة السرية تمنح وليمك لمسة من الخلود والقوة الماورائية.",
      options: [
        { key: "extra_cheese", text: "شلال شيدر سايحة مرعبة", icon: "🧀" },
        { key: "spicy_ghost", text: "تتبيلة فلفل الشبح (قوة خارقة حارقة)", icon: "🔥" },
        { key: "truffle_herb", text: "مايونيز الترافل الفاخر وأعشاب الغابة", icon: "🌿" }
      ]
    }
  ];

  const handleQuizAnswer = (answerKey: string) => {
    const newAnswers = [...quizAnswers, answerKey];
    setQuizAnswers(newAnswers);
    if (soundOn) {
      audioSynth.playSizzle();
    }
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Evaluate result
      const catPref = newAnswers[0];
      const bunPref = newAnswers[1];
      const flavorPref = newAnswers[2];
      
      let matchedItem = dynamicMenu.find(item => item.id === "beef-ghoul-prime"); // default fallback
      
      if (catPref === "chicken") {
        if (flavorPref === "truffle_herb") {
          matchedItem = dynamicMenu.find(item => item.id === "chicken-soul-snatcher") || matchedItem;
        } else {
          matchedItem = dynamicMenu.find(item => item.id === "chicken-phantom-crunch") || dynamicMenu.find(item => item.id === "chicken-asylum-hot") || matchedItem;
        }
      } else if (catPref === "spicy_beef") {
        matchedItem = dynamicMenu.find(item => item.id === "beef-cemetery-smoke") || matchedItem;
      } else {
        // beef
        if (bunPref === "bone") {
          matchedItem = dynamicMenu.find(item => item.id === "beef-vampire-slayer") || matchedItem;
        } else {
          matchedItem = dynamicMenu.find(item => item.id === "beef-ghoul-prime") || matchedItem;
        }
      }
      
      setQuizResultItem(matchedItem || null);
      setQuizStep(quizQuestions.length); // go to results screen (index 3)
    }
  };

  // Dynamic API catalog states
  const [dynamicMenu, setDynamicMenu] = useState<MenuItem[]>(MENU_ITEMS);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [dynamicExtras, setDynamicExtras] = useState<ExtraOption[]>(EXTRA_OPTIONS);
  
  // Customization Options for currently selected item
  const [bunType, setBunType] = useState<"obsidian" | "bone" | "brioche">("obsidian");
  const [temperature, setTemperature] = useState<"medium" | "well-done">("well-done");
  const [itemComments, setItemComments] = useState("");
  
  const [ambientActive, setAmbientActive] = useState(false);

  // Checkout form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [dineInType, setDineInType] = useState<"dine-in" | "delivery">("dine-in");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Active Screens
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResultItem, setQuizResultItem] = useState<MenuItem | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Settings
  const [appsScriptUrl, setAppsScriptUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"order" | "history">("order");
  
  // Status check input
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState("");

  // Notification / Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleCartClick = () => {
    // Scroll to the checkout section smoothly
    const element = document.getElementById("checkout-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Also toggle the cart drawer
    setShowCartDrawer(true);
  };

  // Load configuration, history, and catalog on mount
  useEffect(() => {
    // Get apps script settings
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.googleAppsScriptUrl) {
          setAppsScriptUrl(data.googleAppsScriptUrl);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));

    // Fetch dynamic catalog
    fetchCatalog();
  }, []);

  const fetchCatalog = () => {
    Promise.all([
      fetch("/api/menu").then(res => res.json()),
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/extras").then(res => res.json())
    ])
      .then(([menuData, catData, extData]) => {
        if (Array.isArray(menuData)) setDynamicMenu(menuData);
        if (Array.isArray(catData)) setDynamicCategories(catData);
        if (Array.isArray(extData)) setDynamicExtras(extData);
      })
      .catch(err => {
        console.error("Error loading live catalog:", err);
      });
  };

  // Live order status polling
  useEffect(() => {
    if (!activeTrackingOrder) return;

    const interval = setInterval(() => {
      fetch(`/api/orders/${activeTrackingOrder.orderId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Polling error");
        })
        .then(data => {
          if (data && data.status !== activeTrackingOrder.status) {
            setActiveTrackingOrder(data);
            showToast(`طقس كوزمي: تحديث حالة الطلب إلى [${translatedStatus[data.status] || data.status}]`, "info");
          }
        })
        .catch(err => console.error("Error polling status:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTrackingOrder]);

  // Sound toggle handler
  const handleSoundToggle = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    if (nextState) {
      audioSynth.startAmbientDrone();
      setAmbientActive(true);
      audioSynth.playHeartbeat();
      showToast("بوابة الصوت الغامض مفعّلة. استشعر حرارة لهيب الغول.", "info");
    } else {
      audioSynth.stopAmbientDrone();
      setAmbientActive(false);
    }
  };

  // Heartbeat loop trigger
  useEffect(() => {
    let interval: any;
    if (soundOn) {
      interval = setInterval(() => {
        audioSynth.playHeartbeat();
      }, 5000); // Pulse every 5 seconds
    }
    return () => clearInterval(interval);
  }, [soundOn, setSoundOn]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Add customized item to cart
  const handleAddCustomizedToCart = () => {
    if (!customizingItem) return;

    if (customizingItem.availability === "out-of-stock") {
      showToast("عذراً، هذه الوجبة نفذت من مخزن الغول حالياً ولا يمكن طلبها.", "error");
      return;
    }

    if (soundOn) {
      audioSynth.playSizzle();
    }

    const variantId = activeVariant ? activeVariant.id : "standard";
    const uniqueId = `${customizingItem.id}-${variantId}-${bunType}-${temperature}-${itemComments.replace(/\s+/g, "-")}`;
    
    // Check if identical item already in cart
    const existingIndex = cart.findIndex(item => item.id === uniqueId);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Calculate active price using selected variant
      const itemPrice = calculateItemPrice(customizingItem, activeVariant);

      const newCartItem: CartItem = {
        id: uniqueId,
        menuItemId: customizingItem.id,
        name: activeVariant ? `${customizingItem.name} (${activeVariant.name})` : customizingItem.name,
        price: itemPrice,
        quantity: 1,
        type: customizingItem.type,
        bunType: bunType,
        temperature: customizingItem.type === "beef" ? temperature : undefined,
        comments: itemComments.trim() || undefined,
        selectedVariantId: activeVariant?.id,
        selectedVariantName: activeVariant?.name
      };
      setCart([...cart, newCartItem]);
    }

    showToast(`تمت إضافة ${activeVariant ? `${customizingItem.name} (${activeVariant.name.split(" ")[0]})` : customizingItem.name} إلى قائمة وليمتك المظلمة.`, "success");
    setCustomizingItem(null);
    setActiveVariant(null);
    // Reset values
    setBunType("obsidian");
    setTemperature("well-done");
    setItemComments("");
  };

  // Quick Add helper (uses standard obsidian bun, well-done)
  const handleQuickAdd = (item: MenuItem) => {
    if (item.availability === "out-of-stock") {
      showToast("عذراً، هذه الوجبة نفذت من مخزن الغول حالياً ولا يمكن طلبها.", "error");
      return;
    }

    if (soundOn) {
      audioSynth.playSizzle();
    }

    const currentVariant = selectedVariants[item.id] || (item.variants && item.variants.length > 0 ? item.variants[0] : null);
    const variantId = currentVariant ? currentVariant.id : "standard";
    const uniqueId = `${item.id}-${variantId}-obsidian-well-done-`;
    const existingIndex = cart.findIndex(cartItem => cartItem.id === uniqueId);
    
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Calculate active price using selected variant
      const itemPrice = calculateItemPrice(item, currentVariant);

      const newCartItem: CartItem = {
        id: uniqueId,
        menuItemId: item.id,
        name: currentVariant ? `${item.name} (${currentVariant.name})` : item.name,
        price: itemPrice,
        quantity: 1,
        type: item.type,
        bunType: "obsidian",
        temperature: item.type === "beef" ? "well-done" : undefined,
        selectedVariantId: currentVariant?.id,
        selectedVariantName: currentVariant?.name
      };
      setCart([...cart, newCartItem]);
    }
    
    showToast(`إضافة سريعة: تمت إضافة ${currentVariant ? `${item.name} (${currentVariant.name.split(" ")[0]})` : item.name} إلى قائمتك.`, "success");
  };

  // Quantity updates
  const updateQuantity = (id: string, change: number) => {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const updatedCart = [...cart];
    const newQty = updatedCart[itemIndex].quantity + change;
    
    if (newQty <= 0) {
      updatedCart.splice(itemIndex, 1);
      showToast("تمت إزالة الوجبة من سلتك.", "info");
    } else {
      updatedCart[itemIndex].quantity = newQty;
    }
    setCart(updatedCart);
    if (soundOn) {
      audioSynth.playSizzle();
    }
  };

  // Toggle Global Extras
  const handleToggleExtra = (extraName: string) => {
    if (soundOn) {
      audioSynth.playSizzle();
    }
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(selectedExtras.filter(e => e !== extraName));
    } else {
      setSelectedExtras([...selectedExtras, extraName]);
    }
  };

  // Subtotal of cart items
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Pricing helper
  const getDineInFee = () => {
    return dineInType === "delivery" ? 40.00 : 0; // 40 ج.م توصيل فرسان الغول
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return (getSubtotal() * appliedCoupon.value) / 100;
    } else {
      return Math.min(appliedCoupon.value, getSubtotal());
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      showToast("يرجى إدخال كود الخصم أولاً 💀", "error");
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: getSubtotal() })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        if (soundOn) {
          audioSynth.playSizzle();
        }
        showToast(`تم تفعيل تعويذة الخصم ${data.coupon.code} بنجاح!`, "success");
      } else {
        setCouponError(data.error);
        setAppliedCoupon(null);
        showToast(data.error || "كود الخصم غير صالح 💀", "error");
      }
    } catch (err) {
      console.error("Validate coupon error:", err);
      showToast("حدث خطأ أثناء الاتصال للتحقق من الكود.", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    showToast("تم إزالة تعويذة كود الخصم.", "info");
  };

  const getTotalPrice = () => {
    return Math.max(0, getSubtotal() - getDiscountAmount() + getDineInFee());
  };

  // Handle Apps Script URL Config Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAppsScriptUrl: appsScriptUrl })
      });
      if (response.ok) {
        showToast("تم حفظ وتحديث رابط السجلات بنجاح!", "success");
        setShowConfigModal(false);
      } else {
        showToast("فشل ربط السجلات البرمجية لجوجل.", "error");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء الاتصال بالخادم الرئيسي.", "error");
    }
  };

  // Submit Order
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("سلة وليمتك فارغة تماماً حالياً.", "error");
      return;
    }
    if (!customerName || !customerPhone) {
      showToast("يرجى إدخال الاسم ورقم الهاتف لإكمال الطلب.", "error");
      return;
    }
    const phoneTrimmed = customerPhone.trim();
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phoneTrimmed)) {
      showToast("يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم (مثال: 01012345678).", "error");
      return;
    }
    if (dineInType === "delivery" && !deliveryAddress) {
      showToast("يرجى تزويدنا بالعنوان بالتفصيل لتوصيل وليمتك الساخنة.", "error");
      return;
    }

    setIsSubmitting(true);
    if (soundOn) {
      audioSynth.playGlitchSound();
    }

    try {
      const payload = {
        name: customerName,
        phone: customerPhone,
        address: dineInType === "dine-in" ? "تناول بالمطعم / استلام شخصي" : deliveryAddress,
        items: cart,
        extras: selectedExtras,
        totalPrice: getTotalPrice().toFixed(2)
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const orderData = await response.json();
        setConfirmedOrder(orderData);
        setActiveTrackingOrder(orderData);
        // Clear cart & input states
        setCart([]);
        setSelectedExtras([]);
        setCustomerName("");
        setCustomerPhone("");
        setDeliveryAddress("");
        setAppliedCoupon(null);
        setCouponCode("");
        setShowCartDrawer(false);
        fetchOrdersHistory(); // refresh state
        
        // Final sound cue
        if (soundOn) {
          setTimeout(() => {
            audioSynth.playGlitchSound();
          }, 600);
        }
      } else {
        showToast("رفضت الأرواح طلبك. يرجى مراجعة البيانات والمحاولة مجدداً.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("انقطع الاتصال بقاعدة بيانات مطبخ الغول.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track order live status
  const handleTrackStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchResult(null);

    if (!searchOrderId.trim()) {
      setSearchError("يرجى إدخال معرف طلب صحيح للبدء.");
      return;
    }

    const trimmedId = searchOrderId.trim().toUpperCase();
    fetch(`/api/orders/${trimmedId}`)
      .then(res => {
        if (!res.ok) throw new Error("Ritual not found.");
        return res.json();
      })
      .then(data => {
        setSearchResult(data);
        setActiveTrackingOrder(data);
        if (soundOn) {
          audioSynth.playSizzle();
        }
      })
      .catch(err => {
        setSearchError("لم نجد معرف الطلب هذا في سجلات الغول المقدسة.");
      });
  };

  // Filter Menu Items
  const filteredMenuItems = selectedCategory === "all" 
    ? dynamicMenu.filter(item => !item.isArchived) 
    : dynamicMenu.filter(item => (item.category === selectedCategory || item.type === selectedCategory) && !item.isArchived);

  return (
    <div className="relative min-h-screen bg-obsidian text-bone-white font-sans overflow-x-hidden selection:bg-blood-red selection:text-white pb-12" dir="rtl">
      
      {/* Cinematic Ambient Overlays */}
      <HorrorSmokeOverlay isVisible={isSubmitting} soundOn={soundOn} />
      <div className="fixed inset-0 vignette-ambient pointer-events-none z-10" />
      
      {/* Glitch Grid Lines for Atmospheric Feel */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,15,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,16,15,0.8)_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

      {/* Floating Audio & Panel Toolbar */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {/* Ambient Soundtrack Toggle */}
        <button 
          onClick={handleSoundToggle}
          className={`p-4 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 flex items-center justify-center border cursor-pointer ${
            soundOn 
              ? "bg-blood-red border-blood-red text-bone-white text-glow-red" 
              : "bg-smoky-gray/90 border-charcoal text-neutral-500"
          }`}
          title={soundOn ? "كتم الصوت الغامض" : "تشغيل المؤثرات الصوتية الغامضة"}
        >
          {soundOn ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Floating Cart Icon (Active order screen) */}
        {cart.length > 0 && (
          <button 
            onClick={handleCartClick}
            className="relative p-5 bg-blood-red hover:bg-blood-red/90 text-bone-white border-2 border-bone-white/10 rounded-full shadow-2xl blood-heartbeat cursor-pointer transition-all duration-300 hover:scale-110"
            title="سلة المشتريات والدفع"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1 -left-1 bg-burnt-copper border border-obsidian text-bone-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        )}
      </div>

      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-24 right-1/2 translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-smoky-gray border-r-4 border-blood-red rounded-l-lg shadow-2xl backdrop-blur-md animate-bounce max-w-sm w-11/12 border-t border-b border-l border-white/5 text-right" dir="rtl">
          <Flame className="w-5 h-5 text-blood-red animate-pulse shrink-0" />
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-obsidian/85 backdrop-blur-md border-b border-charcoal py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <WolfLogo className="w-10 h-10" animate={soundOn} />
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-black tracking-widest text-glow-red font-display leading-none">
                مطبخ الغول
              </h1>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-burnt-copper font-semibold mt-0.5 font-mono">
                AL-GHOUL BURGER
              </span>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("order")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all duration-300 cursor-pointer ${
                activeTab === "order" 
                  ? "bg-blood-red/15 border border-blood-red/40 text-blood-red" 
                  : "text-neutral-400 hover:text-bone-white"
              }`}
            >
              قائمة الطعام الفاخرة
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                fetchOrdersHistory();
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all duration-300 cursor-pointer ${
                activeTab === "history" 
                  ? "bg-blood-red/15 border border-blood-red/40 text-blood-red" 
                  : "text-neutral-400 hover:text-bone-white"
              }`}
            >
              كتاب طقوس الطلبات
            </button>
          </nav>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-8 py-8 z-20">
        
        {activeTab === "order" ? (
          <>
            {/* ── HERO BANNER ── */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-smoky-gray to-obsidian border border-charcoal p-8 sm:p-12 mb-12 text-right flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-96 h-96 bg-blood-red/10 rounded-full blur-[100px] -ml-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-burnt-copper/5 rounded-full blur-[100px] -mr-32 -mb-32 pointer-events-none" />
              
              {/* Right Column: Aggressive Copy */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-blood-red/10 border border-blood-red/30 px-3.5 py-1 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-blood-red animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-blood-red font-bold">أكل سريع فاخر بنكهة غامضة</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
                  أشبع <span className="text-blood-red text-glow-red">الوحش</span> الكامن بداخلك.
                </h2>
                <p className="text-neutral-400 text-sm sm:text-base max-w-xl">
                  صُنع في ظلام دامس وعُتق بامتياز. برجر لحم ودجاج مخصص على خبز أسود بركاني مع صوص نخاع العظام السري. 3 خطوات فقط لإتمام الطقوس والاستلام فوراً.
                </p>
                
                <div className="pt-2 flex flex-wrap gap-4 justify-start">
                  <button 
                    onClick={() => {
                      setSelectedCategory("beef");
                      document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3 bg-blood-red hover:bg-blood-red/90 text-bone-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg hover:shadow-blood-red/20 transition-all duration-300 cursor-pointer"
                  >
                    استدعِ برجر اللحم 🥩
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedCategory("chicken");
                      document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3 bg-smoky-gray hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-widest rounded-lg border border-charcoal transition-all duration-300 cursor-pointer"
                  >
                    تصفح دجاج الفانتوم 🍗
                  </button>
                  <button 
                    onClick={() => {
                      if (soundOn) {
                        audioSynth.playSizzle();
                      }
                      setQuizStep(0);
                      setQuizAnswers([]);
                      setQuizResultItem(null);
                      setShowQuizModal(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-burnt-copper to-blood-red hover:from-burnt-copper/90 hover:to-blood-red text-bone-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg hover:shadow-blood-red/30 transition-all duration-300 cursor-pointer animate-pulse border border-blood-red/40"
                  >
                    🔮 اختبار الغول الكوني (وجبتك المثالية)
                  </button>
                </div>
              </div>

              {/* Left Column: Dynamic Cinematic Wolf Logo Display */}
              <div className="relative shrink-0 p-4 border border-charcoal/60 bg-obsidian/40 rounded-2xl flex flex-col items-center justify-center gap-2 w-56">
                <WolfLogo className="w-32 h-32" animate={soundOn} />
                <div className="text-center">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">مختبر أسرار الغول</span>
                  <p className="text-[11px] text-burnt-copper font-mono mt-0.5">THEMED BURGER LAB</p>
                </div>
              </div>
            </div>

            {/* LIVE TRACKING QUICK SEARCH */}
            <div className="bg-smoky-gray/70 border border-charcoal rounded-2xl p-5 mb-12 max-w-xl mx-auto text-right">
              <h3 className="text-sm font-bold uppercase tracking-wider text-burnt-copper flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blood-red" />
                <span>تتبع حالة الوجبة مباشرة</span>
              </h3>
              <form onSubmit={handleTrackStatus} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="أدخل رقم الطلب (مثال: GHL-4028-Y)"
                  className="flex-1 bg-obsidian/90 text-bone-white border border-charcoal hover:border-neutral-700 focus:border-blood-red/60 text-sm px-4 py-2.5 rounded-lg font-mono focus:outline-none transition-colors"
                />
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blood-red hover:bg-blood-red/90 text-bone-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                >
                  تتبع
                </button>
              </form>

              {searchError && (
                <p className="text-blood-red text-xs mt-2.5 font-mono flex items-center gap-1.5 justify-end">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                  <span>{searchError}</span>
                </p>
              )}

              {searchResult && (
                <div className="mt-4 p-4 bg-obsidian/60 border border-charcoal/80 rounded-xl space-y-3 font-mono text-xs text-right">
                  <div className="flex justify-between items-center border-b border-charcoal/50 pb-2">
                    <span className="text-neutral-400">رقم الطلب (ORDER ID):</span>
                    <span className="font-bold text-bone-white text-glow-red">{searchResult.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">صاحب الطلب:</span>
                    <span>{searchResult.name} ({searchResult.phone})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">الحالة الحية:</span>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      searchResult.status === "New" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      searchResult.status === "Preparing" ? "bg-blood-red/10 text-blood-red border border-blood-red/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {translatedStatus[searchResult.status] || searchResult.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">المكونات المستدعاة:</span>
                    <span className="text-left max-w-[200px] truncate" title={searchResult.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}>
                      {searchResult.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-charcoal/50 pt-2 text-sm">
                    <span className="text-neutral-400">السعر الإجمالي:</span>
                    <span className="font-bold text-burnt-copper">{searchResult.totalPrice} ج.م</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── MENU NAVIGATION TABS ── */}
            <div id="menu-grid" className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-charcoal pb-6 mb-8 text-right">
              
              {/* Category buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {dynamicCategories.filter(c => !c.isHidden).map((cat) => {
                  const iconMap: Record<string, string> = {
                    "all": "🔪",
                    "beef": "🥩",
                    "chicken": "🍗",
                    "sides": "🍟",
                    "drinks": "🥤"
                  };
                  const icon = iconMap[cat.id] || "✨";
                  return (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                        selectedCategory === cat.id 
                          ? "bg-blood-red text-bone-white shadow-lg shadow-blood-red/20 border border-blood-red" 
                          : "bg-smoky-gray/70 text-neutral-400 hover:text-white border border-charcoal hover:border-neutral-700"
                      }`}
                    >
                      <span>{icon} {cat.name}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <h3 className="text-base font-black text-bone-white tracking-wide">طقوس ومكونات الغول</h3>
                <p className="text-[10px] text-neutral-500 mt-1">اختر وجبتك بحكمة، فالمكونات غنية كالعصور المظلمة.</p>
              </div>
            </div>

            {/* ── CATALOG PRODUCTS & CHECKOUT GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (Items Grid): taking 8 cols */}
              <div className="lg:col-span-8 order-2 lg:order-1">
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-24 border border-dashed border-charcoal rounded-3xl bg-smoky-gray/10">
                    <Flame className="w-12 h-12 text-neutral-700 mx-auto mb-3 animate-pulse" />
                    <p className="text-neutral-500 text-sm">مطبخ الغول مغلق مؤقتاً لهذا القسم. استدعِ قسماً آخر.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMenuItems.map((item) => {
                      const hasDiscount = item.discount && item.discount.isActive;
                      const discountedPrice = hasDiscount
                        ? item.discount!.type === "percentage"
                          ? item.price * (1 - item.discount!.value / 100)
                          : item.price - item.discount!.value
                        : item.price;

                      const isOutOfStock = item.availability === "out-of-stock";

                      return (
                        <div 
                          key={item.id}
                          className={`group relative bg-gradient-to-b from-smoky-gray/90 to-obsidian/95 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl text-right ${
                            isOutOfStock 
                              ? "border-charcoal opacity-65 grayscale" 
                              : "border-charcoal hover:border-burnt-copper/30"
                          }`}
                        >
                          {/* Top Ribbons */}
                          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                            {item.bestSellerBadge && (
                              <span className="bg-burnt-copper border border-burnt-copper/30 text-bone-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow">
                                الأكثر مبيعاً 🔥
                              </span>
                            )}
                            {item.popularBadge && (
                              <span className="bg-blood-red border border-blood-red/30 text-bone-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow">
                                مميز الغول ✨
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="bg-neutral-800 border border-neutral-700 text-neutral-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow">
                                نفذ من المخزن 💀
                              </span>
                            )}
                          </div>

                          {/* Image & Spark Info Panel */}
                          <div className="relative aspect-video w-full overflow-hidden bg-obsidian">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-charcoal/20 flex items-center justify-center">
                                <Flame className="w-10 h-10 text-neutral-700 animate-pulse" />
                              </div>
                            )}
                            {/* Linear dark gradient overlay on image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80" />

                            {/* Spicy levels indicator */}
                            {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
                              <div className="absolute bottom-3 right-3 bg-obsidian/80 backdrop-blur-sm border border-charcoal/60 px-2 py-1 rounded-md flex items-center gap-1">
                                <span className="text-[10px] text-neutral-400 font-bold">مستوى اللهيب:</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: item.spicyLevel }).map((_, i) => (
                                    <Flame key={i} className="w-3.5 h-3.5 text-blood-red fill-blood-red animate-pulse" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Timer for special deals */}
                            {hasDiscount && item.discount?.badgeType === "Limited Time" && (
                              <div className="absolute bottom-3 left-3 bg-obsidian/95 border border-amber-500/20 px-2 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <MiniTimer endDate={new Date(Date.now() + 18000000).toISOString()} />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-bone-white leading-normal group-hover:text-burnt-copper transition-colors">
                                  {item.name}
                                </h4>
                                <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>
                              </div>

                              {/* Dynamic Size Selector (Single / Double / Triple) */}
                              {item.variants && item.variants.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] text-burnt-copper font-black block uppercase tracking-wider">الحجم ورتبة اللحم:</span>
                                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-obsidian/70 border border-charcoal rounded-xl">
                                    {item.variants.map((v) => {
                                      const currentVariant = selectedVariants[item.id] || item.variants![0];
                                      const isSelected = currentVariant.id === v.id;
                                      let shortName = v.name.split(" ")[0]; // e.g. "فردي" or "ثنائي" or "ثلاثي"
                                      let emoji = "🍔";
                                      if (v.name.includes("Double") || v.name.includes("ثنائي")) emoji = "🍔🍔";
                                      else if (v.name.includes("Triple") || v.name.includes("ثلاثي")) emoji = "🍔🍔🍔";
                                      
                                      return (
                                        <button
                                          key={v.id}
                                          type="button"
                                          onClick={() => {
                                            if (soundOn) audioSynth.playSizzle();
                                            setSelectedVariants(prev => ({
                                              ...prev,
                                              [item.id]: v
                                            }));
                                          }}
                                          className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center border ${
                                            isSelected
                                              ? "bg-blood-red/15 border-blood-red/60 text-blood-red shadow-inner"
                                              : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30"
                                          }`}
                                        >
                                          <span className="text-[10px] font-black">{shortName}</span>
                                          <span className="text-[8px] font-mono font-medium text-neutral-500 mt-0.5">{v.price} ج.م</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Cal / Allergens indicators */}
                            {(() => {
                              const currentVariant = selectedVariants[item.id] || (item.variants && item.variants.length > 0 ? item.variants[0] : null);
                              const activeCalories = currentVariant ? currentVariant.calories : item.calories;
                              return (
                                <div className="flex flex-wrap gap-2 text-[10px] text-neutral-500 font-mono">
                                  {activeCalories && (
                                    <span className="bg-obsidian px-2 py-0.5 rounded border border-charcoal">
                                      {activeCalories} كالوري
                                    </span>
                                  )}
                                  {item.prepTime && (
                                    <span className="bg-obsidian px-2 py-0.5 rounded border border-charcoal">
                                      ⏱️ {item.prepTime} دقيقة
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Price and call to action */}
                            {(() => {
                              const currentVariant = selectedVariants[item.id] || (item.variants && item.variants.length > 0 ? item.variants[0] : null);
                              const basePrice = currentVariant ? currentVariant.price : item.price;
                              const currentDiscountedPrice = hasDiscount
                                ? item.discount!.type === "percentage"
                                  ? basePrice * (1 - item.discount!.value / 100)
                                  : basePrice - item.discount!.value
                                : basePrice;

                              return (
                                <div className="flex items-center justify-between pt-2 border-t border-charcoal/40">
                                  <div className="flex flex-col">
                                    {hasDiscount ? (
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="text-sm font-black text-burnt-copper">{currentDiscountedPrice} ج.م</span>
                                        <span className="text-[10px] text-neutral-500 line-through">{basePrice} ج.م</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm font-black text-bone-white">{basePrice} ج.m</span>
                                    )}
                                    {hasDiscount && (
                                      <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">
                                        وفر {basePrice - currentDiscountedPrice} ج.م ({item.discount?.value}{item.discount?.type === "percentage" ? "٪" : " ج.م"}) خصم
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex gap-1.5">
                                    <button 
                                      disabled={isOutOfStock}
                                      onClick={() => handleQuickAdd(item)}
                                      className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl border border-charcoal transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                                      title="إضافة سريعة كلاسيكية"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                    <button 
                                      disabled={isOutOfStock}
                                      onClick={() => {
                                        if (soundOn) {
                                          audioSynth.playSizzle();
                                        }
                                        setCustomizingItem(item);
                                        setActiveVariant(currentVariant);
                                      }}
                                      className="px-4 py-2 bg-blood-red hover:bg-blood-red/90 text-bone-white font-extrabold text-xs tracking-wider rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                    >
                                      <span>تجهيز وتخصيص ⚡</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column (Live Checkout / Cart Overview): taking 4 cols */}
              <div id="checkout-section" className="lg:col-span-4 order-1 lg:order-2 bg-gradient-to-b from-smoky-gray to-obsidian border border-charcoal rounded-2xl p-6 space-y-5 text-right relative shadow-xl">
                <div className="absolute top-0 right-0 w-44 h-44 bg-blood-red/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="border-b border-charcoal/80 pb-3 flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-blood-red/10 border border-blood-red/20 text-blood-red text-[10px] font-black uppercase rounded-full">
                    معبد الشراء
                  </span>
                  <h3 className="text-base font-black text-bone-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blood-red" />
                    <span>سلة الوليمة الحالية</span>
                  </h3>
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <ShoppingBag className="w-10 h-10 text-neutral-700 mx-auto animate-bounce" />
                    <p className="text-neutral-500 text-xs">وليمتك فارغة كالمقبرة حالياً. أضف بعض برجر الغول لتبدأ الطقوس!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-obsidian/70 border border-charcoal/60 rounded-xl text-xs gap-3"
                        >
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center border border-charcoal text-neutral-400 hover:text-white cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-bone-white font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center border border-charcoal text-neutral-400 hover:text-white cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex-1 text-right min-w-0">
                            <span className="font-extrabold text-bone-white block truncate leading-normal">{item.name}</span>
                            <span className="text-[10px] text-neutral-500 block leading-normal font-mono">
                              {item.bunType === "obsidian" ? "خبز أسود" : item.bunType === "bone" ? "خبز عظام" : "خبز بريوش"}
                              {item.temperature && ` • ${item.temperature === "medium" ? "نصف استواء" : "كامل الاستواء"}`}
                            </span>
                          </div>

                          <span className="font-mono font-bold text-burnt-copper text-xs shrink-0">{(item.price * item.quantity).toFixed(0)} ج.م</span>
                        </div>
                      ))}
                    </div>

                    {/* Global Extras Section */}
                    <div className="border-t border-charcoal/40 pt-4 space-y-3">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-black">ترقية وليمتك بإضافات سرية</span>
                      <div className="grid grid-cols-2 gap-2">
                        {dynamicExtras.filter(e => e.isEnabled && e.availability === "in-stock").map((extra) => {
                          const isSelected = selectedExtras.includes(extra.name);
                          return (
                            <button
                              key={extra.id}
                              onClick={() => handleToggleExtra(extra.name)}
                              className={`p-2.5 rounded-lg border text-[10px] text-right font-black flex flex-col justify-between h-14 transition-all duration-300 cursor-pointer ${
                                isSelected 
                                  ? "bg-burnt-copper/15 border-burnt-copper text-burnt-copper" 
                                  : "bg-obsidian/40 border-charcoal text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                              }`}
                            >
                              <span className="line-clamp-1 leading-normal">{extra.name}</span>
                              <span className="font-mono font-normal block mt-0.5">+{extra.price} ج.م</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Total Panel */}
                    <div className="border-t border-charcoal/60 pt-4 space-y-2 bg-charcoal/10 p-4 rounded-xl">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>قيمة الوجبات الفرعية:</span>
                        <span className="font-mono font-bold">{getSubtotal()} ج.م</span>
                      </div>
                      
                      {selectedExtras.length > 0 && (
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>الإضافات المحددة:</span>
                          <span className="font-mono font-bold">
                            +{selectedExtras.reduce((sum, name) => {
                              const e = dynamicExtras.find(opt => opt.name === name);
                              return sum + (e ? e.price : 0);
                            }, 0)} ج.م
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>خدمة التوصيل / الاستلام:</span>
                        <span className="font-sans text-neutral-300 capitalize">{dineInType === "delivery" ? "توصيل" : "بالمطعم"}</span>
                      </div>

                      {dineInType === "delivery" && (
                        <div className="flex justify-between text-[11px] text-neutral-500">
                          <span>توصيل فرسان الغول السريع:</span>
                          <span className="font-sans text-neutral-300">{getDineInFee()} ج.م</span>
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-400 font-bold text-xs">
                          <span>خصم الميثاق ({appliedCoupon.code}):</span>
                          <span>-{getDiscountAmount()} ج.م</span>
                        </div>
                      )}
                    </div>

                    {/* Coupon section in Live Total Panel */}
                    <div className="border-t border-charcoal/40 pt-3 space-y-2">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">تفعيل تعويذة خصم الغول</span>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-xs">
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="p-1 hover:bg-emerald-500/20 text-emerald-400 hover:text-red-400 rounded transition-colors text-xs font-bold cursor-pointer"
                          >
                            إزالة
                          </button>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 block">الكود {appliedCoupon.code} نشط!</span>
                            <span className="text-[10px] text-neutral-400 block leading-normal">{appliedCoupon.description}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              disabled={isValidatingCoupon}
                              onClick={handleValidateCoupon}
                              className="bg-neutral-800 hover:bg-burnt-copper hover:text-white border border-charcoal hover:border-burnt-copper px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-300 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                            >
                              {isValidatingCoupon ? "جاري..." : "تطبيق"}
                            </button>
                            <input
                              type="text"
                              placeholder="مثال: GHOUL20"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value);
                                setCouponError("");
                              }}
                              className="bg-obsidian border border-charcoal rounded-lg px-3 py-1.5 text-xs text-bone-white placeholder-neutral-600 focus:outline-none focus:border-burnt-copper flex-1 text-center font-mono uppercase"
                            />
                          </div>
                          {couponError && (
                            <span className="text-[10px] text-blood-red block">{couponError}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-charcoal/80 pt-3 flex justify-between items-baseline">
                      <span className="font-mono text-lg font-black text-burnt-copper text-glow-red">{getTotalPrice()} ج.م</span>
                      <span className="text-sm font-black text-bone-white">إجمالي الحساب:</span>
                    </div>

                    {/* Checkout Details Form */}
                    <form onSubmit={handleCheckout} className="border-t border-charcoal/40 pt-4 space-y-3">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-black">بيانات استلام وتوصيل الطلب</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDineInType("dine-in")}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            dineInType === "dine-in"
                              ? "bg-blood-red/15 border-blood-red text-blood-red"
                              : "bg-obsidian/40 border-charcoal text-neutral-400"
                          }`}
                        >
                          تناول بالمطعم / استلام
                        </button>
                        <button
                          type="button"
                          onClick={() => setDineInType("delivery")}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            dineInType === "delivery"
                              ? "bg-blood-red/15 border-blood-red text-blood-red"
                              : "bg-obsidian/40 border-charcoal text-neutral-400"
                          }`}
                        >
                          توصيل دليفرى (+40 ج.م)
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 block font-bold">الاسم بالكامل *</label>
                        <input 
                          type="text" 
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="أدخل اسمك ثلاثي هنا"
                          className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3 text-xs focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 block font-bold">رقم الهاتف المحمول (لتأكيد الطلب) *</label>
                        <input 
                          type="tel" 
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="مثال: 01012345678"
                          className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3 text-xs focus:outline-none transition-colors"
                        />
                      </div>

                      {dineInType === "delivery" && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="text-[10px] text-neutral-400 block font-bold">عنوان التوصيل بالتفصيل *</label>
                          <textarea 
                            required={dineInType === "delivery"}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="اسم المنطقة، الشارع، رقم العمارة، رقم الشقة أو علامة مميزة"
                            rows={2}
                            className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3 text-xs focus:outline-none transition-colors resize-none"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-blood-red hover:bg-blood-red/90 text-bone-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-blood-red/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? "جاري إرسال وتأكيد طلبك..." : "تأكيد وإرسال طلب برجر الغول ⚡"}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* ── WITNESSES OF THE UNDEAD / SURVIVOR TESTIMONIALS ── */}
            <div className="mt-16 border-t border-charcoal/60 pt-12 text-right space-y-6">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <span className="px-3 py-1 bg-burnt-copper/10 border border-burnt-copper/30 text-burnt-copper text-[10px] font-black uppercase rounded-full">
                  شهادات الناجين من وليمة الغول
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-bone-white text-glow-red">أصوات ضحايانا (الذين نجوا واكتفوا بالمتعة)</h3>
                <p className="text-xs text-neutral-500">
                  هل تتساءل عن مدى تأثير برجر الغول على العقل الروحي؟ استمع لقصص الذين عبروا بوابتنا وعادوا بسعادة تامة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "مستدعي الأرواح، مصطفى ك.",
                    avatar: "💀",
                    burger: "برجر الغول الأصلي (GHOUL PRIME)",
                    text: "بعد تلاوة عهد الشراء بدقائق، هبط علي برجر الفحم البركاني. اللحم معتق لدرجة تلامس طاقة كوزمية مرعبة! صوص النخاع جعلني أعيش حيوات سابقة.",
                    stars: 5,
                    date: "عصر الخسوف الأخير"
                  },
                  {
                    name: "صائدة الوحوش، نادين س.",
                    avatar: "🧙‍♀️",
                    burger: "قرمشة الفانتوم (PHANTOM CRUNCH)",
                    text: "كنت أظن شطة الجوست مجرد خرافة، حتى لامست صدور الدجاج المقرمشة فمي. لهيب حارق مطفأ بخردل العسل البرونزي السري! سأكرر الطقس غداً بكل تأكيد.",
                    stars: 5,
                    date: "قمر الدم المكتمل"
                  },
                  {
                    name: "الفارس الغامض، يوسف أ.",
                    avatar: "🧛‍♂️",
                    burger: "دخان المقابر (CEMETERY SMOKE)",
                    text: "الرائحة وحدها كفيلة برفع أرواح الغابة المجاورة. بيكن بقري مقرمش بصلصة القيقب الغريبة التي لا يقاومها إنس ولا جان. أفضل تجربة برجر على الإطلاق!",
                    stars: 5,
                    date: "انقلاب الشتاء العظيم"
                  }
                ].map((witness, i) => (
                  <div 
                    key={i} 
                    className="group bg-gradient-to-b from-smoky-gray/90 to-obsidian border border-charcoal hover:border-burnt-copper/50 rounded-2xl p-5 space-y-4 relative transition-all duration-500 shadow-lg hover:shadow-burnt-copper/5"
                  >
                    <div className="absolute top-4 left-4 text-3xl opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300">
                      {witness.avatar}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <h4 className="text-xs font-black text-bone-white group-hover:text-burnt-copper transition-colors">{witness.name}</h4>
                        <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">{witness.date}</span>
                      </div>
                    </div>

                    <div className="bg-obsidian/60 border border-charcoal/50 p-2.5 rounded-xl text-[10px]">
                      <span className="text-neutral-500 block leading-none">الوجبة المستدعاة:</span>
                      <span className="text-burnt-copper font-bold block mt-1 leading-normal">{witness.burger}</span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                      "{witness.text}"
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-charcoal/30">
                      <div className="flex gap-0.5 text-blood-red text-xs">
                        {Array.from({ length: witness.stars }).map((_, sIdx) => (
                          <span key={sIdx}>★</span>
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-neutral-600 bg-charcoal/10 px-1.5 py-0.5 rounded">نجاة مؤكدة ✔</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── CLIENT ORDER HISTORY VIEW ── */
          <div className="space-y-6 animate-fadeIn text-right">
            <div className="bg-gradient-to-r from-smoky-gray to-obsidian border border-charcoal p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-bone-white uppercase tracking-wider">سجل طقوس وولائم الغول</h3>
                <p className="text-[10px] text-neutral-400">تابع قائمة طلباتك السابقة وتتبع حركاتها الحالية عبر المعبد المظلم.</p>
              </div>
              <button 
                onClick={fetchOrdersHistory}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-charcoal rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                تحديث السجل البرمجي 🔄
              </button>
            </div>

            {ordersHistory.length === 0 ? (
              <div className="text-center py-24 border border-charcoal/60 bg-smoky-gray/50 rounded-2xl space-y-4">
                <FileText className="w-12 h-12 text-neutral-600 mx-auto animate-bounce" />
                <p className="text-neutral-500 text-xs">لا يوجد طقوس أو طلبات سابقة مسجلة في هذا المتصفح حالياً.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-charcoal/60 rounded-2xl bg-smoky-gray/30">
                <table className="w-full text-right text-xs">
                  <thead className="bg-obsidian/85 text-neutral-400 uppercase tracking-widest font-black text-[9px] border-b border-charcoal/80">
                    <tr>
                      <th className="py-4 px-4">رقم الطلب ID</th>
                      <th className="py-4 px-4">المستدعي (العميل)</th>
                      <th className="py-4 px-4">تفاصيل الوليمة</th>
                      <th className="py-4 px-4">العنوان</th>
                      <th className="py-4 px-4">الحساب الإجمالي</th>
                      <th className="py-4 px-4 text-center">حالة الطقوس حية</th>
                      <th className="py-4 px-4 text-left">التوقيت الفلكي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/40 text-neutral-300">
                    {ordersHistory.map((order) => {
                      return (
                        <tr key={order.orderId} className="hover:bg-charcoal/10 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-bone-white">{order.orderId}</td>
                          <td className="py-4 px-4">{order.name} <span className="text-[10px] text-neutral-500">({order.phone})</span></td>
                          <td className="py-4 px-4 max-w-[220px] truncate" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}>
                            {order.items.map((item, index) => (
                              <span key={index} className="inline-block bg-charcoal/20 px-2 py-0.5 rounded text-[10px] ml-1.5 border border-charcoal/40">
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                          </td>
                          <td className="py-4 px-4 text-[11px] text-neutral-400 truncate max-w-[150px]">{order.address}</td>
                          <td className="py-4 px-4 font-bold text-burnt-copper">{order.totalPrice} ج.م</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase ${
                              order.status === "New" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              order.status === "Preparing" ? "bg-blood-red/10 text-blood-red border border-blood-red/20" :
                              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {translatedStatus[order.status] || order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-left text-neutral-500 text-[10px]">
                            {new Date(order.timestamp).toLocaleString("ar-EG")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-charcoal bg-smoky-gray/50 py-12 px-4 text-center z-20 relative text-right" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2">
            <WolfLogo className="w-8 h-8 opacity-60" animate={soundOn} />
            <span className="font-display font-extrabold text-sm tracking-widest text-glow-red uppercase text-bone-white">
              مطبخ برجر الغول الفاخر
            </span>
          </div>
          <p className="text-neutral-500 text-xs max-w-md mx-auto leading-relaxed text-center">
            مختبر طهي مظلم فاخر متخصص في البرجر المبتكر المستوحى من عوالم الرعب والأفلام السينمائية. مصمم لعشاق الطعم الأسطوري المتميز بلمسات غامضة.
          </p>
          <div className="flex justify-center gap-6 text-[10px] uppercase tracking-wider text-burnt-copper font-mono font-bold">
            <span>تناول في المطعم</span>
            <span>•</span>
            <span>تيك أواي</span>
            <span>•</span>
            <span>توصيل الغول السريع</span>
          </div>
          <div className="text-[9px] text-neutral-600 font-mono text-center">
            © {new Date().getFullYear()} مطبخ الغول الكوني. جميع الطقوس والحقوق محفوظة ومستدعاة.
          </div>
        </div>
      </footer>

      {/* ── CUSTOMIZATION MODAL ── */}
      <AnimatePresence>
        {customizingItem && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-smoky-gray border border-charcoal rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-fadeIn flex flex-col max-h-[90vh] text-right" dir="rtl">
              
              {/* Product Header Photo overlay */}
              <div className="relative aspect-video w-full bg-obsidian">
                {customizingItem.image && (
                  <img 
                    src={customizingItem.image} 
                    alt={customizingItem.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-smoky-gray via-transparent to-transparent" />
                <button 
                  onClick={() => setCustomizingItem(null)}
                  className="absolute top-4 left-4 p-2.5 bg-obsidian/90 hover:bg-blood-red text-bone-white rounded-full border border-charcoal transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-4 right-6 left-6">
                  <span className="px-2 py-0.5 bg-burnt-copper border border-burnt-copper/20 rounded-md text-[9px] font-black uppercase tracking-widest text-bone-white">
                    طقوس ومواصفات اللحم البركاني
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-bone-white mt-1">
                    {customizingItem.name}
                  </h4>
                </div>
              </div>

              {/* Customization Details Scrollable */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-neutral-300">
                <div className="space-y-2">
                  <span className="text-[10px] text-burnt-copper font-black block uppercase tracking-wider">قصة ووصف المكونات</span>
                  <p className="text-neutral-400 text-xs leading-relaxed">{customizingItem.description}</p>
                </div>

                {/* Ingredients chips */}
                {customizingItem.ingredients && customizingItem.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold block">مزيج الطقوس المتضمن:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {customizingItem.ingredients.map((ing, i) => (
                        <span key={i} className="bg-obsidian border border-charcoal px-2.5 py-1 rounded text-[10px] font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 0: Variant / Size Selection (Single / Double / Triple) */}
                {customizingItem.variants && customizingItem.variants.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-burnt-copper font-black block uppercase tracking-wider">الخطوة التمهيدية: قوة وحجم الوجبة</span>
                    <div className="grid grid-cols-3 gap-3">
                      {customizingItem.variants.map((v) => {
                        const isSelected = activeVariant?.id === v.id;
                        let emoji = "🍔";
                        let descAr = "شريحة غول دسمة مشوية ومغطاة بالشيدر الساحر.";
                        if (v.name.includes("Double") || v.name.includes("ثنائي")) {
                          emoji = "🍔🍔";
                          descAr = "شريحتان من اللحم البقري لمضاعفة اللهيب والمتعة.";
                        } else if (v.name.includes("Triple") || v.name.includes("ثلاثي")) {
                          emoji = "🍔🍔🍔";
                          descAr = "ثلاث شرائح أسطورية تشبع غضب غول الغابة الكوني.";
                        }
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              if (soundOn) audioSynth.playSizzle();
                              setActiveVariant(v);
                            }}
                            className={`p-3 rounded-xl border text-right font-black flex flex-col justify-between h-24 transition-all duration-300 cursor-pointer ${
                              isSelected 
                                ? "bg-blood-red/15 border-blood-red text-blood-red shadow-inner" 
                                : "bg-obsidian/40 border-charcoal text-neutral-400 hover:border-neutral-700"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[10px]">{v.name}</span>
                              <span className="text-xs">{emoji}</span>
                            </div>
                            <span className="text-[8px] text-neutral-500 font-normal leading-normal line-clamp-2 mt-1">{descAr}</span>
                            <span className="text-[10px] text-burnt-copper block mt-1 font-mono font-bold">{v.price} ج.م</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 1: Bun Type */}
                <div className="space-y-3">
                  <span className="text-[10px] text-burnt-copper font-black block uppercase tracking-wider">الخطوة الأولى: لون وطعم خبز الملحمة</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "obsidian", label: "خبز الفحم الأسود (البركاني)", desc: "كربون نشط كحمم جبل الغول" },
                      { id: "bone", label: "خبز العظام الأبيض (القمح)", desc: "خبز دافئ من قشور القمح الأبيض" },
                      { id: "brioche", label: "خبز البريوش (الذهبي)", desc: "عجينة فرنسية فاخرة بالزبدة المعتقة" }
                    ].map((bun) => {
                      const isSelected = bunType === bun.id;
                      return (
                        <button
                          key={bun.id}
                          onClick={() => {
                            if (soundOn) audioSynth.playSizzle();
                            setBunType(bun.id as any);
                          }}
                          className={`p-3 rounded-xl border text-right font-black flex flex-col justify-between h-20 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? "bg-blood-red/15 border-blood-red text-blood-red" 
                              : "bg-obsidian/40 border-charcoal text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <span className="text-[10px]">{bun.label}</span>
                          <span className="text-[9px] text-neutral-500 font-normal leading-normal">{bun.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Meat Temperature Level (Only for Beef Burgers) */}
                {customizingItem.type === "beef" && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-burnt-copper font-black block uppercase tracking-wider">الخطوة الثانية: درجة استواء اللحم المعتق</span>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "well-done", label: "استواء كامل (WELL-DONE)", desc: "ناضج تماماً على لهب البركان الحارق" },
                        { id: "medium", label: "نصف استواء (MEDIUM-WELL)", desc: "غني بالعصارة السرية لنخاع العظام" }
                      ].map((temp) => {
                        const isSelected = temperature === temp.id;
                        return (
                          <button
                            key={temp.id}
                            onClick={() => {
                              if (soundOn) audioSynth.playSizzle();
                              setTemperature(temp.id as any);
                            }}
                            className={`p-3 rounded-xl border text-right font-black flex flex-col justify-between h-20 transition-all duration-300 cursor-pointer ${
                              isSelected 
                                ? "bg-blood-red/15 border-blood-red text-blood-red" 
                                : "bg-obsidian/40 border-charcoal text-neutral-400 hover:border-neutral-700"
                            }`}
                          >
                            <span className="text-[10px]">{temp.label}</span>
                            <span className="text-[9px] text-neutral-500 font-normal leading-normal">{temp.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: Custom commands to chef */}
                <div className="space-y-2">
                  <span className="text-[10px] text-burnt-copper font-black block uppercase tracking-wider">الخطوة الثالثة: رغبات وتعاويذ مخصصة للطاهي</span>
                  <textarea 
                    value={itemComments}
                    onChange={(e) => setItemComments(e.target.value)}
                    placeholder="مثال: بدون بصل، زيادة صوص الغول السري، المخلل إضافي..."
                    rows={2}
                    className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3 text-xs focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Modal footer / Price & Submit button */}
              <div className="p-6 border-t border-charcoal bg-obsidian/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-neutral-500 text-[10px]">السعر الإجمالي للقطعة:</span>
                  <span className="font-mono text-base font-black text-burnt-copper">
                    {calculateItemPrice(customizingItem, activeVariant)} ج.م
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setCustomizingItem(null);
                      setActiveVariant(null);
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-xl font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleAddCustomizedToCart}
                    className="px-6 py-2.5 bg-blood-red hover:bg-blood-red/90 text-bone-white font-black rounded-xl shadow-lg hover:shadow-blood-red/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>أضف إلى ولائمي</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DIALOG B: CONFIRMED ORDER OVERLAY ── */}
      <AnimatePresence>
        {confirmedOrder && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-smoky-gray border-2 border-blood-red/30 rounded-3xl max-w-md w-full p-6 text-right space-y-5"
              dir="rtl"
            >
              <div className="text-center space-y-2">
                <Flame className="w-12 h-12 text-blood-red mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-bone-white text-glow-red">تم إرسال الطلب بنجاح!</h3>
                <p className="text-neutral-400 text-xs">تلقى مطبخ الغول طلبك بنجاح ويقوم الفرسان بتجهيزه الآن على النار الحية.</p>
              </div>

              {/* Order summary card */}
              <div className="bg-obsidian border border-charcoal/80 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-charcoal/50 pb-2 text-[11px]">
                  <span className="text-neutral-500">رقم الطلب (Order ID):</span>
                  <span className="font-bold text-bone-white text-glow-red">{confirmedOrder.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-500">الاسم بالكامل:</span>
                  <span className="text-neutral-300">{confirmedOrder.name}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-500">رقم الهاتف المحمول:</span>
                  <span className="text-neutral-300">{confirmedOrder.phone}</span>
                </div>
                <div className="flex justify-between items-start text-[11px]">
                  <span className="text-neutral-500 ml-3">مكان وعنوان التسليم:</span>
                  <span className="text-neutral-300 text-left truncate max-w-[180px]">{confirmedOrder.address}</span>
                </div>
                
                <div className="border-t border-charcoal/50 pt-2.5">
                  <span className="text-neutral-500 text-[10px] block mb-1.5 font-bold">تفاصيل طلب الوجبات:</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {confirmedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-[11px] text-neutral-400">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{(item.price * item.quantity).toFixed(0)} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-charcoal/50 pt-2.5 flex justify-between items-baseline text-sm">
                  <span className="text-neutral-400">المبلغ الإجمالي المطلوب:</span>
                  <span className="font-bold text-burnt-copper text-glow-red">{confirmedOrder.totalPrice} ج.م</span>
                </div>
              </div>

              <div className="p-3 bg-blood-red/10 border border-blood-red/20 rounded-xl text-[10px] text-blood-red flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                <span>انسخ كود الطلب لتتبع حالة طلبك والوجبة لاحقاً.</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(confirmedOrder.orderId);
                    showToast("تم نسخ معرف طلب الغول بنجاح!", "success");
                  }}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-charcoal rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ معرف الطلب</span>
                </button>
                <button
                  onClick={() => setConfirmedOrder(null)}
                  className="flex-1 py-2.5 bg-blood-red hover:bg-blood-red/90 text-bone-white font-black rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer"
                >
                  <span>إغلاق التأكيد</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DIALOG E: MOBILE CART DRAWER ── */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-md z-50 flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-smoky-gray border-t border-charcoal/80 rounded-t-[2.5rem] w-full max-h-[92vh] flex flex-col text-right shadow-2xl overflow-hidden"
              dir="rtl"
            >
              {/* Header / Pull bar */}
              <div className="flex items-center justify-between p-5 border-b border-charcoal/50 bg-obsidian/40">
                <button 
                  onClick={() => setShowCartDrawer(false)}
                  className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blood-red" />
                  <span className="text-sm font-black text-bone-white">سلة المشتريات والدفع</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blood-red/15 border border-blood-red/20 text-blood-red rounded-full font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} وجبة
                </span>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-neutral-700 mx-auto animate-bounce" />
                    <p className="text-neutral-500 text-xs">سلة الشراء فارغة حالياً. أضف وجبة برجر لتبدأ!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">الوجبات المحددة</span>
                      <div className="space-y-2.5">
                        {cart.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-3.5 bg-obsidian border border-charcoal rounded-xl text-xs gap-3"
                          >
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center border border-charcoal text-neutral-400 hover:text-white cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-bone-white font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center border border-charcoal text-neutral-400 hover:text-white cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex-1 text-right min-w-0">
                              <span className="font-extrabold text-bone-white block truncate leading-normal text-xs">{item.name}</span>
                              <span className="text-[10px] text-neutral-500 block leading-normal font-mono mt-0.5">
                                {item.bunType === "obsidian" ? "خبز أسود" : item.bunType === "bone" ? "خبز عظام" : "خبز بريوش"}
                                {item.temperature && ` • ${item.temperature === "medium" ? "نصف استواء" : "كامل الاستواء"}`}
                              </span>
                            </div>

                            <span className="font-mono font-bold text-burnt-copper text-xs shrink-0">{(item.price * item.quantity).toFixed(0)} ج.م</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Extras */}
                    <div className="border-t border-charcoal/40 pt-4 space-y-3">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">إضافات مطبخ الغول السرية</span>
                      <div className="grid grid-cols-2 gap-2">
                        {dynamicExtras.filter(e => e.isEnabled && e.availability === "in-stock").map((extra) => {
                          const isSelected = selectedExtras.includes(extra.name);
                          return (
                            <button
                              key={extra.id}
                              onClick={() => handleToggleExtra(extra.name)}
                              className={`p-3 rounded-xl border text-[10px] text-right font-black flex flex-col justify-between h-14 transition-all duration-300 cursor-pointer ${
                                isSelected 
                                  ? "bg-burnt-copper/15 border-burnt-copper text-burnt-copper" 
                                  : "bg-obsidian/40 border-charcoal text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                              }`}
                            >
                              <span className="line-clamp-1 leading-normal">{extra.name}</span>
                              <span className="font-mono font-normal block mt-0.5">+{extra.price} ج.م</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="border-t border-charcoal/60 pt-4 space-y-2 bg-charcoal/10 p-4 rounded-xl">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>قيمة الوجبات:</span>
                        <span className="font-mono font-bold">{getSubtotal()} ج.م</span>
                      </div>
                      
                      {selectedExtras.length > 0 && (
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>الإضافات المحددة:</span>
                          <span className="font-mono font-bold">
                            +{selectedExtras.reduce((sum, name) => {
                              const e = dynamicExtras.find(opt => opt.name === name);
                              return sum + (e ? e.price : 0);
                            }, 0)} ج.م
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>الخدمة / التوصيل:</span>
                        <span className="font-sans text-neutral-300 capitalize">{dineInType === "delivery" ? "توصيل" : "بالمطعم"}</span>
                      </div>

                      {dineInType === "delivery" && (
                        <div className="flex justify-between text-[11px] text-neutral-500">
                          <span>سعر التوصيل:</span>
                          <span className="font-sans text-neutral-300">{getDineInFee()} ج.م</span>
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-400 font-bold text-xs">
                          <span>خصم الميثاق ({appliedCoupon.code}):</span>
                          <span>-{getDiscountAmount()} ج.م</span>
                        </div>
                      )}

                      <div className="border-t border-charcoal/40 pt-2 flex justify-between items-baseline font-bold text-sm">
                        <span className="font-mono text-base font-black text-burnt-copper text-glow-red">{getTotalPrice()} ج.م</span>
                        <span className="text-bone-white">إجمالي الحساب:</span>
                      </div>
                    </div>

                    {/* Coupons */}
                    <div className="border-t border-charcoal/40 pt-4 space-y-2">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">تعويذة الخصم</span>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-xs">
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="p-1 hover:bg-emerald-500/20 text-emerald-400 hover:text-red-400 rounded transition-colors text-xs font-bold cursor-pointer"
                          >
                            إزالة
                          </button>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 block">كود {appliedCoupon.code} نشط!</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              disabled={isValidatingCoupon}
                              onClick={handleValidateCoupon}
                              className="bg-neutral-800 hover:bg-burnt-copper hover:text-white border border-charcoal hover:border-burnt-copper px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-300 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                            >
                              {isValidatingCoupon ? "جاري..." : "تطبيق"}
                            </button>
                            <input
                              type="text"
                              placeholder="مثال: GHOUL20"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value);
                                setCouponError("");
                              }}
                              className="bg-obsidian border border-charcoal rounded-lg px-3 py-1.5 text-xs text-bone-white placeholder-neutral-600 focus:outline-none focus:border-burnt-copper flex-1 text-center font-mono uppercase"
                            />
                          </div>
                          {couponError && (
                            <span className="text-[10px] text-blood-red block">{couponError}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Checkout details Form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleCheckout(e);
                    }} className="border-t border-charcoal/40 pt-4 space-y-3 pb-8">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-black">بيانات استلام وتوصيل الطلب</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDineInType("dine-in")}
                          className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            dineInType === "dine-in"
                              ? "bg-blood-red/15 border-blood-red text-blood-red"
                              : "bg-obsidian/40 border-charcoal text-neutral-400"
                          }`}
                        >
                          ناول بالمطعم / استلام
                        </button>
                        <button
                          type="button"
                          onClick={() => setDineInType("delivery")}
                          className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            dineInType === "delivery"
                              ? "bg-blood-red/15 border-blood-red text-blood-red"
                              : "bg-obsidian/40 border-charcoal text-neutral-400"
                          }`}
                        >
                          توصيل دليفرى (+40 ج.م)
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 block font-bold">الاسم بالكامل *</label>
                        <input 
                          type="text" 
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="أدخل اسمك ثلاثي هنا"
                          className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3.5 text-xs focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 block font-bold">رقم الهاتف المحمول (لتأكيد الطلب) *</label>
                        <input 
                          type="tel" 
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="مثال: 01012345678"
                          className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3.5 text-xs focus:outline-none transition-colors"
                        />
                      </div>

                      {dineInType === "delivery" && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="text-[10px] text-neutral-400 block font-bold">عنوان التوصيل بالتفصيل *</label>
                          <textarea 
                            required={dineInType === "delivery"}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="اسم المنطقة، الشارع، رقم العمارة، رقم الشقة أو علامة مميزة"
                            rows={2}
                            className="w-full bg-obsidian border border-charcoal focus:border-burnt-copper/80 rounded-xl p-3.5 text-xs focus:outline-none transition-colors resize-none"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blood-red hover:bg-blood-red/90 text-bone-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-blood-red/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? "جاري إرسال وتأكيد طلبك..." : "تأكيد وإرسال طلب برجر الغول ⚡"}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DIALOG F: COSMIC HORROR QUIZ MODAL ── */}
      <AnimatePresence>
        {showQuizModal && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-b from-smoky-gray to-obsidian border-2 border-burnt-copper/30 rounded-3xl max-w-lg w-full p-6 text-right space-y-6 relative overflow-hidden shadow-2xl"
              dir="rtl"
            >
              {/* Decorative background dust */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-burnt-copper/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blood-red/5 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={() => {
                  if (soundOn) audioSynth.playSizzle();
                  setShowQuizModal(false);
                }}
                className="absolute top-4 left-4 p-2 bg-neutral-800/80 hover:bg-neutral-700 rounded-full border border-charcoal text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1.5 border-b border-charcoal/60 pb-3">
                <span className="text-[10px] px-2.5 py-0.5 bg-burnt-copper/10 border border-burnt-copper/30 text-burnt-copper font-black uppercase rounded-full">
                  بوابة استحضار الرغبات
                </span>
                <h3 className="text-base sm:text-lg font-black text-bone-white text-glow-red flex items-center justify-center gap-2">
                  <span>🔮 طقس اختبار الغول الكوني</span>
                </h3>
                <p className="text-[10px] text-neutral-400">أجب عن التساؤلات لتقوم الأرواح باختيار وجبتك المطبوخة على جمرات الجحيم.</p>
              </div>

              {/* Step rendering */}
              {quizStep < quizQuestions.length ? (
                <div className="space-y-5 animate-fadeIn">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>خطوة {quizStep + 1} من {quizQuestions.length}</span>
                    <div className="flex gap-1.5">
                      {quizQuestions.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                            idx === quizStep 
                              ? "bg-blood-red w-8" 
                              : idx < quizStep 
                                ? "bg-burnt-copper" 
                                : "bg-neutral-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Question & Description */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-bone-white leading-normal">{quizQuestions[quizStep].question}</h4>
                    <p className="text-[10px] text-neutral-500 leading-normal">{quizQuestions[quizStep].desc}</p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {quizQuestions[quizStep].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleQuizAnswer(opt.key)}
                        className="w-full p-4 bg-obsidian/60 hover:bg-burnt-copper/10 border border-charcoal hover:border-burnt-copper/50 rounded-xl text-xs text-right transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl group-hover:scale-125 transition-transform duration-300">{opt.icon}</span>
                          <span className="text-neutral-300 group-hover:text-bone-white font-extrabold transition-colors leading-normal">{opt.text}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-burnt-copper transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Results screen */
                <div className="space-y-5 animate-fadeIn text-center">
                  <div className="space-y-1">
                    <span className="text-emerald-400 text-xs font-bold block">★ اكتملت الطقوس الكونية ★</span>
                    <h4 className="text-base font-black text-bone-white">الأرواح الكونية قد اختارت وليمك!</h4>
                  </div>

                  {quizResultItem ? (
                    <div className="bg-obsidian border border-burnt-copper/30 rounded-2xl p-4 text-right space-y-4">
                      {quizResultItem.image && (
                        <div className="relative h-28 rounded-xl overflow-hidden border border-charcoal/50">
                          <img 
                            src={quizResultItem.image} 
                            alt={quizResultItem.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-blood-red/80 text-bone-white text-[9px] font-black rounded-md">
                            تطابق روحي ممتاز 🔥
                          </span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-bone-white">{quizResultItem.name}</h5>
                        <p className="text-[10px] text-neutral-400 leading-normal line-clamp-2">{quizResultItem.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-charcoal/50">
                        <span className="text-[10px] text-neutral-500">سعر الاستدعاء الأساسي:</span>
                        <span className="font-mono text-sm font-black text-burnt-copper">{quizResultItem.price} ج.م</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-400 text-xs">تعذر العثور على وجبة متوافقة. يرجى إعادة المحاولة.</p>
                  )}

                  <div className="flex flex-col gap-2.5 pt-2">
                    {quizResultItem && (
                      <button
                        onClick={() => {
                          if (soundOn) audioSynth.playSizzle();
                          setCustomizingItem(quizResultItem);
                          setShowQuizModal(false);
                        }}
                        className="w-full py-3 bg-blood-red hover:bg-blood-red/90 text-bone-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-blood-red/20 cursor-pointer"
                      >
                        استدعاء الوجبة الآن وتخصيصها ⚡
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (soundOn) audioSynth.playSizzle();
                          setQuizStep(0);
                          setQuizAnswers([]);
                          setQuizResultItem(null);
                        }}
                        className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-charcoal rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      >
                        إعادة الطقوس 🔄
                      </button>
                      <button
                        onClick={() => {
                          if (soundOn) audioSynth.playSizzle();
                          setShowQuizModal(false);
                        }}
                        className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-xl text-[11px] font-bold cursor-pointer"
                      >
                        إغلاق البوابة
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DIALOG G: NECROMANCER LIVE ORDER TRACKER MODAL ── */}
      <AnimatePresence>
        {activeTrackingOrder && (
          <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-b from-smoky-gray to-obsidian border-2 border-blood-red/40 rounded-3xl max-w-md w-full p-6 text-right space-y-6 relative overflow-hidden shadow-2xl"
              dir="rtl"
            >
              {/* Absolute glowing orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blood-red/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-burnt-copper/5 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={() => setActiveTrackingOrder(null)}
                className="absolute top-4 left-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full border border-charcoal text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1.5 border-b border-charcoal/60 pb-3">
                <span className="text-[10px] px-2.5 py-0.5 bg-blood-red/10 border border-blood-red/20 text-blood-red font-black uppercase rounded-full animate-pulse">
                  طقس التتبع الماورائي الحقيقي
                </span>
                <h3 className="text-base sm:text-lg font-black text-bone-white text-glow-red">بوابة الاستدعاء وتتبع الأرواح</h3>
                <p className="text-[10px] text-neutral-400">حالة وجبتك الحالية يتم رصدها عبر بلورات المطبخ مباشرة.</p>
              </div>

              {/* Rotating Custom Magic Summoning Circle */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-4">
                {/* Outer runic ring */}
                <div className="absolute inset-0 border-2 border-dashed border-blood-red/30 rounded-full animate-[spin_25s_linear_infinite]" />
                {/* Middle dotted ring */}
                <div className="absolute inset-2 border border-dotted border-burnt-copper/50 rounded-full animate-[spin_10s_linear_infinite]" />
                {/* Inner solid glowing ring */}
                <div className={`absolute inset-4 border border-blood-red/50 rounded-full ${activeTrackingOrder.status === "Preparing" ? "animate-pulse" : ""}`} />
                {/* Core emblem */}
                <span className="absolute text-3xl animate-bounce">
                  {activeTrackingOrder.status === "New" ? "📜" : activeTrackingOrder.status === "Preparing" ? "🔥" : "🚀"}
                </span>
              </div>

              {/* Order Info Bar */}
              <div className="bg-obsidian border border-charcoal rounded-xl p-3 text-center space-y-1 font-mono text-xs">
                <span className="text-neutral-500 text-[10px]">كود الاستدعاء الفرعي للطلب:</span>
                <h4 className="text-sm font-black text-bone-white text-glow-red tracking-wider">{activeTrackingOrder.orderId}</h4>
              </div>

              {/* Live Progress Stage List */}
              <div className="space-y-4 pt-2">
                {[
                  {
                    statusKey: "New",
                    title: "توقيع ميثاق الدم (طلب جديد)",
                    desc: "تم تسجيل الطلب في السجلات المقدسة. يقوم الطاهي بفرز التوابل الآن.",
                    active: true
                  },
                  {
                    statusKey: "Preparing",
                    title: "الشي على لهيب الجمرات (جاري التحضير)",
                    desc: "جمرات معبد الغول تشتعل الآن! يجري إنضاج المكونات على نار حية.",
                    active: activeTrackingOrder.status === "Preparing" || activeTrackingOrder.status === "Delivered"
                  },
                  {
                    statusKey: "Delivered",
                    title: "انطلاق رسول الغسق (تم التوصيل / جاهز)",
                    desc: "خرجت الوجبة من بوابة المعبد وهبطت بنجاح لتمزيق جوعك!",
                    active: activeTrackingOrder.status === "Delivered"
                  }
                ].map((stage, idx) => (
                  <div key={idx} className="flex gap-3 text-right group">
                    {/* Visual Line connector & dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors duration-300 ${
                        stage.active 
                          ? "bg-blood-red/15 border-blood-red text-blood-red" 
                          : "bg-neutral-900 border-charcoal text-neutral-600"
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < 2 && (
                        <div className={`w-0.5 h-12 transition-colors duration-300 ${
                          stage.active && (idx === 0 ? (activeTrackingOrder.status === "Preparing" || activeTrackingOrder.status === "Delivered") : activeTrackingOrder.status === "Delivered")
                            ? "bg-blood-red" 
                            : "bg-charcoal/60"
                        }`} />
                      )}
                    </div>

                    {/* Content text */}
                    <div className="flex-1 space-y-0.5">
                      <h4 className={`text-xs font-black transition-colors ${stage.active ? "text-bone-white" : "text-neutral-600"}`}>
                        {stage.title}
                        {activeTrackingOrder.status === stage.statusKey && (
                          <span className="mr-2 text-[8px] px-1.5 py-0.5 bg-blood-red/20 border border-blood-red/30 text-blood-red rounded-full font-bold uppercase animate-pulse">
                            مستمر حالياً ⚡
                          </span>
                        )}
                      </h4>
                      <p className={`text-[10px] leading-relaxed transition-colors ${stage.active ? "text-neutral-400" : "text-neutral-600"}`}>
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeTrackingOrder.orderId);
                    showToast("تم نسخ معرف طلب الغول بنجاح!", "success");
                  }}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-charcoal rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </button>
                <button
                  onClick={() => setActiveTrackingOrder(null)}
                  className="flex-1 py-2.5 bg-blood-red hover:bg-blood-red/90 text-bone-white font-black rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer"
                >
                  <span>إغلاق التتبع</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}
