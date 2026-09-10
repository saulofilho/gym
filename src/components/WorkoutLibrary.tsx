import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, Play, Sparkles, Filter, Search, ChevronRight, 
  Flame, Clock, Calendar, CheckCircle2, Award
} from 'lucide-react';
import { WORKOUT_PROGRAMS } from '../data/workoutsData';
import { EXERCISES_DATABASE } from '../data/exercisesData';
import { Exercise, WorkoutProgram, FitnessLevel, MuscleGroup } from '../types';
import { useWorkout } from '../context/WorkoutContext';
import { DailyTipCard } from './DailyTipCard';
import { DailyWorkoutGoals } from './DailyWorkoutGoals';

interface WorkoutLibraryProps {
  onSelectExercise: (exercise: Exercise) => void;
  onOpenCustomGenerator: () => void;
  onNavigateToTab?: (tab: 'treinos' | 'progresso' | 'nutricao' | 'chat' | 'vip') => void;
}

export const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({
  onSelectExercise,
  onOpenCustomGenerator,
  onNavigateToTab
}) => {
  const { startWorkout, startQuickWorkoutWithExercise, customPrograms, userProfile } = useWorkout();

  const [selectedLevel, setSelectedLevel] = useState<'todos' | FitnessLevel>('todos');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'fichas' | 'exercicios'>('fichas');
  const [selectedProgramPreview, setSelectedProgramPreview] = useState<WorkoutProgram | null>(null);

  const allPrograms = useMemo(() => {
    return [...customPrograms, ...WORKOUT_PROGRAMS];
  }, [customPrograms]);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter(p => {
      if (selectedLevel !== 'todos' && p.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allPrograms, selectedLevel, searchQuery]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return EXERCISES_DATABASE.filter(e => {
      if (selectedLevel !== 'todos' && e.level !== selectedLevel) return false;
      if (selectedMuscle !== 'todos') {
        const isPrimary = e.primaryMuscle.toLowerCase() === selectedMuscle.toLowerCase();
        const isSecondary = e.secondaryMuscles.some(m => m.toLowerCase() === selectedMuscle.toLowerCase());
        if (!isPrimary && !isSecondary) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.primaryMuscle.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedLevel, selectedMuscle, searchQuery]);

  const muscleFilters = [
    'todos', 'Peito', 'Costas', 'Quadríceps', 'Posterior', 'Glúteos', 'Ombros', 'Bíceps', 'Tríceps'
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#161616] border border-[#222222] p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-[#D4FF00] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guia Oficial de Treino & Biomecânica</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Treine com Propósito e <span className="text-[#D4FF00]">Progressione Cargas</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Fichas estruturadas para alunos do primeiro dia ao estágio avançado. Vídeos didáticos de postura, registro série a série e prevenção de lesões.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-switch-to-fichas"
              onClick={() => setViewMode('fichas')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                viewMode === 'fichas'
                  ? 'bg-[#D4FF00] text-black shadow-md shadow-[rgba(212,255,0,0.2)]'
                  : 'bg-[#1A1A1A] border border-[#222222] text-neutral-300 hover:text-white'
              }`}
            >
              Fichas Prontas ({allPrograms.length})
            </button>
            <button
              id="btn-switch-to-exercicios"
              onClick={() => setViewMode('exercicios')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                viewMode === 'exercicios'
                  ? 'bg-[#D4FF00] text-black shadow-md shadow-[rgba(212,255,0,0.2)]'
                  : 'bg-[#1A1A1A] border border-[#222222] text-neutral-300 hover:text-white'
              }`}
            >
              Banco de Exercícios com Vídeo ({EXERCISES_DATABASE.length})
            </button>

            <button
              id="btn-open-ai-generator"
              onClick={onOpenCustomGenerator}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/10 text-xs sm:text-sm font-bold transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#D4FF00]" />
              <span>Gerar Treino Personalizado VIP</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#D4FF00]/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Seção de Metas de Treino Diário & Frequência Semanal */}
      <DailyWorkoutGoals 
        onStartSuggestedWorkout={() => {
          if (filteredPrograms.length > 0) {
            startWorkout(filteredPrograms[0]);
          }
        }}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Dica do Dia (Forma, Nutrição ou Motivação) */}
      <DailyTipCard 
        onSelectExercise={onSelectExercise}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#161616] border border-[#222222]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={viewMode === 'fichas' ? "Buscar ficha por nome ou objetivo..." : "Buscar exercício por nome, músculo ou aparelho..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg bg-[#222222] border border-[#333333] text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4FF00] transition-colors"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-neutral-400 mr-1 hidden sm:inline">Nível:</span>
          {(['todos', 'iniciante', 'avancado'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedLevel === lvl
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              {lvl === 'todos' ? 'Todos os Níveis' : lvl === 'iniciante' ? 'Iniciantes' : 'Avançados'}
            </button>
          ))}
        </div>
      </div>

      {/* Muscle Sub-filters (when viewing exercises) */}
      {viewMode === 'exercicios' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-neutral-400 whitespace-nowrap">Grupamento:</span>
          {muscleFilters.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                selectedMuscle === m
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'bg-[#161616] border border-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* View: Programs List */}
      {viewMode === 'fichas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            return (
              <div
                key={program.id}
                id={`program-card-${program.id}`}
                className={`flex flex-col justify-between rounded-2xl p-6 border transition-all duration-300 hover:translate-y-[-2px] ${
                  program.isPremium
                    ? 'bg-[#161616] border-[#D4FF00]/30 hover:border-[#D4FF00]/60'
                    : 'bg-[#161616] border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        program.level === 'iniciante'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/25'
                      }`}>
                        {program.level === 'iniciante' ? 'Iniciante' : 'Avançado'}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">
                        {program.daysPerWeek}x na semana
                      </span>
                    </div>

                    {program.isPremium && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">
                        <Award className="w-3 h-3 text-[#D4FF00]" />
                        VIP
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{program.title}</h3>
                    <p className="text-xs text-[#D4FF00] font-semibold mt-0.5">{program.split}</p>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                    {program.tagline || program.description}
                  </p>

                  {/* Highlights */}
                  {(program.focusAreas && program.focusAreas.length > 0) && (
                    <div className="space-y-1.5 pt-2 border-t border-[#222222]">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Foco desta ficha:</span>
                      <ul className="space-y-1">
                        {program.focusAreas.map((area, aIdx) => (
                          <li key={aIdx} className="text-xs text-neutral-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Exercises count preview */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-neutral-400" />
                      {(program.exercises || []).length} exercícios estruturados
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      ~{program.durationMin || 45} min
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-6 mt-4 border-t border-[#222222] flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProgramPreview(program)}
                    className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-neutral-200 text-xs font-bold transition-colors border border-[#333333]"
                  >
                    Ver Exercícios
                  </button>
                  <button
                    id={`btn-start-program-${program.id}`}
                    onClick={() => startWorkout(program)}
                    className="flex-1 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black text-xs font-bold shadow-md shadow-[rgba(212,255,0,0.2)] transition-all"
                  >
                    Iniciar Treino
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View: Exercises Encyclopedia */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              id={`exercise-card-${exercise.id}`}
              className="flex flex-col justify-between rounded-2xl bg-[#161616] border border-[#222222] hover:border-[#333333] transition-all p-5 space-y-4"
            >
              <div className="space-y-3">
                {/* Muscle and Level badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/20">
                      {exercise.primaryMuscle}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      exercise.level === 'iniciante' 
                        ? 'bg-emerald-500/15 text-emerald-300' 
                        : 'bg-indigo-500/15 text-indigo-300'
                    }`}>
                      {exercise.level === 'iniciante' ? 'Iniciante' : 'Avançado'}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{exercise.equipment}</span>
                </div>

                {/* Video thumbnail preview */}
                <div 
                  onClick={() => onSelectExercise(exercise)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#222222] cursor-pointer group shadow-md"
                >
                  <img
                    src={`https://img.youtube.com/vi/${exercise.youtubeId}/hqdefault.jpg`}
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#D4FF00] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold text-white bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <span className="bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm inline-block">Vídeo Didático</span>
                    <span className="text-[#D4FF00]">Postura Correta</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{exercise.name}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {exercise.coachTips || exercise.setupInstructions[0]}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-[#222222]">
                  <span>Recomendado: <strong className="text-neutral-200">{exercise.defaultSets} × {exercise.defaultReps}</strong></span>
                  <span>Descanso: <strong className="text-neutral-200">{exercise.defaultRestSeconds}s</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onSelectExercise(exercise)}
                  className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#333333]"
                >
                  <Play className="w-3.5 h-3.5 text-[#D4FF00] fill-[#D4FF00]" />
                  <span>Vídeo & Postura</span>
                </button>
                <button
                  onClick={() => startQuickWorkoutWithExercise(exercise)}
                  className="flex-1 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Treinar Agora</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Exercises Preview Drawer/Modal */}
      {selectedProgramPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#161616] border border-[#222222] rounded-2xl p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">
                  {selectedProgramPreview.split}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1.5">{selectedProgramPreview.title}</h3>
                <p className="text-xs text-neutral-400">{selectedProgramPreview.description}</p>
              </div>
              <button
                onClick={() => setSelectedProgramPreview(null)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Lista de Exercícios da Sessão ({(selectedProgramPreview.exercises || []).length}):
              </h4>
              <div className="divide-y divide-[#222222] border border-[#222222] rounded-xl overflow-hidden bg-[#111111]">
                {(selectedProgramPreview.exercises || []).map((pEx, idx) => {
                  const def = EXERCISES_DATABASE.find(e => e.id === pEx.exerciseId);
                  if (!def) return null;

                  return (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#1A1A1A]/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#222222] text-neutral-300 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-white">{def.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-neutral-400">
                            {def.primaryMuscle}
                          </span>
                        </div>
                        {pEx.note && (
                          <p className="text-xs text-[#D4FF00]/90 italic pl-7">{pEx.note}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <span className="font-bold text-[#D4FF00]">{pEx.targetSets} séries</span>
                          <span className="text-neutral-400 block">{pEx.targetReps} reps • {pEx.restSeconds}s</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProgramPreview(null);
                            onSelectExercise(def);
                          }}
                          className="p-2 rounded-lg bg-[#222222] hover:bg-[#333333] text-[#D4FF00]"
                          title="Ver vídeo e postura"
                        >
                          <Play className="w-4 h-4 fill-[#D4FF00]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProgramPreview(null)}
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  const prog = selectedProgramPreview;
                  setSelectedProgramPreview(null);
                  startWorkout(prog);
                }}
                className="px-6 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)]"
              >
                Iniciar Este Treino Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
