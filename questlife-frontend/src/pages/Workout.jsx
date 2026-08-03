import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Dumbbell, Calendar, Flame, CheckCircle, Clock, Plus, Timer, 
  TrendingUp, Sparkles, Award, Shield, X, RefreshCw, Trophy, 
  Play, Pause, ChevronRight, ChevronLeft, Info, HelpCircle, Edit3, Search
} from 'lucide-react';
import { apiClient } from '../api/client';

// SVG Muscle Silhouette Components
const FrontMuscleSVG = ({ primary = [], secondary = [] }) => {
  const getFill = (muscle) => {
    if (primary.includes(muscle)) return 'rgba(34, 197, 94, 0.85)';
    if (secondary.includes(muscle)) return 'rgba(245, 158, 11, 0.85)';
    return '#111827';
  };
  const getStroke = (muscle) => {
    if (primary.includes(muscle)) return '#22c55e';
    if (secondary.includes(muscle)) return '#f59e0b';
    return '#374151';
  };

  return (
    <svg viewBox="0 0 100 200" className="w-28 h-56 md:w-32 md:h-64 mx-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <circle cx="50" cy="18" r="9" fill="#030712" stroke="#374151" strokeWidth="1.5" />
      <rect x="47" y="27" width="6" height="6" fill="#030712" stroke="#374151" strokeWidth="1.5" />
      <path d="M 28,33 C 35,32 65,32 72,33 C 74,40 68,45 68,45 L 32,45 C 32,45 26,40 28,33 Z" fill={getFill('Shoulders')} stroke={getStroke('Shoulders')} strokeWidth="1.2" />
      <path d="M 32,45 L 68,45 L 65,70 L 35,70 Z" fill={getFill('Chest')} stroke={getStroke('Chest')} strokeWidth="1.2" />
      <path d="M 27,34 L 22,65 L 26,67 L 31,45 Z" fill={getFill('Arms')} stroke={getStroke('Arms')} strokeWidth="1.2" />
      <path d="M 73,34 L 78,65 L 74,67 L 69,45 Z" fill={getFill('Arms')} stroke={getStroke('Arms')} strokeWidth="1.2" />
      <rect x="36" y="72" width="28" height="35" rx="2" fill={getFill('Core')} stroke={getStroke('Core')} strokeWidth="1.2" />
      <path d="M 36,110 C 36,110 40,150 42,152 L 49,152 L 49,110 Z" fill={getFill('Quadriceps')} stroke={getStroke('Quadriceps')} strokeWidth="1.2" />
      <path d="M 64,110 C 64,110 60,150 58,152 L 51,152 L 51,110 Z" fill={getFill('Quadriceps')} stroke={getStroke('Quadriceps')} strokeWidth="1.2" />
      <path d="M 22,66 L 18,90 L 22,91 L 26,68 Z" fill={getFill('Arms')} stroke={getStroke('Arms')} strokeWidth="1.2" />
      <path d="M 78,66 L 82,90 L 78,91 L 74,68 Z" fill={getFill('Arms')} stroke={getStroke('Arms')} strokeWidth="1.2" />
      <path d="M 42,154 L 46,188 L 41,192 L 39,188 Z" fill={getFill('Calves')} stroke={getStroke('Calves')} strokeWidth="1.2" />
      <path d="M 58,154 L 54,188 L 59,192 L 61,188 Z" fill={getFill('Calves')} stroke={getStroke('Calves')} strokeWidth="1.2" />
    </svg>
  );
};

const BackMuscleSVG = ({ primary = [], secondary = [] }) => {
  const getFill = (muscle) => {
    if (primary.includes(muscle)) return 'rgba(34, 197, 94, 0.85)';
    if (secondary.includes(muscle)) return 'rgba(245, 158, 11, 0.85)';
    return '#111827';
  };
  const getStroke = (muscle) => {
    if (primary.includes(muscle)) return '#22c55e';
    if (secondary.includes(muscle)) return '#f59e0b';
    return '#374151';
  };

  return (
    <svg viewBox="0 0 100 200" className="w-28 h-56 md:w-32 md:h-64 mx-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <circle cx="50" cy="18" r="9" fill="#030712" stroke="#374151" strokeWidth="1.5" />
      <rect x="47" y="27" width="6" height="6" fill="#030712" stroke="#374151" strokeWidth="1.5" />
      <path d="M 28,33 C 35,32 65,32 72,33 C 74,40 68,45 68,45 L 32,45 C 32,45 26,40 28,33 Z" fill={getFill('Shoulders')} stroke={getStroke('Shoulders')} strokeWidth="1.2" />
      <path d="M 32,45 L 68,45 L 62,80 L 38,80 Z" fill={getFill('Back')} stroke={getStroke('Back')} strokeWidth="1.2" />
      <path d="M 38,80 L 62,80 L 60,108 L 40,108 Z" fill={getFill('Back')} stroke={getStroke('Back')} strokeWidth="1.2" />
      <path d="M 36,109 L 64,109 L 61,126 L 39,126 Z" fill={getFill('Glutes')} stroke={getStroke('Glutes')} strokeWidth="1.2" />
      <path d="M 36,128 C 36,128 40,165 42,168 L 49,168 L 49,128 Z" fill={getFill('Hamstrings')} stroke={getStroke('Hamstrings')} strokeWidth="1.2" />
      <path d="M 64,128 C 64,128 60,165 58,168 L 51,168 L 51,128 Z" fill={getFill('Hamstrings')} stroke={getStroke('Hamstrings')} strokeWidth="1.2" />
      <path d="M 42,170 L 46,192 L 41,195 L 39,192 Z" fill={getFill('Calves')} stroke={getStroke('Calves')} strokeWidth="1.2" />
      <path d="M 58,170 L 54,192 L 59,195 L 61,192 Z" fill={getFill('Calves')} stroke={getStroke('Calves')} strokeWidth="1.2" />
    </svg>
  );
};

// Squat Vector animation states (stick figure)
const SquatAnimationSVG = ({ phase }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  const barY = 60 + p * 10;
  const hipY = 100 + p * 15;
  const kneeY = 140 + p * 3;
  const backAngle = p * 12;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
      <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
      <line x1="60" y1="180" x2="60" y2="70" stroke="#1f2937" strokeWidth="2" strokeDasharray="3 3" />
      <rect x="75" y={barY - 15} width="8" height="30" rx="2" fill="#ef4444" />
      <rect x="67" y={barY - 20} width="6" height="40" rx="2" fill="#111827" stroke="#4b5563" />
      <rect x="117" y={barY - 15} width="8" height="30" rx="2" fill="#ef4444" />
      <rect x="127" y={barY - 20} width="6" height="40" rx="2" fill="#111827" stroke="#4b5563" />
      <line x1="65" y1={barY} x2="135" y2={barY} stroke="#9ca3af" strokeWidth="4" />
      <line x1="90" y1="180" x2="85" y2={kneeY} stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="180" x2="115" y2={kneeY} stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <line x1="85" y1={kneeY} x2="100" y2={hipY} stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <line x1="115" y1={kneeY} x2="100" y2={hipY} stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={hipY} x2={100 - backAngle * 0.3} y2={barY + 5} stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <circle cx={100 - backAngle * 0.3} cy={barY - 10} r="7" fill="#f3f4f6" />
    </svg>
  );
};

const PressAnimationSVG = ({ phase, isStanding }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  if (isStanding) {
    const barY = 85 - p * 20;
    const armY = 95 - p * 10;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
        <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
        <line x1="100" y1="180" x2="100" y2="135" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="135" x2="100" y2="95" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="85" r="7" fill="#f3f4f6" />
        <line x1="100" y1="98" x2="85" y2={armY} stroke="#e5e7eb" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="85" y1={armY} x2="85" y2={barY} stroke="#e5e7eb" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="100" y1="98" x2="115" y2={armY} stroke="#e5e7eb" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="115" y1={armY} x2="115" y2={barY} stroke="#e5e7eb" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1={barY} x2="140" y2={barY} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <rect x="52" y={barY - 10} width="8" height="20" rx="1" fill="#111827" />
        <rect x="140" y={barY - 10} width="8" height="20" rx="1" fill="#111827" />
      </svg>
    );
  } else {
    const barY = 80 + p * 18;
    const armXOffset = p * 8;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
        <line x1="30" y1="145" x2="170" y2="145" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <rect x="50" y="145" width="10" height="35" fill="#374151" />
        <rect x="140" y="145" width="10" height="35" fill="#374151" />
        <line x1="75" y1="145" x2="75" y2="90" stroke="#4b5563" strokeWidth="3" />
        <line x1="125" y1="145" x2="125" y2="90" stroke="#4b5563" strokeWidth="3" />
        <ellipse cx="100" cy="140" rx="45" ry="6" fill="#e5e7eb" />
        <circle cx="55" cy="138" r="6" fill="#f3f4f6" />
        <line x1="88" y1="140" x2={78 - armXOffset} y2="120" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
        <line x1={78 - armXOffset} y1="120" x2="90" y2={barY} stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
        <line x1="112" y1="140" x2={122 + armXOffset} y2="120" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
        <line x1={122 + armXOffset} y1="120" x2="110" y2={barY} stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1={barY} x2="150" y2={barY} stroke="#9ca3af" strokeWidth="4" />
        <rect x="42" y={barY - 12} width="8" height="24" rx="1" fill="#2563eb" />
        <rect x="150" y={barY - 12} width="8" height="24" rx="1" fill="#2563eb" />
      </svg>
    );
  }
};

