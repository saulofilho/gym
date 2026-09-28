import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Flame } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseSetsBarChartProps {
  exerciseId: string;
  exerciseName?: string;
  compact?: boolean;
}

interface SetPoint {
  id: string;
  label: string;
  dateLabel: string;
  weightKg: number;
  reps: number;
  rpe: number;
  isLive?: boolean;
}

export const ExerciseSetsBarChart: React.FC<ExerciseSetsBarChartProps> = ({
  exerciseId,
  exerciseName,
  compact = false
}) => {
  const { workoutHistory, activeWorkout } = useWorkout();

  // Gather the last 5 sets for the selected exercise (chronological order: oldest -> newest)
  const lastFiveSets = useMemo<SetPoint[]>(() => {
    const collected: SetPoint[] = [];

    // 1. From saved workoutHistory (workoutHistory is stored newest-first, so iterate reversed for chronological)
    const chronologicalSessions = [...(workoutHistory || [])].reverse();
    chronologicalSessions.forEach((session) => {
      const match = (session.exercises || []).find((e) => e.exerciseId === exerciseId);
      if (match && Array.isArray(match.sets)) {
        const shortDate = session.date
          ? session.date.split('-').slice(1).reverse().join('/')
          : 'Hist.';
        match.sets.forEach((s, idx) => {
          if (s.weightKg > 0 && s.reps > 0) {
            collected.push({
              id: `${session.id}-${idx}`,
              label: `S${s.setNumber || idx + 1}`,
              dateLabel: shortDate,
              weightKg: s.weightKg,
              reps: s.reps,
              rpe: Math.min(10, Math.max(1, Number(s.rpe ?? 8))),
              isLive: false
            });
          }
        });
      }
    });

    // 2. Include sets from activeWorkout if this exercise is currently being logged
    if (activeWorkout) {
      const activeEx = activeWorkout.exercises.find((e) => e.exercise.id === exerciseId);
      if (activeEx && Array.isArray(activeEx.sets)) {
        activeEx.sets.forEach((s, idx) => {
          if (s.completed && s.weightKg > 0 && s.reps > 0) {
            collected.push({
              id: `active-${idx}`,
              label: `S${s.setNumber || idx + 1}`,
              dateLabel: 'Hoje',
              weightKg: s.weightKg,
              reps: s.reps,
              rpe: Math.min(10, Math.max(1, Number(s.rpe ?? 8))),
              isLive: true
            });
          }
        });
      }
    }

    return collected.slice(-5);
  }, [workoutHistory, activeWorkout, exerciseId]);

  if (lastFiveSets.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-neutral-500" />
          <span>Conclua ou registre séries neste exercício para visualizar o gráfico de evolução (Carga × RPE).</span>
        </div>
      </div>
    );
  }

  const maxWeight = Math.max(...lastFiveSets.map((s) => s.weightKg), 20);
  const firstSet = lastFiveSets[0];
  const latestSet = lastFiveSets[lastFiveSets.length - 1];
  const weightDelta = Number((latestSet.weightKg - firstSet.weightKg).toFixed(1));
  const avgRpe = Number(
    (lastFiveSets.reduce((acc, s) => acc + s.rpe, 0) / lastFiveSets.length).toFixed(1)
  );

  const getRpeBarClasses = (rpe: number) => {
    if (rpe >= 10) return 'bg-rose-500 border-rose-400 text-rose-300';
    if (rpe >= 9) return 'bg-amber-400 border-amber-300 text-amber-300';
    if (rpe >= 7) return 'bg-emerald-400 border-emerald-300 text-emerald-300';
    return 'bg-sky-400 border-sky-300 text-sky-300';
  };

  const getRpeBadgeText = (rpe: number) => {
    if (rpe >= 10) return 'text-rose-400';
    if (rpe >= 9) return 'text-amber-300';
    if (rpe >= 7) return 'text-emerald-400';
    return 'text-sky-300';
  };

  return (
    <div
      id={`exercise-sets-barchart-${exerciseId}`}
      className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-[#242424] space-y-4"
    >
      {/* Header & Summary KPIs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4FF00]/15 border border-[#D4FF00]/30 text-[#D4FF00] flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-bold text-white">
                Evolução nas Últimas {lastFiveSets.length} Séries
              </span>
              {exerciseName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-300 truncate max-w-[180px] sm:max-w-[240px]">
                    {exerciseName}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Comparativo direto entre Carga levantada (kg) e Esforço Percebido (RPE 1–10)
            </p>
          </div>
        </div>

        {/* Delta & Average RPE Summary */}
        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
          <div className="px-2.5 py-1 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="text-neutral-400">Carga:</span>
            <span
              className={`font-bold ${
                weightDelta > 0
                  ? 'text-[#D4FF00]'
                  : weightDelta < 0
                  ? 'text-amber-300'
                  : 'text-white'
              }`}
            >
              {weightDelta > 0 ? `+${weightDelta}kg` : `${weightDelta}kg`}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-400">RPE Médio:</span>
            <span className={`font-bold ${getRpeBadgeText(avgRpe)}`}>{avgRpe}</span>
          </div>
        </div>
      </div>

      {/* Pure CSS / DOM Paired Bar Chart */}
      <div className="pt-2">
        <div
          className={`grid grid-cols-5 gap-2 sm:gap-4 items-end ${
            compact ? 'h-36' : 'h-44'
          } px-2 pt-6 pb-2 rounded-xl bg-[#0B0B0B] border border-[#1E1E1E] relative`}
        >
          {/* Horizontal Reference Grid Lines */}
          <div className="pointer-events-none absolute inset-x-3 top-6 bottom-8 flex flex-col justify-between opacity-25">
            <div className="border-b border-dashed border-neutral-600 w-full" />
            <div className="border-b border-dashed border-neutral-700 w-full" />
            <div className="border-b border-dashed border-neutral-700 w-full" />
          </div>

          {lastFiveSets.map((item, idx) => {
            // Scale bar heights between 18% and 100% for clear visual contrast
            const weightHeightPct = Math.max(
              18,
              Math.min(100, Math.round((item.weightKg / maxWeight) * 100))
            );
            const rpeHeightPct = Math.max(
              18,
              Math.min(100, Math.round((item.rpe / 10) * 100))
            );
            const isLatest = idx === lastFiveSets.length - 1;

            return (
              <div
                key={item.id}
                className="relative z-10 flex flex-col items-center justify-end h-full group"
              >
                {/* Top Numeric Callouts */}
                <div className="flex items-center justify-center gap-1.5 mb-1.5 text-[10px] sm:text-[11px] font-mono tabular-nums leading-none">
                  <span className="font-bold text-[#D4FF00]" title={`Carga: ${item.weightKg}kg × ${item.reps} reps`}>
                    {item.weightKg}kg
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span
                    className={`font-bold ${getRpeBadgeText(item.rpe)}`}
                    title={`Esforço Percebido: RPE ${item.rpe}/10`}
                  >
                    R{item.rpe}
                  </span>
                </div>

                {/* Paired Vertical Bars Container */}
                <div className="w-full max-w-[64px] flex-1 flex items-end justify-center gap-1.5 sm:gap-2 px-1">
                  {/* Load (kg) Bar */}
                  <div className="flex-1 h-full flex items-end">
                    <div
                      style={{ height: `${weightHeightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 bg-gradient-to-t from-[#99B800] to-[#D4FF00] ${
                        isLatest ? 'ring-1 ring-[#D4FF00] shadow-[0_0_12px_rgba(212,255,0,0.25)]' : 'opacity-90'
                      }`}
                      title={`Série ${idx + 1}: ${item.weightKg} kg × ${item.reps} repetições`}
                    />
                  </div>

                  {/* RPE (1-10) Bar */}
                  <div className="flex-1 h-full flex items-end">
                    <div
                      style={{ height: `${rpeHeightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 border-t ${getRpeBarClasses(
                        item.rpe
                      )}`}
                      title={`Série ${idx + 1}: RPE ${item.rpe} / 10`}
                    />
                  </div>
                </div>

                {/* X-Axis Set Label */}
                <div className="mt-2 text-center leading-tight">
                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-mono tabular-nums font-bold text-neutral-200">
                    <span>{item.label}</span>
                    <span className="text-neutral-400 font-normal">({item.reps}r)</span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500 block">
                    {item.isLive ? 'Agora' : item.dateLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D4FF00] inline-block" />
            <strong className="text-neutral-200">Barra Esquerda:</strong> Carga (kg)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" />
            <strong className="text-neutral-200">Barra Direita:</strong> RPE (7–8 Ideal ·{' '}
            <span className="text-amber-300">9 Intenso</span> ·{' '}
            <span className="text-rose-400">10 Falha</span>)
          </span>
        </div>
        <span className="font-mono text-[10px] text-neutral-500">
          Última série: {latestSet.weightKg}kg × {latestSet.reps} (RPE {latestSet.rpe})
        </span>
      </div>
    </div>
  );
};
