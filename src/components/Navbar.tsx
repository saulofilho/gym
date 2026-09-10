import React from 'react';
import { Dumbbell, Flame, Sparkles, Trophy, Calendar, BookOpen, Utensils, MessageSquare, Award } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface NavbarProps {
  activeTab: 'treinos' | 'progresso' | 'nutricao' | 'chat' | 'vip';
  setActiveTab: (tab: 'treinos' | 'progresso' | 'nutricao' | 'chat' | 'vip') => void;
  onOpenPremiumModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenPremiumModal }) => {
  const { userProfile, activeWorkout, monthlyCompletedCount } = useWorkout();

  return (
    <header className="sticky top-0 z-30 bg-[#111111]/95 backdrop-blur border-b border-[#222222]">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            id="nav-logo"
            onClick={() => setActiveTab('treinos')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-md bg-[#D4FF00] flex items-center justify-center text-black font-bold shadow-md shadow-[rgba(212,255,0,0.25)] group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Academia<span className="text-[#D4FF00]">Pro</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A1A1A] text-neutral-400 border border-[#333333]">
                  {userProfile.level === 'iniciante' ? 'Iniciante' : 'Avançado'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">Treino Inteligente, Cargas & Nutrição</p>
            </div>
          </div>

          {/* Active Workout Indicator (if workout ongoing) */}
          {activeWorkout && (
            <div 
              id="active-workout-pill"
              onClick={() => setActiveTab('treinos')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#D4FF00]/40 text-[#D4FF00] text-xs font-semibold cursor-pointer animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-[#D4FF00]"></span>
              <span className="hidden sm:inline">Treino em Andamento:</span>
              <span className="font-mono font-bold">
                {Math.floor(activeWorkout.elapsedSeconds / 60)}:{(activeWorkout.elapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* User Status Badges */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div 
              id="streak-badge"
              title={`${userProfile.streakDays} dias de consistência seguidos`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161616] border border-[#222222] text-xs text-neutral-300"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white">{userProfile.streakDays}</span>
              <span className="hidden md:inline text-neutral-400">dias</span>
            </div>

            {/* Monthly Workouts */}
            <div 
              id="monthly-workouts-badge"
              title={`${monthlyCompletedCount} treinos neste mês`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161616] border border-[#222222] text-xs text-neutral-300"
            >
              <Trophy className="w-4 h-4 text-[#D4FF00]" />
              <span className="font-bold text-white">{monthlyCompletedCount}</span>
              <span className="text-neutral-400">no mês</span>
            </div>

            {/* VIP Subscription Button */}
            <button
              id="btn-vip-subscription"
              onClick={onOpenPremiumModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                userProfile.isPremium
                  ? 'bg-gradient-to-br from-[#D4FF00] to-[#A0C400] text-black shadow-md shadow-[rgba(212,255,0,0.2)] hover:brightness-105'
                  : 'bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-[#D4FF00] hover:bg-[#D4FF00]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{userProfile.isPremium ? 'VIP Ativo' : 'Seja VIP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-[#222222] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
            <button
              id="tab-treinos"
              onClick={() => setActiveTab('treinos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'treinos'
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Fichas & Exercícios</span>
            </button>

            <button
              id="tab-progresso"
              onClick={() => setActiveTab('progresso')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'progresso'
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Progresso & Cargas</span>
            </button>

            <button
              id="tab-nutricao"
              onClick={() => setActiveTab('nutricao')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'nutricao'
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Nutrição Básica</span>
            </button>

            <button
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat com Treinadores</span>
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'chat' ? 'bg-black' : 'bg-emerald-400 animate-pulse'}`}></span>
            </button>

            <button
              id="tab-vip"
              onClick={() => setActiveTab('vip')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'vip'
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Área VIP / IA</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                activeTab === 'vip' ? 'bg-black text-[#D4FF00]' : 'bg-[#D4FF00]/15 text-[#D4FF00]'
              }`}>PRO</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