const PullAnimationSVG = ({ phase, isLatPulldown }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  if (isLatPulldown) {
    const barY = 60 + p * 20;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
        <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
        <line x1="80" y1="140" x2="120" y2="140" stroke="#4b5563" strokeWidth="4" />
        <line x1="100" y1="140" x2="100" y2="180" stroke="#4b5563" strokeWidth="4" />
        <line x1="100" y1="140" x2="100" y2="90" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="100" cy="80" r="7" fill="#f3f4f6" />
        <line x1="100" y1="40" x2="100" y2={barY} stroke="#9ca3af" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="70" y1={barY} x2="130" y2={barY} stroke="#a855f7" strokeWidth="4" />
        <line x1="90" y1="95" x2="80" y2="80" stroke="#e5e7eb" strokeWidth="3" />
        <line x1="80" y1="80" x2="80" y2={barY} stroke="#e5e7eb" strokeWidth="3" />
        <line x1="110" y1="95" x2="120" y2="80" stroke="#e5e7eb" strokeWidth="3" />
        <line x1="120" y1="80" x2="120" y2={barY} stroke="#e5e7eb" strokeWidth="3" />
      </svg>
    );
  } else {
    const hinge = p * 15;
    const barY = 120 + p * 20;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
        <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
        <line x1="80" y1="180" x2="90" y2="135" stroke="#e5e7eb" strokeWidth="4" />
        <line x1="90" y1="135" x2={90 + hinge * 0.8} y2={90 + hinge * 0.5} stroke="#e5e7eb" strokeWidth="4" />
        <circle cx={90 + hinge * 0.8} cy={80 + hinge * 0.5} r="7" fill="#f3f4f6" />
        <line x1={90 + hinge * 0.8} y1={95 + hinge * 0.5} x2="110" y2={barY} stroke="#e5e7eb" strokeWidth="3" />
        <line x1="110" y1={barY - 15} x2="110" y2={barY + 15} stroke="#111827" strokeWidth="8" />
        <circle cx="110" cy={barY} r="6" fill="#10b981" />
      </svg>
    );
  }
};

const CurlAnimationSVG = ({ phase }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  const angle = p * 30;
  return (
    <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
      <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
      <line x1="90" y1="180" x2="90" y2="130" stroke="#e5e7eb" strokeWidth="4" />
      <line x1="90" y1="130" x2="90" y2="85" stroke="#e5e7eb" strokeWidth="4" />
      <circle cx="90" cy="75" r="7" fill="#f3f4f6" />
      <line x1="90" y1="90" x2="90" y2="120" stroke="#e5e7eb" strokeWidth="3.5" />
      <line x1="90" y1="120" x2={90 + Math.sin(angle * Math.PI / 180) * 25} y2={120 - Math.cos(angle * Math.PI / 180) * 25} stroke="#e5e7eb" strokeWidth="3.5" />
      <circle cx={90 + Math.sin(angle * Math.PI / 180) * 25} cy={120 - Math.cos(angle * Math.PI / 180) * 25} r="6" fill="#10b981" />
    </svg>
  );
};

const TricepsAnimationSVG = ({ phase }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  const cableY = 95 + p * 35;
  const glowOpacity = 0.3 + (p / 2) * 0.7;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full bg-gradient-to-b from-quest-dark via-quest-darkest to-black border border-white/10 rounded-2xl shadow-2xl">
      {/* Background Cable Tower Structure */}
      <rect x="30" y="8" width="140" height="10" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="1" />
      <circle cx="100" cy="13" r="6" fill="#4b5563" stroke="#9ca3af" strokeWidth="1.5" />
      
      {/* Cable Line */}
      <line x1="100" y1="13" x2="100" y2={cableY} stroke="#9ca3af" strokeWidth="2.5" strokeDasharray="4 2" />
      
      {/* Attachment Handle */}
      <line x1="82" y1={cableY} x2="118" y2={cableY} stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
      <circle cx="82" cy={cableY} r="4" fill="#6b7280" />
      <circle cx="118" cy={cableY} r="4" fill="#6b7280" />

      {/* Ground platform */}
      <line x1="25" y1="185" x2="175" y2="185" stroke="#374151" strokeWidth="4" />
      <rect x="65" y="185" width="70" height="4" fill="#4b5563" />

      {/* Human Body - Side Profile */}
      <circle cx="75" cy="50" r="11" fill="#f3f4f6" stroke="#374151" strokeWidth="1.5" />
      
      {/* Torso */}
      <path d="M 68,66 C 68,66 84,66 84,115 C 84,115 70,115 68,115 Z" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      
      {/* Legs */}
      <line x1="72" y1="115" x2="70" y2="150" stroke="#e5e7eb" strokeWidth="7" strokeLinecap="round" />
      <line x1="70" y1="150" x2="68" y2="185" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="115" x2="82" y2="150" stroke="#e5e7eb" strokeWidth="7" strokeLinecap="round" />
      <line x1="82" y1="150" x2="84" y2="185" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round" />

      {/* Upper Arm (Stays steady close to torso) */}
      <line x1="82" y1="72" x2="92" y2="95" stroke="#f3f4f6" strokeWidth="7" strokeLinecap="round" />
      
      {/* TRICEPS MUSCLE GLOW HIGHLIGHT (Green on extension) */}
      <path 
        d="M 78,72 Q 86,84 90,95" 
        stroke={`rgba(34, 197, 94, ${glowOpacity})`} 
        strokeWidth="9" 
        strokeLinecap="round"
        className="transition-all duration-300"
      />
      <path 
        d="M 78,72 Q 86,84 90,95" 
        stroke={`rgba(34, 197, 94, ${glowOpacity + 0.2})`} 
        strokeWidth="4" 
        strokeLinecap="round"
      />

      {/* Forearm (Moves down with cableY) */}
      <line x1="92" y1="95" x2="100" y2={cableY} stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy={cableY} r="5" fill="#22c55e" />

      {/* Dynamic Movement Arc */}
      <path d="M 100,95 A 35 35 0 0 1 100,130" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2" strokeDasharray="3 3" />

      {/* HUD Info Labels */}
      <text x="100" y="176" textAnchor="middle" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {p === 0 ? 'CONCENTRIC: BENT ELBOWS' : p === 1 ? 'PRESSING CABLE DOWN' : '⚡ PEAK TRICEPS CONTRACTION'}
      </text>
    </svg>
  );
};

const CardioAnimationSVG = ({ phase }) => {
  const legPhase = phase % 2 === 0;
  return (
    <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
      <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
      <line x1="90" y1="130" x2="100" y2="85" stroke="#e5e7eb" strokeWidth="4" />
      <circle cx="103" cy="73" r="7" fill="#f3f4f6" />
      {legPhase ? (
        <>
          <line x1="90" y1="130" x2="75" y2="145" stroke="#e5e7eb" strokeWidth="4" />
          <line x1="75" y1="145" x2="85" y2="175" stroke="#e5e7eb" strokeWidth="4" />
          <line x1="90" y1="130" x2="105" y2="145" stroke="#e5e7eb" strokeWidth="4" />
          <line x1="105" y1="145" x2="95" y2="178" stroke="#e5e7eb" strokeWidth="4" />
        </>
      ) : (
        <>
          <line x1="90" y1="130" x2="105" y2="145" stroke="#e5e7eb" strokeWidth="4" />
          <line x1="105" y1="145" x2="115" y2="175" stroke="#e5e7eb" strokeWidth="4" />
          <line x1="90" y1="130" x2="75" y2="145" stroke="#e5e7eb" strokeWidth="4" />
          <line x1="75" y1="145" x2="65" y2="178" stroke="#e5e7eb" strokeWidth="4" />
        </>
      )}
      <line x1="98" y1="95" x2="115" y2="105" stroke="#e5e7eb" strokeWidth="3" />
      <line x1="98" y1="95" x2="80" y2="110" stroke="#e5e7eb" strokeWidth="3" />
    </svg>
  );
};

const CoreAnimationSVG = ({ phase, isPlank }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  if (isPlank) {
    const breathing = p * 1.5;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
        <line x1="30" y1="160" x2="170" y2="160" stroke="#374151" strokeWidth="3" />
        <line x1="50" y1="145" x2="50" y2="160" stroke="#e5e7eb" strokeWidth="3" />
        <line x1="50" y1="145" x2="140" y2="140" stroke="#e5e7eb" strokeWidth="4" />
        <ellipse cx="110" cy={141 - breathing * 0.3} rx="20" ry={12 + breathing * 0.2} fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="1" />
        <line x1="130" y1="141" x2="135" y2="160" stroke="#e5e7eb" strokeWidth="3.5" />
        <line x1="135" y1="160" x2="145" y2="160" stroke="#e5e7eb" strokeWidth="3.5" />
        <circle cx="150" cy="135" r="7" fill="#f3f4f6" />
      </svg>
    );
  } else {
    const angle = p * 40;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
        <line x1="30" y1="160" x2="170" y2="160" stroke="#374151" strokeWidth="3" />
        <line x1="45" y1="135" x2="145" y2="135" stroke="#4b5563" strokeWidth="4" />
        <line x1="60" y1="135" x2="60" y2="160" stroke="#4b5563" strokeWidth="4" />
        <line x1="130" y1="135" x2="130" y2="160" stroke="#4b5563" strokeWidth="4" />
        <line x1="90" y1="132" x2="140" y2="132" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="145" cy="127" r="6" fill="#f3f4f6" />
        <line x1="90" y1="132" x2={90 - Math.cos(angle * Math.PI / 180) * 35} y2={132 - Math.sin(angle * Math.PI / 180) * 35} stroke="#e5e7eb" strokeWidth="4" />
      </svg>
    );
  }
};

