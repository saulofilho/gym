import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Plus, Trash2, ChevronLeft, ChevronRight, 
  Timer, Dumbbell, Play, Sparkles, Award, ArrowRight,
  Bell, Volume2, VolumeX, Pause, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise, WorkoutSession } from '../types';

interface ActiveWorkoutModalProps {
  onOpenExerciseDetail: (exercise: Exercise) => void;
}

interface RestExerciseInfo {
  exerciseName: string;
  completedSetNumber: number;
  nextSetNumber: number;
  totalSets: number;
  isLastSetOfExercise: boolean;
  nextExerciseName?: string;
  nextWeight?: number;
  nextReps?: number;
  nextSetIdx?: number;
}

// Harmonious Web Audio synthesizer for gym timer alert (C5 -> E5 -> G5 -> C6)
const playRestFinishedChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, dur: 0.16 },    // C5
      { freq: 659.25, time: 0.14, dur: 0.16 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.22 }, // G5
      { freq: 1046.50, time: 0.44, dur: 0.50 } // C6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // Warm, distinct gym tone
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch (err) {
    console.warn('Audio playback unavailable or blocked:', err);
  }
};

// Haptic feedback for mobile devices
const triggerVibration = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([250, 120, 250, 120, 400]);
    } catch (e) { /* ignore */ }
  }
};

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  onOpenExerciseDetail
}) => {
  const { 
    activeWorkout, 
    cancelActiveWorkout, 
    finishActiveWorkout,
    toggleSetCompleted,
    updateSetValues,
    addNewSetToExercise,
    removeSetFromExercise,
    nextExercise,
    prevExercise,
    setCurrentExerciseIndex,
    restTimerSeconds,
    isRestTimerRunning,
    startRestTimer,
    cancelRestTimer,
    getLastLoadForExercise
  } = useWorkout();

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<WorkoutSession | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<WorkoutSession['feeling']>('otimo');
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Automatic Rest Timer & Notification state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('academiapro_rest_sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [showRestFinishedAlert, setShowRestFinishedAlert] = useState(false);
  const [restExerciseInfo, setRestExerciseInfo] = useState<RestExerciseInfo | null>(null);
  const [initialRestDuration, setInitialRestDuration] = useState<number>(60);
  const prevRunningRef = useRef(isRestTimerRunning);
  const userCancelledRef = useRef(false);

  // Monitor rest timer completion (triggers audio & visual notification)
  useEffect(() => {
    if (prevRunningRef.current && !isRestTimerRunning) {
      if (!userCancelledRef.current && restTimerSeconds === 0 && restExerciseInfo) {
        if (soundEnabled) {
          playRestFinishedChime();
        }
        triggerVibration();
        setShowRestFinishedAlert(true);
      }
      userCancelledRef.current = false;
    }
    prevRunningRef.current = isRestTimerRunning;
  }, [isRestTimerRunning, restTimerSeconds, soundEnabled, restExerciseInfo]);

  // Auto-dismiss visual notification after 8 seconds
  useEffect(() => {
    if (!showRestFinishedAlert) return;
    const timer = setTimeout(() => {
      setShowRestFinishedAlert(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [showRestFinishedAlert]);

  const handleToggleSet = (sIdx: number) => {
    if (!currentEx) return;
    const s = currentEx.sets[sIdx];
    if (!s) return;

    const willBeCompleted = !s.completed;
    toggleSetCompleted(activeWorkout.currentExerciseIndex, sIdx);

    if (willBeCompleted) {
      const restDuration = currentEx.restSeconds || 60;
      setInitialRestDuration(restDuration);

      const isLastSet = sIdx === currentEx.sets.length - 1;
      const nextEx = activeWorkout.exercises[activeWorkout.currentExerciseIndex + 1];

      setRestExerciseInfo({
        exerciseName: currentEx.exercise.name,
        completedSetNumber: s.setNumber,
        nextSetNumber: s.setNumber + 1,
        totalSets: currentEx.sets.length,
        isLastSetOfExercise: isLastSet,
        nextExerciseName: isLastSet && nextEx ? nextEx.exercise.name : undefined,
        nextWeight: currentEx.sets[sIdx + 1]?.weightKg ?? s.weightKg,
        nextReps: currentEx.sets[sIdx + 1]?.reps ?? s.reps,
        nextSetIdx: !isLastSet ? sIdx + 1 : undefined
      });

      setShowRestFinishedAlert(false);
      userCancelledRef.current = false;
      startRestTimer(restDuration);
    } else {
      if (isRestTimerRunning) {
        userCancelledRef.current = true;
        cancelRestTimer();
      }
      setShowRestFinishedAlert(false);
    }
  };

  const handleSkipRest = () => {
    userCancelledRef.current = true;
    cancelRestTimer();
    setShowRestFinishedAlert(false);
  };

  const handleAdjustRest = (delta: number) => {
    const newSeconds = Math.max(5, restTimerSeconds + delta);
    setInitialRestDuration(prev => Math.max(prev, newSeconds));
    startRestTimer(newSeconds);
  };

  const handleAddExtraRest = (seconds = 30) => {
    setShowRestFinishedAlert(false);
    setInitialRestDuration(seconds);
    userCancelledRef.current = false;
    startRestTimer(seconds);
  };

  const handleStartNextSet = () => {
    setShowRestFinishedAlert(false);
    if (restExerciseInfo?.isLastSetOfExercise && activeWorkout.currentExerciseIndex < activeWorkout.exercises.length - 1) {
      nextExercise();
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('academiapro_rest_sound', String(next));
      if (next) {
        playRestFinishedChime();
      }
      return next;
    });
  };

  if (!activeWorkout) return null;

  const currentEx = activeWorkout.exercises[activeWorkout.currentExerciseIndex];
  const lastLoads = currentEx ? getLastLoadForExercise(currentEx.exercise.id) : null;

  // Calculate live volume
  let liveVolume = 0;
  let totalSetsCompleted = 0;
  let totalPlannedSets = 0;

  activeWorkout.exercises.forEach(exItem => {
    exItem.sets.forEach(set => {
      totalPlannedSets++;
      if (set.completed) {
        totalSetsCompleted++;
        liveVolume += (set.weightKg * set.reps);
      }
    });
  });

  const handleFinish = () => {
    try {
      // Fire celebration confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) { /* ignore */ }

    const savedSession = finishActiveWorkout(selectedFeeling, workoutNotes);
    setCompletedSessionData(savedSession);
  };

  // If completed summary is showing
  if (completedSessionData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
        <div 
          id="workout-completion-card"
          className="w-full max-w-md bg-[#161616] border border-[#222222] rounded-2xl p-6 text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-[#D4FF00] mx-auto flex items-center justify-center text-black font-bold shadow-lg shadow-[rgba(212,255,0,0.2)]">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#D4FF00] uppercase tracking-widest">Treino Concluído com Sucesso!</span>
            <h2 className="text-2xl font-bold text-white">{completedSessionData.title}</h2>
            <p className="text-xs text-neutral-400">Excelente consistência. Cada série conta na sua evolução.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#111111] border border-[#222222]">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Duração</span>
              <div className="text-lg font-bold text-white mt-0.5">{completedSessionData.durationMinutes} min</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Tonelagem Total</span>
              <div className="text-lg font-bold text-[#D4FF00] mt-0.5">{completedSessionData.totalVolumeKg} kg</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Exercícios</span>
              <div className="text-lg font-bold text-white mt-0.5">{completedSessionData.exercises.length}</div>
            </div>
          </div>

          <button
            id="btn-close-completed-summary"
            onClick={() => setCompletedSessionData(null)}
            className="w-full py-3.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-sm transition-transform active:scale-95 shadow-md shadow-[rgba(212,255,0,0.2)]"
          >
            Ver Minha Evolução no Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0A] text-white overflow-hidden animate-fadeIn">
      {/* Top Workout Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#222222] bg-[#161616]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4FF00]">Em Treinamento</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold truncate max-w-[200px] sm:max-w-md">{activeWorkout.title}</h1>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111111] border border-[#333333] text-xs font-mono">
            <Timer className="w-4 h-4 text-[#D4FF00]" />
            <span className="font-bold">
              {Math.floor(activeWorkout.elapsedSeconds / 60)}:{(activeWorkout.elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111111] border border-[#333333] text-xs font-mono">
            <Dumbbell className="w-4 h-4 text-neutral-400" />
            <span className="text-[#D4FF00] font-bold">{liveVolume}</span>
            <span className="text-neutral-400 text-[10px]">kg volume</span>
          </div>

          <button
            id="btn-open-finish-modal"
            onClick={() => setShowFinishConfirm(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)] transition-colors"
          >
            Finalizar
          </button>

          <button
            id="btn-cancel-workout"
            onClick={() => {
              if (confirm('Deseja realmente cancelar este treino? Os registros não salvos serão descartados.')) {
                cancelActiveWorkout();
              }
            }}
            className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-[#222222] transition-colors"
            title="Descartar treino"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Exercise Navigation Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#222222] bg-[#111111] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          {(activeWorkout.exercises || []).map((item, idx) => {
            const allCompleted = (item.sets || []).every(s => s.completed);
            const isCurrent = idx === activeWorkout.currentExerciseIndex;

            return (
              <button
                key={idx}
                onClick={() => setCurrentExerciseIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : allCompleted
                    ? 'bg-[#1A1A1A] text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#1A1A1A] text-neutral-400 hover:text-white border border-[#222222]'
                }`}
              >
                {allCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{idx + 1}. {item.exercise.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 ml-4">
          <span className="text-xs text-neutral-400">
            {totalSetsCompleted} de {totalPlannedSets} séries
          </span>
        </div>
      </div>

      {/* Main Exercise Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        {currentEx ? (
          <>
            {/* Current Exercise Title & Video Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#161616] border border-[#222222]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#D4FF00]/10 text-[#D4FF00]">
                    {currentEx.exercise.primaryMuscle}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Alvo: {currentEx.targetSets} séries × {currentEx.targetReps} reps (Descanso {currentEx.restSeconds}s)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{currentEx.exercise.name}</h2>
                {currentEx.notes && (
                  <p className="text-xs text-neutral-300 mt-1 italic">💡 {currentEx.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-view-exercise-video"
                  onClick={() => onOpenExerciseDetail(currentEx.exercise)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-xs font-bold text-[#D4FF00] border border-[#333333] transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-[#D4FF00]" />
                  <span>Vídeo & Postura</span>
                </button>
              </div>
            </div>

            {/* Sets Logging Table */}
            <div className="rounded-2xl bg-[#161616] border border-[#222222] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-[#222222] bg-[#111111]">
                <span className="col-span-2 text-center">Série</span>
                <span className="col-span-3 text-center">Anterior</span>
                <span className="col-span-3 text-center">Carga (kg)</span>
                <span className="col-span-2 text-center">Reps</span>
                <span className="col-span-2 text-center">Feito</span>
              </div>

              <div className="divide-y divide-[#222222]">
                {(currentEx?.sets || []).map((s, sIdx) => {
                  const pastSet = lastLoads && lastLoads[sIdx];
                  const isNextTarget = !s.completed && restExerciseInfo?.nextSetIdx === sIdx;

                  return (
                    <div 
                      key={sIdx}
                      className={`grid grid-cols-12 gap-2 p-3 items-center transition-colors ${
                        s.completed 
                          ? 'bg-[#1A1A1A]/60' 
                          : isNextTarget
                          ? 'bg-[#D4FF00]/5 ring-1 ring-[#D4FF00]/50'
                          : 'hover:bg-[#1A1A1A]/30'
                      }`}
                    >
                      {/* Set Number & Remove */}
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          s.completed 
                            ? 'bg-[#D4FF00] text-black' 
                            : isNextTarget
                            ? 'bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/60'
                            : 'bg-[#222222] text-neutral-300'
                        }`}>
                          {s.setNumber}
                        </span>
                        {currentEx.sets.length > 1 && (
                          <button
                            onClick={() => removeSetFromExercise(activeWorkout.currentExerciseIndex, sIdx)}
                            className="text-neutral-600 hover:text-rose-400 p-0.5 rounded transition-colors"
                            title="Remover série"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Previous reference */}
                      <div className="col-span-3 text-center text-xs text-neutral-400 font-mono">
                        {pastSet ? (
                          <span className="text-[#D4FF00] font-medium">
                            {pastSet.weightKg}kg × {pastSet.reps}
                          </span>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </div>

                      {/* Weight (kg) Input with Quick Adjust */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={s.weightKg || ''}
                          onChange={(e) => updateSetValues(
                            activeWorkout.currentExerciseIndex, 
                            sIdx, 
                            parseFloat(e.target.value) || 0, 
                            s.reps, 
                            s.rpe
                          )}
                          className="w-16 px-2 py-1.5 text-center text-sm font-bold font-mono rounded-lg bg-[#111111] border border-[#333333] text-[#D4FF00] focus:outline-none focus:border-[#D4FF00]"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-2 flex items-center justify-center">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={s.reps || ''}
                          onChange={(e) => updateSetValues(
                            activeWorkout.currentExerciseIndex, 
                            sIdx, 
                            s.weightKg, 
                            parseInt(e.target.value) || 1, 
                            s.rpe
                          )}
                          className="w-12 px-1 py-1.5 text-center text-sm font-bold font-mono rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4FF00]"
                        />
                      </div>

                      {/* Check Complete Button */}
                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          id={`btn-check-set-${sIdx}`}
                          onClick={() => handleToggleSet(sIdx)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            s.completed
                              ? 'bg-[#D4FF00] text-black shadow-md shadow-[rgba(212,255,0,0.2)]'
                              : isNextTarget
                              ? 'bg-[#1A1A1A] text-[#D4FF00] border-2 border-[#D4FF00] shadow-[0_0_10px_rgba(212,255,0,0.2)]'
                              : 'bg-[#1A1A1A] text-neutral-400 hover:bg-[#222222] hover:text-white border border-[#333333]'
                          }`}
                          title={s.completed ? 'Série concluída' : 'Marcar como concluída (inicia descanso)'}
                        >
                          <Check className={`w-5 h-5 ${s.completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Set Button */}
              <div className="p-3 bg-[#111111] border-t border-[#222222] flex justify-center">
                <button
                  id="btn-add-new-set"
                  onClick={() => addNewSetToExercise(activeWorkout.currentExerciseIndex)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-xs font-bold text-neutral-200 border border-[#333333] transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#D4FF00]" />
                  <span>Adicionar Série</span>
                </button>
              </div>
            </div>

            {/* Pagination between exercises */}
            <div className="flex items-center justify-between pt-2">
              <button
                id="btn-prev-exercise"
                onClick={prevExercise}
                disabled={activeWorkout.currentExerciseIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#161616] border border-[#222222] text-xs font-bold disabled:opacity-30 hover:bg-[#1A1A1A] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <span className="text-xs text-neutral-400">
                Exercício {activeWorkout.currentExerciseIndex + 1} de {activeWorkout.exercises.length}
              </span>

              <button
                id="btn-next-exercise"
                onClick={nextExercise}
                disabled={activeWorkout.currentExerciseIndex === activeWorkout.exercises.length - 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black text-xs font-bold disabled:opacity-30 transition-colors shadow-md shadow-[rgba(212,255,0,0.2)]"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : null}
      </main>

      {/* Visual Notification: Rest Finished Alert */}
      {showRestFinishedAlert && (
        <div 
          id="rest-finished-notification"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-[#161616] border-2 border-[#D4FF00] rounded-2xl p-4 sm:p-5 shadow-[0_12px_45px_rgba(212,255,0,0.35)] animate-fadeIn text-white overflow-hidden"
        >
          {/* Top subtle highlight pulse indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#222222] overflow-hidden">
            <div className="h-full bg-[#D4FF00] animate-pulse" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center font-bold shrink-0 shadow-md shadow-[rgba(212,255,0,0.25)] mt-0.5">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">
                    Descanso Concluído
                  </span>
                  {soundEnabled && (
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-[#D4FF00]" /> Alerta Sonoro
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {restExerciseInfo?.isLastSetOfExercise
                    ? 'Última Série Concluída!'
                    : `Hora da Série ${restExerciseInfo?.nextSetNumber || ''}!`}
                </h3>
                <p className="text-xs text-neutral-300">
                  {restExerciseInfo?.isLastSetOfExercise ? (
                    <span>
                      Você finalizou todas as {restExerciseInfo.totalSets} séries de <strong className="text-white">{restExerciseInfo.exerciseName}</strong>.{' '}
                      {restExerciseInfo.nextExerciseName ? (
                        <span>Próximo: <strong className="text-[#D4FF00]">{restExerciseInfo.nextExerciseName}</strong></span>
                      ) : (
                        <span>Você concluiu todos os exercícios planejados!</span>
                      )}
                    </span>
                  ) : (
                    <span>
                      <strong className="text-white">{restExerciseInfo?.exerciseName}</strong> • Meta:{' '}
                      <strong className="text-[#D4FF00]">{restExerciseInfo?.nextWeight} kg × {restExerciseInfo?.nextReps} reps</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              id="btn-close-rest-alert"
              onClick={() => setShowRestFinishedAlert(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors shrink-0"
              title="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#222222]">
            <button
              id="btn-start-next-set"
              onClick={handleStartNextSet}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[rgba(212,255,0,0.2)] transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>
                {restExerciseInfo?.isLastSetOfExercise && restExerciseInfo.nextExerciseName
                  ? 'Ir para Próximo Exercício'
                  : 'Iniciar Próxima Série'}
              </span>
            </button>

            <button
              id="btn-add-extra-rest-30"
              onClick={() => handleAddExtraRest(30)}
              className="py-2.5 px-3.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-[#333333] transition-colors"
              title="Adicionar 30 segundos adicionais de recuperação"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span>+30s</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Rest Timer Bar (appears when countdown active) */}
      {isRestTimerRunning && (
        <div 
          id="floating-rest-timer"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg bg-[#161616] text-white border border-[#333333] rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/80 flex flex-col gap-2.5 backdrop-blur-md"
        >
          {/* Progress bar line */}
          <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D4FF00] transition-all duration-1000 ease-linear rounded-full"
              style={{ 
                width: `${Math.min(100, Math.max(0, ((initialRestDuration - restTimerSeconds) / Math.max(1, initialRestDuration)) * 100))}%` 
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Countdown and set info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center font-bold text-sm shadow-md shadow-[rgba(212,255,0,0.2)]">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#D4FF00]">
                    Descanso Automático
                  </span>
                  {restExerciseInfo && (
                    <span className="text-[10px] text-neutral-400 hidden sm:inline">
                      • Série {restExerciseInfo.completedSetNumber} concluída
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black font-mono leading-none tracking-tight text-white mt-0.5">
                  {Math.floor(restTimerSeconds / 60)}:{(restTimerSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Quick Adjustments, Sound Toggle and Skip */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="btn-adjust-rest-minus"
                onClick={() => handleAdjustRest(-15)}
                className="px-2 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-xs font-mono font-bold text-neutral-300 hover:text-white border border-[#333333] transition-colors"
                title="Diminuir 15 segundos"
              >
                -15s
              </button>
              <button
                id="btn-adjust-rest-plus"
                onClick={() => handleAdjustRest(30)}
                className="px-2.5 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-xs font-mono font-bold text-[#D4FF00] border border-[#333333] transition-colors"
                title="Adicionar 30 segundos"
              >
                +30s
              </button>

              <button
                id="btn-toggle-rest-sound"
                onClick={toggleSound}
                className="p-2 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-neutral-300 border border-[#333333] transition-colors"
                title={soundEnabled ? 'Som do alarme ativado (clique para silenciar)' : 'Alarme silenciado (clique para ativar som)'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#D4FF00]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              <button
                id="btn-skip-rest"
                onClick={handleSkipRest}
                className="px-3.5 py-1.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black text-xs font-bold shadow-md shadow-[rgba(212,255,0,0.2)] transition-transform active:scale-95"
              >
                Pular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161616] border border-[#222222] rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Finalizar Treino de Hoje?</h3>
            <p className="text-xs text-neutral-400">
              Você completou <strong className="text-[#D4FF00]">{totalSetsCompleted}</strong> séries e levantou <strong className="text-[#D4FF00]">{liveVolume} kg</strong> de tonelagem acumulada!
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300">Como você se sentiu hoje?</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'otimo', label: '🔥 Ótimo' },
                  { id: 'bom', label: '💪 Bom' },
                  { id: 'cansado', label: '😴 Cansado' },
                  { id: 'desafiador', label: '⚡ Difícil' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedFeeling(item.id as any)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      selectedFeeling === item.id
                        ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-sm'
                        : 'bg-[#111111] text-neutral-400 border-[#222222] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Notas ou Destaques do Treino (Opcional):</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="Ex: Aumentei 2kg no supino, ótima cadência na descida..."
                className="w-full h-20 p-3 text-xs rounded-lg bg-[#111111] border border-[#333333] text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4FF00]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white"
              >
                Voltar ao Treino
              </button>
              <button
                id="btn-confirm-save-workout"
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)]"
              >
                Salvar & Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
