import React from "react";

interface WolfLogoProps {
  className?: string;
  glowColor?: string;
  animate?: boolean;
}

export default function WolfLogo({ className = "w-24 h-24", glowColor = "#EF4444", animate = true }: WolfLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Dynamic Backing Ambient Red Glow */}
      {animate && (
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
          style={{ backgroundColor: glowColor, animationDuration: "3s" }}
        />
      )}
      
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.25)]"
      >
        <defs>
          {/* Crimson Flame Linear Gradient */}
          <linearGradient id="crimsonFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Golden/Copper Metallic Accent Gradient */}
          <linearGradient id="copperAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          {/* Premium Titanium Slate Steel Gradient */}
          <linearGradient id="titaniumSteel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Obsidian Body Shadow */}
          <linearGradient id="obsidianGrip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* 1. OUTER CHRONOS & CULINARY SEAL (PROFESSIONAL FRAMING) */}
        <g opacity="0.9">
          {/* Ultra-fine decorative outer circular ring with precise dashing */}
          <circle 
            cx="60" 
            cy="60" 
            r="56" 
            stroke="url(#copperAccent)" 
            strokeWidth="1.2" 
            strokeDasharray="4 3" 
            opacity="0.8" 
          />
          {/* Inner solid border with dynamic high-contrast line */}
          <circle 
            cx="60" 
            cy="60" 
            r="52" 
            stroke="#F1F5F9" 
            strokeWidth="1" 
            opacity="0.25" 
          />
        </g>

        {/* 2. CROSSED PREMIUM BUTCHER CLEAVERS (RESTAURANT SIGNATURE BACKGROUND) */}
        <g opacity="0.85">
          {/* Left Cleaver */}
          <g transform="translate(60, 60) rotate(-45) translate(-60, -60)">
            {/* Blade body */}
            <path 
              d="M 45 25 L 75 25 L 75 52 L 45 42 Z" 
              fill="url(#titaniumSteel)" 
              stroke="#0F172A" 
              strokeWidth="1.2" 
              strokeLinejoin="round" 
            />
            {/* Razor edge highlighter */}
            <path 
              d="M 45 42 L 75 52" 
              stroke="#EF4444" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
            {/* Hanging hole */}
            <circle cx="50" cy="30" r="1.5" fill="#0F172A" />
            {/* Cleaver handle shank */}
            <path 
              d="M 60 52 L 60 85" 
              stroke="url(#copperAccent)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Wooden grip scales */}
            <path 
              d="M 57 70 L 63 70 L 63 85 L 57 85 Z" 
              fill="url(#obsidianGrip)" 
              stroke="url(#copperAccent)" 
              strokeWidth="0.8" 
            />
          </g>

          {/* Right Cleaver */}
          <g transform="translate(60, 60) rotate(45) translate(-60, -60)">
            {/* Blade body */}
            <path 
              d="M 45 25 L 75 25 L 75 42 L 45 52 Z" 
              fill="url(#titaniumSteel)" 
              stroke="#0F172A" 
              strokeWidth="1.2" 
              strokeLinejoin="round" 
            />
            {/* Razor edge highlighter */}
            <path 
              d="M 45 52 L 75 42" 
              stroke="#EF4444" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
            {/* Hanging hole */}
            <circle cx="70" cy="30" r="1.5" fill="#0F172A" />
            {/* Cleaver handle shank */}
            <path 
              d="M 60 52 L 60 85" 
              stroke="url(#copperAccent)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Wooden grip scales */}
            <path 
              d="M 57 70 L 63 70 L 63 85 L 57 85 Z" 
              fill="url(#obsidianGrip)" 
              stroke="url(#copperAccent)" 
              strokeWidth="0.8" 
            />
          </g>
        </g>

        {/* 3. CORE GEOMETRIC WOLF FACE (SHARP, HIGH-END VECTOR) */}
        <g 
          stroke="url(#titaniumSteel)" 
          strokeWidth="2.2" 
          strokeLinejoin="round" 
          strokeLinecap="round"
          className="filter drop-shadow-[0_2px_8px_rgba(15,23,42,0.6)]"
        >
          {/* Ears & Face Boundary */}
          <polygon points="25,18 16,68 45,38" fill="#111827" opacity="0.95" />
          <polygon points="95,18 104,68 75,38" fill="#111827" opacity="0.95" />
          
          {/* Ear details */}
          <line x1="25" y1="18" x2="45" y2="38" />
          <line x1="95" y1="18" x2="75" y2="38" />
          <line x1="45" y1="38" x2="75" y2="38" />

          {/* Diamond Forehead Shield */}
          <polygon points="45,38 60,56 75,38 60,26" fill="#1E293B" opacity="0.7" />
          <line x1="45" y1="38" x2="60" y2="56" />
          <line x1="75" y1="38" x2="60" y2="56" />

          {/* Cheek & Jaw boundaries */}
          <line x1="16" y1="68" x2="45" y2="102" />
          <line x1="104" y1="68" x2="75" y2="102" />
          <line x1="16" y1="68" x2="34" y2="50" />
          <line x1="104" y1="68" x2="86" y2="50" />

          {/* Glowing Eyes & Nose Bridge */}
          {/* Left Eye Triangle */}
          <polygon points="34,50 51,58 42,70" fill="url(#crimsonFlame)" stroke="#EF4444" strokeWidth="1.2" />
          {/* Right Eye Triangle */}
          <polygon points="86,50 69,58 78,70" fill="url(#crimsonFlame)" stroke="#EF4444" strokeWidth="1.2" />

          {/* Nose Snout Core */}
          <polygon points="51,78 69,78 60,90" fill="#111827" />
          <line x1="51" y1="78" x2="60" y2="90" />
          <line x1="69" y1="78" x2="60" y2="90" />
          <line x1="51" y1="78" x2="69" y2="78" />

          {/* Mouth & Teeth Symmetrical Outline */}
          <line x1="45" y1="102" x2="60" y2="98" />
          <line x1="75" y1="102" x2="60" y2="98" />
          <line x1="60" y1="90" x2="60" y2="98" />
          
          {/* Symmetrical fangs representing the Gourmet Bite */}
          <path d="M 52 93 L 55 98 L 58 93" stroke="url(#copperAccent)" strokeWidth="1.5" />
          <path d="M 68 93 L 65 98 L 62 93" stroke="url(#copperAccent)" strokeWidth="1.5" />
        </g>

        {/* 4. THREE MICHELIN-STYLE STEAKHOUSE STARS (PREMIUM BRANDING) */}
        <g 
          fill="url(#copperAccent)" 
          stroke="url(#copperAccent)" 
          strokeWidth="0.5" 
          strokeLinejoin="round"
        >
          {/* Center Star (cx=60, cy=108) */}
          <path d="M 60 102 L 61.5 106 L 65.5 106 L 62.2 108.5 L 63.5 112.5 L 60 110 L 56.5 112.5 L 57.8 108.5 L 54.5 106 L 58.5 106 Z" />
          {/* Left Star (cx=44, cy=105) */}
          <path d="M 44 99 L 45.5 103 L 49.5 103 L 46.2 105.5 L 47.5 109.5 L 44 107 L 40.5 109.5 L 41.8 105.5 L 38.5 103 L 42.5 103 Z" />
          {/* Right Star (cx=76, cy=105) */}
          <path d="M 76 99 L 77.5 103 L 81.5 103 L 78.2 105.5 L 79.5 109.5 L 76 107 L 72.5 109.5 L 73.8 105.5 L 70.5 103 L 74.5 103 Z" />
        </g>
      </svg>
    </div>
  );
}
