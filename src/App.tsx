import React, { useState, useEffect } from "react";
import ClientStore from "./components/ClientStore";
import AdminDashboard from "./components/AdminDashboard";
import { Order } from "./types";
import { audioSynth } from "./utils/audio";
import { ShieldAlert, Key, Eye, EyeOff, Sparkles, LogIn, ChevronLeft } from "lucide-react";

export default function App() {
  const [route, setRoute] = useState<"client" | "admin">(
    window.location.pathname === "/admin" || window.location.hash === "#admin" ? "admin" : "client"
  );
  
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [soundOn, setSoundOn] = useState(false);

  // Secure isolation authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem("ghoul_admin_auth") === "true"
  );
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState("");

  // Synchronous location update tracker
  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(window.location.pathname === "/admin" || window.location.hash === "#admin" ? "admin" : "client");
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const fetchOrdersHistory = () => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrdersHistory(data);
        }
      })
      .catch(err => console.error("Error fetching orders:", err));
  };

  useEffect(() => {
    fetchOrdersHistory();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept standard test credentials or thematic codes matching the brand
    if (adminPasscode === "666" || adminPasscode === "123456" || adminPasscode === "admin") {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("ghoul_admin_auth", "true");
      setAuthError("");
      if (soundOn) {
        audioSynth.playSizzle();
      }
    } else {
      setAuthError("الرمز غير صحيح! لم ترضَ عنك أرواح معبد الغول 💀");
      if (soundOn) {
        audioSynth.playGlitchSound();
      }
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("ghoul_admin_auth");
    setAdminPasscode("");
    
    // Navigate back to store
    window.location.hash = "";
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (route === "admin") {
    // If not authenticated, render a completely isolated authentication gate screen
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-obsidian text-bone-white flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
          {/* Cosmic background effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blood-red/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-burnt-copper/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Core Login Card */}
          <div className="max-w-md w-full bg-gradient-to-b from-smoky-gray to-obsidian border-2 border-blood-red/30 rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl text-right">
            
            {/* Thematic Icon/Emblem */}
            <div className="w-16 h-16 bg-blood-red/10 border border-blood-red/40 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg relative animate-bounce">
              💀
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-burnt-copper rounded-full animate-ping" />
            </div>

            {/* Headers */}
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-blood-red/15 border border-blood-red/30 text-blood-red text-[10px] font-black uppercase rounded-full tracking-widest inline-block">
                بوابة حراسة معبد الغول الكونية
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-bone-white text-glow-red">دخول المنسقين والكهنة</h2>
              <p className="text-xs text-neutral-400">
                هذه الصفحة منفصلة تماماً ومخصصة للمشرفين والمديرين لإدارة المبيعات وقاعدة البيانات. يرجى إثبات هويتك.
              </p>
            </div>

            {/* Credentials hint for trial / owner */}
            <div className="bg-obsidian/80 border border-charcoal/80 p-3 rounded-xl text-center space-y-1">
              <span className="text-[10px] text-neutral-500 block">رمز العبور السري الافتراضي للمعاينة:</span>
              <div className="flex justify-center gap-1.5 font-mono text-xs font-bold text-burnt-copper">
                <span>666</span>
                <span className="text-neutral-600">أو</span>
                <span>123456</span>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3.5 bg-blood-red/15 border border-blood-red/30 rounded-xl text-xs text-blood-red text-center font-bold flex items-center justify-center gap-2 animate-pulse">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 block">رمز العبور الفلكي (Passcode)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasscode ? "text" : "password"}
                    placeholder="••••••"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 bg-obsidian border border-charcoal hover:border-neutral-700 focus:border-blood-red rounded-xl text-sm font-mono text-center tracking-widest text-bone-white placeholder-neutral-600 transition-all focus:outline-none focus:ring-1 focus:ring-blood-red"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-burnt-copper to-blood-red hover:from-burnt-copper/90 hover:to-blood-red text-bone-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-blood-red/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-blood-red/20"
              >
                <LogIn className="w-4 h-4" />
                <span>تحقق وافتح البوابة الكبرى</span>
              </button>
            </form>

            {/* Back button to client store */}
            <div className="border-t border-charcoal/60 pt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  const nextSoundState = !soundOn;
                  setSoundOn(nextSoundState);
                  if (nextSoundState) {
                    audioSynth.playSizzle();
                  }
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  soundOn 
                    ? "bg-blood-red/10 border-blood-red/30 text-blood-red" 
                    : "bg-neutral-900 border-charcoal text-neutral-500"
                }`}
              >
                <span>{soundOn ? "🔊 الصوت مفعل" : "🔇 الصوت صامت"}</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = "";
                  window.history.pushState(null, "", "/");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="text-neutral-400 hover:text-bone-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>العودة لصفحة الزبائن</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-obsidian text-bone-white antialiased text-right" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex justify-between items-center mb-8 border-b border-charcoal pb-4">
            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-charcoal rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>قفل وتسجيل الخروج 🚪</span>
            </button>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-black text-bone-white font-display">لوحة تحكم الغول العليا</h1>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">إدارة الطقوس، والطلبات، والخصومات والمخزون الحي</p>
            </div>
          </div>
          
          <AdminDashboard
            orders={ordersHistory}
            onRefreshOrders={fetchOrdersHistory}
            soundOn={soundOn}
            onPlaySound={(soundType) => {
              if (soundOn) {
                if (soundType === "click") {
                  audioSynth.playSizzle();
                } else if (soundType === "skull") {
                  audioSynth.playGlitchSound();
                } else if (soundType === "ember") {
                  audioSynth.playGlitchSound();
                } else if (soundType === "fire") {
                  audioSynth.playHeartbeat();
                }
              }
            }}
            onCatalogChange={() => {
              // Direct synchronization
              fetchOrdersHistory();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <ClientStore 
      soundOn={soundOn} 
      setSoundOn={setSoundOn} 
      ordersHistory={ordersHistory} 
      fetchOrdersHistory={fetchOrdersHistory} 
    />
  );
}

