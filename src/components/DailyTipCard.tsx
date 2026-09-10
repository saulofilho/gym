import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Dumbbell, Apple, Flame, Shuffle, ChevronRight, 
  ChevronDown, ChevronUp, Check, Copy, Heart, BookOpen, 
  MessageSquare, ShieldCheck, Zap, Lightbulb
} from 'lucide-react';
import { DailyTip, TipCategory, Exercise } from '../types';
import { DAILY_TIPS_DATABASE, getDailyTipForToday, getRandomTip } from '../data/tipsData';
import { EXERCISES_DATABASE } from '../data/exercisesData';

interface DailyTipCardProps {
  onSelectExercise?: (exercise: Exercise) => void;
  onNavigateToTab?: (tab: 'treinos' | 'progresso' | 'nutricao' | 'chat' | 'vip') => void;
}

export const DailyTipCard: React.FC<DailyTipCardProps> = ({
  onSelectExercise,
  onNavigateToTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | 'todas'>('todas');
  const [currentTip, setCurrentTip] = useState<DailyTip>(() => getDailyTipForToday());
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Today's formatted date string
  const todayFormatted = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long' 
    });
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      todas: DAILY_TIPS_DATABASE.length,
      forma: DAILY_TIPS_DATABASE.filter(t => t.category === 'forma').length,
      nutricao: DAILY_TIPS_DATABASE.filter(t => t.category === 'nutricao').length,
      motivacao: DAILY_TIPS_DATABASE.filter(t => t.category === 'motivacao').length
    };
  }, []);

  // Handle category change
  const handleCategoryChange = (cat: TipCategory | 'todas') => {
    setSelectedCategory(cat);
    const categoryParam = cat === 'todas' ? undefined : cat;
    const newTip = getDailyTipForToday(categoryParam);
    setCurrentTip(newTip);
    setIsLiked(false);
  };

  // Handle shuffle/random tip
  const handleNextRandomTip = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const categoryParam = selectedCategory === 'todas' ? undefined : selectedCategory;
      const next = getRandomTip(currentTip.id, categoryParam);
      setCurrentTip(next);
      setIsLiked(false);
      setIsSpinning(false);
    }, 200);
  };

  // Copy to clipboard
  const handleCopyTip = async () => {
    try {
      const textToCopy = `💡 Dica do Dia AcademiaPro: ${currentTip.title}\n\n${currentTip.content}\n\n🎯 Como aplicar: ${currentTip.practicalAction}`;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  // Check if tip has matching exercise
  const relatedExercise = useMemo(() => {
    if (!currentTip.exerciseId) return null;
    return EXERCISES_DATABASE.find(e => e.id === currentTip.exerciseId) || null;
  }, [currentTip.exerciseId]);

  // Color styles based on category
  const categoryConfig = {
    forma: {
      label: 'Forma & Biomecânica',
      badgeClass: 'bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30',
      icon: Dumbbell,
      accentBorder: 'border-l-[#D4FF00]',
      highlightBg: 'bg-[#D4FF00]/5 border-[#D4FF00]/20'
    },
    nutricao: {
      label: 'Nutrição & Dieta',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: Apple,
      accentBorder: 'border-l-emerald-400',
      highlightBg: 'bg-emerald-500/5 border-emerald-500/20'
    },
    motivacao: {
      label: 'Motivação & Mindset',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Zap,
      accentBorder: 'border-l-amber-400',
      highlightBg: 'bg-amber-500/5 border-amber-500/20'
    }
  };

  const currentConfig = categoryConfig[currentTip.category];
  const CategoryIcon = currentConfig.icon;

  return (
    <div 
      id="daily-tip-card"
      className="relative rounded-2xl bg-[#161616] border border-[#222222] overflow-hidden transition-all duration-300 shadow-lg"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#1A1A1A] border-b border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#D4FF00]/15 flex items-center justify-center text-[#D4FF00]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Dica do Dia
              </h3>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-neutral-600"></span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline-block capitalize">
                {todayFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Shuffle button */}
          <button
            id="btn-shuffle-tip"
            onClick={handleNextRandomTip}
            title="Sortear outra dica da base de conhecimento"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-semibold border border-[#333333] transition-all group active:scale-95"
          >
            <Shuffle className={`w-3.5 h-3.5 text-[#D4FF00] transition-transform duration-300 ${isSpinning ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            <span>Outra Dica</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            id="btn-toggle-collapse-tip"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir dica" : "Recolher dica"}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Selector (visible even when collapsed or expanded) */}
      <div className="flex items-center gap-1.5 px-5 py-2.5 bg-[#121212] border-b border-[#202020] overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-medium text-neutral-500 mr-1 hidden sm:inline">
          Filtrar:
        </span>

        <button
          id="filter-tip-todas"
          onClick={() => handleCategoryChange('todas')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'todas'
              ? 'bg-[#262626] text-white border border-[#3A3A3A] font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Todas ({categoryCounts.todas})
        </button>

        <button
          id="filter-tip-forma"
          onClick={() => handleCategoryChange('forma')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'forma'
              ? 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Dumbbell className="w-3 h-3 text-[#D4FF00]" />
          <span>Forma & Postura</span>
        </button>

        <button
          id="filter-tip-nutricao"
          onClick={() => handleCategoryChange('nutricao')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'nutricao'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Apple className="w-3 h-3 text-emerald-400" />
          <span>Nutrição</span>
        </button>

        <button
          id="filter-tip-motivacao"
          onClick={() => handleCategoryChange('motivacao')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'motivacao'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Motivação</span>
        </button>
      </div>

      {/* Main Content Body (if not collapsed) */}
      {!isCollapsed ? (
        <div className="p-5 sm:p-6 space-y-4">
          {/* Metadata Row: Category Badge + Tag + Author */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentConfig.badgeClass}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{currentConfig.label}</span>
            </span>

            <span className="text-xs px-2 py-0.5 rounded bg-[#202020] text-neutral-300 font-medium">
              {currentTip.tag}
            </span>

            {currentTip.authorBadge && (
              <span className="text-[11px] text-neutral-400 ml-auto flex items-center gap-1 font-mono">
                <span>Por:</span>
                <span className="text-neutral-200 font-medium">{currentTip.authorBadge}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {currentTip.title}
          </h4>

          {/* Main Description */}
          <p className="text-sm text-neutral-300 leading-relaxed">
            {currentTip.content}
          </p>

          {/* Actionable Box: "Como aplicar hoje" */}
          <div className={`p-4 rounded-xl border ${currentConfig.highlightBg} space-y-1.5`}>
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <span className="text-sm">🎯</span>
              <span>Como aplicar no seu treino de hoje:</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
              {currentTip.practicalAction}
            </p>
          </div>

          {/* Scientific or Coach Note (if available) */}
          {currentTip.scientificOrCoachNote && (
            <div className="text-xs text-neutral-400 bg-[#121212] p-3 rounded-lg border border-[#202020] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-neutral-300">Base científica & biomecânica: </span>
                <span>{currentTip.scientificOrCoachNote}</span>
              </div>
            </div>
          )}

          {/* Bottom Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#222222]">
            {/* Deep Link Buttons based on tip type */}
            <div className="flex flex-wrap items-center gap-2">
              {relatedExercise && onSelectExercise && (
                <button
                  id={`btn-view-exercise-${relatedExercise.id}`}
                  onClick={() => onSelectExercise(relatedExercise)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4FF00] hover:bg-[#BCE600] text-black text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Ver Vídeo & Execução ({relatedExercise.name})</span>
                </button>
              )}

              {currentTip.category === 'nutricao' && onNavigateToTab && (
                <button
                  id="btn-tip-goto-nutrition"
                  onClick={() => onNavigateToTab('nutricao')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Explorar Guias de Nutrição</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentTip.category === 'motivacao' && onNavigateToTab && (
                <button
                  id="btn-tip-goto-chat"
                  onClick={() => onNavigateToTab('chat')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition-all active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tirar Dúvida com os Coaches</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Utility Buttons: Copy & Bookmark */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                id="btn-copy-tip"
                onClick={handleCopyTip}
                title="Copiar dica para a área de transferência"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-xs border border-[#303030] transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copiar</span>
                  </>
                )}
              </button>

              <button
                id="btn-like-tip"
                onClick={() => setIsLiked(!isLiked)}
                title={isLiked ? "Dica favoritada" : "Favoritar dica"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                  isLiked
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white border-[#303030]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                <span className="hidden sm:inline">{isLiked ? 'Salvo' : 'Útil'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed Compact View */
        <div 
          onClick={() => setIsCollapsed(false)}
          className="px-5 py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#1A1A1A] transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${currentConfig.badgeClass} flex-shrink-0`}>
              {currentTip.tag}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate">
              {currentTip.title}
            </span>
          </div>
          <span className="text-xs text-[#D4FF00] font-medium flex-shrink-0 flex items-center gap-1">
            <span>Expandir</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>
      )}
    </div>
  );
};
