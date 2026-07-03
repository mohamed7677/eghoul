import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Timer, Skull, Flame, Hourglass } from "lucide-react";

interface HorrorCountdownTimerProps {
  initialMinutes?: number;
  soundOn: boolean;
  onComplete?: () => void;
}

const STAGE_MESSAGES = [
  { timeAtLeast: 15, msg: "طهاة الغول يباشرون ذبح وفرم اللحم المعتق في الظلال..." },
  { timeAtLeast: 10, msg: "البرجر يستقبل لفحة لهب حارقة فوق جمر صخور البراكين..." },
  { timeAtLeast: 5, msg: "صهر شيدر الحمم والبلوبيري يغمر الهيكل.. الرائحة تفوح!" },
  { timeAtLeast: 2, msg: "الطلب يغلف في صناديق الغول المبرومة بالرموز والتمائم..." },
  { timeAtLeast: 0, msg: "فارس الغول السريع انطلق كالسهم وهو في طريقه إلى وكرك الآن!" }
];

export default function HorrorCountdownTimer({ 
  initialMinutes = 20, 
  soundOn, 
  onComplete 
}: HorrorCountdownTimerProps) {
  // Store remaining seconds
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const totalSeconds = initialMinutes * 60;

  // Countdown loop
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Get current cooking status text based on time left
  const getStageMessage = () => {
    const minutesLeft = secondsLeft / 60;
    const stage = STAGE_MESSAGES.find(s => minutesLeft >= s.timeAtLeast);
    return stage ? stage.msg : "الأرواح تُنهي لمساتها الأخيرة على وليمتك...";
  };

  // Calculate percentage for progress circle/bar
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div 
      className="bg-obsidian/60 border border-charcoal rounded-2xl p-5 space-y-4 text-center relative overflow-hidden"
      id="horror-countdown-timer"
    >
      {/* Background glowing embers behind timer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#A10017_1px,transparent_1px)] bg-[size:12px_12px]" />

      {/* Title */}
      <div className="flex items-center justify-between border-b border-charcoal/40 pb-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-blood-red animate-pulse" />
          مؤقت ترقب وليمة الغول
        </span>
        <span className="text-[10px] text-burnt-copper font-mono font-bold">
          الوقت المتبقي للتحضير والتسليم
        </span>
      </div>

      {/* Large Glowing Countdown Display */}
      <div className="relative py-4 flex flex-col items-center justify-center">
        {/* Burning Circular Outer Ring representing cooking progression */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            {/* Dark background circle */}
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="transparent"
              stroke="#1a1a1a"
              strokeWidth="4"
            />
            {/* Red pulsing/bleeding progress circle */}
            <motion.circle
              cx="56"
              cy="56"
              r="48"
              fill="transparent"
              stroke="#A10017"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              animate={{
                filter: [
                  "drop-shadow(0 0 4px rgba(161,0,23,0.6))",
                  "drop-shadow(0 0 10px rgba(161,0,23,0.9))",
                  "drop-shadow(0 0 4px rgba(161,0,23,0.6))"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          {/* Actual Digital Clock */}
          <div className="z-10 text-center flex flex-col items-center justify-center">
            <motion.span 
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl font-black text-bone-white font-mono tracking-wider text-glow-red"
            >
              {formatTime(secondsLeft)}
            </motion.span>
            <span className="text-[8px] uppercase tracking-widest text-neutral-500 mt-1 flex items-center gap-0.5">
              <Hourglass className="w-2.5 h-2.5 text-burnt-copper animate-spin" /> دقيقة : ثانية
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Status Progress Bar */}
      <div className="space-y-1.5 text-right">
        <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
          <span>{Math.round(progressPercent)}% تم التحضير</span>
          <span className="flex items-center gap-0.5 text-blood-red">
            <Flame className="w-3 h-3 animate-bounce" /> فرن جهنم نشط
          </span>
        </div>
        <div className="h-1.5 bg-neutral-900 border border-charcoal/60 rounded-full overflow-hidden p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-blood-red via-burnt-copper to-amber-500 shadow-[0_0_8px_rgba(161,0,23,0.6)]"
          />
        </div>
      </div>

      {/* Dynamic Culinary Ritual Eerie Stage description */}
      <div className="bg-obsidian/80 border border-charcoal/40 p-3 rounded-xl text-center min-h-[50px] flex items-center justify-center">
        <motion.p
          key={secondsLeft ? Math.floor(secondsLeft / 120) : "completed"} // re-animate slightly when phase changes roughly
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-neutral-300 font-medium leading-relaxed"
        >
          {getStageMessage()}
        </motion.p>
      </div>

      {/* Heartbeat feedback sound trigger or indicator */}
      <div className="flex justify-center items-center gap-2">
        <div className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full bg-blood-red animate-ping" />
          <span className="text-[9px] text-neutral-500 font-sans">تتبع التحضير المباشر جارٍ</span>
        </div>
      </div>
    </div>
  );
}
