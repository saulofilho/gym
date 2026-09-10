import React, { useState } from 'react';
import { 
  Target, Flame, Calendar, Dumbbell, Trophy, Edit3, 
  CheckCircle2, Plus, Minus, X, Check, Activity, Zap, 
  ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutGoals } from '../types';

interface DailyWorkoutGoalsProps {
  onStartSuggestedWorkout?: () => void;
  onNavigateToTab?: (tab: 'treinos' | 'progresso' | 'nutricao' | 'chat' | 'vip') => void;
}

export const DailyWorkoutGoals: React.FC<DailyWorkoutGoalsProps> = ({
  onStartSuggestedWorkout,
  onNavigateToTab
}) => {
  const {
    workoutGoals,
    updateWorkoutGoals,
    todayTotalVolumeKg,
    todayCompletedVolumeKg,
    activeWorkoutCurrentVolumeKg,
    activeWorkout,
    thisWeekWorkoutsCount,
    thisWeekDaysStatus,
    thisWeekCardioMinutes
  } = useWorkout();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGoals, setEditGoals] = useState<WorkoutGoals>({
    dailyVolumeTargetKg: workoutGoals.dailyVolumeTargetKg,
    weeklyFrequencyTargetDays: workoutGoals.weeklyFrequencyTargetDays,
    weeklyCardioTargetMinutes: workoutGoals.weeklyCardioTargetMinutes || 60
  });
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Volume calculations
  const dailyTarget = workoutGoals.dailyVolumeTargetKg || 8000;
  const volumePercent = Math.round((todayTotalVolumeKg / dailyTarget) * 100);
  const isVolumeGoalCompleted = todayTotalVolumeKg >= dailyTarget;
  const remainingVolumeKg = Math.max(0, dailyTarget - todayTotalVolumeKg);

  // Weekly frequency calculations
  const weeklyTarget = workoutGoals.weeklyFrequencyTargetDays || 4;
  const frequencyPercent = Math.round((thisWeekWorkoutsCount / weeklyTarget) * 100);
  const isFrequencyGoalCompleted = thisWeekWorkoutsCount >= weeklyTarget;
  const remainingWorkouts = Math.max(0, weeklyTarget - thisWeekWorkoutsCount);

  // Cardio calculations
  const cardioTarget = workoutGoals.weeklyCardioTargetMinutes || 60;
  const cardioPercent = Math.round((thisWeekCardioMinutes / cardioTarget) * 100);

  // Open modal with current values
  const handleOpenEdit = () => {
    setEditGoals({
      dailyVolumeTargetKg: workoutGoals.dailyVolumeTargetKg,
      weeklyFrequencyTargetDays: workoutGoals.weeklyFrequencyTargetDays,
      weeklyCardioTargetMinutes: workoutGoals.weeklyCardioTargetMinutes || 60
    });
    setIsEditModalOpen(true);
  };

  // Save changes
  const handleSaveGoals = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateWorkoutGoals(editGoals);
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      setIsEditModalOpen(false);
    }, 600);
  };

  // Volume presets (kg)
  const volumePresets = [5000, 8000, 10000, 12000, 15000];
  // Frequency presets (dias/semana)
  const frequencyPresets = [3, 4, 5, 6];
  // Cardio presets (min/semana)
  const cardioPresets = [30, 45, 60, 90, 120];

  return (
    <div 
      id="daily-goals-section" 
      className="rounded-2xl bg-[#161616] border border-[#242424] overflow-hidden shadow-lg transition-all"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-[#1A1A1A] border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D4FF00]/15 flex items-center justify-center text-[#D4FF00]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Metas de Treino Diário & Semanal
              </h3>
              {(isVolumeGoalCompleted || isFrequencyGoalCompleted) && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/30">
                  <Trophy className="w-3 h-3" />
                  <span>Meta Superada!</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Acompanhe seu volume de carga diária e consistência semanal em tempo real
            </p>
          </div>
        </div>

        {/* Action button: Edit Goals */}
        <button
          id="btn-edit-workout-goals"
          onClick={handleOpenEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-semibold border border-[#333333] transition-all group active:scale-95 ml-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>Ajustar Metas</span>
        </button>
      </div>

      {/* Main Grid: Volume Diário + Frequência Semanal */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Meta de Volume Total Diário (cols-7) */}
        <div 
          id="card-daily-volume-goal"
          className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#1A1A1A] border border-[#282828] relative overflow-hidden group"
        >
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4FF00]/10 flex items-center justify-center text-[#D4FF00]">
                  <Dumbbell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Volume Total Diário (Tonelagem)
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Carga levantada hoje (peso × repetições)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {isVolumeGoalCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Meta Atingida!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#242424] text-neutral-300 border border-[#333333] whitespace-nowrap">
                  <span>{volumePercent}% concluído</span>
                </span>
              )}
            </div>

            {/* Main Stats Display */}
            <div className="flex items-baseline justify-between gap-2 mt-4 mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {todayTotalVolumeKg.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-400">
                  / {dailyTarget.toLocaleString('pt-BR')} kg
                </span>
              </div>

              <div className="text-right">
                <span className={`text-sm font-bold ${isVolumeGoalCompleted ? 'text-emerald-400' : 'text-[#D4FF00]'}`}>
                  {volumePercent}%
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#121212] rounded-full h-3 sm:h-3.5 p-0.5 border border-[#2A2A2A] overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 relative ${
                  isVolumeGoalCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-[#D4FF00]' 
                    : 'bg-gradient-to-r from-[#BCE600] to-[#D4FF00]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, volumePercent))}%` }}
              >
                {/* Visual pulse glow on edge */}
                {volumePercent > 0 && volumePercent < 100 && (
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Live active workout callout if workout in progress */}
            {activeWorkout && activeWorkoutCurrentVolumeKg > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-[11px] text-[#D4FF00] font-medium mb-3 animate-pulse">
                <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  <strong>+{activeWorkoutCurrentVolumeKg.toLocaleString('pt-BR')} kg</strong> contabilizados ao vivo no treino atual ({activeWorkout.title})!
                </span>
              </div>
            )}
          </div>

          {/* Bottom helper text / status */}
          <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs text-neutral-400">
            {isVolumeGoalCompleted ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Parabéns! Excelente estímulo de hipertrofia hoje (+{(todayTotalVolumeKg - dailyTarget).toLocaleString('pt-BR')} kg além da meta).
              </span>
            ) : todayTotalVolumeKg > 0 ? (
              <span>
                Faltam <strong className="text-white">{remainingVolumeKg.toLocaleString('pt-BR')} kg</strong> para cumprir sua meta de hoje.
              </span>
            ) : (
              <span className="text-neutral-400">
                Nenhum treino iniciado hoje. Selecione um treino abaixo para começar a pontuar.
              </span>
            )}

            {todayTotalVolumeKg === 0 && onStartSuggestedWorkout && (
              <button
                onClick={onStartSuggestedWorkout}
                className="text-xs text-[#D4FF00] hover:underline font-semibold flex items-center gap-1 ml-2 flex-shrink-0"
              >
                <span>Treinar agora</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Meta de Frequência Semanal (cols-5) */}
        <div 
          id="card-weekly-frequency-goal"
          className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#1A1A1A] border border-[#282828]"
        >
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Frequência Semanal
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Dias de treino na semana atual
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {isFrequencyGoalCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 whitespace-nowrap">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Meta Batida!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#242424] text-neutral-300 border border-[#333333] whitespace-nowrap">
                  <span>{frequencyPercent}%</span>
                </span>
              )}
            </div>

            {/* Stats Display */}
            <div className="flex items-baseline justify-between gap-2 mt-4 mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {thisWeekWorkoutsCount}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-400">
                  / {weeklyTarget} dias nesta semana
                </span>
              </div>

              <div className="text-right">
                <span className={`text-sm font-bold ${isFrequencyGoalCompleted ? 'text-cyan-400' : 'text-neutral-300'}`}>
                  {thisWeekWorkoutsCount} de {weeklyTarget}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#121212] rounded-full h-3 sm:h-3.5 p-0.5 border border-[#2A2A2A] overflow-hidden mb-3">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, frequencyPercent))}%` }}
              ></div>
            </div>

            {/* Interactive Day by Day Tracker (Seg - Dom) */}
            <div className="pt-2 pb-1">
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {thisWeekDaysStatus.map((day) => {
                  const hasActivity = day.hasWorkout;
                  const hasCardioOnly = !day.hasWorkout && day.hasCardio;

                  return (
                    <div
                      key={day.date}
                      title={`${day.dayName} (${day.dayNum}): ${
                        hasActivity ? 'Treino de musculação realizado' : hasCardioOnly ? 'Cardio realizado' : 'Descanso / Pendente'
                      }`}
                      className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border text-center transition-all ${
                        day.isToday
                          ? 'border-[#D4FF00] bg-[#D4FF00]/10 shadow-sm'
                          : hasActivity
                          ? 'border-cyan-500/40 bg-cyan-500/10'
                          : hasCardioOnly
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-[#262626] bg-[#141414] text-neutral-500'
                      }`}
                    >
                      <span className={`text-[10px] font-bold ${
                        day.isToday 
                          ? 'text-[#D4FF00]' 
                          : hasActivity 
                          ? 'text-cyan-400' 
                          : hasCardioOnly 
                          ? 'text-emerald-400' 
                          : 'text-neutral-400'
                      }`}>
                        {day.dayName}
                      </span>
                      
                      <div className="my-0.5 flex items-center justify-center">
                        {hasActivity ? (
                          <div className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : hasCardioOnly ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                            <Activity className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-neutral-500">
                            {day.dayNum}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom status */}
          <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs text-neutral-400">
            {isFrequencyGoalCompleted ? (
              <span className="text-cyan-400 font-medium">
                🎯 Meta semanal cumprida! Mantenha a recuperação ativa.
              </span>
            ) : (
              <span>
                Faltam <strong className="text-white">{remainingWorkouts} {remainingWorkouts === 1 ? 'treino' : 'treinos'}</strong> para atingir a meta da semana.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Bonus Strip: Cardio Semanal & Dica Rápida */}
      <div className="px-5 py-3 bg-[#131313] border-t border-[#222222] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Cardio nesta semana: <strong className="text-white">{thisWeekCardioMinutes} min</strong> / {cardioTarget} min ({cardioPercent}%)
          </span>
        </div>

        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('progresso')}
            className="text-xs text-neutral-400 hover:text-[#D4FF00] transition-colors flex items-center gap-1 font-medium ml-auto"
          >
            <span>Ver histórico completo de cargas no Progresso</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* MODAL: Ajustar Metas de Treino */}
      {isEditModalOpen && (
        <div 
          id="modal-edit-goals-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            id="modal-edit-goals"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#181818] border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#1F1F1F] border-b border-[#2B2B2B]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D4FF00]" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Definir Metas de Treino
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGoals} className="p-5 sm:p-6 space-y-5">
              {/* Field 1: Meta de Volume Total Diário (kg) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-[#D4FF00]" />
                    <span>Volume Total Diário (kg)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#D4FF00]">
                    {editGoals.dailyVolumeTargetKg.toLocaleString('pt-BR')} kg
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Volume de carga diário planejado (soma de séries x repetições x carga). Ex: 3 séries de 10 reps com 60kg = 1.800 kg.
                </p>

                {/* Number input with stepper */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditGoals(prev => ({
                      ...prev,
                      dailyVolumeTargetKg: Math.max(1000, prev.dailyVolumeTargetKg - 1000)
                    }))}
                    className="p-2.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white border border-[#333333] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    step="500"
                    min="1000"
                    max="50000"
                    value={editGoals.dailyVolumeTargetKg}
                    onChange={(e) => setEditGoals(prev => ({
                      ...prev,
                      dailyVolumeTargetKg: Number(e.target.value) || 1000
                    }))}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#141414] border border-[#333333] text-white font-mono text-center text-sm font-bold focus:outline-none focus:border-[#D4FF00]"
                  />

                  <button
                    type="button"
                    onClick={() => setEditGoals(prev => ({
                      ...prev,
                      dailyVolumeTargetKg: Math.min(50000, prev.dailyVolumeTargetKg + 1000)
                    }))}
                    className="p-2.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white border border-[#333333] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-neutral-500 font-semibold mr-1">Sugestões:</span>
                  {volumePresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditGoals(prev => ({ ...prev, dailyVolumeTargetKg: preset }))}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                        editGoals.dailyVolumeTargetKg === preset
                          ? 'bg-[#D4FF00] text-black font-bold'
                          : 'bg-[#222222] text-neutral-300 hover:bg-[#2C2C2C]'
                      }`}
                    >
                      {preset >= 1000 ? `${preset / 1000}k` : preset} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Meta de Frequência Semanal (dias/semana) */}
              <div className="space-y-2 pt-3 border-t border-[#262626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Frequência Semanal</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {editGoals.weeklyFrequencyTargetDays} dias / semana
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Quantos dias na semana você pretende treinar para manter o estímulo constante.
                </p>

                {/* Frequency selector buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {frequencyPresets.map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setEditGoals(prev => ({ ...prev, weeklyFrequencyTargetDays: days }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        editGoals.weeklyFrequencyTargetDays === days
                          ? 'bg-cyan-500 text-black shadow-sm'
                          : 'bg-[#222222] text-neutral-300 hover:bg-[#2A2A2A] border border-[#303030]'
                      }`}
                    >
                      {days}x na semana
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Meta de Aeróbico / Cardio Semanal (minutos) */}
              <div className="space-y-2 pt-3 border-t border-[#262626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cardio Semanal (minutos)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {editGoals.weeklyCardioTargetMinutes} min
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {cardioPresets.map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEditGoals(prev => ({ ...prev, weeklyCardioTargetMinutes: mins }))}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        editGoals.weeklyCardioTargetMinutes === mins
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-[#222222] text-neutral-300 hover:bg-[#2C2C2C]'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors"
                >
                  Cancelar
                </button>

                <button
                  id="btn-save-workout-goals"
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#D4FF00] hover:bg-[#BCE600] text-black text-xs font-bold transition-all active:scale-95 shadow-md"
                >
                  {saveFeedback ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Metas Salvas!</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      <span>Salvar Metas</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
