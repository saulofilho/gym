import React, { useState } from 'react';
import { X, Play, AlertTriangle, Lightbulb, Dumbbell, History, ShieldCheck, ExternalLink } from 'lucide-react';
import { Exercise } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onStartExercise: (exercise: Exercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onStartExercise
}) => {
  const { getLastLoadForExercise, getExerciseMax1RM } = useWorkout();
  const [activeTab, setActiveTab] = useState<'video-postura' | 'historico'>('video-postura');

  if (!exercise) return null;

  const lastLoads = getLastLoadForExercise(exercise.id);
  const max1RM = getExerciseMax1RM(exercise.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        id="exercise-modal-card"
        className="relative w-full max-w-3xl bg-[#161616] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#222222] bg-[#111111]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30">
                {exercise.primaryMuscle}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                exercise.level === 'iniciante' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
              }`}>
                {exercise.level === 'iniciante' ? 'Iniciante' : 'Avançado'}
              </span>
              <span className="text-xs text-neutral-400 hidden sm:inline">• {exercise.equipment}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{exercise.name}</h2>
          </div>
          <button
            id="btn-close-exercise-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#222222] px-6 pt-2 bg-[#111111]/40">
          <button
            onClick={() => setActiveTab('video-postura')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'video-postura'
                ? 'border-[#D4FF00] text-[#D4FF00]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Vídeo & Biomecânica</span>
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'historico'
                ? 'border-[#D4FF00] text-[#D4FF00]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Meu Histórico de Cargas</span>
            {max1RM > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[#D4FF00]/10 text-[#D4FF00] font-mono">
                1RM: {max1RM}kg
              </span>
            )}
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'video-postura' ? (
            <>
              {/* Video Embed Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1 font-semibold text-neutral-300">
                    <Play className="w-3.5 h-3.5 text-[#D4FF00] fill-[#D4FF00]" />
                    Demonstração Técnica da Postura
                  </span>
                  <a 
                    href={`https://www.youtube.com/watch?v=${exercise.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#D4FF00]/80 hover:text-[#D4FF00] transition-colors"
                  >
                    <span>Abrir no YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#222222] shadow-inner">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${exercise.youtubeId}?rel=0&modestbranding=1`}
                    title={exercise.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              {/* Coach Tip Callout */}
              {exercise.coachTips && (
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333] flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#D4FF00]/10 text-[#D4FF00] shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#D4FF00]">Dica de Ouro do Treinador</h4>
                    <p className="text-sm text-neutral-200 leading-relaxed mt-0.5">
                      {exercise.coachTips}
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Setup */}
                <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>1. Setup & Posicionamento</span>
                  </div>
                  <ul className="space-y-2">
                    {(exercise.setupInstructions || []).map((step, idx) => (
                      <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#1A1A1A] border border-[#333333] text-neutral-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Execution */}
                <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Dumbbell className="w-4 h-4 text-[#D4FF00]" />
                    <span>2. Execução Biomecânica</span>
                  </div>
                  <ul className="space-y-2">
                    {(exercise.executionSteps || []).map((step, idx) => (
                      <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#D4FF00]/10 text-[#D4FF00] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Common Mistakes */}
              {(exercise.commonMistakes && exercise.commonMistakes.length > 0) && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Erros Comuns (Evite a todo custo)</span>
                  </div>
                  <ul className="space-y-1.5">
                    {exercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-xs text-rose-200/90 flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            /* Historical Loads Tab */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] text-center">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">1RM Estimado Máximo</span>
                  <div className="text-3xl font-bold text-[#D4FF00] mt-1">
                    {max1RM > 0 ? `${max1RM} kg` : 'Sem registro'}
                  </div>
                  <span className="text-[11px] text-neutral-400">Fórmula de Epley / Brzycki</span>
                </div>

                <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] text-center">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Séries Recomendadas</span>
                  <div className="text-3xl font-bold text-white mt-1">
                    {exercise.defaultSets} × {exercise.defaultReps}
                  </div>
                  <span className="text-[11px] text-neutral-400">Descanso: {exercise.defaultRestSeconds}s</span>
                </div>
              </div>

              {lastLoads && lastLoads.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                    <History className="w-4 h-4 text-[#D4FF00]" />
                    Últimas Séries Registradas na Academia:
                  </h4>
                  <div className="bg-[#0A0A0A] rounded-xl border border-[#222222] overflow-hidden divide-y divide-[#222222]">
                    {lastLoads.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 text-xs">
                        <span className="font-bold text-neutral-400">Série {s.setNumber}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#D4FF00] font-mono text-sm">{s.weightKg} kg</span>
                          <span className="text-neutral-300 font-medium">{s.reps} reps</span>
                          {s.rpe && (
                            <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-neutral-400 text-[10px]">
                              RPE {s.rpe}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-emerald-400/90 font-medium pt-1">
                    💡 Dica de sobrecarga: para a próxima sessão, tente aumentar 1 repetição na última série ou adicione 1 a 2 kg mantendo a boa técnica!
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#111111] border border-[#222222] text-center space-y-2">
                  <Dumbbell className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">Nenhuma carga registrada para este exercício ainda</p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Clique em "Iniciar Treino com este Exercício" para registrar suas primeiras séries e acompanhar sua progressão de força!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#222222] bg-[#111111] flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            Tempo de descanso: <strong className="text-neutral-200">{exercise.defaultRestSeconds}s</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors"
            >
              Fechar
            </button>
            <button
              id="btn-start-single-exercise"
              onClick={() => {
                onClose();
                onStartExercise(exercise);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#D4FF00] hover:brightness-95 text-black shadow-md shadow-[rgba(212,255,0,0.2)] transition-all"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Registrar Carga Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
