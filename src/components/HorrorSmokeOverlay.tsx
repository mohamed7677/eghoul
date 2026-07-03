import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Skull, Ghost } from "lucide-react";

interface HorrorSmokeOverlayProps {
  isVisible: boolean;
  soundOn: boolean;
}

const RITUAL_PHRASES = [
  "طقوس استحضار الغول تبدأ الآن...",
  "يتم فرم اللحم المعتق بضربات دقيقة ومرعبة...",
  "صهر شيدر الحمم المدخنة فوق لهب جهنم المستعر...",
  "سحب غاز ثومية نخاع العظام المكثفة من سراديب المطبخ...",
  "تحضير الخبز البركاني الأسود المشبع بغبار الفحم...",
  "فرسان الغول الأوفياء يسرجون خيولهم السريعة استعداداً للانطلاق...",
  "الأرواح الحارسة تبارك مكونات وليمتك المظلمة..."
];

export default function HorrorSmokeOverlay({ isVisible, soundOn }: HorrorSmokeOverlayProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [filterSeed, setFilterSeed] = useState(1);

  // Cycle through scary ritual phrases
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % RITUAL_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Dynamically morph the fractal noise seed to make the smoke look alive and swirling
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setFilterSeed((prev) => (prev % 100) + 1);
    }, 150);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian/95 select-none overflow-hidden text-right"
          id="horror-smoke-overlay"
        >
          {/* Dynamic real-time SVG fractal noise smoke generator */}
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen scale-110">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <filter id="horror-smoke-turb">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.012"
                  numOctaves="4"
                  seed={filterSeed}
                  result="noise"
                />
                <feColorMatrix
                  type="matrix"
                  values="
                    0 0 0 0 0.63
                    0 0 0 0 0.00
                    0 0 0 0 0.09
                    1 1 1 0 -0.1
                  "
                  result="coloredNoise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="coloredNoise"
                  scale="50"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
              
              {/* Dynamic swirling overlay shapes that are deformed by the turbulence */}
              <g filter="url(#horror-smoke-turb)">
                <circle cx="20%" cy="30%" r="250" fill="rgba(161, 0, 23, 0.15)" />
                <circle cx="80%" cy="40%" r="300" fill="rgba(198, 91, 45, 0.12)" />
                <circle cx="50%" cy="70%" r="350" fill="rgba(90, 0, 11, 0.2)" />
                <circle cx="30%" cy="90%" r="200" fill="rgba(245, 241, 234, 0.05)" />
              </g>
            </svg>
          </div>

          {/* Drifting Mist Layers (Pure CSS fallback & enhancements for depth) */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Dark Cloud Wisp 1 */}
            <motion.div
              animate={{
                x: ["-20%", "20%"],
                y: ["-10%", "10%"],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="absolute -top-20 -left-20 w-[120vw] h-[120vh] bg-radial from-blood-red/10 via-transparent to-transparent opacity-50 blur-3xl"
            />
            
            {/* Gold/Copper Cloud Wisp 2 */}
            <motion.div
              animate={{
                x: ["10%", "-15%"],
                y: ["15%", "-10%"],
                scale: [1.1, 0.9, 1.1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="absolute -bottom-20 -right-20 w-[110vw] h-[110vh] bg-radial from-burnt-copper/8 via-transparent to-transparent opacity-40 blur-3xl"
            />

            {/* Ghostly Whispers / Embers Rising */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: "110%", 
                    scale: Math.random() * 0.6 + 0.4,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: "-10%",
                    x: [`${Math.random() * 100}%`, `${Math.random() * 100 + (Math.random() * 20 - 10)}%`],
                    opacity: [0, 0.7, 0.7, 0],
                    rotate: [0, Math.random() * 360]
                  }}
                  transition={{ 
                    duration: Math.random() * 8 + 6, 
                    repeat: Infinity, 
                    delay: i * 0.8,
                    ease: "easeOut"
                  }}
                  className="absolute w-4 h-4 rounded-full bg-gradient-to-t from-blood-red to-burnt-copper filter blur-[2px] opacity-30 pointer-events-none"
                />
              ))}
            </div>
          </div>

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 pointer-events-none z-20 shadow-inner vignette-ambient" />

          {/* Core Content Box */}
          <div className="relative z-30 flex flex-col items-center max-w-lg px-6 text-center space-y-8">
            
            {/* Center Stage Glowing Runes / Skull Indicator */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer pulsing ritual ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-blood-red/40 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-2 border border-dotted border-burnt-copper/30 rounded-full"
              />
              
              {/* Inner glowing core with a spooky beating flame */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  boxShadow: [
                    "0 0 20px rgba(161, 0, 23, 0.4)",
                    "0 0 40px rgba(161, 0, 23, 0.7)",
                    "0 0 20px rgba(161, 0, 23, 0.4)"
                  ]
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-obsidian border-2 border-blood-red/80 rounded-full flex items-center justify-center"
              >
                <Flame className="w-10 h-10 text-blood-red blood-heartbeat" />
              </motion.div>
            </div>

            {/* Portal Loading Title */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-bone-white font-display uppercase tracking-wider text-glow-red select-none">
                استدعاء <span className="text-burnt-copper text-glow-copper">الوليمة المظلمة</span>...
              </h2>
              <div className="flex justify-center items-center gap-1.5 text-neutral-500 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-blood-red animate-ping" />
                <span>الخادم يتلقى رموز طلبك الطقسي</span>
              </div>
            </div>

            {/* Dynamic Scary Culinary Ritual Status lines */}
            <div className="h-16 flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                  transition={{ duration: 0.5 }}
                  className="text-burnt-copper font-medium text-sm sm:text-base leading-relaxed tracking-wide text-center"
                >
                  {RITUAL_PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Heartbeat EKG visualizer representing cooking frequency */}
            <div className="flex items-end justify-center gap-1 w-48 h-10 px-2 border-b border-charcoal/40 pb-1">
              {[...Array(15)].map((_, idx) => {
                const heights = [10, 15, 35, 12, 8, 40, 20, 15, 30, 25, 10, 15, 45, 20, 12];
                return (
                  <motion.div
                    key={idx}
                    animate={{ 
                      height: [
                        `${heights[idx % heights.length]}%`, 
                        `${Math.max(10, heights[idx % heights.length] + (Math.random() * 40 - 20))}%`,
                        `${heights[idx % heights.length]}%`
                      ] 
                    }}
                    transition={{ 
                      duration: 0.8 + idx * 0.05, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-1.5 bg-blood-red/80 rounded-t-sm"
                  />
                );
              })}
            </div>

            <p className="text-[11px] text-neutral-500 font-sans max-w-xs leading-normal">
              برجاء عدم إغلاق هذه البوابة. طهاة الغول يعملون بكامل قواهم المستترة لتسجيل وحساب طقوس طعامك.
            </p>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
