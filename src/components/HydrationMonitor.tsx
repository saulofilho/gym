import React, { useState, useMemo } from 'react';
import { 
  Droplets, Droplet, Plus, Trash2, RotateCcw, Check, 
  Target, Sparkles, Award, Clock, Calendar, 
  Zap, Info, ChevronRight, Edit3, Settings2, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkout } from '../context/WorkoutContext';
import { BeverageType, HydrationLogEntry } from '../types';

interface PresetOption {
  label: string;
  amount: number;
  iconText: string;
  description: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  { label: 'Copo Pequeno', amount: 200, iconText: '200ml', description: 'Copo de requeijão / café' },
  { label: 'Copo Padrão', amount: 250, iconText: '250ml', description: 'Copo de vidro tradicional' },
  { label: 'Caneca / Garrafa', amount: 350, iconText: '350ml', description: 'Caneca térmica / garrafinha' },
  { label: 'Squeeze Esportivo', amount: 500, iconText: '500ml', description: 'Garrafa esportiva padrão' },
  { label: 'Shaker / Coqueteleira', amount: 750, iconText: '750ml', description: 'Shaker com suplementação' },
  { label: 'Garrafão / Galão', amount: 1000, iconText: '1000ml', description: '1 Litro integral' }
];

const BEVERAGE_TYPES: { type: BeverageType; label: string; color: string; bg: string; border: string }[] = [
  { type: 'agua', label: 'Água Pura', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { type: 'eletrolitos', label: 'Eletrólitos / Intra', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { type: 'cha', label: 'Chá / Infusão', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { type: 'shake', label: 'Shake Proteico', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { type: 'outro', label: 'Outro Líquido', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
];

export const HydrationMonitor: React.FC = () => {
  const { 
    userProfile, 
    hydrationLogs, 
    addHydrationLog, 
    deleteHydrationLog, 
    clearTodayHydration,
    hydrationDailyTargetMl, 
    setHydrationDailyTargetMl,
    todayHydrationTotalMl,
    todayHydrationLogs,
    workoutHistory,
    cardioLogs
  } = useWorkout();

  // Quick custom intake form state
  const [customAmount, setCustomAmount] = useState<number>(300);
  const [beverageType, setBeverageType] = useState<BeverageType>('agua');
  const [customNote, setCustomNote] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  // Target customization state
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<number>(hydrationDailyTargetMl);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Selected date filter (default today)
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Active date logs and sum
  const activeDateLogs = useMemo(() => {
    return (hydrationLogs || []).filter(l => l.date === selectedDate);
  }, [hydrationLogs, selectedDate]);

  const activeDateTotalMl = useMemo(() => {
    return activeDateLogs.reduce((acc, l) => acc + (l.amountMl || 0), 0);
  }, [activeDateLogs]);

  // Scientific water requirement based on bodyweight and workouts
  const scientificTarget = useMemo(() => {
    const weight = userProfile?.weightKg || 75;
    // 35ml per kg base
    const baseMl = Math.round(weight * 35);
    // Extra 500ml for workout/cardio active days
    const isWorkoutDay = (workoutHistory || []).some(w => w.date === selectedDate) || 
                         (cardioLogs || []).some(c => c.date === selectedDate);
    const workoutBonus = isWorkoutDay ? 500 : 0;
    return {
      baseMl,
      workoutBonus,
      recommendedMl: Math.round((baseMl + workoutBonus) / 100) * 100 // rounded to nearest 100ml
    };
  }, [userProfile?.weightKg, workoutHistory, cardioLogs, selectedDate]);

  // Calculations for today's circular gauge
  const percentage = Math.min(150, Math.round((todayHydrationTotalMl / hydrationDailyTargetMl) * 100));
  const remainingMl = Math.max(0, hydrationDailyTargetMl - todayHydrationTotalMl);
  const isGoalAchieved = todayHydrationTotalMl >= hydrationDailyTargetMl;

  // SVG Circular Gauge calculations
  const size = 240;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  // Progress clamped to 100% for the main stroke
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  // Handlers
  const handleQuickAdd = (amount: number, label: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    addHydrationLog({
      date: todayStr,
      amountMl: amount,
      timestamp: timeStr,
      type: 'agua',
      note: label
    });

    // Check if this addition crosses 100%
    if (todayHydrationTotalMl < hydrationDailyTargetMl && (todayHydrationTotalMl + amount) >= hydrationDailyTargetMl) {
      triggerConfetti();
    }
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount <= 0) return;

    addHydrationLog({
      date: selectedDate,
      amountMl: customAmount,
      timestamp: customTime || '12:00',
      type: beverageType,
      note: customNote.trim() || undefined
    });

    if (selectedDate === todayStr && todayHydrationTotalMl < hydrationDailyTargetMl && (todayHydrationTotalMl + customAmount) >= hydrationDailyTargetMl) {
      triggerConfetti();
    }

    setCustomNote('');
  };

  const triggerConfetti = () => {
    setShowCelebration(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#3B82F6', '#D4FF00', '#10B981']
      });
    } catch (e) {
      console.log(e);
    }
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const handleSaveTarget = () => {
    if (tempTarget >= 1000 && tempTarget <= 10000) {
      setHydrationDailyTargetMl(tempTarget);
      setIsEditingTarget(false);
    }
  };

  const applyRecommendedTarget = () => {
    setHydrationDailyTargetMl(scientificTarget.recommendedMl);
    setTempTarget(scientificTarget.recommendedMl);
    setIsEditingTarget(false);
  };

  // Weekly stats for the last 7 days
  const weeklyStats = useMemo(() => {
    const days: { dateStr: string; label: string; dayNum: number; totalMl: number; isGoalMet: boolean; isToday: boolean }[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const dayLogs = (hydrationLogs || []).filter(l => l.date === dStr);
      const sum = dayLogs.reduce((acc, l) => acc + (l.amountMl || 0), 0);
      
      days.push({
        dateStr: dStr,
        label: dayNames[d.getDay()],
        dayNum: d.getDate(),
        totalMl: sum,
        isGoalMet: sum >= hydrationDailyTargetMl,
        isToday: dStr === todayStr
      });
    }

    const totalWeeklyMl = days.reduce((acc, d) => acc + d.totalMl, 0);
    const avgDailyMl = Math.round(totalWeeklyMl / 7);
    const completedDaysCount = days.filter(d => d.isGoalMet).length;

    return {
      days,
      totalWeeklyMl,
      avgDailyMl,
      completedDaysCount
    };
  }, [hydrationLogs, hydrationDailyTargetMl, todayStr]);

  return (
    <div id="hydration-monitor-container" className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#181818] via-[#141414] to-[#0d141d] border border-[#262626] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-inner">
                <Droplets className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Monitor de Hidratação</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Anabolismo & Performance
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Acompanhamento contínuo da ingestão diária de líquidos e reposição de eletrólitos
                </p>
              </div>
            </div>
          </div>

          {/* Quick Target Settings Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-edit-target"
              onClick={() => {
                setTempTarget(hydrationDailyTargetMl);
                setIsEditingTarget(!isEditingTarget);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#333333] text-xs font-bold text-neutral-200 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Meta: <strong className="font-mono text-cyan-300">{hydrationDailyTargetMl.toLocaleString('pt-BR')} ml</strong></span>
              <Edit3 className="w-3 h-3 text-neutral-500" />
            </button>

            <button
              id="btn-apply-recommended-target"
              onClick={applyRecommendedTarget}
              title={`Sugerido pela ciência do esporte: ${scientificTarget.recommendedMl} ml`}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sugerir ({scientificTarget.recommendedMl} ml)</span>
            </button>
          </div>
        </div>

        {/* Inline Target Editor Modal / Panel */}
        {isEditingTarget && (
          <div className="mt-4 p-4 rounded-xl bg-[#1D1D1D] border border-[#333333] space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                Definir Meta Diária de Água
              </span>
              <button 
                onClick={() => setIsEditingTarget(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[2000, 2500, 3000, 3500, 4000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTempTarget(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    tempTarget === val
                      ? 'bg-cyan-400 text-black shadow-sm'
                      : 'bg-[#252525] text-neutral-300 hover:bg-[#303030] hover:text-white'
                  }`}
                >
                  {val.toLocaleString('pt-BR')} ml
                </button>
              ))}

              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="number"
                  step="50"
                  min="500"
                  max="10000"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-[#282828] border border-[#3F3F3F] text-xs font-mono text-white text-right focus:outline-none focus:border-cyan-400"
                />
                <span className="text-xs text-neutral-400 font-mono">ml</span>
                <button
                  onClick={handleSaveTarget}
                  className="ml-2 px-3 py-1.5 rounded-lg bg-[#D4FF00] hover:bg-[#bce000] text-black text-xs font-bold transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              💡 Recomendação esportiva: 35ml × {userProfile?.weightKg || 75}kg = {scientificTarget.baseMl} ml + 500ml em dias de treino = <strong>{scientificTarget.recommendedMl} ml/dia</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Main Interactive Row: Circular Gauge & Quick Intake Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5 cols on lg): The Circular Gauge Progress Card */}
        <div 
          id="hydration-circular-gauge-card"
          className="lg:col-span-5 p-6 rounded-2xl bg-[#161616] border border-[#242424] flex flex-col justify-between items-center text-center relative overflow-hidden"
        >
          {/* Subtle water droplet ambient background */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#242424] mb-4">
            <div className="flex items-center gap-2 text-left">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Progresso de Hoje
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
              isGoalAchieved 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}>
              {isGoalAchieved ? 'Meta Atingida! 🏆' : `${percentage}% da Meta`}
            </span>
          </div>

          {/* SVG Circular Gauge */}
          <div className="relative my-auto flex items-center justify-center">
            <svg 
              width={size} 
              height={size} 
              viewBox={`0 0 ${size} ${size}`} 
              className="transform -rotate-90 select-none drop-shadow-md"
            >
              <defs>
                {/* Gradient for normal progress */}
                <linearGradient id="hydrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>

                {/* Gradient for achieved state */}
                <linearGradient id="hydrationSuccessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="70%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#D4FF00" />
                </linearGradient>

                {/* Soft glow filter */}
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00E5FF" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Background track circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#202020"
                strokeWidth={strokeWidth}
              />

              {/* Milestone notch marks (25%, 50%, 75%) */}
              {[0.25, 0.5, 0.75].map((fraction, idx) => {
                const angle = fraction * 2 * Math.PI;
                const markRadiusInner = radius - strokeWidth / 2 - 2;
                const markRadiusOuter = radius + strokeWidth / 2 + 2;
                const x1 = center + markRadiusInner * Math.cos(angle);
                const y1 = center + markRadiusInner * Math.sin(angle);
                const x2 = center + markRadiusOuter * Math.cos(angle);
                const y2 = center + markRadiusOuter * Math.sin(angle);
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#2D2D2D"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Dynamic Animated Progress Circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={isGoalAchieved ? "url(#hydrationSuccessGradient)" : "url(#hydrationGradient)"}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter={percentage > 0 ? "url(#cyanGlow)" : undefined}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Content Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-1 animate-pulse">
                <Droplet className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              </div>
              
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {percentage}%
              </div>

              <div className="text-xs font-bold text-neutral-300 font-mono mt-0.5">
                {todayHydrationTotalMl.toLocaleString('pt-BR')} <span className="text-neutral-500 font-normal">/</span> {hydrationDailyTargetMl.toLocaleString('pt-BR')} ml
              </div>

              <div className="text-[11px] text-cyan-400/90 font-medium mt-1">
                {isGoalAchieved ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> +{(todayHydrationTotalMl - hydrationDailyTargetMl).toLocaleString('pt-BR')} ml extras
                  </span>
                ) : (
                  <span>Faltam {remainingMl.toLocaleString('pt-BR')} ml</span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Status Insight */}
          <div className="w-full mt-4 p-3 rounded-xl bg-[#1A1A1A] border border-[#292929] text-xs text-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-neutral-400 text-[10px] block">Último copo registrado:</span>
                <span className="font-mono font-bold text-white text-xs">
                  {todayHydrationLogs.length > 0 ? todayHydrationLogs[0].timestamp : '--:--'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-neutral-400 text-[10px] block">Total de registros:</span>
              <span className="font-mono font-bold text-cyan-300 text-xs">
                {todayHydrationLogs.length} doses
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols on lg): Quick Add Presets & Custom Logging */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Preset Intake Buttons */}
          <div 
            id="hydration-presets-card"
            className="p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Registro Rápido em 1 Clique
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400">
                Adiciona instantaneamente ao dia de hoje
              </span>
            </div>

            {/* Grid of Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_OPTIONS.map((preset) => (
                <button
                  key={preset.amount}
                  id={`btn-quick-add-${preset.amount}`}
                  onClick={() => handleQuickAdd(preset.amount, preset.label)}
                  className="group p-3 rounded-xl bg-[#1C1C1C] hover:bg-[#242424] border border-[#2C2C2C] hover:border-cyan-500/40 text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                      <Droplet className="w-3.5 h-3.5 fill-cyan-400/70" />
                    </div>
                    <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      +{preset.amount} ml
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {preset.label}
                    </h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Ingestion Form */}
          <div 
            id="hydration-custom-form-card"
            className="p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4FF00]" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Registro Personalizado & Tipo de Líquido
                </h3>
              </div>
            </div>

            <form onSubmit={handleCustomAdd} className="space-y-3.5">
              {/* Beverage Type Selection Chips */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium block">
                  Tipo de Bebida:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BEVERAGE_TYPES.map(bev => (
                    <button
                      key={bev.type}
                      type="button"
                      id={`bev-type-${bev.type}`}
                      onClick={() => setBeverageType(bev.type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        beverageType === bev.type
                          ? `${bev.bg} ${bev.border} ${bev.color} shadow-sm ring-1 ring-cyan-400/40`
                          : 'bg-[#1F1F1F] border-[#2A2A2A] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {bev.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume (ml), Time & Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Volume Input with quick step */}
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="text-xs text-neutral-400 font-medium block">
                    Volume em Mililitros (ml):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomAmount(prev => Math.max(50, prev - 50))}
                      className="w-9 h-9 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-neutral-300 font-bold text-sm flex items-center justify-center border border-[#303030]"
                    >
                      -50
                    </button>

                    <div className="relative flex-1">
                      <input
                        id="input-custom-water-ml"
                        type="number"
                        step="10"
                        min="20"
                        max="5000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-lg bg-[#1F1F1F] border border-[#333333] text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400 text-center"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 pointer-events-none">
                        ml
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCustomAmount(prev => prev + 50)}
                      className="w-9 h-9 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-neutral-300 font-bold text-sm flex items-center justify-center border border-[#303030]"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAmount(prev => prev + 100)}
                      className="w-9 h-9 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-neutral-300 font-bold text-sm flex items-center justify-center border border-[#303030]"
                    >
                      +100
                    </button>
                  </div>
                </div>

                {/* Time picker */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs text-neutral-400 font-medium block">
                    Horário:
                  </label>
                  <input
                    id="input-custom-water-time"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1F1F1F] border border-[#333333] text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400 text-center"
                    required
                  />
                </div>
              </div>

              {/* Optional Note & Submit Button */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs text-neutral-400 font-medium block">
                    Observação Opcional:
                  </label>
                  <input
                    id="input-custom-water-note"
                    type="text"
                    placeholder="Ex: Água gelada com Creatina 5g, pós-treino..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1F1F1F] border border-[#333333] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-4">
                  <button
                    id="btn-submit-hydration-log"
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar {customAmount} ml</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 7-Day Consistency Bar Chart & Today's Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Consistency Bar Chart (7 cols on lg) */}
        <div 
          id="hydration-weekly-chart-card"
          className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242424] pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Consistência Semanal (Últimos 7 Dias)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Acompanhe se a ingestão hídrica atingiu a meta estipulada em cada dia
              </p>
            </div>

            {/* Weekly summary stats pills */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-[#202020] border border-[#303030] text-xs">
                <span className="text-neutral-400">Média:</span>{' '}
                <strong className="text-cyan-300 font-mono">{weeklyStats.avgDailyMl.toLocaleString('pt-BR')} ml</strong>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold">
                {weeklyStats.completedDaysCount} / 7 metas
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-2 pt-2">
            <div className="flex items-end justify-between gap-2 h-44 px-2 pt-4">
              {weeklyStats.days.map((d) => {
                const dayHeightPercent = Math.min(100, Math.max(10, Math.round((d.totalMl / (hydrationDailyTargetMl * 1.2)) * 100)));
                const isSelected = d.dateStr === selectedDate;

                return (
                  <div 
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                    title={`${d.label} (${d.dayNum}): ${d.totalMl.toLocaleString('pt-BR')} ml`}
                  >
                    {/* Volume tooltip on hover */}
                    <span className="text-[10px] font-mono font-bold text-neutral-400 group-hover:text-cyan-300 opacity-80 group-hover:opacity-100 transition-opacity">
                      {(d.totalMl / 1000).toFixed(1)}L
                    </span>

                    {/* Bar graphic */}
                    <div className="w-full max-w-[42px] bg-[#222222] rounded-t-lg h-full flex items-end p-0.5 border border-[#2D2D2D] group-hover:border-cyan-500/40 transition-colors">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          d.isGoalMet 
                            ? 'bg-gradient-to-t from-emerald-600 to-cyan-400' 
                            : d.totalMl >= hydrationDailyTargetMl * 0.7 
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' 
                            : 'bg-gradient-to-t from-amber-600 to-amber-400'
                        } ${isSelected ? 'ring-2 ring-white' : ''}`}
                        style={{ height: `${dayHeightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-[11px] font-bold ${
                      d.isToday 
                        ? 'text-cyan-400 font-extrabold' 
                        : isSelected 
                        ? 'text-white' 
                        : 'text-neutral-400'
                    }`}>
                      {d.label}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">
                      {d.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Target indicator reference line */}
            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[#222222]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Meta diária configurada: <strong className="font-mono text-neutral-300">{hydrationDailyTargetMl.toLocaleString('pt-BR')} ml</strong>
              </span>
              <span>* Clique no dia para visualizar os registros</span>
            </div>
          </div>
        </div>

        {/* Selected Date Timeline / Intake Logs (5 cols on lg) */}
        <div 
          id="hydration-timeline-card"
          className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#242424] pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Registros de {selectedDate === todayStr ? 'Hoje' : selectedDate}</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Total registrado: <strong className="font-mono text-cyan-300">{activeDateTotalMl.toLocaleString('pt-BR')} ml</strong>
              </p>
            </div>

            {selectedDate === todayStr && todayHydrationLogs.length > 0 && (
              <button
                id="btn-clear-today-hydration"
                onClick={() => {
                  if (window.confirm('Deseja limpar todos os registros de água de hoje?')) {
                    clearTodayHydration();
                  }
                }}
                className="text-[11px] text-neutral-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                title="Limpar registros do dia"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar dia</span>
              </button>
            )}
          </div>

          {/* List of intake logs */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {activeDateLogs.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 space-y-2">
                <Droplet className="w-8 h-8 text-neutral-600 mx-auto stroke-1" />
                <p className="text-xs">Nenhum registro para esta data.</p>
                <p className="text-[11px] text-neutral-600">Use os botões de registro rápido para adicionar copos de água!</p>
              </div>
            ) : (
              activeDateLogs.map((log) => {
                const bevConfig = BEVERAGE_TYPES.find(b => b.type === (log.type || 'agua')) || BEVERAGE_TYPES[0];
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#1C1C1C] border border-[#272727] flex items-center justify-between gap-3 group hover:border-[#383838] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bevConfig.bg} ${bevConfig.color} border ${bevConfig.border}`}>
                        <Droplet className="w-4 h-4 fill-current opacity-80" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white font-mono">
                            {log.amountMl} ml
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${bevConfig.bg} ${bevConfig.color} ${bevConfig.border}`}>
                            {bevConfig.label}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-[11px] text-neutral-400 truncate">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-neutral-400">
                        {log.timestamp}
                      </span>
                      <button
                        onClick={() => deleteHydrationLog(log.id)}
                        className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-60 group-hover:opacity-100"
                        title="Remover registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Scientific Insights: Por que Hidratação é Crítica na Musculação */}
      <div 
        id="hydration-science-card"
        className="p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-[#242424] pb-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Ciência Aplicada: O Papel da Água na Hipertrofia & Força
            </h3>
            <p className="text-xs text-neutral-400">
              Evidências fisiológicas que comprovam por que a desidratação destrói seus ganhos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-1">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              1. Volumização Celular
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              O tecido muscular esquelético é composto por aproximadamente <strong>75% de água</strong>. Uma célula hidratada ativa cascatas anabólicas (mTOR) e minimiza a quebra de aminoácidos.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              2. Queda de Força Máxima
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Estudos apontam que um déficit de apenas <strong>2% no peso corporal em água</strong> causa uma queda de até <strong>15% na força de 1RM</strong> e reduz significativamente as repetições até a falha.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-1">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              3. Eficácia da Creatina
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              A creatina atua puxando moléculas de água para dentro do miócito. Sem ingestão hídrica proporcional, o efeito de retenção intracelular e ressíntese de ATP é severamente limitado.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-1">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              4. Lubrificação Articular
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              O líquido sinovial que protege suas articulações em agachamentos e supinos pesados depende diretamente de osmolaridade plasmática equilibrada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