const RestAnimationSVG = ({ phase }) => {
  const p = phase <= 2 ? phase : 4 - phase;
  const breathing = p * 2;
  return (
    <svg viewBox="0 0 200 200" className="w-full h-48 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/5 rounded-2xl">
      <line x1="30" y1="180" x2="170" y2="180" stroke="#374151" strokeWidth="3" />
      <circle cx="100" cy="80" r="10" fill="#f3f4f6" />
      <line x1="100" y1="90" x2="100" y2="135" stroke="#e5e7eb" strokeWidth="4" />
      <circle cx="100" cy="110" r={30 + breathing * 3} fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1.5" />
      <circle cx="100" cy="110" r={15 + breathing * 1.5} fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" />
      <path d="M 100,135 Q 75,130 70,150 Q 80,165 100,160 Q 120,165 130,150 Q 125,130 100,135" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
      <line x1="100" y1="100" x2="80" y2="125" stroke="#e5e7eb" strokeWidth="3" />
      <line x1="100" y1="100" x2="120" y2="125" stroke="#e5e7eb" strokeWidth="3" />
    </svg>
  );
};

const LottieExerciseAnimation = ({ exercise, phase }) => {
  if (!exercise) return <RestAnimationSVG phase={phase} />;
  const name = exercise.name.toLowerCase();
  const muscle = exercise.muscleGroup.toLowerCase();

  if (name.includes('squat') || muscle.includes('quadriceps') || muscle.includes('hamstrings') || name.includes('calf') || name.includes('deadlift')) {
    return <SquatAnimationSVG phase={phase} />;
  }
  if (name.includes('bench') || name.includes('press') || muscle.includes('chest') || muscle.includes('shoulders')) {
    const isStanding = name.includes('overhead') || name.includes('shoulder') || name.includes('lateral');
    return <PressAnimationSVG phase={phase} isStanding={isStanding} />;
  }
  if (name.includes('row') || name.includes('pulldown') || muscle.includes('back')) {
    const isLat = name.includes('pulldown');
    return <PullAnimationSVG phase={phase} isLatPulldown={isLat} />;
  }
  if (name.includes('curl') || name.includes('bicep') || muscle.includes('arms')) {
    return <CurlAnimationSVG phase={phase} />;
  }
  if (name.includes('tricep') || name.includes('extension') || name.includes('pushdown')) {
    return <TricepsAnimationSVG phase={phase} />;
  }
  if (name.includes('sprint') || name.includes('run') || name.includes('cardio') || name.includes('interval') || name.includes('agility')) {
    return <CardioAnimationSVG phase={phase} />;
  }
  if (name.includes('plank') || name.includes('raise') || name.includes('twist') || muscle.includes('core') || muscle.includes('abs')) {
    const isPlank = name.includes('plank');
    return <CoreAnimationSVG phase={phase} isPlank={isPlank} />;
  }
  return <RestAnimationSVG phase={phase} />;
};

const EXERCISE_ANIMATION_KEYFRAMES = {
  'triceps pushdown': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg'
  ],
  'barbell bench press': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/1.jpg'
  ],
  'overhead shoulder press': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Overhead_Press/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Overhead_Press/1.jpg'
  ],
  'deadlift': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/1.jpg'
  ],
  'lat pulldowns': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wide-Grip_Rear_Pulldown/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wide-Grip_Rear_Pulldown/1.jpg'
  ],
  'barbell bicep curl': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg'
  ],
  'barbell back squat': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/1.jpg'
  ],
  'standing calf raises': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raise/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raise/1.jpg'
  ],
  'dumbbell lateral raise': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lateral_Raise/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lateral_Raise/1.jpg'
  ],
  'dumbbell hammer curl': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Hammer_Curl/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Hammer_Curl/1.jpg'
  ],
  'hanging leg raise': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg'
  ],
  'plank hold': [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg'
  ]
};

const WorkoutAnimation = ({ exercise, phase }) => {
  const [animSource, setAnimSource] = useState('gif');
  const [fetchedImages, setFetchedImages] = useState([]);
  const [matchType, setMatchType] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [autoLoopIndex, setAutoLoopIndex] = useState(0);

  const exKey = exercise?.name?.toLowerCase().trim() || '';
  const localFrames = EXERCISE_ANIMATION_KEYFRAMES[exKey] || Object.entries(EXERCISE_ANIMATION_KEYFRAMES).find(([k]) => exKey.includes(k) || k.includes(exKey))?.[1] || [
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg',
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoLoopIndex(prev => (prev + 1) % 2);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const activeFrames = (fetchedImages && fetchedImages.length > 0) ? fetchedImages : localFrames;
  const frameIdx = (phase !== undefined && phase !== null && phase > 0) ? (phase % activeFrames.length) : autoLoopIndex;
  const activeImageUrl = activeFrames[frameIdx] || activeFrames[0];

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    setFetchedImages([]);
    setMatchType(null);

    let isMounted = true;
    if (exercise?.name) {
      apiClient(`/workouts/exercise-animation?name=${encodeURIComponent(exercise.name)}&muscle_group=${encodeURIComponent(exercise.muscleGroup || '')}`)
        .then(res => {
          if (!isMounted) return;
          if (res?.images && res.images.length > 0) {
            setFetchedImages(res.images);
          } else if (res?.gifUrl) {
            setFetchedImages([res.gifUrl]);
          }
          setMatchType(res?.match_type || 'none');
        })
        .catch(() => {
          if (isMounted) setMatchType('none');
        });
    }
    return () => { isMounted = false; };
  }, [exercise]);

  const matchDotColor = (matchType === 'exact' || matchType === 'fuzzy') ? 'bg-emerald-400 animate-pulse' : matchType === 'muscle_fallback' ? 'bg-amber-400' : 'bg-gray-400';
  const matchLabel = matchType === 'exact' ? 'Exact match' : matchType === 'fuzzy' ? 'Closest match' : matchType === 'muscle_fallback' ? 'Generic image' : 'Local media';

  return (
    <div className="relative flex flex-col items-center">
      {/* Top Bar Badges & Source Toggle */}
      <div className="w-full flex justify-between items-center mb-2 px-1">
        <div className="px-2 py-0.5 bg-quest-darkest/80 backdrop-blur-md rounded-md border border-quest-primary/40 text-[9px] font-mono text-quest-primary flex items-center gap-1.5 shadow-md">
          <span className={`w-1.5 h-1.5 rounded-full ${matchDotColor}`} />
          <span>{matchLabel}</span>
        </div>

        <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/10 text-[9px] font-bold">
          <button
            type="button"
            onClick={() => setAnimSource('gif')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${animSource === 'gif' ? 'bg-quest-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            🎬 Exercise Dataset
          </button>
          <button
            type="button"
            onClick={() => setAnimSource('vector')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${animSource === 'vector' ? 'bg-quest-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ Vector
          </button>
        </div>
      </div>

      {/* Main Animation Screen */}
      <div className="w-full h-52 bg-gradient-to-b from-quest-dark to-quest-darkest border border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner">
        {animSource === 'gif' && activeImageUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 space-y-2">
                <div className="w-6 h-6 border-2 border-quest-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-gray-400 font-mono">Loading Exercise Media...</span>
              </div>
            )}
            <img
              src={activeImageUrl}
              alt={exercise?.name || 'Exercise Animation'}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-2 transition-all duration-300 transform scale-95"
            />
          </>
        ) : (
          <div className="w-full h-full relative">
            {imgError && animSource === 'gif' && (
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded text-[9px] font-mono">
                Rendering Anatomical Player
              </div>
            )}
            <LottieExerciseAnimation exercise={exercise} phase={phase} />
          </div>
        )}
      </div>
    </div>
  );
};

