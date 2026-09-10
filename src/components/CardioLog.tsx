import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { CardioLogEntry, CardioType } from '../types';
import { 
  Activity, 
  Footprints, 
  Bike, 
  Flame, 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  X, 
  Zap, 
  Gauge, 
  Waves,
  ChevronRight,
  Info
} from 'lucide-react';

interface CardioConfig {
  id: CardioType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultMET: number;
  hasDistance: boolean;
  hasIncline: boolean;
  color: string;
}

const CARDIO_TYPES_CONFIG: CardioConfig[] = [
  { id: 'esteira', label: 'Esteira Ergométrica', icon: Footprints, defaultMET: 6.0, hasDistance: true, hasIncline: true, color: 'text-amber-400' },
  { id: 'corrida', label: 'Corrida ao Ar Livre', icon: Flame, defaultMET: 9.5, hasDistance: true, hasIncline: false, color: 'text-orange-400' },
  { id: 'bicicleta', label: 'Bicicleta / Spinning', icon: Bike, defaultMET: 7.0, hasDistance: true, hasIncline: false, color: 'text-cyan-400' },
  { id: 'ciclismo_rua', label: 'Ciclismo de Rua', icon: Bike, defaultMET: 8.0, hasDistance: true, hasIncline: false, color: 'text-emerald-400' },
  { id: 'escada', label: 'Simulador de Escada', icon: TrendingUp, defaultMET: 8.5, hasDistance: false, hasIncline: false, color: 'text-[#D4FF00]' },
  { id: 'eliptico', label: 'Elíptico / Transport', icon: Activity, defaultMET: 6.5, hasDistance: true, hasIncline: false, color: 'text-purple-400' },
  { id: 'caminhada', label: 'Caminhada Rápida', icon: Footprints, defaultMET: 3.8, hasDistance: true, hasIncline: true, color: 'text-blue-400' },
  { id: 'natacao', label: 'Natação', icon: Waves, defaultMET: 7.5, hasDistance: true, hasIncline: false, color: 'text-sky-400' },
  { id: 'remo', label: 'Remo Seco (Rowing)', icon: Activity, defaultMET: 8.0, hasDistance: true, hasIncline: false, color: 'text-rose-400' },
  { id: 'hiit', label: 'Cardio HIIT / Circuitos', icon: Zap, defaultMET: 10.0, hasDistance: false, hasIncline: false, color: 'text-red-400' },
];

