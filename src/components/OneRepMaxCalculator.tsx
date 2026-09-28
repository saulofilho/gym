import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Dumbbell, History, RotateCcw, TrendingUp, 
  CheckCircle2, ChevronRight, Flame, ShieldAlert, Sparkles
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { EXERCISES_DATABASE } from '../data/exercisesData';
import { LoggedSet } from '../types';

type FormulaType = 'epley' | 'brzycki' | 'media';

interface LastExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  sessionDate: string;
  sessionTitle: string;
  sets: LoggedSet[];
  lastSet: LoggedSet;
  heaviestSet: LoggedSet;
  historicalBest1RM: number;
}

export const OneRepMaxCalculator: React.FC = () => {
  const { workoutHistory, activeWorkout } = useWorkout();

  // Extract all exercises with their latest recorded session data
  const exerciseRecordsMap = useMemo(() => {
    const map = new Map<string, LastExerciseRecord>();

    // Helper to calculate Epley 1RM
    const calcEpley = (w: number, r: number) => (r === 1 ? w : Math.round(w * (1 + r / 30)));

    // Sort sessions newest first by date/startTime
    const sortedSessions = [...(workoutHistory || [])].sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.startTime || 0) - (a.startTime || 0);
    });

    // If there's an active workout with completed sets, consider it first
    if (activeWorkout && activeWorkout.exercises) {
      const todayDate = new Date().toISOString().split('T')[0];
      activeWorkout.exercises.forEach(item => {
        const completedSets = (item.sets || []).filter(s => s.completed && s.weightKg > 0 && s.reps > 0);
        if (completedSets.length > 0 && !map.has(item.exercise.id)) {
          const lastSet = completedSets[completedSets.length - 1];
          const heaviestSet = completedSets.reduce((best, curr) =>
            calcEpley(curr.weightKg, curr.reps) >= calcEpley(best.weightKg, best.reps) ? curr : best
          , completedSets[0]);

          map.set(item.exercise.id, {
            exerciseId: item.exercise.id,
            exerciseName: item.exercise.name,
            sessionDate: todayDate,
            sessionTitle: `${activeWorkout.title} (Em andamento)`,
            sets: completedSets,
            lastSet,
            heaviestSet,
            historicalBest1RM: calcEpley(heaviestSet.weightKg, heaviestSet.reps)
          });
        }
      });
    }

    // Check historical sessions
    sortedSessions.forEach(session => {
      if (!session.exercises) return;
      session.exercises.forEach(exLog => {
        const validSets = (exLog.sets || []).filter(s => s.weightKg > 0 && s.reps > 0);
        if (validSets.length === 0) return;

        const sessionBest1RM = validSets.reduce((max, s) => {
          const est = calcEpley(s.weightKg, s.reps);
          return est > max ? est : max;
        }, 0);

        if (!map.has(exLog.exerciseId)) {
          const lastSet = validSets[validSets.length - 1];
          const heaviestSet = validSets.reduce((best, curr) =>
            calcEpley(curr.weightKg, curr.reps) >= calcEpley(best.weightKg, best.reps) ? curr : best
          , validSets[0]);

          map.set(exLog.exerciseId, {
            exerciseId: exLog.exerciseId,
            exerciseName: exLog.exerciseName,
            sessionDate: session.date,
            sessionTitle: session.title,
            sets: validSets,
            lastSet,
            heaviestSet,
            historicalBest1RM: sessionBest1RM
          });
        } else {
          const existing = map.get(exLog.exerciseId)!;
          if (sessionBest1RM > existing.historicalBest1RM) {
            existing.historicalBest1RM = sessionBest1RM;
          }
        }
      });
    });

    return map;
  }, [workoutHistory, activeWorkout]);

  // Build ordered exercise options: recorded exercises first, then remaining from database
  const exerciseOptions = useMemo(() => {
    const recorded: { id: string; name: string; muscle: string; hasRecord: boolean }[] = [];
    const unrecorded: { id: string; name: string; muscle: string; hasRecord: boolean }[] = [];
    const seenIds = new Set<string>();

    EXERCISES_DATABASE.forEach(ex => {
      seenIds.add(ex.id);
      if (exerciseRecordsMap.has(ex.id)) {
        recorded.push({ id: ex.id, name: ex.name, muscle: ex.primaryMuscle, hasRecord: true });
      } else {
        unrecorded.push({ id: ex.id, name: ex.name, muscle: ex.primaryMuscle, hasRecord: false });
      }
    });

    // Include any custom exercise present in history but not in EXERCISES_DATABASE
    exerciseRecordsMap.forEach((rec, id) => {
      if (!seenIds.has(id)) {
        recorded.push({ id, name: rec.exerciseName, muscle: 'Geral', hasRecord: true });
      }
    });

    return [...recorded, ...unrecorded];
  }, [exerciseRecordsMap]);

  // Default to first recorded exercise (e.g. Supino or Agachamento)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    const firstRecorded = Array.from(exerciseRecordsMap.keys())[0];
    return firstRecorded || EXERCISES_DATABASE[0]?.id || 'supino-reto-barra';
  });

  const currentRecord = exerciseRecordsMap.get(selectedExerciseId) || null;

  const [weightKg, setWeightKg] = useState<number>(60);
  const [reps, setReps] = useState<number>(8);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);
  const [formula, setFormula] = useState<FormulaType>('epley');

  // Whenever selected exercise changes, auto-populate with its last recorded set
  useEffect(() => {
    const rec = exerciseRecordsMap.get(selectedExerciseId);
    if (rec && rec.lastSet) {
      setWeightKg(rec.lastSet.weightKg);
      setReps(rec.lastSet.reps);
      setSelectedSetIndex(rec.sets.length - 1);
    } else {
      // Fallback default values for unrecorded exercise
      setWeightKg(40);
      setReps(10);
      setSelectedSetIndex(null);
    }
  }, [selectedExerciseId, exerciseRecordsMap]);

  // Check if current inputs match the last recorded set
  const isSyncedWithLastSet = useMemo(() => {
    if (!currentRecord) return false;
    return (
      weightKg === currentRecord.lastSet.weightKg &&
      reps === currentRecord.lastSet.reps
    );
  }, [currentRecord, weightKg, reps]);

  const handleSyncLastSet = () => {
    if (!currentRecord) return;
    setWeightKg(currentRecord.lastSet.weightKg);
    setReps(currentRecord.lastSet.reps);
    setSelectedSetIndex(currentRecord.sets.length - 1);
  };

  const handleSelectRecordedSet = (set: LoggedSet, idx: number) => {
    setWeightKg(set.weightKg);
    setReps(set.reps);
    setSelectedSetIndex(idx);
  };

  // Calculate 1RM across scientific formulas
  const calculations = useMemo(() => {
    const safeWeight = Math.max(0, Number(weightKg) || 0);
    const safeReps = Math.max(1, Math.min(36, Math.round(Number(reps) || 1)));

    if (safeWeight <= 0) {
      return {
        epley: 0,
        brzycki: 0,
        lombardi: 0,
        active1RM: 0,
        zones: []
      };
    }

    if (safeReps === 1) {
      const zones = [
        { pct: 95, label: 'Força Máxima / Pico', repsRange: '1–2 reps', load: Math.round(safeWeight * 0.95) },
        { pct: 85, label: 'Força Pura', repsRange: '4–6 reps', load: Math.round(safeWeight * 0.85) },
        { pct: 75, label: 'Hipertrofia Miofibrilar', repsRange: '8–10 reps', load: Math.round(safeWeight * 0.75) },
        { pct: 65, label: 'Hipertrofia Metabólica', repsRange: '12–15 reps', load: Math.round(safeWeight * 0.65) }
      ];
      return {
        epley: Math.round(safeWeight),
        brzycki: Math.round(safeWeight),
        lombardi: Math.round(safeWeight),
        active1RM: Math.round(safeWeight),
        zones
      };
    }

    const epley = safeWeight * (1 + safeReps / 30);
    const brzycki = safeWeight * (36 / Math.max(1, 37 - safeReps));
    const lombardi = safeWeight * Math.pow(safeReps, 0.1);
    const media = (epley + brzycki) / 2;

    const rawActive =
      formula === 'epley' ? epley :
      formula === 'brzycki' ? brzycki : media;

    const active1RM = Math.round(rawActive);

    const zones = [
      { pct: 95, label: 'Força Máxima / Pico', repsRange: '1–2 reps', load: Math.round(active1RM * 0.95) },
      { pct: 85, label: 'Força Pura', repsRange: '4–6 reps', load: Math.round(active1RM * 0.85) },
      { pct: 75, label: 'Hipertrofia Miofibrilar', repsRange: '8–10 reps', load: Math.round(active1RM * 0.75) },
      { pct: 65, label: 'Hipertrofia Metabólica', repsRange: '12–15 reps', load: Math.round(active1RM * 0.65) }
    ];

    return {
      epley: Math.round(epley),
      brzycki: Math.round(brzycki),
      lombardi: Math.round(lombardi),
      active1RM,
      zones
    };
  }, [weightKg, reps, formula]);

  const formatDateBR = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div 
      id="one-rm-calculator-card"
      className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-base font-bold text-white">
              Calculadora de Carga Máxima Estimada (1RM)
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Selecione um exercício para carregar automaticamente sua última carga e repetições registradas ou simule novas metas.
          </p>
        </div>

        {/* Formula Selector */}
        <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-[#222222] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setFormula('epley')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${
              formula === 'epley'
                ? 'bg-[#D4FF00] text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Epley
          </button>
          <button
            type="button"
            onClick={() => setFormula('brzycki')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${
              formula === 'brzycki'
                ? 'bg-[#D4FF00] text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Brzycki
          </button>
          <button
            type="button"
            onClick={() => setFormula('media')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${
              formula === 'media'
                ? 'bg-[#D4FF00] text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Média Científica
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exercise Selection + Last Recorded Sets + Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Exercise Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-1rm-exercise" className="text-xs font-bold text-neutral-300">
                Exercício de Referência
              </label>
              <span className="text-[11px] text-neutral-400">
                {exerciseRecordsMap.size} {exerciseRecordsMap.size === 1 ? 'exercício com histórico' : 'exercícios com histórico'}
              </span>
            </div>
            <select
              id="select-1rm-exercise"
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#111111] border border-[#2B2B2B] text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D4FF00] transition-colors"
            >
              {exerciseOptions.some(o => o.hasRecord) && (
                <optgroup label="Com Registro Recente no Histórico">
                  {exerciseOptions.filter(o => o.hasRecord).map(opt => {
                    const rec = exerciseRecordsMap.get(opt.id);
                    return (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.muscle}) — Última: {rec?.lastSet.weightKg}kg × {rec?.lastSet.reps} reps
                      </option>
                    );
                  })}
                </optgroup>
              )}
              <optgroup label="Catálogo Completo de Exercícios">
                {exerciseOptions.filter(o => !o.hasRecord).map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.muscle}) — Sem registro prévio
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Last Recorded Workout Callout */}
          {currentRecord ? (
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <History className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
                  <span className="font-semibold text-white">Último Registro:</span>
                  <span className="text-neutral-400 font-mono tabular-nums">{formatDateBR(currentRecord.sessionDate)}</span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-neutral-400 truncate max-w-[200px] sm:max-w-[260px]">{currentRecord.sessionTitle}</span>
                </div>

                {!isSyncedWithLastSet ? (
                  <button
                    type="button"
                    id="btn-sync-last-load"
                    onClick={handleSyncLastSet}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4FF00]/15 hover:bg-[#D4FF00]/25 text-[#D4FF00] text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar Última Série ({currentRecord.lastSet.weightKg}kg × {currentRecord.lastSet.reps})</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sincronizado com a última série</span>
                  </span>
                )}
              </div>

              {/* Recorded Sets Selector */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-neutral-400">
                  Séries registradas nessa sessão (clique para usar no cálculo):
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRecord.sets.map((s, idx) => {
                    const isSelected = selectedSetIndex === idx && weightKg === s.weightKg && reps === s.reps;
                    const isLast = idx === currentRecord.sets.length - 1;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectRecordedSet(s, idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#D4FF00] text-black border-[#D4FF00] font-bold'
                            : 'bg-[#181818] text-neutral-300 border-[#2B2B2B] hover:border-neutral-500'
                        }`}
                      >
                        <span>S{s.setNumber}: {s.weightKg}kg × {s.reps}</span>
                        {isLast && (
                          <span className={`text-[10px] font-sans font-semibold ${isSelected ? 'text-black/80' : 'text-[#D4FF00]'}`}>
                            · Última
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-between gap-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>
                  Nenhum treino registrado ainda para este exercício. Insira a carga e repetições abaixo para estimar seu 1RM inicial.
                </span>
              </div>
            </div>
          )}

          {/* Weight & Reps Interactive Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight Control */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-1rm-weight" className="text-xs font-bold text-neutral-300">
                  Carga Utilizada (kg)
                </label>
                <span className="text-[11px] font-mono text-neutral-500">Passo: 2.5 kg</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWeightKg(prev => Math.max(1, Number((prev - 2.5).toFixed(1))));
                    setSelectedSetIndex(null);
                  }}
                  className="w-10 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-white font-mono font-bold text-sm transition-colors shrink-0"
                  aria-label="Diminuir carga em 2.5 kg"
                >
                  -2.5
                </button>
                <input
                  id="input-1rm-weight"
                  type="number"
                  min={1}
                  max={600}
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(Math.max(0, parseFloat(e.target.value) || 0));
                    setSelectedSetIndex(null);
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-[#161616] border border-[#2E2E2E] text-center text-white font-mono tabular-nums font-bold text-base focus:outline-none focus:border-[#D4FF00]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setWeightKg(prev => Math.min(600, Number((prev + 2.5).toFixed(1))));
                    setSelectedSetIndex(null);
                  }}
                  className="w-10 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-white font-mono font-bold text-sm transition-colors shrink-0"
                  aria-label="Aumentar carga em 2.5 kg"
                >
                  +2.5
                </button>
              </div>
            </div>

            {/* Reps Control */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-1rm-reps" className="text-xs font-bold text-neutral-300">
                  Repetições Completas
                </label>
                <span className="text-[11px] text-neutral-500">
                  {reps <= 10 ? 'Precisão Alta' : 'Precisão Moderada'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReps(prev => Math.max(1, prev - 1));
                    setSelectedSetIndex(null);
                  }}
                  className="w-10 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-white font-mono font-bold text-sm transition-colors shrink-0"
                  aria-label="Diminuir 1 repetição"
                >
                  -1
                </button>
                <input
                  id="input-1rm-reps"
                  type="number"
                  min={1}
                  max={36}
                  step="1"
                  value={reps}
                  onChange={(e) => {
                    setReps(Math.max(1, Math.min(36, parseInt(e.target.value, 10) || 1)));
                    setSelectedSetIndex(null);
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-[#161616] border border-[#2E2E2E] text-center text-white font-mono tabular-nums font-bold text-base focus:outline-none focus:border-[#D4FF00]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setReps(prev => Math.min(36, prev + 1));
                    setSelectedSetIndex(null);
                  }}
                  className="w-10 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-white font-mono font-bold text-sm transition-colors shrink-0"
                  aria-label="Aumentar 1 repetição"
                >
                  +1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Estimated 1RM Result + Training Zones Table (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-4">
          {/* Primary 1RM Display */}
          <div className="space-y-2 border-b border-[#222222] pb-4">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Carga Máxima Estimada (1RM)</span>
              <span className="font-mono tabular-nums text-neutral-300">
                Base: {weightKg} kg × {reps} {reps === 1 ? 'rep' : 'reps'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <span 
                  id="estimated-1rm-value"
                  className="text-4xl font-bold text-[#D4FF00] font-mono tabular-nums tracking-tight"
                >
                  {calculations.active1RM}
                </span>
                <span className="text-base font-bold text-neutral-400">kg</span>
              </div>

              {currentRecord && currentRecord.historicalBest1RM > 0 && (
                <div className="text-right text-xs">
                  <span className="text-neutral-400">Recorde histórico: </span>
                  <span className="font-mono tabular-nums font-bold text-white">
                    {currentRecord.historicalBest1RM} kg
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono tabular-nums pt-1">
              <span>Epley: {calculations.epley} kg</span>
              <span>·</span>
              <span>Brzycki: {calculations.brzycki} kg</span>
              <span>·</span>
              <span>Lombardi: {calculations.lombardi} kg</span>
            </div>
          </div>

          {/* Training Percentage Zones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300">Zonas de Prescrição de Treino</span>
              <span className="text-[11px] text-neutral-500">% da 1RM</span>
            </div>

            <div className="divide-y divide-[#1E1E1E] text-xs">
              {calculations.zones.map((z) => (
                <div key={z.pct} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono tabular-nums font-bold text-[#D4FF00] w-9 shrink-0">
                      {z.pct}%
                    </span>
                    <span className="text-neutral-200 truncate">{z.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                    <span className="text-neutral-400 text-[11px]">{z.repsRange}</span>
                    <span className="text-white font-bold w-14 text-right">{z.load} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
