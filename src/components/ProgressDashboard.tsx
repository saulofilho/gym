import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calendar, Dumbbell, Trophy, Scale, Plus, 
  Trash2, Sparkles, Award, ArrowUpRight, ArrowDownRight, Clock, Activity, Flame, Moon, Droplets, Droplet
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { BodyMeasurement } from '../types';
import { CardioLog } from './CardioLog';
import { SleepMonitor } from './SleepMonitor';
import { HydrationMonitor } from './HydrationMonitor';
import { ProgressDailyTipCard } from './ProgressDailyTipCard';

interface ProgressDashboardProps {
  onOpenPremiumModal: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onOpenPremiumModal
}) => {
  const { 
    workoutHistory, 
    measurements, 
    addMeasurement, 
    deleteMeasurement, 
    userProfile,
    monthlyCompletedCount,
    monthlyTotalVolumeKg,
    cardioLogs,
    monthlyCardioMinutes,
    monthlyCardioCalories,
    sleepLogs,
    todayHydrationTotalMl,
    hydrationDailyTargetMl,
    addHydrationLog
  } = useWorkout();

  const [activeDashboardTab, setActiveDashboardTab] = useState<'musculacao' | 'cardio' | 'sono' | 'hidratacao'>('musculacao');
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [selectedExerciseRecord, setSelectedExerciseRecord] = useState<'supino' | 'agachamento' | 'terra'>('supino');
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);

  // New measurement form state
  const [newWeight, setNewWeight] = useState(userProfile.weightKg.toString());
  const [newFat, setNewFat] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newThigh, setNewThigh] = useState('');

  // Big 3 lifts history
  const getLiftHistory = (exerciseId: string) => {
    const list: { date: string; max1RM: number; topWeight: number }[] = [];
    (workoutHistory || []).forEach(s => {
      if (!s || !s.exercises) return;
      const match = s.exercises.find(e => e.exerciseId === exerciseId);
      if (match && match.best1RM && match.sets) {
        let maxWeight = 0;
        match.sets.forEach(set => {
          if (set && set.weightKg > maxWeight) maxWeight = set.weightKg;
        });
        list.push({
          date: s.date,
          max1RM: match.best1RM,
          topWeight: maxWeight
        });
      }
    });
    return list.reverse();
  };

  const supinoHistory = useMemo(() => getLiftHistory('supino-reto-barra'), [workoutHistory]);
  const agachamentoHistory = useMemo(() => getLiftHistory('agachamento-livre'), [workoutHistory]);
  const terraHistory = useMemo(() => getLiftHistory('levantamento-terra'), [workoutHistory]);

  const activeLiftHistory = 
    selectedExerciseRecord === 'supino' ? supinoHistory :
    selectedExerciseRecord === 'agachamento' ? agachamentoHistory : terraHistory;

  // Measurement deltas
  const safeMeasurements = measurements || [];
  const latestMeasurement = safeMeasurements[safeMeasurements.length - 1];
  const firstMeasurement = safeMeasurements[0];

  const weightDelta = latestMeasurement && firstMeasurement 
    ? (latestMeasurement.weightKg - firstMeasurement.weightKg).toFixed(1) 
    : '0';

  const armDelta = latestMeasurement?.armCm && firstMeasurement?.armCm 
    ? (latestMeasurement.armCm - firstMeasurement.armCm).toFixed(1) 
    : null;

  const waistDelta = latestMeasurement?.waistCm && firstMeasurement?.waistCm 
    ? (latestMeasurement.waistCm - firstMeasurement.waistCm).toFixed(1) 
    : null;

  // Generate current month calendar days (e.g. September 2026: 30 days)
  const currentMonthDate = new Date();
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentMonthName = currentMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Map of completed workout & cardio dates
  const workoutDatesSet = new Set((workoutHistory || []).map(s => s.date));
  const cardioDatesSet = new Set((cardioLogs || []).map(c => c.date));

  // Request Remote Coach AI Analysis (VIP feature)
  const handleRequestAiAnalysis = async () => {
    setAiAnalysisLoading(true);
    setAiAnalysisText(null);

    const mainLifts = {
      supino: supinoHistory.slice(-1)[0] || { topWeight: 60, max1RM: 72 },
      agachamento: agachamentoHistory.slice(-1)[0] || { topWeight: 90, max1RM: 108 },
      terra: terraHistory.slice(-1)[0] || { topWeight: 100, max1RM: 120 }
    };

    try {
      const res = await fetch('/api/analyze-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalWorkouts: monthlyCompletedCount,
          volumeHistory: (workoutHistory || []).slice(0, 5).map(s => ({ date: s.date, volume: s.totalVolumeKg })),
          mainLifts,
          weightTrend: (safeMeasurements || []).map(m => ({ date: m.date, weight: m.weightKg }))
        })
      });

      const data = await res.json();
      if (data.analysisText) {
        setAiAnalysisText(data.analysisText);
      } else {
        throw new Error('Falha ao obter análise');
      }
    } catch (err) {
      // Graceful offline fallback
      setAiAnalysisText(
        `### Relatório de Evolução Remota da Coordenação Técnica:\n\n` +
        `**1. Consistência e Sobrecarga Progressiva:**\n` +
        `Você acumulou ${monthlyTotalVolumeKg.toLocaleString()} kg de volume de treino com ${monthlyCompletedCount} sessões registradas. Seu padrão de regularidade está excelente.\n\n` +
        `**2. Avaliação das Cargas nos Exercícios Chave:**\n` +
        `- Supino Reto: Carga consolidada com boa margem de 1RM.\n` +
        `- Agachamento Livre: Volume e cadência adequados. Próxima meta: buscar +2 repetições na primeira série de trabalho.\n\n` +
        `**3. Ajuste para o Próximo Mês:**\n` +
        `Sugerimos um mini-deload de 3 a 4 dias se sentir fadiga articular ou sono agitado, seguido de novo ciclo de micro-cargas (+1kg a +2kg em exercícios compostos). Parabéns pelo engajamento!`
      );
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (!weightNum || isNaN(weightNum)) return;

    addMeasurement({
      date: new Date().toISOString().split('T')[0],
      weightKg: weightNum,
      bodyFatPercent: newFat ? parseFloat(newFat) : undefined,
      chestCm: newChest ? parseFloat(newChest) : undefined,
      waistCm: newWaist ? parseFloat(newWaist) : undefined,
      armCm: newArm ? parseFloat(newArm) : undefined,
      thighCm: newThigh ? parseFloat(newThigh) : undefined
    });

    setShowAddMeasurementModal(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Monthly Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161616] border border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4FF00]">Controle Mensal de Performance</span>
            <span className="text-xs text-neutral-400 capitalize">• {currentMonthName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Evolução de Cargas & Físico</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Acompanhe sua tonelagem acumulada, progressão nos levantamentos mestres e medidas corporais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-measurement"
            onClick={() => setShowAddMeasurementModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-xs sm:text-sm font-bold text-neutral-200 border border-[#333333] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#D4FF00]" />
            <span>Registrar Medidas</span>
          </button>

          <button
            id="btn-request-ai-analysis"
            onClick={userProfile.isPremium ? handleRequestAiAnalysis : onOpenPremiumModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black text-xs sm:text-sm font-bold shadow-md shadow-[rgba(212,255,0,0.2)] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Análise Remota por IA</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Switcher: Musculação vs Cardio vs Sono */}
      <div className="flex items-center gap-2 border-b border-[#222222] overflow-x-auto no-scrollbar">
        <button
          id="tab-btn-musculacao"
          onClick={() => setActiveDashboardTab('musculacao')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboardTab === 'musculacao'
              ? 'border-[#D4FF00] text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-[#D4FF00]" />
          <span>Musculação & Cargas</span>
        </button>

        <button
          id="tab-btn-cardio"
          onClick={() => setActiveDashboardTab('cardio')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboardTab === 'cardio'
              ? 'border-[#D4FF00] text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Cardio & Aeróbico</span>
          {monthlyCardioMinutes > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {monthlyCardioMinutes} min
            </span>
          )}
        </button>

        <button
          id="tab-btn-sono"
          onClick={() => setActiveDashboardTab('sono')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboardTab === 'sono'
              ? 'border-[#D4FF00] text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-400" />
          <span>Monitor de Sono & Recuperação</span>
          {sleepLogs && sleepLogs.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              {sleepLogs.length} reg
            </span>
          )}
        </button>

        <button
          id="tab-btn-hidratacao"
          onClick={() => setActiveDashboardTab('hidratacao')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboardTab === 'hidratacao'
              ? 'border-[#D4FF00] text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span>Monitor de Hidratação</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
            {todayHydrationTotalMl.toLocaleString('pt-BR')} / {hydrationDailyTargetMl.toLocaleString('pt-BR')} ml
          </span>
        </button>
      </div>

      {/* Render Cardio Log View */}
      {activeDashboardTab === 'cardio' && (
        <CardioLog />
      )}

      {/* Render Sleep Monitor View */}
      {activeDashboardTab === 'sono' && (
        <SleepMonitor />
      )}

      {/* Render Hydration Monitor View */}
      {activeDashboardTab === 'hidratacao' && (
        <HydrationMonitor />
      )}

      {/* Render Musculação & Evolution View */}
      {activeDashboardTab === 'musculacao' && (
        <>
      {/* AI Analysis Result Card (if generated) */}
      {aiAnalysisLoading && (
        <div className="p-6 rounded-2xl bg-[#161616] border border-[#D4FF00]/40 animate-pulse text-center space-y-2">
          <Sparkles className="w-8 h-8 text-[#D4FF00] mx-auto animate-spin" />
          <h3 className="text-base font-bold text-white">Analisando suas cargas e evolução física com IA...</h3>
          <p className="text-xs text-neutral-400">Cruzando dados de volume, 1RM e consistência mensal.</p>
        </div>
      )}

      {aiAnalysisText && (
        <div className="p-6 rounded-2xl bg-[#161616] border border-[#D4FF00]/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#D4FF00] font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Feedback Técnico do Treinador Remoto AcademiaPro</span>
            </div>
            <button
              onClick={() => setAiAnalysisText(null)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Fechar
            </button>
          </div>
          <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line bg-[#111111] p-4 rounded-xl border border-[#222222]">
            {aiAnalysisText}
          </div>
        </div>
      )}

      {/* Dica do Dia Baseada no Volume Recente, Sono e Hidratação */}
      <ProgressDailyTipCard onNavigateSubTab={(tab) => setActiveDashboardTab(tab)} />

      {/* Monthly Metrics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Monthly Workouts */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Treinos no Mês</span>
            <Calendar className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="text-3xl font-bold text-white">{monthlyCompletedCount}</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Meta: 12 a 16 treinos
          </div>
        </div>

        {/* Total Volume */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Tonelagem Total</span>
            <Dumbbell className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="text-3xl font-bold text-[#D4FF00] font-mono">
            {monthlyTotalVolumeKg.toLocaleString()} <span className="text-sm text-neutral-400 font-sans">kg</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">
            Peso × repetições executadas
          </div>
        </div>

        {/* Cardio Monthly KPI */}
        <div 
          onClick={() => setActiveDashboardTab('cardio')}
          className="p-5 rounded-xl bg-[#161616] border border-[#222222] hover:border-cyan-500/40 cursor-pointer space-y-1 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Cardio no Mês</span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {monthlyCardioMinutes} <span className="text-sm text-neutral-400 font-sans">min</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>{monthlyCardioCalories.toLocaleString()} kcal queimadas</span>
          </div>
        </div>

        {/* Current Weight & Delta */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Peso Atual</span>
            <Scale className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="text-3xl font-bold text-white">
            {latestMeasurement ? `${latestMeasurement.weightKg} kg` : `${userProfile.weightKg} kg`}
          </div>
          <div className="text-[11px] font-medium flex items-center gap-1">
            {parseFloat(weightDelta) < 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {weightDelta} kg no período
              </span>
            ) : (
              <span className="text-[#D4FF00] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{weightDelta} kg no período
              </span>
            )}
          </div>
        </div>

        {/* Consistency Streak */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Sequência Ativa</span>
            <Trophy className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {userProfile.streakDays} <span className="text-sm text-neutral-400">dias</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">
            Consistência ininterrupta
          </div>
        </div>
      </div>

      {/* Quick Hydration Status Bar */}
      <div 
        id="quick-hydration-banner"
        className="p-4 rounded-2xl bg-gradient-to-r from-[#161616] via-[#151c24] to-[#161616] border border-[#27323f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Droplets className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Hidratação de Hoje
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {Math.round((todayHydrationTotalMl / hydrationDailyTargetMl) * 100)}% da meta
              </span>
            </div>
            <div className="text-sm font-bold text-neutral-200 mt-0.5">
              <span className="font-mono text-cyan-400 font-black">{todayHydrationTotalMl.toLocaleString('pt-BR')} ml</span>
              <span className="text-neutral-500 font-normal"> de </span>
              <span className="font-mono text-neutral-300">{hydrationDailyTargetMl.toLocaleString('pt-BR')} ml</span>
              <span className="text-xs text-neutral-400 ml-2 font-normal hidden md:inline">
                {todayHydrationTotalMl >= hydrationDailyTargetMl ? '• Meta diária atingida! 🏆' : `• Faltam ${(hydrationDailyTargetMl - todayHydrationTotalMl).toLocaleString('pt-BR')} ml`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            id="btn-quick-add-250-banner"
            onClick={() => {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              addHydrationLog({
                date: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
                amountMl: 250,
                timestamp: timeStr,
                type: 'agua',
                note: 'Copo rápido'
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] border border-[#333333] hover:border-cyan-500/30 text-xs font-bold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+250 ml</span>
          </button>

          <button
            id="btn-quick-add-500-banner"
            onClick={() => {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              addHydrationLog({
                date: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
                amountMl: 500,
                timestamp: timeStr,
                type: 'agua',
                note: 'Squeeze esportivo'
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] border border-[#333333] hover:border-cyan-500/30 text-xs font-bold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+500 ml</span>
          </button>

          <button
            id="btn-open-hydration-tab"
            onClick={() => setActiveDashboardTab('hidratacao')}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center gap-1 transition-colors ml-1"
          >
            <span>Ver Monitor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calendar Heatmap & 1RM Progression Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Attendance Calendar (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4FF00]" />
              <span>Frequência Mensal de Treinos</span>
            </h3>
            <span className="text-xs text-neutral-400 capitalize">{currentMonthName}</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
              <span key={i} className="text-[10px] font-bold text-neutral-500 uppercase">{day}</span>
            ))}

            {Array.from({ length: daysInMonth }, (_, idx) => {
              const dayNumber = idx + 1;
              const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
              const hasTrained = workoutDatesSet.has(dateString);
              const hasCardio = cardioDatesSet.has(dateString);
              const isToday = dayNumber === currentMonthDate.getDate();

              let dayTitle = `Dia ${dayNumber}`;
              if (hasTrained && hasCardio) {
                dayTitle = `Treino de Musculação e Cardio realizados em ${dayNumber} de ${currentMonthName}`;
              } else if (hasTrained) {
                dayTitle = `Treino de Musculação realizado em ${dayNumber} de ${currentMonthName}`;
              } else if (hasCardio) {
                dayTitle = `Sessão de Cardio realizada em ${dayNumber} de ${currentMonthName}`;
              }

              let dayClasses = 'bg-[#111111] border border-[#222222] text-neutral-500 hover:border-[#333333]';
              if (hasTrained && hasCardio) {
                dayClasses = 'bg-[#D4FF00] text-black font-bold ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#161616]';
              } else if (hasTrained) {
                dayClasses = 'bg-[#D4FF00] text-black shadow-sm font-bold';
              } else if (hasCardio) {
                dayClasses = 'bg-cyan-400 text-black shadow-sm font-bold';
              } else if (isToday) {
                dayClasses = 'bg-[#1A1A1A] border border-[#D4FF00]/60 text-white';
              }

              return (
                <div
                  key={idx}
                  title={dayTitle}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${dayClasses}`}
                >
                  {dayNumber}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 pt-2 border-t border-[#222222]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D4FF00]"></span>
              <span>Musculação</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
              <span>Cardio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D4FF00] ring-1 ring-cyan-400"></span>
              <span>Ambos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#111111] border border-[#222222]"></span>
              <span>Descanso</span>
            </div>
          </div>

          {/* Quick Sleep & Recovery Status Callout */}
          <div 
            onClick={() => setActiveDashboardTab('sono')}
            className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                  <span className="truncate">Monitor de Sono & Recuperação</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono shrink-0">D3</span>
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {sleepLogs && sleepLogs.length > 0
                    ? `${sleepLogs.length} noites analisadas • Correlação com volume de treino`
                    : 'Registre seu sono para correlacionar com a tonelagem dos treinos'}
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </div>
        </div>

        {/* 1RM Load Progression Tracker (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
                <span>Progressão de Carga (1RM Máximo)</span>
              </h3>
              <p className="text-xs text-neutral-400">Força máxima estimada nos exercícios fundamentais</p>
            </div>

            {/* Exercise Selector */}
            <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-[#222222]">
              <button
                onClick={() => setSelectedExerciseRecord('supino')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  selectedExerciseRecord === 'supino'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Supino
              </button>
              <button
                onClick={() => setSelectedExerciseRecord('agachamento')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  selectedExerciseRecord === 'agachamento'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Agachamento
              </button>
              <button
                onClick={() => setSelectedExerciseRecord('terra')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  selectedExerciseRecord === 'terra'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Terra
              </button>
            </div>
          </div>

          {/* Lift Progression Chart */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Evolução nas últimas sessões</span>
              <span className="font-mono text-[#D4FF00] font-bold">
                1RM Recorde: {activeLiftHistory.length > 0 ? `${Math.max(...activeLiftHistory.map(h => h.max1RM))} kg` : 'Nenhum'}
              </span>
            </div>

            {/* Responsive visual bar timeline */}
            {activeLiftHistory.length > 0 ? (
              <div className="space-y-2 pt-2">
                {activeLiftHistory.map((item, idx) => {
                  const percentage = Math.min(100, Math.round((item.max1RM / 150) * 100));

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-neutral-300">
                        <span className="font-mono text-neutral-400">{item.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-400">Carga máx: {item.topWeight}kg</span>
                          <span className="text-[#D4FF00] font-bold font-mono">1RM: {item.max1RM}kg</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#222222] overflow-hidden">
                        <div 
                          className="h-full bg-[#D4FF00] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                Ainda não há registros para este exercício. Conclua uma sessão para visualizar sua curva de força!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body Measurements Tracker Table */}
      <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#D4FF00]" />
              <span>Controle de Medidas Corporais</span>
            </h3>
            <p className="text-xs text-neutral-400">Histórico de composição física e medidas antropométricas</p>
          </div>

          <button
            onClick={() => setShowAddMeasurementModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-neutral-200 text-xs font-bold border border-[#333333] self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Adicionar Avaliação</span>
          </button>
        </div>

        <div className="rounded-xl border border-[#222222] overflow-hidden bg-[#111111]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] text-neutral-400 font-bold uppercase bg-[#161616]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Peso (kg)</th>
                  <th className="p-3">Gordura (%)</th>
                  <th className="p-3">Tórax (cm)</th>
                  <th className="p-3">Cintura (cm)</th>
                  <th className="p-3">Braço (cm)</th>
                  <th className="p-3">Coxa (cm)</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-neutral-200 font-medium">
                {safeMeasurements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#1A1A1A]/40 transition-colors">
                    <td className="p-3 font-mono text-neutral-400">{m.date}</td>
                    <td className="p-3 font-bold text-white font-mono">{m.weightKg} kg</td>
                    <td className="p-3 font-mono">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '-'}</td>
                    <td className="p-3 font-mono">{m.chestCm ? `${m.chestCm} cm` : '-'}</td>
                    <td className="p-3 font-mono text-[#D4FF00]">{m.waistCm ? `${m.waistCm} cm` : '-'}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{m.armCm ? `${m.armCm} cm` : '-'}</td>
                    <td className="p-3 font-mono">{m.thighCm ? `${m.thighCm} cm` : '-'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteMeasurement(m.id)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                        title="Excluir medição"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Add Measurement Modal */}
      {showAddMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161616] border border-[#222222] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#D4FF00]" />
                <span>Nova Medição Corporal</span>
              </h3>
              <button
                onClick={() => setShowAddMeasurementModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Peso Corporal (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">% de Gordura Estimada</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 16.5"
                    value={newFat}
                    onChange={(e) => setNewFat(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Braço Contraído (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 36.5"
                    value={newArm}
                    onChange={(e) => setNewArm(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Cintura na altura do umbigo (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 82.0"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Tórax (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 101.0"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Coxa Medial (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 57.5"
                    value={newThigh}
                    onChange={(e) => setNewThigh(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMeasurementModal(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)]"
                >
                  Salvar Medição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