export const CardioLog: React.FC = () => {
  const { 
    cardioLogs, 
    addCardioLog, 
    deleteCardioLog, 
    userProfile,
    monthlyCardioMinutes,
    monthlyCardioCalories,
    monthlyCardioDistanceKm,
    weeklyCardioMinutes
  } = useWorkout();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<CardioType | 'todos'>('todos');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<CardioType>('esteira');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(25);
  const [distanceKm, setDistanceKm] = useState<number | ''>('');
  const [caloriesBurned, setCaloriesBurned] = useState<number | ''>('');
  const [avgHeartRateBpm, setAvgHeartRateBpm] = useState<number | ''>('');
  const [rpe, setRpe] = useState<number>(6);
  const [inclinePercent, setInclinePercent] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const currentTypeConfig = CARDIO_TYPES_CONFIG.find(c => c.id === selectedType) || CARDIO_TYPES_CONFIG[0];

  // Auto-calculated pace
  const calculatedPace = React.useMemo(() => {
    const dur = typeof durationMinutes === 'number' ? durationMinutes : 0;
    const dist = typeof distanceKm === 'number' ? distanceKm : 0;
    if (dur > 0 && dist > 0) {
      const paceDecimal = dur / dist; // minutes per km
      const paceMins = Math.floor(paceDecimal);
      const paceSecs = Math.round((paceDecimal - paceMins) * 60);
      return `${paceMins}:${paceSecs.toString().padStart(2, '0')} min/km`;
    }
    return '';
  }, [durationMinutes, distanceKm]);

  // Speed in km/h
  const calculatedSpeed = React.useMemo(() => {
    const dur = typeof durationMinutes === 'number' ? durationMinutes : 0;
    const dist = typeof distanceKm === 'number' ? distanceKm : 0;
    if (dur > 0 && dist > 0) {
      return ((dist / dur) * 60).toFixed(1);
    }
    return null;
  }, [durationMinutes, distanceKm]);

  // Estimate calories function
  const handleEstimateCalories = () => {
    const dur = typeof durationMinutes === 'number' ? durationMinutes : 0;
    if (dur <= 0) return;
    const weight = userProfile.weightKg || 75;
    const met = currentTypeConfig.defaultMET;
    // Formula: Calories = MET * Weight(kg) * Duration(hours)
    const estimated = Math.round(met * weight * (dur / 60));
    setCaloriesBurned(estimated);
  };

  const handleOpenAddModal = (defaultCardio?: CardioType) => {
    if (defaultCardio) {
      setSelectedType(defaultCardio);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setDurationMinutes(25);
    setDistanceKm('');
    setCaloriesBurned('');
    setAvgHeartRateBpm('');
    setRpe(6);
    setInclinePercent('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveCardio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationMinutes || durationMinutes <= 0) return;

    const entry: Omit<CardioLogEntry, 'id'> = {
      date,
      type: selectedType,
      title: title.trim() || currentTypeConfig.label,
      durationMinutes: Number(durationMinutes),
      distanceKm: distanceKm !== '' ? Number(distanceKm) : undefined,
      caloriesBurned: caloriesBurned !== '' ? Number(caloriesBurned) : undefined,
      avgHeartRateBpm: avgHeartRateBpm !== '' ? Number(avgHeartRateBpm) : undefined,
      perceivedExertionRPE: rpe,
      inclinePercent: inclinePercent !== '' ? Number(inclinePercent) : undefined,
      paceMinPerKm: calculatedPace || undefined,
      notes: notes.trim() || undefined
    };

    addCardioLog(entry);
    setIsAddModalOpen(false);
  };

  // Filtered logs
  const filteredLogs = (cardioLogs || []).filter(log => {
    if (filterType === 'todos') return true;
    return log.type === filterType;
  });

  // Weekly recommendation (WHO: 150 min/week moderate activity)
  const weeklyGoalMinutes = 150;
  const weeklyProgressPercent = Math.min(100, Math.round((weeklyCardioMinutes / weeklyGoalMinutes) * 100));

  const getRpeBadge = (val?: number) => {
    if (!val) return null;
    if (val <= 3) return { text: 'Leve (Z1)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    if (val <= 6) return { text: 'Moderado / Zona 2', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (val <= 8) return { text: 'Intenso / Limiar', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { text: 'Máximo / HIIT', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="cardio-log-container">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4FF00]/10 text-[#D4FF00] flex items-center justify-center border border-[#D4FF00]/20">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Registro de Atividades Aeróbicas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Monitore suas sessões de cardio, gasto calórico e condicionamento cardiovascular.
          </p>
        </div>

        <button
          id="btn-register-cardio"
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cardio</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Minutes */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Cardio no Mês</span>
            <Clock className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {monthlyCardioMinutes} <span className="text-sm text-neutral-400 font-sans">min</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            {cardioLogs.length} {cardioLogs.length === 1 ? 'sessão registrada' : 'sessões registradas'}
          </div>
        </div>

        {/* Calories Burned */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Gasto Calórico Estimado</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 font-mono">
            {monthlyCardioCalories.toLocaleString()} <span className="text-sm text-neutral-400 font-sans">kcal</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Déficit metabólico acumulado no mês
          </div>
        </div>

        {/* Total Distance */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Distância Total</span>
            <Footprints className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {monthlyCardioDistanceKm.toFixed(1)} <span className="text-sm text-neutral-400 font-sans">km</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Corrida, esteira e pedaladas
          </div>
        </div>

        {/* Weekly Consistency Progress */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Meta Semanal (OMS)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{weeklyCardioMinutes}</span>
            <span className="text-xs text-neutral-400 font-sans">/ {weeklyGoalMinutes} min</span>
          </div>
          <div className="w-full bg-[#222222] rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Activity Selector Chips */}
      <div className="p-5 rounded-2xl bg-[#161616] border border-[#222222] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#D4FF00]" />
            Atalhos Rápidos de Registro
          </h3>
          <span className="text-[11px] text-neutral-500">Clique para registrar com preset</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {CARDIO_TYPES_CONFIG.slice(0, 5).map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleOpenAddModal(item.id)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#D4FF00]/50 hover:bg-[#1A1A1A] transition-all text-left group"
              >
                <div className={`p-2 rounded-lg bg-[#161616] ${item.color} group-hover:bg-[#D4FF00]/10`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{item.label}</div>
                  <div className="text-[10px] text-neutral-500">Preset rápido</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & History List */}
      <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-base font-bold text-white">Histórico de Sessões de Cardio</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#222222] text-neutral-300 font-mono">
              {filteredLogs.length}
            </span>
          </div>

          {/* Activity Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterType === 'todos'
                  ? 'bg-[#D4FF00] text-black shadow-sm'
                  : 'bg-[#111111] text-neutral-400 hover:text-white border border-[#222222]'
              }`}
            >
              Todos
            </button>
            {CARDIO_TYPES_CONFIG.map(type => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === type.id
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'bg-[#111111] text-neutral-400 hover:text-white border border-[#222222]'
                }`}
              >
                {type.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* List of Sessions */}
        {filteredLogs.length === 0 ? (
          <div className="p-10 rounded-xl bg-[#111111] border border-dashed border-[#222222] text-center space-y-3">
            <Activity className="w-10 h-10 text-neutral-600 mx-auto" />
            <div className="text-sm font-bold text-neutral-300">Nenhum cardio registrado nesta categoria</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Mantenha seu coração forte e acelere a queima de gordura registrando suas sessões de aeróbico.
            </p>
            <button
              onClick={() => handleOpenAddModal(filterType !== 'todos' ? filterType : undefined)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4FF00] text-black font-bold text-xs hover:brightness-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Primeira Sessão
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map(log => {
              const cfg = CARDIO_TYPES_CONFIG.find(c => c.id === log.type) || CARDIO_TYPES_CONFIG[0];
              const Icon = cfg.icon;
              const rpeBadge = getRpeBadge(log.perceivedExertionRPE);
              const formattedDate = new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div 
                  key={log.id} 
                  className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#333333] transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-[#161616] border border-[#222222] ${cfg.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {log.title || cfg.label}
                          </h4>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#262626] text-neutral-300">
                            {cfg.label}
                          </span>
                          {rpeBadge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${rpeBadge.color}`}>
                              RPE {log.perceivedExertionRPE} • {rpeBadge.text}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 capitalize mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete action */}
                    <div>
                      {deleteConfirmId === log.id ? (
                        <div className="flex items-center gap-1.5 animate-fadeIn">
                          <button
                            onClick={() => {
                              deleteCardioLog(log.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded bg-[#222222] hover:bg-[#333333] text-neutral-300 text-[11px]"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(log.id)}
                          className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metrics Badge Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1 border-t border-[#1A1A1A]">
                    {/* Duration */}
                    <div className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                      <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D4FF00]" />
                        Duração
                      </div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {log.durationMinutes} min
                      </div>
                    </div>

                    {/* Distance (if applicable) */}
                    {log.distanceKm !== undefined && (
                      <div className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                        <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                          <Footprints className="w-3 h-3 text-cyan-400" />
                          Distância
                        </div>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">
                          {log.distanceKm.toFixed(2)} km
                        </div>
                      </div>
                    )}

                    {/* Pace or Incline */}
                    {log.paceMinPerKm ? (
                      <div className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                        <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-emerald-400" />
                          Ritmo Médio
                        </div>
                        <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                          {log.paceMinPerKm}
                        </div>
                      </div>
                    ) : log.inclinePercent !== undefined ? (
                      <div className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                        <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-amber-400" />
                          Inclinação
                        </div>
                        <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                          {log.inclinePercent}%
                        </div>
                      </div>
                    ) : null}

                    {/* Calories */}
                    {log.caloriesBurned !== undefined && (
                      <div className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                        <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          Calorias
                        </div>
                        <div className="text-sm font-bold text-orange-400 font-mono mt-0.5">
                          {log.caloriesBurned} kcal
                        </div>
                      </div>
                    )}

                    {/* Heart Rate */}
                    {log.avgHeartRateBpm !== undefined && (
                      <div className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                        <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          FC Média
                        </div>
                        <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                          {log.avgHeartRateBpm} bpm
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes / Observações */}
                  {log.notes && (
                    <div className="text-xs text-neutral-400 bg-[#161616] p-2.5 rounded-lg border border-[#222222] italic">
                      "{log.notes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal to Add New Cardio Log */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#161616] border border-[#222222] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#D4FF00]/10 text-[#D4FF00]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Registrar Sessão de Cardio
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCardio} className="space-y-4">
              {/* Select Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Modalidade Aeróbica *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CARDIO_TYPES_CONFIG.map(type => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#D4FF00] text-black border-[#D4FF00] font-bold shadow-sm'
                            : 'bg-[#111111] text-neutral-300 border-[#262626] hover:border-[#333333]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">{type.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Título / Descrição Curta</label>
                  <input
                    type="text"
                    placeholder={`Ex: ${currentTypeConfig.label} Pós-Treino`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Data da Atividade *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              {/* Duration & Distance */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span>Duração (min) *</span>
                    <Clock className="w-3 h-3 text-[#D4FF00]" />
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span>Distância (km)</span>
                    <Footprints className="w-3 h-3 text-cyan-400" />
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 5.0"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              {/* Live calculated Pace & Speed banner */}
              {calculatedPace && (
                <div className="p-2.5 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-between text-xs font-mono">
                  <div className="text-neutral-400">
                    Ritmo Médio: <span className="text-emerald-400 font-bold">{calculatedPace}</span>
                  </div>
                  {calculatedSpeed && (
                    <div className="text-neutral-400">
                      Velocidade: <span className="text-[#D4FF00] font-bold">{calculatedSpeed} km/h</span>
                    </div>
                  )}
                </div>
              )}

              {/* Calories & Incline or Heart rate */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300">Calorias (kcal)</label>
                    <button
                      type="button"
                      onClick={handleEstimateCalories}
                      className="text-[10px] text-[#D4FF00] hover:underline flex items-center gap-0.5"
                      title="Estimar gasto com base no seu peso e na intensidade"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Estimar
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 220"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span>FC Média (bpm)</span>
                    <Heart className="w-3 h-3 text-rose-500" />
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    placeholder="Ex: 135"
                    value={avgHeartRateBpm}
                    onChange={(e) => setAvgHeartRateBpm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              {/* Incline if treadmill or walking */}
              {currentTypeConfig.hasIncline && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span>Inclinação da Esteira (%)</span>
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    placeholder="Ex: 6.0"
                    value={inclinePercent}
                    onChange={(e) => setInclinePercent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              )}

              {/* Perceived Exertion RPE Slider */}
              <div className="space-y-2 p-3 rounded-xl bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-300">Intensidade Subjetiva (RPE):</span>
                  <span className="font-mono font-bold text-[#D4FF00]">
                    {rpe} / 10 {getRpeBadge(rpe)?.text}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-[#D4FF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>1-3 Leve</span>
                  <span>4-6 Zona 2 Queima</span>
                  <span>7-8 Limiar</span>
                  <span>9-10 Máximo</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Observações da Sessão</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Realizado em jejum matinal, sensação de energia alta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)]"
                >
                  Salvar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
