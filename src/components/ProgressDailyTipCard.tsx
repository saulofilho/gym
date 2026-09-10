import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, Sparkles, Dumbbell, Droplets, Moon, 
  RefreshCw, Check, ArrowRight, ShieldCheck, 
  AlertTriangle, HeartPulse, Zap, Info, Plus
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface ProgressDailyTipCardProps {
  onNavigateSubTab?: (tab: 'musculacao' | 'cardio' | 'sono' | 'hidratacao') => void;
}

interface DynamicRecommendation {
  id: string;
  category: 'sinergia' | 'volume' | 'sono' | 'hidratacao';
  tag: string;
  tagColor: string; // e.g. text & bg classes
  borderColor: string;
  title: string;
  diagnosis: string;
  volumeAction: string;
  sleepAction: string;
  hydrationAction: string;
  scientificInsight: string;
  urgencyLevel: 'alta' | 'moderada' | 'otima';
}

export const ProgressDailyTipCard: React.FC<ProgressDailyTipCardProps> = ({
  onNavigateSubTab
}) => {
  const { 
    workoutHistory, 
    weeklyCardioMinutes,
    sleepLogs, 
    todayHydrationTotalMl, 
    hydrationDailyTargetMl,
    addHydrationLog,
    userProfile 
  } = useWorkout();

  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [showFullScience, setShowFullScience] = useState(false);
  const [quickWaterAdded, setQuickWaterAdded] = useState(false);

  // 1. Calculate Recent Training Volume (Past 7 Days)
  const recentWorkoutStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${(sevenDaysAgo.getMonth() + 1).toString().padStart(2, '0')}-${sevenDaysAgo.getDate().toString().padStart(2, '0')}`;

    const recentSessions = (workoutHistory || []).filter(session => {
      return session.date >= sevenDaysAgoStr;
    });

    const totalVolumeKg = recentSessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
    const sessionsCount = recentSessions.length;
    const avgVolumePerSession = sessionsCount > 0 ? Math.round(totalVolumeKg / sessionsCount) : 0;
    const latestSession = recentSessions.length > 0 ? recentSessions[0] : null;

    // Categorize volume level
    let volumeLevel: 'alto' | 'moderado' | 'baixo' | 'recuperacao' = 'moderado';
    if (totalVolumeKg > 14000 || (sessionsCount >= 4 && avgVolumePerSession > 3500)) {
      volumeLevel = 'alto';
    } else if (totalVolumeKg >= 6000 || sessionsCount >= 2) {
      volumeLevel = 'moderado';
    } else if (sessionsCount === 1) {
      volumeLevel = 'baixo';
    } else {
      volumeLevel = 'recuperacao';
    }

    return {
      totalVolumeKg,
      sessionsCount,
      avgVolumePerSession,
      volumeLevel,
      latestSession
    };
  }, [workoutHistory]);

  // 2. Calculate Recent Sleep Average & Quality
  const recentSleepStats = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) {
      return {
        hasData: false,
        avgHours: 7.2,
        latestHours: 7.2,
        quality: 'bom' as const,
        isDeficient: false
      };
    }

    const recentLogs = sleepLogs.slice(0, 7);
    const sumHours = recentLogs.reduce((acc, log) => acc + (log.hoursSlept || 0), 0);
    const avgHours = Math.round((sumHours / recentLogs.length) * 10) / 10;
    const latestHours = recentLogs[0]?.hoursSlept || avgHours;
    const latestQuality = recentLogs[0]?.quality || 'bom';
    const isDeficient = avgHours < 6.8 || latestQuality === 'ruim';

    return {
      hasData: true,
      avgHours,
      latestHours,
      quality: latestQuality,
      isDeficient
    };
  }, [sleepLogs]);

  // 3. Calculate Hydration Metrics
  const hydrationStats = useMemo(() => {
    const target = hydrationDailyTargetMl || 3000;
    const current = todayHydrationTotalMl || 0;
    const percent = Math.min(150, Math.round((current / target) * 100));
    const remainingMl = Math.max(0, target - current);
    const isBehindSchedule = percent < 45;
    const isComplete = percent >= 100;

    return {
      target,
      current,
      percent,
      remainingMl,
      isBehindSchedule,
      isComplete
    };
  }, [todayHydrationTotalMl, hydrationDailyTargetMl]);

  // 4. Generate Dynamically Tailored Recommendations
  const recommendations = useMemo<DynamicRecommendation[]>(() => {
    const list: DynamicRecommendation[] = [];
    const { totalVolumeKg, sessionsCount, volumeLevel } = recentWorkoutStats;
    const { avgHours, isDeficient: sleepDeficient } = recentSleepStats;
    const { current, target, percent, isBehindSchedule } = hydrationStats;

    // Case 1: High Volume + Deficient Recovery (Sleep or Hydration)
    if (volumeLevel === 'alto' && (sleepDeficient || isBehindSchedule)) {
      list.push({
        id: 'high-vol-overload-recovery',
        category: 'sinergia',
        tag: 'Alerta de Fadiga Central (SNC)',
        tagColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        borderColor: 'border-rose-500/30',
        urgencyLevel: 'alta',
        title: 'Sobrecarga Alta com Débito de Recuperação',
        diagnosis: `Você movimentou uma tonelagem expressiva de ${totalVolumeKg.toLocaleString('pt-BR')} kg nos últimos 7 dias em ${sessionsCount} sessões. Com o sono médio em ${avgHours}h e água em ${percent}%, seu corpo entra em risco de fadiga neural crônica.`,
        volumeAction: 'Evite buscar 1RM ou treinar até a falha concêntrica hoje; mantenha 1 a 2 repetições em reserva (RIR 2).',
        sleepAction: 'Priorize hoje pelo menos 8 horas no leito para elevar o pico de liberação de GH (hormônio do crescimento) e atenuar o cortisol elevado.',
        hydrationAction: `Ingira agora 350-500ml de água mineral. Com volume alto de treino, suas células exigem ao menos ${target.toLocaleString('pt-BR')} ml/dia para manter a osmolaridade celular.`,
        scientificInsight: 'Estudos neuromusculares mostram que a perda de força subsequente a microlesões musculares severas se prolonga em até 72 horas a mais quando o sono é inferior a 7h por noite.'
      });
    }

    // Case 2: High Volume + Optimized Recovery (Optimal Anabolic State)
    if (volumeLevel === 'alto' && !sleepDeficient && !isBehindSchedule) {
      list.push({
        id: 'high-vol-optimal-anabolism',
        category: 'sinergia',
        tag: 'Anabolismo & Supercompensação',
        tagColor: 'bg-[#D4FF00]/15 text-[#D4FF00] border-[#D4FF00]/30',
        borderColor: 'border-[#D4FF00]/30',
        urgencyLevel: 'otima',
        title: 'Sinergia Perfeita: Janela Anabólica Maximizada',
        diagnosis: `Parabéns! Sua tonelagem recente (${totalVolumeKg.toLocaleString('pt-BR')} kg) está perfeitamente amparada por sono de qualidade (${avgHours}h) e hidratação alinhada (${percent}% da meta).`,
        volumeAction: 'Seu Sistema Nervoso Central está recomposto. O momento é ideal para tentar aumento de carga (+1kg a 2kg) nos exercícios de base.',
        sleepAction: 'Mantenha o ambiente escuro e frio para preservar a fase de ondas lentas (N3), sustentando a taxa acelerada de síntese proteica.',
        hydrationAction: 'Fracione seu consumo hídrico para garantir que os estoques de creatina fosfato recebam água intramuscular constante.',
        scientificInsight: 'A hipertrofia miofibrilar ocorre na interface entre estímulo mecânico suficiente e suporte sistêmico (hidratação turgida + GH noturno).'
      });
    }

    // Case 3: Hydration Focus (Low Water Adherence)
    if (isBehindSchedule) {
      list.push({
        id: 'hydration-cellular-boost',
        category: 'hidratacao',
        tag: 'Prioridade Hídrica',
        tagColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        borderColor: 'border-cyan-500/30',
        urgencyLevel: 'alta',
        title: 'Déficit Hídrico Reduz a Força em até 15%',
        diagnosis: `Você registrou ${current.toLocaleString('pt-BR')} ml hoje (${percent}% da meta de ${target.toLocaleString('pt-BR')} ml). Para o volume atual de ${totalVolumeKg.toLocaleString('pt-BR')} kg, o músculo precisa de água para manter a integridade dos discos articulares.`,
        volumeAction: 'Em estado de desidratação branda (2%), a velocidade da barra diminui e as articulações sofrem maior atrito mecânico.',
        sleepAction: 'Concentre a ingestão de água até 2 horas antes de deitar para não fragmentar o sono com idas noturnas ao banheiro.',
        hydrationAction: `Beba agora 1 a 2 copos cheios (350ml a 500ml) de água fresca para reidratar os estoques plasmáticos.`,
        scientificInsight: 'O tecido muscular é composto por ~75% de água. A desidratação celular estimula catabolismo e diminui a eficácia da suplementação de creatina.'
      });
    }

    // Case 4: Sleep Optimization for Muscle Growth
    if (sleepDeficient || avgHours < 7) {
      list.push({
        id: 'sleep-recovery-focus',
        category: 'sono',
        tag: 'Regeneração Noturna',
        tagColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        borderColor: 'border-indigo-500/30',
        urgencyLevel: 'moderada',
        title: 'Sono Restrito Bloqueia a Reparação Muscular',
        diagnosis: `Sua média de sono recente está em ${avgHours}h. Para sustentar treinos consistentes de musculação, o sono REM e N3 são vitais para restauração da coordenação motora intermuscular.`,
        volumeAction: 'Se sentir cansaço ocular ou lentidão no aquecimento, reduza o número de séries totais em 20% para poupar tendões.',
        sleepAction: 'Desligue telas luminosas 45 minutos antes de dormir e evite cafeína ou pré-treinos estimulantes após as 16h.',
        hydrationAction: 'Mantenha-se bem hidratado durante o dia, pois a desidratação noturna causa microdespertares e boca seca que afetam a qualidade do sono.',
        scientificInsight: 'Mais de 70% do pulso diário de GH (Growth Hormone) ocorre durante os primeiros ciclos de sono profundo de ondas lentas.'
      });
    }

    // Case 5: Concurrent Training (Cardio + Musculação)
    if (weeklyCardioMinutes > 45 && totalVolumeKg > 5000) {
      list.push({
        id: 'concurrent-cardio-volume',
        category: 'volume',
        tag: 'Cardio + Musculação',
        tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        borderColor: 'border-amber-500/30',
        urgencyLevel: 'moderada',
        title: 'Gestão de Eletrólitos no Treino Concorrente',
        diagnosis: `Você acumulou ${weeklyCardioMinutes} min de cardio aeróbico e ${totalVolumeKg.toLocaleString('pt-BR')} kg de volume em ferros. A taxa de sudorese foi alta e a depleção de sódio e glicogênio exige atenção redobrada.`,
        volumeAction: 'Separe as sessões de cardio e musculação por pelo menos 6 horas para minimizar a interferência da via AMPK sobre a mTOR.',
        sleepAction: 'O desgaste metabólico duplo acelera o sono profundo; garanta sono contínuo para recomposição de glicogênio hepático e muscular.',
        hydrationAction: 'Adicione uma pitada de sal mineral ou eletrólitos ao intra-treino para prevenir quedas bruscas de pressão arterial e câimbras.',
        scientificInsight: 'A reposição simultânea de água e sódio acelera a retenção hídrica no compartimento extracelular e evita fadiga periférica precoce.'
      });
    }

    // Fallback baseline tip: Progressive overload & balance
    if (list.length === 0) {
      list.push({
        id: 'baseline-equilibrium',
        category: 'sinergia',
        tag: 'Pilares do Crescimento',
        tagColor: 'bg-[#D4FF00]/15 text-[#D4FF00] border-[#D4FF00]/30',
        borderColor: 'border-[#D4FF00]/30',
        urgencyLevel: 'otima',
        title: 'Triângulo Anabólico: Cargas, Sono & Hidratação',
        diagnosis: `Você registrou ${sessionsCount} treino(s) recente(s) somando ${totalVolumeKg.toLocaleString('pt-BR')} kg. Para continuar evoluindo de forma sólida, sincronize os 3 pilares da hipertrofia.`,
        volumeAction: 'Anote cada carga e repetição com precisão; pequenas progressões semanais geram grandes transformações físicas.',
        sleepAction: 'Busque entre 7.5h e 8.5h de sono constante para garantir recuperação de junções neuromusculares.',
        hydrationAction: `Consuma 35 a 40 ml de água por quilo de peso corporal (${Math.round((userProfile?.weightKg || 75) * 35)} ml sugeridos).`,
        scientificInsight: 'Sem hidratação adequada, o transporte de creatina e aminoácidos para o sarcoplasma perde até 30% de eficiência cinética.'
      });
    }

    return list;
  }, [recentWorkoutStats, recentSleepStats, hydrationStats, weeklyCardioMinutes, userProfile]);

  // Ensure current tip index is bounded
  const currentTip = recommendations[activeTipIndex % recommendations.length];

  const handleNextTip = () => {
    setIsRotating(true);
    setTimeout(() => {
      setActiveTipIndex(prev => (prev + 1) % recommendations.length);
      setIsRotating(false);
      setShowFullScience(false);
    }, 150);
  };

  const handleQuickAddWater = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    addHydrationLog({
      date: todayStr,
      amountMl: 350,
      timestamp: timeStr,
      type: 'agua',
      note: 'Dica do Dia - Hidratação'
    });

    setQuickWaterAdded(true);
    setTimeout(() => setQuickWaterAdded(false), 3000);
  };

  return (
    <div 
      id="progress-daily-tip-card"
      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#161616] via-[#151515] to-[#121820] border border-[#262626] relative overflow-hidden transition-all shadow-sm"
    >
      {/* Ambient background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar: Title, Context Pills & Action Buttons */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#242424] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4FF00]/15 text-[#D4FF00] flex items-center justify-center border border-[#D4FF00]/30 shrink-0">
            <Lightbulb className="w-5 h-5 text-[#D4FF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Dica do Dia</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Baseada nos Seus Dados
                </span>
              </h3>

              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${currentTip.tagColor}`}>
                {currentTip.tag}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sugestões fisiológicas integrando volume recente de treino, sono e hidratação
            </p>
          </div>
        </div>

        {/* Action Controls: Shuffle / Next Tip & Live Status Bar */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {recommendations.length > 1 && (
            <button
              id="btn-next-daily-tip"
              onClick={handleNextTip}
              className="px-3 py-1.5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#333333] text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ver outra sugestão personalizada"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRotating ? 'animate-spin' : ''}`} />
              <span>Outra Dica ({((activeTipIndex % recommendations.length) + 1)}/{recommendations.length})</span>
            </button>
          )}

          <button
            id="btn-toggle-tip-science"
            onClick={() => setShowFullScience(!showFullScience)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showFullScience ? 'Ocultar Ciência' : 'Base Científica'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Context Metric Badges */}
      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 py-3 border-b border-[#222222] my-3 text-center">
        {/* Metric 1: Recent Volume */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#1A1A1A] border border-[#282828] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <Dumbbell className="w-4 h-4 text-[#D4FF00] shrink-0" />
          <div className="text-left">
            <span className="text-[10px] text-neutral-400 block font-medium">Volume 7 Dias:</span>
            <span className="text-xs font-mono font-black text-white">
              {recentWorkoutStats.totalVolumeKg.toLocaleString('pt-BR')} kg
            </span>
          </div>
        </div>

        {/* Metric 2: Sleep Average */}
        <div 
          onClick={() => onNavigateSubTab && onNavigateSubTab('sono')}
          className="p-2 sm:p-2.5 rounded-xl bg-[#1A1A1A] border border-[#282828] hover:border-indigo-500/40 cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors group"
          title="Abrir monitor de sono"
        >
          <Moon className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <span className="text-[10px] text-neutral-400 block font-medium">Sono Médio:</span>
            <span className="text-xs font-mono font-black text-indigo-300">
              {recentSleepStats.avgHours}h / noite
            </span>
          </div>
        </div>

        {/* Metric 3: Today's Hydration */}
        <div 
          onClick={() => onNavigateSubTab && onNavigateSubTab('hidratacao')}
          className="p-2 sm:p-2.5 rounded-xl bg-[#1A1A1A] border border-[#282828] hover:border-cyan-500/40 cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors group"
          title="Abrir monitor de hidratação"
        >
          <Droplets className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <span className="text-[10px] text-neutral-400 block font-medium">Água Hoje:</span>
            <span className="text-xs font-mono font-black text-cyan-300">
              {hydrationStats.current.toLocaleString('pt-BR')} ml ({hydrationStats.percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Advice Body */}
      <div className="relative z-10 space-y-3.5">
        <div>
          <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>{currentTip.title}</span>
            {currentTip.urgencyLevel === 'alta' && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" /> Foco Requerido
              </span>
            )}
          </h4>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-1">
            {currentTip.diagnosis}
          </p>
        </div>

        {/* 3 Pillars Action Cards (Volume, Sono, Hidratação) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pillar 1: Cargas & Volume */}
          <div className="p-3.5 rounded-xl bg-[#191919] border border-[#2A2A2A] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4FF00]">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Ajuste de Cargas & Volume</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {currentTip.volumeAction}
            </p>
          </div>

          {/* Pillar 2: Sono & Recuperação */}
          <div className="p-3.5 rounded-xl bg-[#191919] border border-[#2A2A2A] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <Moon className="w-3.5 h-3.5" />
              <span>Sono & Reparo Noturno</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {currentTip.sleepAction}
            </p>
          </div>

          {/* Pillar 3: Hidratação & Eletrólitos */}
          <div className="p-3.5 rounded-xl bg-[#191919] border border-[#2A2A2A] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Droplets className="w-3.5 h-3.5" />
              <span>Hidratação & Eletrólitos</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {currentTip.hydrationAction}
            </p>
          </div>
        </div>

        {/* Scientific Evidence Expansion */}
        {showFullScience && (
          <div className="p-4 rounded-xl bg-[#151a24] border border-indigo-500/30 text-xs text-neutral-300 space-y-1.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Fisiologia do Exercício & Evidências:</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              {currentTip.scientificInsight}
            </p>
          </div>
        )}

        {/* Interactive Direct Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick 350ml water intake button */}
            <button
              id="btn-tip-quick-add-water"
              onClick={handleQuickAddWater}
              disabled={quickWaterAdded}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                quickWaterAdded
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300'
              }`}
            >
              {quickWaterAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+350 ml Adicionado!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Registrar +350 ml de Água</span>
                </>
              )}
            </button>

            {/* Quick navigate to sleep */}
            {onNavigateSubTab && (
              <button
                id="btn-tip-open-sleep-tab"
                onClick={() => onNavigateSubTab('sono')}
                className="px-3 py-1.5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#333333] text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Ajustar Sono</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>
            )}

            {/* Quick navigate to hydration */}
            {onNavigateSubTab && (
              <button
                id="btn-tip-open-hydration-tab"
                onClick={() => onNavigateSubTab('hidratacao')}
                className="px-3 py-1.5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#333333] text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Ver Hidratação</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>
            )}
          </div>

          <span className="text-[11px] text-neutral-500 font-mono">
            Atualizado automaticamente com seus treinos
          </span>
        </div>
      </div>
    </div>
  );
};
