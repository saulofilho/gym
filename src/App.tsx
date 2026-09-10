import React, { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { Navbar } from './components/Navbar';
import { WorkoutLibrary } from './components/WorkoutLibrary';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { ProgressDashboard } from './components/ProgressDashboard';
import { NutritionHub } from './components/NutritionHub';
import { CoachChat } from './components/CoachChat';
import { PremiumModal } from './components/PremiumModal';
import { CustomWorkoutGenerator } from './components/CustomWorkoutGenerator';
import { Exercise, WorkoutProgram } from './types';
import { Dumbbell, Sparkles, Award, TrendingUp, ShieldCheck, Heart, Github } from 'lucide-react';

const AppContent: React.FC = () => {
  const { startWorkout, userProfile } = useWorkout();

  const [activeTab, setActiveTab] = useState<'treinos' | 'progresso' | 'nutricao' | 'chat' | 'vip'>('treinos');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);

  const handleStartExerciseQuick = (exercise: Exercise) => {
    // Will start quick workout with this exercise
    const quickProgram: WorkoutProgram = {
      id: `quick-${exercise.id}-${Date.now()}`,
      title: `Treino de ${exercise.name}`,
      tagline: `Registro de cargas individual para ${exercise.primaryMuscle}`,
      description: `Sessão focada na progressão de carga de ${exercise.name}.`,
      level: exercise.level,
      daysPerWeek: 1,
      durationMin: 30,
      split: exercise.primaryMuscle,
      focusAreas: [exercise.primaryMuscle],
      exercises: [
        {
          exerciseId: exercise.id,
          targetSets: exercise.defaultSets,
          targetReps: `${exercise.defaultReps} reps`,
          restSeconds: exercise.defaultRestSeconds,
          note: exercise.coachTips
        }
      ]
    };
    startWorkout(quickProgram);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] flex flex-col font-sans selection:bg-[#D4FF00] selection:text-black">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'treinos' && (
          <WorkoutLibrary
            onSelectExercise={(exercise) => setSelectedExerciseForModal(exercise)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenCustomGenerator={() => {
              if (userProfile.isPremium) {
                setIsAiGeneratorOpen(true);
              } else {
                setIsPremiumModalOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'progresso' && (
          <ProgressDashboard 
            onOpenPremiumModal={() => setIsPremiumModalOpen(true)} 
          />
        )}

        {activeTab === 'nutricao' && (
          <NutritionHub />
        )}

        {activeTab === 'chat' && (
          <CoachChat />
        )}

        {activeTab === 'vip' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#161616] border border-[#222222] text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center mx-auto shadow-lg shadow-[rgba(212,255,0,0.25)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Assinatura Premium AcademiaPro
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Desbloqueie treinos 100% personalizados por inteligência artificial, análise de dados avançada e acompanhamento remoto constante da sua evolução.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  id="btn-open-vip-generator-tab"
                  onClick={() => setIsAiGeneratorOpen(true)}
                  className="px-6 py-3.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-sm shadow-md shadow-[rgba(212,255,0,0.2)] flex items-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Treino Personalizado com IA</span>
                </button>

                <button
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="px-6 py-3.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-white font-semibold text-sm border border-[#333333] transition-colors"
                >
                  Gerenciar Minha Assinatura
                </button>
              </div>
            </div>

            {/* VIP Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-3">
                <div className="p-3 rounded-xl bg-[#D4FF00]/10 text-[#D4FF00] w-fit">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Treinos Adaptados à Sua Vida</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Defina dias disponíveis, focos em pontos fracos e limitações articulares. A IA estrutura a melhor periodização em segundos.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-3">
                <div className="p-3 rounded-xl bg-[#D4FF00]/10 text-[#D4FF00] w-fit">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Análise de Dados Avançada</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Gráficos de sobrecarga progressiva, cálculo de 1RM com detecção precoce de estagnação e fadiga muscular.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-3">
                <div className="p-3 rounded-xl bg-[#D4FF00]/10 text-[#D4FF00] w-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Acompanhamento Remoto</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Auditorias técnicas da sua consistência com feedbacks detalhados e contato direto com nossos 4 treinadores.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
        onStartExercise={handleStartExerciseQuick}
      />

      <ActiveWorkoutModal
        onOpenExerciseDetail={(exercise) => setSelectedExerciseForModal(exercise)}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onOpenGenerator={() => setIsAiGeneratorOpen(true)}
      />

      <CustomWorkoutGenerator
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onStartGeneratedWorkout={(prog) => startWorkout(prog)}
      />

      {/* Footer */}
      <footer className="border-t border-[#222222] bg-[#0A0A0A] py-8 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#D4FF00] text-black flex items-center justify-center font-bold text-xs">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">AcademiaPro</span>
            <span className="text-neutral-500">• Treinamento Inteligente & Nutrição Científica</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Iniciante ao Avançado</span>
            <span className="text-neutral-600">•</span>
            <span>Progressão de Carga</span>
            <span className="text-neutral-600">•</span>
            <span>Design Elegant Dark</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}
