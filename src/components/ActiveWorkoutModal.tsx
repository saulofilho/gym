import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Plus, Trash2, ChevronLeft, ChevronRight, 
  Timer, Dumbbell, Play, Sparkles, Award, ArrowRight,
  Bell, Volume2, VolumeX, Pause, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise, WorkoutSession } from '../types';
import { ExerciseSetsBarChart } from './ExerciseSetsBarChart';

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
  const [customRestSeconds, setCustomRestSeconds] = useState<number>(90);
  const prevRunningRef = useRef(isRestTimerRunning);
  const userCancelledRef = useRef(false);

  const currentEx = activeWorkout ? activeWorkout.exercises[activeWorkout.currentExerciseIndex] : null;

  // Sync customRestSeconds with the recommended rest duration whenever the exercise changes
  useEffect(() => {
    if (currentEx?.restSeconds) {
      setCustomRestSeconds(currentEx.restSeconds);
    }
  }, [activeWorkout?.currentExerciseIndex, currentEx?.restSeconds]);

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
      const restDuration = customRestSeconds || currentEx.restSeconds || 60;
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

  const handleStartCustomRest = (overrideSeconds?: number) => {
    if (!currentEx) return;
    const target = Math.max(5, overrideSeconds ?? customRestSeconds ?? currentEx.restSeconds ?? 60);
    setCustomRestSeconds(target);
    setInitialRestDuration(target);
    const completedCount = currentEx.sets.filter(s => s.completed).length;
    setRestExerciseInfo({
      exerciseName: currentEx.exercise.name,
      completedSetNumber: Math.max(1, completedCount),
      nextSetNumber: Math.min(currentEx.sets.length, completedCount + 1),
      totalSets: currentEx.sets.length,
      isLastSetOfExercise: completedCount >= currentEx.sets.length
    });
    setShowRestFinishedAlert(false);
    userCancelledRef.current = false;
    startRestTimer(target);
  };

  if (!activeWorkout) return null;

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

            {/* Inline Custom Rest Timer Panel for Current Exercise */}
            <div
              id="exercise-rest-timer-panel"
              className="p-4 rounded-2xl bg-[#141414] border border-[#242424] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D4FF00]/15 border border-[#D4FF00]/30 text-[#D4FF00] flex items-center justify-center">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-bold text-white">Cronômetro de Descanso</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#D4FF00] font-mono">
                        Recomendado p/ este exercício: {currentEx.restSeconds}s
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Personalize a contagem regressiva ou inicie o tempo recomendado após cada série
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isRestTimerRunning ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#D4FF00]/50 font-mono text-sm font-bold text-[#D4FF00]">
                        ⏱️ {Math.floor(restTimerSeconds / 60).toString().padStart(2, '0')}:
                        {(restTimerSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={handleSkipRest}
                        className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-xs font-bold text-neutral-200 border border-[#333333]"
                      >
                        Zerar
                      </button>
                    </div>
                  ) : (
                    <button
                      id="btn-start-custom-exercise-rest"
                      type="button"
                      onClick={() => handleStartCustomRest(customRestSeconds)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4FF00] hover:brightness-95 text-black text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>Iniciar Descanso ({customRestSeconds}s)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#222222]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomRestSeconds(currentEx.restSeconds)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      customRestSeconds === currentEx.restSeconds
                        ? 'bg-[#D4FF00]/15 border-[#D4FF00]/50 text-[#D4FF00]'
                        : 'bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300 hover:text-white'
                    }`}
                  >
                    Recomendado ({currentEx.restSeconds}s)
                  </button>
                  {[45, 60, 90, 120, 180].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCustomRestSeconds(sec)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        customRestSeconds === sec && sec !== currentEx.restSeconds
                          ? 'bg-[#D4FF00]/15 border-[#D4FF00]/50 text-[#D4FF00]'
                          : 'bg-[#1A1A1A] border-[#2A2A2A] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400">Personalizado (s):</span>
                  <button
                    type="button"
                    onClick={() => setCustomRestSeconds((prev) => Math.max(10, prev - 15))}
                    className="px-2 py-1 rounded bg-[#1A1A1A] border border-[#2C2C2C] text-xs font-mono text-neutral-300 hover:text-white"
                  >
                    -15
                  </button>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    step={5}
                    value={customRestSeconds}
                    onChange={(e) => setCustomRestSeconds(Math.max(5, parseInt(e.target.value) || 60))}
                    className="w-16 px-2 py-1 text-center text-xs font-mono font-bold rounded bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#D4FF00]"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomRestSeconds((prev) => Math.min(600, prev + 15))}
                    className="px-2 py-1 rounded bg-[#1A1A1A] border border-[#2C2C2C] text-xs font-mono text-[#D4FF00] hover:brightness-110"
                  >
                    +15
                  </button>
                </div>
              </div>
            </div>

            {/* Sets Logging Table */}
            <div className="rounded-2xl bg-[#161616] border border-[#222222] overflow-hidden">
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 p-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-[#222222] bg-[#111111]">
                <span className="col-span-2 text-center">Série</span>
                <span className="col-span-2 text-center">Anterior</span>
                <span className="col-span-3 text-center">Carga (kg)</span>
                <span className="col-span-2 text-center">Reps</span>
                <span className="col-span-2 text-center text-[#D4FF00]" title=" Taxa de Esforço Percebido de 1 a 10">RPE (1-10)</span>
                <span className="col-span-1 text-center">Feito</span>
              </div>

              <div className="divide-y divide-[#222222]">
                {(currentEx?.sets || []).map((s, sIdx) => {
                  const pastSet = lastLoads && lastLoads[sIdx];
                  const isNextTarget = !s.completed && restExerciseInfo?.nextSetIdx === sIdx;
                  const currentRpe = s.rpe ?? 8;
                  const rirText =
                    currentRpe >= 10
                      ? 'Falha (0 RIR)'
                      : currentRpe === 9
                      ? '1 RIR'
                      : currentRpe === 8
                      ? '2 RIR'
                      : currentRpe === 7
                      ? '3 RIR'
                      : currentRpe >= 5
                      ? '4+ RIR'
                      : 'Aquec.';

                  const rpeStyle =
                    currentRpe >= 10
                      ? 'border-rose-500/50 text-rose-400 bg-rose-950/20'
                      : currentRpe === 9
                      ? 'border-amber-500/50 text-amber-300 bg-amber-950/20'
                      : currentRpe >= 7
                      ? 'border-[#D4FF00]/50 text-[#D4FF00] bg-[#111111]'
                      : 'border-cyan-500/40 text-cyan-300 bg-[#111111]';

                  return (
                    <div 
                      key={sIdx}
                      className={`grid grid-cols-12 gap-1.5 sm:gap-2 p-2.5 sm:p-3 items-center transition-colors ${
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
                      <div className="col-span-2 text-center text-[11px] text-neutral-400 font-mono leading-tight">
                        {pastSet ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[#D4FF00] font-medium">
                              {pastSet.weightKg}kg×{pastSet.reps}
                            </span>
                            {pastSet.rpe && (
                              <span className="text-[10px] text-neutral-500">
                                RPE {pastSet.rpe}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </div>

                      {/* Weight (kg) Input */}
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
                          className="w-16 sm:w-20 px-2 py-1.5 text-center text-sm font-bold font-mono rounded-lg bg-[#111111] border border-[#333333] text-[#D4FF00] focus:outline-none focus:border-[#D4FF00]"
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
                          className="w-12 sm:w-14 px-1 py-1.5 text-center text-sm font-bold font-mono rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4FF00]"
                        />
                      </div>

                      {/* RPE (1-10) Select Input */}
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        <select
                          id={`select-rpe-set-${sIdx}`}
                          aria-label={`Esforço Percebido RPE da série ${s.setNumber}`}
                          value={Math.round(currentRpe)}
                          onChange={(e) => updateSetValues(
                            activeWorkout.currentExerciseIndex,
                            sIdx,
                            s.weightKg,
                            s.reps,
                            parseInt(e.target.value, 10) || 8
                          )}
                          className={`w-14 sm:w-16 px-1 py-1 text-center text-xs sm:text-sm font-bold font-mono rounded-lg border focus:outline-none focus:border-[#D4FF00] cursor-pointer ${rpeStyle}`}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                            <option key={val} value={val} className="bg-[#111111] text-white">
                              {val}
                            </option>
                          ))}
                        </select>
                        <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                          {rirText}
                        </span>
                      </div>

                      {/* Check Complete Button */}
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          id={`btn-check-set-${sIdx}`}
                          onClick={() => handleToggleSet(sIdx)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                            s.completed
                              ? 'bg-[#D4FF00] text-black shadow-md shadow-[rgba(212,255,0,0.2)]'
                              : isNextTarget
                              ? 'bg-[#1A1A1A] text-[#D4FF00] border-2 border-[#D4FF00] shadow-[0_0_10px_rgba(212,255,0,0.2)]'
                              : 'bg-[#1A1A1A] text-neutral-400 hover:bg-[#222222] hover:text-white border border-[#333333]'
                          }`}
                          title={s.completed ? 'Série concluída' : 'Marcar como concluída (inicia descanso)'}
                        >
                          <Check className={`w-4 h-4 sm:w-5 sm:h-5 ${s.completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RPE Legend & Add Set Footer */}
              <div className="p-3 bg-[#111111] border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
                  <span className="font-bold text-neutral-300">Escala RPE (1-10):</span>
                  <span><strong className="text-cyan-300">1-6</strong> Leve/Aquec.</span>
                  <span><strong className="text-[#D4FF00]">7-8</strong> Ideal (2-3 RIR)</span>
                  <span><strong className="text-amber-300">9</strong> Quase Falha (1 RIR)</span>
                  <span><strong className="text-rose-400">10</strong> Falha Máx (0 RIR)</span>
                </div>

                <button
                  id="btn-add-new-set"
                  onClick={() => addNewSetToExercise(activeWorkout.currentExerciseIndex)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-xs font-bold text-neutral-200 border border-[#333333] transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#D4FF00]" />
                  <span>Adicionar Série</span>
                </button>
              </div>
            </div>

            {/* CSS/DOM Bar Chart: Load (kg) & RPE Evolution across Last 5 Sets */}
            <ExerciseSetsBarChart
              exerciseId={currentEx.exercise.id}
              exerciseName={currentEx.exercise.name}
              compact
            />

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