const ROUTINE_PRESETS = [
  {
    id: 'push',
    focus: 'Upper Body Push (Chest & Shoulders)',
    duration: '45 mins',
    calories: '620 kcal',
    xp: 63,
    primaryMuscles: ['Chest', 'Shoulders'],
    secondaryMuscles: ['Arms'],
    exercises: [
      { id: 101, name: 'Barbell Bench Press', muscleGroup: 'Chest', targetSets: 3, targetReps: '8', baseWeight: 65, instructions: 'Lie on the bench with feet flat on the floor. Grip the bar slightly wider than shoulder-width, lower to chest, and press up.', steps: ['1. Start', '2. Lowering', '3. Bottom', '4. Pressing Up', '5. Lockout'] },
      { id: 102, name: 'Overhead Shoulder Press', muscleGroup: 'Shoulders', targetSets: 3, targetReps: '8-10', baseWeight: 40, instructions: 'Press the barbell overhead from shoulder height while keeping core tight and back straight.', steps: ['1. Rack Position', '2. Dip & Drive', '3. Lockout', '4. Control Down'] },
      { id: 103, name: 'Triceps Pushdown', muscleGroup: 'Arms', targetSets: 3, targetReps: '10-12', baseWeight: 20, instructions: 'Push cable attachment down by flexing the triceps, keeping elbows pinned to your sides.', steps: ['1. Start', '2. Press Down', '3. Squeeze', '4. Control Up'] }
    ]
  },
  {
    id: 'pull',
    focus: 'Upper Body Pull (Back & Biceps)',
    duration: '45 mins',
    calories: '580 kcal',
    xp: 63,
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Arms'],
    exercises: [
      { id: 301, name: 'Deadlift', muscleGroup: 'Back', targetSets: 3, targetReps: '5', baseWeight: 100, instructions: 'Pull barbell from floor keeping spine neutral and hips low, driving with legs, locking out at hips.', steps: ['1. Setup', '2. Grip & Brace', '3. Leg Drive', '4. Hip Lockout'] },
      { id: 302, name: 'Lat Pulldowns', muscleGroup: 'Back', targetSets: 3, targetReps: '10', baseWeight: 55, instructions: 'Pull bar to collarbone, contracting upper back muscles, release slowly back to top.', steps: ['1. Reach', '2. Pull Down', '3. Contraction', '4. Release'] },
      { id: 303, name: 'Barbell Bicep Curl', muscleGroup: 'Arms', targetSets: 3, targetReps: '10', baseWeight: 30, instructions: 'Curl barbell up towards chest, keeping elbows locked at your side and squeezing biceps.', steps: ['1. Start', '2. Curl Up', '3. Squeeze', '4. Control Down'] }
    ]
  },
  {
    id: 'squat',
    focus: 'Leg Squat Focus (Legs & Calves)',
    duration: '50 mins',
    calories: '710 kcal',
    xp: 70,
    primaryMuscles: ['Quadriceps', 'Hamstrings'],
    secondaryMuscles: ['Glutes', 'Calves'],
    exercises: [
      { id: 201, name: 'Barbell Back Squat', muscleGroup: 'Quadriceps', targetSets: 3, targetReps: '6', baseWeight: 85, instructions: 'Rest bar on upper back. Lower hips below knees, keeping chest up, and drive back up through heels.', steps: ['1. Start', '2. Lowering', '3. Bottom', '4. Driving Up', '5. Lockout'] },
      { id: 202, name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', targetSets: 3, targetReps: '10-12', baseWeight: 70, instructions: 'Hinge at the hips, keeping back flat. Lower weight along legs until hamstring stretch, squeeze glutes to return.', steps: ['1. Setup', '2. Hip Hinge', '3. Stretch', '4. Squeeze Glutes'] },
      { id: 203, name: 'Standing Calf Raises', muscleGroup: 'Calves', targetSets: 4, targetReps: '15', baseWeight: 50, instructions: 'Raise heels as high as possible by flexing calf muscles, hold, and slowly lower.', steps: ['1. Stretch', '2. Lift', '3. Peak Contract', '4. Lower'] }
    ]
  },
  {
    id: 'cardio',
    focus: 'Agility & HIIT Cardio (HIIT Cardio & Abs)',
    duration: '35 mins',
    calories: '450 kcal',
    xp: 83,
    primaryMuscles: ['Core', 'Calves'],
    secondaryMuscles: ['Quadriceps'],
    exercises: [
      { id: 401, name: 'Interval Sprints', muscleGroup: 'Core', targetSets: 4, targetReps: '60s Sprint', baseWeight: 0, instructions: 'Perform maximum effort running intervals followed by active recovery walks.', steps: ['1. Warmup', '2. Sprint Blast', '3. Recover Walk', '4. Cool Down'] },
      { id: 402, name: 'Hanging Leg Raise', muscleGroup: 'Core', targetSets: 3, targetReps: '12', baseWeight: 0, instructions: 'Hang from bar, raise feet to hip height contracting abs, lower under control.', steps: ['1. Dead Hang', '2. Raise Legs', '3. Peak Abs', '4. Control Down'] },
      { id: 403, name: 'Plank Hold', muscleGroup: 'Core', targetSets: 3, targetReps: '60s Hold', baseWeight: 0, instructions: 'Maintain straight body line supported by elbows and toes, keeping abs tight.', steps: ['1. Get Set', '2. Hold Line', '3. Breathe', '4. Recover'] }
    ]
  },
  {
    id: 'arnold',
    focus: 'Golden Era Arnold Split (Chest, Back & Shoulders)',
    duration: '60 mins',
    calories: '800 kcal',
    xp: 77,
    primaryMuscles: ['Chest', 'Back'],
    secondaryMuscles: ['Arms'],
    exercises: [
      { id: 501, name: 'Incline Bench Press', muscleGroup: 'Chest', targetSets: 4, targetReps: '8-10', baseWeight: 60, instructions: 'Press barbell on 30-degree incline bench focusing on upper pectoral stretch.', steps: ['1. Setup', '2. Unrack', '3. Lower', '4. Push'] },
      { id: 502, name: 'Barbell Row', muscleGroup: 'Back', targetSets: 4, targetReps: '8', baseWeight: 50, instructions: 'Hinge at hip, pull barbell to lower chest contracting lats and rhomboids.', steps: ['1. Hinge', '2. Pull', '3. Control Down'] },
      { id: 503, name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', targetSets: 3, targetReps: '12-15', baseWeight: 10, instructions: 'Raise dumbbells laterally to shoulder level with slight elbow bend, lower slowly.', steps: ['1. Start', '2. Fly Out', '3. Peak Shoulder', '4. Control Down'] }
    ]
  },
  {
    id: 'arms',
    focus: 'Arms & Core Warrior (Bicep, Tricep & Abs)',
    duration: '45 mins',
    calories: '500 kcal',
    xp: 63,
    primaryMuscles: ['Arms', 'Core'],
    secondaryMuscles: ['Shoulders'],
    exercises: [
      { id: 601, name: 'Dumbbell Hammer Curl', muscleGroup: 'Arms', targetSets: 3, targetReps: '12', baseWeight: 14, instructions: 'Curl dumbbells with neutral grip (palms facing each other) to build forearm and brachialis.', steps: ['1. Start', '2. Curl Up', '3. Squeeze', '4. Lower'] },
      { id: 602, name: 'Overhead Triceps Extension', muscleGroup: 'Arms', targetSets: 3, targetReps: '10', baseWeight: 22, instructions: 'Hold dumbbell overhead, lower behind head by bending elbows, and press back up.', steps: ['1. Rack Overhead', '2. Lower Behind', '3. Press Up', '4. Lockout'] },
      { id: 603, name: 'Russian Twists', muscleGroup: 'Core', targetSets: 3, targetReps: '20', baseWeight: 10, instructions: 'Sit on floor, lean back slightly, rotate torso and weight from side to side.', steps: ['1. Hold Balance', '2. Twist Left', '3. Twist Right', '4. Center'] }
    ]
  },
  {
    id: 'rest',
    focus: 'Rest & Recovery (Yoga & Foam Rolling)',
    duration: '30 mins',
    calories: '200 kcal',
    xp: 23,
    primaryMuscles: ['Core', 'Calves'],
    secondaryMuscles: ['Back'],
    exercises: [
      { id: 701, name: 'Yoga Stretching', muscleGroup: 'Core', targetSets: 3, targetReps: '10 mins', baseWeight: 0, instructions: 'Hold recovery static stretching positions like child pose, cobra, and downward dog.', steps: ['1. Child Pose', '2. Cobra Pose', '3. Downward Dog', '4. Savasana'] },
      { id: 702, name: 'Foam Rolling', muscleGroup: 'Back', targetSets: 1, targetReps: '10 mins', baseWeight: 0, instructions: 'Roll out tight myofascial trigger points in calves, hamstrings, quads, and upper back.', steps: ['1. Roll Calves', '2. Roll Quads', '3. Roll Back', '4. Relax'] }
    ]
  }
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ALL_COMMON_EXERCISES = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'Chest', baseWeight: 60, targetSets: 4, targetReps: '8-10', instructions: 'Lie flat on a barbell bench, lower it to mid-chest, and press up.' },
  { name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', baseWeight: 22, targetSets: 3, targetReps: '10-12', instructions: 'Set bench to a 30-45 degree incline. Press dumbbells upwards.' },
  { name: 'Chest Flyes (Dumbbell)', muscleGroup: 'Chest', baseWeight: 14, targetSets: 3, targetReps: '12-15', instructions: 'Lie flat on bench, open dumbbells in a wide arc, squeeze at top.' },
  { name: 'Cable Crossover', muscleGroup: 'Chest', baseWeight: 20, targetSets: 3, targetReps: '12-15', instructions: 'Stand in middle of cable station, pull handles down and together.' },
  { name: 'Push-ups', muscleGroup: 'Chest', baseWeight: 0, targetSets: 3, targetReps: '15-20', instructions: 'Keep body in straight plank, bend arms to lower chest, press up.' },

  // Back
  { name: 'Deadlift', muscleGroup: 'Back', baseWeight: 100, targetSets: 3, targetReps: '5', instructions: 'Stand with feet shoulder-width, hinge down, pull barbell to upright stance.' },
  { name: 'Barbell Row', muscleGroup: 'Back', baseWeight: 50, targetSets: 4, targetReps: '8-10', instructions: 'Hinge hips forward with flat back. Pull bar to lower chest.' },
  { name: 'Lat Pulldown', muscleGroup: 'Back', baseWeight: 45, targetSets: 3, targetReps: '10-12', instructions: 'Sit down, pull bar down to upper chest, squeeze shoulder blades.' },
  { name: 'Pull-up', muscleGroup: 'Back', baseWeight: 0, targetSets: 3, targetReps: '6-10', instructions: 'Hang from overhead bar with wide grip, pull chin above bar level.' },
  { name: 'Seated Cable Row', muscleGroup: 'Back', baseWeight: 40, targetSets: 3, targetReps: '10-12', instructions: 'Sit on bench, pull double handle to lower chest, keep back tall.' },

  // Shoulders
  { name: 'Overhead Press (Barbell)', muscleGroup: 'Shoulders', baseWeight: 40, targetSets: 4, targetReps: '8-10', instructions: 'Press barbell overhead from shoulder height until arms lock.' },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', baseWeight: 16, targetSets: 3, targetReps: '10-12', instructions: 'Sit tall, press dumbbells upwards from shoulder height.' },
  { name: 'Lateral Raise (Dumbbell)', muscleGroup: 'Shoulders', baseWeight: 8, targetSets: 4, targetReps: '12-15', instructions: 'Stand tall, raise dumbbells out to sides to shoulder level.' },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders', baseWeight: 8, targetSets: 3, targetReps: '12-15', instructions: 'Bend forward, raise dumbbells to sides focusing on posterior deltoid.' },

  // Legs
  { name: 'Barbell Back Squat', muscleGroup: 'Quadriceps', baseWeight: 80, targetSets: 4, targetReps: '8-10', instructions: 'Bar on upper back, stand shoulder-width, lower hips to parallel, drive up.' },
  { name: 'Leg Press', muscleGroup: 'Quadriceps', baseWeight: 120, targetSets: 3, targetReps: '10-12', instructions: 'Sit in press seat, press sled upward until legs extend.' },
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', baseWeight: 60, targetSets: 3, targetReps: '10-12', instructions: 'Hinge hips backward with soft knee bend, lower bar to mid-shin level.' },
  { name: 'Leg Curl (Lying)', muscleGroup: 'Hamstrings', baseWeight: 30, targetSets: 3, targetReps: '12-15', instructions: 'Lie face down, curl roller toward glutes, squeeze hamstrings.' },
  { name: 'Standing Calf Raise', muscleGroup: 'Calves', baseWeight: 40, targetSets: 4, targetReps: '15-20', instructions: 'Stand on platform edge, raise heels as high as possible, lower slowly.' },

  // Arms
  { name: 'Bicep Curl (Dumbbell)', muscleGroup: 'Arms', baseWeight: 12, targetSets: 3, targetReps: '10-12', instructions: 'Hold dumbbells at sides, curl weights toward shoulders under control.' },
  { name: 'Hammer Curl', muscleGroup: 'Arms', baseWeight: 12, targetSets: 3, targetReps: '10-12', instructions: 'Hold dumbbells with neutral palms grip, curl upwards.' },
  { name: 'Tricep Pushdown (Cable)', muscleGroup: 'Arms', baseWeight: 20, targetSets: 3, targetReps: '12-15', instructions: 'Hold cable attachment, push down until arms are lock-straight.' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Arms', baseWeight: 16, targetSets: 3, targetReps: '10-12', instructions: 'Dumbbell held overhead in both hands, bend elbows to lower bar behind head.' },

  // Core
  { name: 'Plank', muscleGroup: 'Core', baseWeight: 0, targetSets: 3, targetReps: '60s', instructions: 'Rest on forearms and toes, keep body straight and core squeezed.' },
  { name: 'Russian Twist', muscleGroup: 'Core', baseWeight: 10, targetSets: 3, targetReps: '20', instructions: 'Sit with feet off ground, twist torso and touch weight side to side.' }
];

export default function Workout() {
  const { applyXpResult, showToast, profile, activityHistory } = useUser();
  const [submittingWorkout, setSubmittingWorkout] = useState(false);

  // Calculate dynamic weekly training progress
  const targetWorkouts = profile?.trainingDays || 4;
  const workoutsThisWeek = (activityHistory || []).filter(act => {
    if (act.activity_type !== 'workout') return false;
    const actDate = new Date(act.created_at);
    const diffTime = Math.abs(new Date() - actDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  const completedWorkoutsCount = workoutsThisWeek.length;

  const totalDurationMinutes = workoutsThisWeek.reduce((sum, act) => {
    const meta = act.metadata || {};
    return sum + (meta.duration_minutes || 45);
  }, 0);
  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  const durationLabel = `${hours}h ${mins}m`;

  const totalCaloriesKcal = workoutsThisWeek.reduce((sum, act) => {
    const meta = act.metadata || {};
    const duration = meta.duration_minutes || 45;
    return sum + Math.round(duration * 7.5);
  }, 0);

  const getCurrentDayKey = () => {
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayMap[new Date().getDay()] || 'Mon';
  };

  const [selectedDay, setSelectedDay] = useState(getCurrentDayKey);
  const [routines, setRoutines] = useState({
    Mon: { ...ROUTINE_PRESETS[0], day: 'Monday' },
    Tue: { ...ROUTINE_PRESETS[1], day: 'Tuesday' },
    Wed: { ...ROUTINE_PRESETS[2], day: 'Wednesday' },
    Thu: { ...ROUTINE_PRESETS[3], day: 'Thursday' },
    Fri: { ...ROUTINE_PRESETS[4], day: 'Friday' },
    Sat: { ...ROUTINE_PRESETS[5], day: 'Saturday' },
    Sun: { ...ROUTINE_PRESETS[6], day: 'Sunday' }
  });
  
  // Searching & Editing states
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEx, setEditingEx] = useState(null); // { exercise: {...}, index: 0 }
  const [showAddExModal, setShowAddExModal] = useState(false);

  // Custom/New Exercise Fields
  const [customExName, setCustomExName] = useState('');
  const [customExMuscle, setCustomExMuscle] = useState('Chest');
  const [customExWeight, setCustomExWeight] = useState('40');
  const [customExSets, setCustomExSets] = useState('3');
  const [customExReps, setCustomExReps] = useState('8-10');
  const [customExInstructions, setCustomExInstructions] = useState('');
  const [exSuggestions, setExSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCustomExNameChange = (val) => {
    setCustomExName(val);
    if (!val) {
      setExSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = ALL_COMMON_EXERCISES.filter(ex => 
      ex.name.toLowerCase().includes(val.toLowerCase())
    );
    setExSuggestions(filtered);
    setShowSuggestions(true);
  };

  // Set Logging State: { [exerciseId]: { sets: [{ weight, reps, rpe, completed }] } }
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState(false);

  // Active Exercise State
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [infoTab, setInfoTab] = useState('animation'); // 'animation' or 'info'
  const [animPhase, setAnimPhase] = useState(0);

  // Set Inputs
  const [inputWeight, setInputWeight] = useState('');
  const [inputReps, setInputReps] = useState('');
  const [inputRpe, setInputRpe] = useState('8');

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const currentRoutine = routines[selectedDay] || routines['Mon'];
  const activeExercise = currentRoutine.exercises[activeExerciseIndex] || currentRoutine.exercises[0];

  // Auto animation effect
  useEffect(() => {
    let animInterval = null;
    if (infoTab === 'animation') {
      animInterval = setInterval(() => {
        setAnimPhase(prev => (prev + 1) % 5);
      }, 1000);
    }
    return () => clearInterval(animInterval);
  }, [infoTab, activeExerciseIndex]);

  // Countdown Rest Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
      showToast('Rest Timer Complete! Ready for next set!', 'success');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds, showToast]);

  const startRestTimer = (seconds = 90) => {
    setTimerSeconds(seconds);
    setIsTimerActive(true);
  };

  // Search filter routines
  const filteredPresets = ROUTINE_PRESETS.filter(p => 
    p.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectPreset = (preset) => {
    setRoutines(prev => ({
      ...prev,
      [selectedDay]: {
        ...preset,
        day: prev[selectedDay].day
      }
    }));
    setSearchQuery('');
    showToast(`Swapped active routine with "${preset.focus}" preset!`, 'success');
  };

  const handleAddSet = () => {
    if (!inputWeight || !inputReps || Number(inputWeight) < 0 || Number(inputReps) <= 0) {
      showToast('Please enter valid positive weight and reps', 'error');
      return;
    }

    const exId = activeExercise.id;
    const currentSets = exerciseLogs[exId]?.sets || [];
    const newSetObj = {
      weight: Number(inputWeight),
      reps: Number(inputReps),
      rpe: Number(inputRpe),
      completed: true
    };

    const updatedSets = [...currentSets, newSetObj];
    setExerciseLogs(prev => ({
      ...prev,
      [exId]: { ...prev[exId], sets: updatedSets }
    }));

    showToast(`Logged Set ${updatedSets.length} (RPE ${inputRpe})! Rest timer started.`, 'info');

    // Auto rest countdown timer
    startRestTimer(90);
  };

  const handleToggleSetCompleted = (exId, setIndex) => {
    setExerciseLogs(prev => {
      const sets = [...(prev[exId]?.sets || [])];
      if (sets[setIndex]) {
        sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
      }
      return { ...prev, [exId]: { ...prev[exId], sets } };
    });
  };

  const handleFinishWorkout = async () => {
    if (submittingWorkout || completedWorkout) return;
    setSubmittingWorkout(true);
    const totalSets = Object.values(exerciseLogs).reduce((s, e) => s + (e.sets?.length || 0), 0);
    const totalDuration = Math.max(15, totalSets * 4); // Estimated duration in minutes based on sets completed

    try {
      const result = await apiClient('/activities/log', {
        method: 'POST',
        body: {
          activity_type: 'workout',
          workout: {
            exercise_name: currentRoutine.focus,
            sets: totalSets || 1,
            reps: 10,
            duration_minutes: totalDuration,
            notes: `${currentRoutine.focus} (${selectedDay})`
          }
        }
      });
      applyXpResult(result, `Completed ${currentRoutine.focus}`);
      setCompletedWorkout(true);
    } catch (err) {
      console.warn('Backend workout log exception, applying local completion:', err);
      addXP(100, `Completed ${currentRoutine.focus}`);
      setCompletedWorkout(true);
    } finally {
      setSubmittingWorkout(false);
    }
  };

  const handleStartWorkout = () => {
    if (!activeExercise) {
      showToast('Add or load exercises into the routine first!', 'error');
      return;
    }
    setSessionStarted(true);
    setCompletedWorkout(false);
    setActiveExerciseIndex(0);
    setExerciseLogs({});
    
    setInputWeight(activeExercise.baseWeight.toString());
    setInputReps(activeExercise.targetReps.split('-')[0] || '8');
  };

  // Save changes to exercise under currentDay
  const handleSaveEditExercise = (e) => {
    e.preventDefault();
    if (!editingEx) return;

    const { exercise, index } = editingEx;
    setRoutines(prev => {
      const dayRoutine = prev[selectedDay];
      const updatedExercises = [...dayRoutine.exercises];
      updatedExercises[index] = exercise;
      return {
        ...prev,
        [selectedDay]: { ...dayRoutine, exercises: updatedExercises }
      };
    });

    setEditingEx(null);
    showToast(`Saved changes for exercise "${exercise.name}"!`, 'success');
  };

  // Add custom exercise to current day
  const handleAddCustomExercise = (e) => {
    e.preventDefault();
    if (!customExName) return;

    const newEx = {
      id: Date.now(),
      name: customExName,
      muscleGroup: customExMuscle,
      targetSets: Number(customExSets) || 3,
      targetReps: customExReps || '8-10',
      baseWeight: Number(customExWeight) || 40,
      instructions: customExInstructions || 'Perform movement with proper form and control.',
      steps: ['1. Setup', '2. Descent', '3. Drive', '4. Lockout']
    };

    setRoutines(prev => {
      const dayRoutine = prev[selectedDay];
      setActiveExerciseIndex(dayRoutine.exercises.length);
      return {
        ...prev,
        [selectedDay]: {
          ...dayRoutine,
          exercises: [...dayRoutine.exercises, newEx]
        }
      };
    });

    setShowAddExModal(false);
    setCustomExName('');
    setCustomExWeight('40');
    setCustomExSets('3');
    setCustomExReps('8-10');
    setCustomExInstructions('');
    showToast(`Added custom exercise "${newEx.name}"!`, 'success');
  };

  // Remove exercise from current day routine
  const handleRemoveExercise = (index) => {
    setRoutines(prev => {
      const dayRoutine = prev[selectedDay];
      const updatedExercises = dayRoutine.exercises.filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedDay]: { ...dayRoutine, exercises: updatedExercises }
      };
    });
    setActiveExerciseIndex(0);
    showToast("Exercise removed from routine!", "info");
  };

  // Change weight suggestions on exercise swap
  useEffect(() => {
    if (activeExercise) {
      setInputWeight(activeExercise.baseWeight.toString());
      setInputReps(activeExercise.targetReps.split('-')[0] || '8');
    }
  }, [activeExerciseIndex, selectedDay]);

  const activeSets = exerciseLogs[activeExercise?.id]?.sets || [];
  const userName = profile?.name || 'Utkarsh';

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-white">
      {/* Hello Greeting Header */}
      <div className="flex justify-between items-center bg-[#FFFAF3] dark:bg-quest-dark/30 p-5 rounded-2xl border border-[#FFE5BF]/60 dark:border-white/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2">
            Hello, <span className="text-green-400">{userName}</span> 👋
          </h1>
          <p className="text-lg font-heading text-gray-600 dark:text-gray-300 mt-1">
            Let's <span className="text-green-400 font-extrabold uppercase animate-pulse">crush</span> your workout today!
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#FFF2DB]/50 dark:bg-white/5 border border-[#FFE5BF]/60 dark:border-white/10 flex items-center justify-center text-gray-400">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Week Progress Bar & Metric Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-6 border-t-2 border-t-green-400 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">This Week Progress</span>
            <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-full">
              {completedWorkoutsCount}/{targetWorkouts} Workouts
            </span>
          </div>
          
          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${targetWorkouts}, minmax(0, 1fr))` }}>
            {Array.from({ length: targetWorkouts }).map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2.5 rounded-full ${
                  idx < completedWorkoutsCount 
                    ? 'bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.5)]' 
                    : 'bg-quest-darkest border border-white/10'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-quest-darkest/60 p-3 rounded-xl border border-white/5">
              <Dumbbell className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white">{completedWorkoutsCount}</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase">Workouts</div>
            </div>
            <div className="bg-quest-darkest/60 p-3 rounded-xl border border-white/5">
              <Clock className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white">{durationLabel}</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase">Duration</div>
            </div>
            <div className="bg-quest-darkest/60 p-3 rounded-xl border border-white/5">
              <Flame className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white">{totalCaloriesKcal.toLocaleString()} kcal</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase">Calories</div>
            </div>
          </div>
        </div>

        {/* Neural Rest Timer */}
        <div className="md:col-span-1 glass-card p-6 flex flex-col justify-between items-center text-center relative overflow-hidden border-t-2 border-t-green-400">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Timer className="w-24 h-24" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Neural Rest Timer</span>
            <p className="text-[10px] text-gray-500 mt-0.5">Optimize output by resting between working sets.</p>
          </div>

          <div className="my-4">
            {isTimerActive ? (
              <div className="text-4xl font-heading font-extrabold text-green-400 tracking-wider drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse">
                {timerSeconds}s
              </div>
            ) : (
              <div className="text-3xl font-heading font-bold text-gray-600">00s</div>
            )}
          </div>

          <div className="flex gap-2 w-full">
            {isTimerActive ? (
              <button 
                onClick={() => setIsTimerActive(false)}
                className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Skip Rest
              </button>
            ) : (
              <button 
                onClick={() => startRestTimer(90)}
                className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-black" /> Start 90s Rest
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Screen Panels */}
      {!sessionStarted ? (
        /* Intro Overview / Search & Preset Swapping Screen */
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main selection card */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 border-l-4 border-l-green-400 min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#FFE5BF]/60 dark:border-white/5 pb-3">
                  <div>
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Active Workout Routine</span>
                    <h2 className="text-2xl font-heading font-bold mt-1">{currentRoutine.focus}</h2>
                  </div>
                  {/* Day selector tabs */}
                  <div className="flex bg-[#FFF2DB]/50 dark:bg-quest-darkest p-1 rounded-xl border border-[#FFE5BF]/60 dark:border-white/10 shrink-0 gap-0.5">
                    {DAYS.map(day => {
                      const isToday = getCurrentDayKey() === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            selectedDay === day ? 'bg-green-500 text-black shadow-lg scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-white'
                          }`}
                        >
                          <span>{day}</span>
                          {isToday && (
                            <span className={`text-[8px] font-extrabold px-1 rounded uppercase tracking-tighter ${
                              selectedDay === day ? 'bg-black/20 text-black' : 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                            }`}>
                              Today
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Exercises overview & inline actions */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                    <span>Routine Checklist ({currentRoutine.exercises.length} items)</span>
                    <button 
                      onClick={() => setShowAddExModal(true)}
                      className="text-green-400 hover:text-green-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>
                  </div>
                  
                  {currentRoutine.exercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs border border-dashed border-[#FFE5BF]/60 dark:border-white/5 rounded-xl">
                      No exercises in this routine. Add or search below.
                    </div>
                  ) : (
                    currentRoutine.exercises.map((ex, index) => (
                      <div 
                        key={ex.id} 
                        onClick={() => setActiveExerciseIndex(index)}
                        className={`flex justify-between items-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          activeExerciseIndex === index
                            ? 'bg-green-500/10 border-green-500 text-gray-900 dark:text-white shadow-md'
                            : 'bg-[#FFFAF3] dark:bg-black/30 border-[#FFE5BF]/60 dark:border-white/5 hover:border-green-400/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 dark:text-white">{index + 1}. {ex.name}</span>
                            {activeExerciseIndex === index && (
                              <span className="text-[9px] font-bold text-green-400 bg-green-500/20 px-1.5 py-0.2 rounded border border-green-500/40 uppercase">ACTIVE</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {ex.muscleGroup} • {ex.targetSets} Sets × {ex.targetReps} reps • {ex.baseWeight} kg
                          </span>
                        </div>
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setEditingEx({ exercise: { ...ex }, index })}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit exercise config"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleRemoveExercise(index)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Remove exercise from plan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={handleStartWorkout}
                className="w-full btn-primary bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-95 text-black font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 text-sm mt-6 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" /> Start Live Workout Session
              </button>
            </div>

            {/* Presets Search & Load Section */}
            <div className="glass-card p-6 border-l-4 border-l-quest-secondary space-y-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-white">Load Routine Presets</h3>
                <p className="text-[10px] text-gray-400">Search built-in routines and swap today's session focus.</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-quest-secondary"
                  placeholder="Search presets (e.g. push, pull, squat, Arnold)..."
                />
              </div>

              {/* Search Results list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {filteredPresets.map(preset => (
                  <div key={preset.id} className="bg-quest-darkest/75 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-white">{preset.focus}</div>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>{preset.duration}</span>
                        <span>•</span>
                        <span>{preset.calories}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{preset.primaryMuscles.join(', ')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full py-1.5 bg-white/5 hover:bg-quest-secondary hover:text-black border border-white/10 text-white hover:border-transparent font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                    >
                      Swap & Load Preset
                    </button>
                  </div>
                ))}
                {filteredPresets.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-6 text-xs">
                    No matching presets found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Muscle Focus Outline Column */}
          <div className="md:col-span-1 glass-card p-6 border-l-4 border-l-amber-500">
            <h3 className="font-heading font-bold text-sm text-white mb-2">Muscle Focus Map</h3>
            <p className="text-[10px] text-gray-400 mb-4">Targeted muscles highlighted for {currentRoutine.focus}.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FrontMuscleSVG primary={currentRoutine.primaryMuscles} secondary={currentRoutine.secondaryMuscles} />
                <div className="text-center text-[10px] text-gray-400 mt-2">Front View</div>
              </div>
              <div>
                <BackMuscleSVG primary={currentRoutine.primaryMuscles} secondary={currentRoutine.secondaryMuscles} />
                <div className="text-center text-[10px] text-gray-400 mt-2">Back View</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex gap-4 justify-center text-[10px]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-gray-300">Primary</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-gray-300">Secondary</span>
              </div>
            </div>
          </div>
        </div>
      ) : completedWorkout ? (
        /* Confetti Workout Complete Screen */
        <div className="glass-card p-8 border border-green-500/35 bg-green-500/5 text-center max-w-xl mx-auto space-y-6 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
          <div className="w-16 h-16 bg-green-500 text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div>
            <h2 className="text-2xl font-heading font-bold text-green-400">Workout Completed!</h2>
            <p className="text-gray-300 text-xs mt-1">Excellent training stimulus achieved. Great job today! 💪</p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-black/40 p-4 rounded-xl border border-white/5">
            <div>
              <div className="text-lg font-bold text-white">{currentRoutine.exercises.length}</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase">Exercises</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{currentRoutine.duration}</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase">Duration</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{currentRoutine.calories}</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase">Calories</div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={() => setSessionStarted(false)}
              className="w-full btn-primary bg-green-500 text-black font-extrabold py-3 rounded-xl text-xs hover:bg-green-600 shadow shadow-green-500/25 cursor-pointer"
            >
              Back to Training Hub
            </button>
          </div>
        </div>
      ) : (
        /* Live training workout details page split in 3 Columns */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Column 1: Workout Outline / exercise list */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5 border-t-2 border-t-green-400">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Session Checklist</span>
                <button 
                  onClick={() => setSessionStarted(false)} 
                  className="text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  Quit
                </button>
              </div>

              <div className="space-y-2">
                {currentRoutine.exercises.map((ex, index) => {
                  const loggedSets = exerciseLogs[ex.id]?.sets || [];
                  const isDone = loggedSets.length >= ex.targetSets;

                  return (
                    <button
                      key={ex.id}
                      onClick={() => setActiveExerciseIndex(index)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        activeExerciseIndex === index
                          ? 'bg-green-500/10 border-green-500 text-white'
                          : 'bg-black/30 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-heading font-bold text-xs text-white">{ex.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{ex.muscleGroup} • {ex.targetSets} Sets</div>
                      </div>
                      
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : loggedSets.length > 0 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 border border-white/10 text-white">
                          {loggedSets.length}/{ex.targetSets}
                        </span>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Workout complete save button */}
              <div className="pt-6 border-t border-white/5 mt-4">
                <button 
                  onClick={handleFinishWorkout}
                  disabled={completedWorkout || submittingWorkout}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-extrabold rounded-xl text-xs hover:opacity-95 shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingWorkout ? 'Saving Session...' : 'Complete Live Session'}
                </button>
              </div>
            </div>

            {/* Muscle map preview */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-bold text-white mb-3">Highlighted Muscles</h4>
              <div className="grid grid-cols-2 gap-2">
                <FrontMuscleSVG primary={currentRoutine.primaryMuscles} secondary={currentRoutine.secondaryMuscles} />
                <BackMuscleSVG primary={currentRoutine.primaryMuscles} secondary={currentRoutine.secondaryMuscles} />
              </div>
            </div>
          </div>

          {/* Column 2: Active exercise visual, description, instructions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5 border-t-2 border-t-amber-500 flex flex-col justify-between min-h-[460px]">
              <div>
                {/* Switchable Animation / Info sub-tabs */}
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h3 className="font-heading font-bold text-sm text-white truncate max-w-[150px]">{activeExercise?.name || 'Workout'}</h3>
                  <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                    <button
                      onClick={() => setInfoTab('animation')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        infoTab === 'animation' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Animation
                    </button>
                    <button
                      onClick={() => setInfoTab('info')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        infoTab === 'info' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Instructions
                    </button>
                  </div>
                </div>

                {/* Sub Tab Panel */}
                {infoTab === 'animation' ? (
                  <div className="space-y-4">
                    <WorkoutAnimation exercise={activeExercise} phase={animPhase} />

                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Target Muscle Group:</div>
                      <div className="text-xs text-amber-400 font-bold flex items-center gap-1">
                        ⚡ {activeExercise?.muscleGroup || 'Full Body'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs text-gray-300 leading-relaxed min-h-[190px]">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-400" /> Description & Setup
                    </div>
                    <p>{activeExercise?.instructions || 'Controlled reps focus.'}</p>
                  </div>
                )}
              </div>

              {/* Bottom circular reps tracker dial */}
              <div className="border-t border-white/5 pt-4 mt-4">
                <div className="flex justify-between items-center gap-4 text-center">
                  <div className="flex-1 bg-black/45 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] text-gray-500 font-bold uppercase block">Reps Goal</span>
                    <span className="text-base font-extrabold text-green-400">{activeExercise?.targetReps || '8'}</span>
                  </div>
                  
                  {/* Progress tracker dial */}
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500 transition-all duration-500"
                        strokeWidth="3.5"
                        strokeDasharray={`${Math.min((activeSets.length / (activeExercise?.targetSets || 3)) * 100, 100)}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="text-[10px] font-bold text-white">
                      {activeSets.length}/{activeExercise?.targetSets || 3}
                    </div>
                  </div>

                  <div className="flex-1 bg-black/45 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] text-gray-500 font-bold uppercase block">Base Load</span>
                    <span className="text-base font-extrabold text-green-400">{activeExercise?.baseWeight || '40'} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal card animations list */}
            <div className="glass-card p-5">
              <div className="text-xs font-bold text-white mb-3">Animation Frames</div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {[0, 1, 2, 3, 4].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => setAnimPhase(idx)}
                    className={`p-2 rounded-lg border text-[10px] transition-all cursor-pointer ${
                      animPhase === idx 
                        ? 'bg-amber-500/20 border-amber-500 text-white' 
                        : 'bg-black/40 border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-amber-400">P-{idx+1}</div>
                    <div className="text-[8px] text-gray-500 font-medium truncate mt-0.5">
                      {(() => {
                        const name = activeExercise?.name.toLowerCase() || '';
                        const muscle = activeExercise?.muscleGroup.toLowerCase() || '';
                        if (name.includes('squat') || muscle.includes('quadriceps') || muscle.includes('hamstrings') || name.includes('calf') || name.includes('deadlift')) {
                          return ['Start', 'Lowering', 'Bottom', 'Driving', 'Lockout'][idx];
                        }
                        if (name.includes('bench') || name.includes('press') || muscle.includes('chest') || muscle.includes('shoulders')) {
                          return ['Rack', 'Lowering', 'Bottom', 'Pressing', 'Lockout'][idx];
                        }
                        if (name.includes('row') || name.includes('pulldown') || muscle.includes('back')) {
                          return ['Setup', 'Pulling', 'Peak Hold', 'Release', 'Start'][idx];
                        }
                        if (name.includes('curl') || name.includes('bicep')) {
                          return ['Hanging', 'Curling', 'Squeeze', 'Lowering', 'Start'][idx];
                        }
                        if (name.includes('tricep') || name.includes('extension') || name.includes('pushdown')) {
                          return ['Start', 'Pressing', 'Squeeze', 'Release', 'Ready'][idx];
                        }
                        if (name.includes('sprint') || name.includes('run') || name.includes('cardio') || name.includes('interval') || name.includes('agility')) {
                          return ['Left Leg', 'Stance', 'Right Leg', 'Stance', 'Loop'][idx];
                        }
                        if (name.includes('plank') || name.includes('raise') || name.includes('twist') || muscle.includes('core') || muscle.includes('abs')) {
                          return ['Setup', 'Active', 'Peak', 'Control', 'Rest'][idx];
                        }
                        return ['Inhale', 'Hold', 'Exhale', 'Hold', 'Rest'][idx];
                      })()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Log set inputs & Set list history */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5 border-t-2 border-t-green-400">
              <h3 className="font-heading font-bold text-sm text-white mb-4 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-green-400" /> Active Log Panel
              </h3>

              {/* Logger inputs */}
              <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="input-field py-1 text-center text-sm font-bold text-white cursor-text"
                      placeholder="65"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Reps</label>
                    <input 
                      type="number" 
                      min="0"
                      value={inputReps}
                      onChange={(e) => setInputReps(e.target.value)}
                      className="input-field py-1 text-center text-sm font-bold text-white cursor-text"
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">RPE (1-10)</label>
                    <select
                      value={inputRpe}
                      onChange={(e) => setInputRpe(e.target.value)}
                      className="input-field py-1.5 text-center text-xs font-bold text-quest-gold bg-[#FFFAF3] dark:bg-quest-darkest cursor-pointer"
                    >
                      <option value="10">10 (Max failure)</option>
                      <option value="9.5">9.5</option>
                      <option value="9">9 (1 Rep Reserve)</option>
                      <option value="8.5">8.5</option>
                      <option value="8">8 (2 Rep Reserve)</option>
                      <option value="7.5">7.5</option>
                      <option value="7">7 (3 Rep Reserve)</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleAddSet}
                  className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-lg text-xs transition-all shadow-md shadow-green-500/10 cursor-pointer"
                >
                  + Log Active Set (+40 XP)
                </button>
              </div>

              {/* Set list history logs */}
              <div className="mt-5 space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Logged Sets Checklist</span>
                {activeSets.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs border border-dashed border-white/10 rounded-xl">
                    No sets logged for this exercise yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {activeSets.map((set, sIdx) => (
                      <div 
                        key={sIdx} 
                        className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                          set.completed 
                            ? 'bg-green-500/10 border-green-500/35 text-white' 
                            : 'bg-black/30 border-white/5 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleSetCompleted(activeExercise.id, sIdx)}
                            className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center cursor-pointer shrink-0"
                          >
                            {set.completed && <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>}
                          </button>
                          <span className="text-xs font-bold">Set {sIdx + 1}</span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-mono font-bold text-white">{set.weight} kg</span>
                          <span className="text-gray-500 px-1.5">×</span>
                          <span className="font-mono font-bold text-white">{set.reps} reps</span>
                          <span className="text-[9px] text-quest-gold font-bold ml-2">RPE {set.rpe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {editingEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 relative border-t-2 border-t-green-400 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-400" /> Edit Exercise Config
              </h2>
              <button onClick={() => setEditingEx(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExercise} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Exercise Name *</label>
                <input 
                  type="text" 
                  value={editingEx.exercise.name}
                  onChange={(e) => setEditingEx(prev => ({
                    ...prev,
                    exercise: { ...prev.exercise, name: e.target.value }
                  }))}
                  className="input-field text-xs text-white" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Muscle Group</label>
                  <select 
                    value={editingEx.exercise.muscleGroup}
                    onChange={(e) => setEditingEx(prev => ({
                      ...prev,
                      exercise: { ...prev.exercise, muscleGroup: e.target.value }
                    }))}
                    className="input-field bg-[#FFFAF3] dark:bg-quest-darkest text-xs text-gray-900 dark:text-white"
                  >
                    <option>Chest</option>
                    <option>Back</option>
                    <option>Quadriceps</option>
                    <option>Hamstrings</option>
                    <option>Shoulders</option>
                    <option>Arms</option>
                    <option>Core</option>
                    <option>Calves</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Base Load (kg)</label>
                  <input 
                    type="number" 
                    value={editingEx.exercise.baseWeight}
                    onChange={(e) => setEditingEx(prev => ({
                      ...prev,
                      exercise: { ...prev.exercise, baseWeight: Number(e.target.value) }
                    }))}
                    className="input-field text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Target Sets</label>
                  <input 
                    type="number" 
                    value={editingEx.exercise.targetSets}
                    onChange={(e) => setEditingEx(prev => ({
                      ...prev,
                      exercise: { ...prev.exercise, targetSets: Number(e.target.value) }
                    }))}
                    className="input-field text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Target Reps</label>
                  <input 
                    type="text" 
                    value={editingEx.exercise.targetReps}
                    onChange={(e) => setEditingEx(prev => ({
                      ...prev,
                      exercise: { ...prev.exercise, targetReps: e.target.value }
                    }))}
                    className="input-field text-xs text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Description / Setup Instructions</label>
                <textarea 
                  value={editingEx.exercise.instructions}
                  onChange={(e) => setEditingEx(prev => ({
                    ...prev,
                    exercise: { ...prev.exercise, instructions: e.target.value }
                  }))}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400 text-xs"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 py-2.5 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-lg text-xs transition-all shadow-md shadow-green-500/10 cursor-pointer"
              >
                Save Exercise Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 relative border-t-2 border-t-green-400 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" /> Add Custom Exercise
              </h2>
              <button onClick={() => setShowAddExModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomExercise} className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Exercise Name *</label>
                <input 
                  type="text" 
                  value={customExName}
                  onChange={(e) => handleCustomExNameChange(e.target.value)}
                  onFocus={() => { if (customExName) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="input-field text-xs text-gray-900 dark:text-white" 
                  placeholder="e.g. Incline Dumbbell Fly"
                  required
                  autoComplete="off"
                />
                
                {showSuggestions && exSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-[#FFFAF3] dark:bg-quest-darkest border border-[#FFE5BF] dark:border-white/10 rounded-xl shadow-2xl divide-y divide-[#FFE5BF]/40 dark:divide-white/5">
                    {exSuggestions.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCustomExName(ex.name);
                          setCustomExMuscle(ex.muscleGroup);
                          setCustomExWeight(ex.baseWeight.toString());
                          setCustomExSets(ex.targetSets.toString());
                          setCustomExReps(ex.targetReps);
                          setCustomExInstructions(ex.instructions);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-quest-primary/10 text-xs text-gray-800 dark:text-gray-200 transition-colors flex justify-between items-center cursor-pointer"
                      >
                        <span className="font-bold">{ex.name}</span>
                        <span className="text-[10px] text-quest-primary bg-quest-primary/10 px-2 py-0.5 rounded-full font-bold uppercase">{ex.muscleGroup}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Muscle Group</label>
                  <select 
                    value={customExMuscle}
                    onChange={(e) => setCustomExMuscle(e.target.value)}
                    className="input-field bg-white dark:bg-quest-darkest text-xs text-gray-900 dark:text-white"
                  >
                    <option>Chest</option>
                    <option>Back</option>
                    <option>Quadriceps</option>
                    <option>Hamstrings</option>
                    <option>Shoulders</option>
                    <option>Arms</option>
                    <option>Core</option>
                    <option>Calves</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Starting Load (kg)</label>
                  <input 
                    type="number" 
                    value={customExWeight}
                    onChange={(e) => setCustomExWeight(e.target.value)}
                    className="input-field text-xs text-gray-900 dark:text-white" 
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Sets</label>
                  <input 
                    type="number" 
                    value={customExSets}
                    onChange={(e) => setCustomExSets(e.target.value)}
                    className="input-field text-xs text-gray-900 dark:text-white" 
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Reps Target</label>
                  <input 
                    type="text" 
                    value={customExReps}
                    onChange={(e) => setCustomExReps(e.target.value)}
                    className="input-field text-xs text-gray-900 dark:text-white" 
                    placeholder="8-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Setup / How to perform</label>
                <textarea 
                  value={customExInstructions}
                  onChange={(e) => setCustomExInstructions(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FFFAF3] dark:bg-black/40 border border-[#FFE5BF]/60 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-green-400 text-xs"
                  placeholder="Steps on how to perform the movement safely..."
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 py-2.5 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-lg text-xs transition-all shadow-md shadow-green-500/10 cursor-pointer"
              >
                Create & Add to Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
