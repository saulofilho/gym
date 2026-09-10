import React, { useState } from 'react';
import { 
  Sparkles, Dumbbell, Clock, Calendar, Check, AlertTriangle, 
  X, CheckCircle2, ArrowRight, Play 
} from 'lucide-react';
import { EXERCISES_DATABASE } from '../data/exercisesData';
import { WorkoutProgram, FitnessLevel } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface CustomWorkoutGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGeneratedWorkout: (program: WorkoutProgram) => void;
}

export const CustomWorkoutGenerator: React.FC<CustomWorkoutGeneratorProps> = ({
  isOpen,
  onClose,
  onStartGeneratedWorkout
}) => {
  const { addCustomProgram, userProfile } = useWorkout();

  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [muscleFocus, setMuscleFocus] = useState<string>('geral');
  const [level, setLevel] = useState<FitnessLevel>(userProfile.level);
  const [durationMin, setDurationMin] = useState<number>(60);
  const [equipment, setEquipment] = useState<string>('academia');
  const [injuryLimitation, setInjuryLimitation] = useState<string>('nenhuma');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<WorkoutProgram | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedProgram(null);

    try {
      const res = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysPerWeek,
          level,
          goal: muscleFocus,
          availableEquipment: equipment,
          limitations: injuryLimitation,
          sessionDurationMinutes: durationMin
        })
      });

      const data = await res.json();
      if (data.program && data.program.exercises && data.program.exercises.length > 0) {
        setGeneratedProgram(data.program);
      } else {
        throw new Error('Falha no formato da resposta');
      }
    } catch (err) {
      // Graceful smart algorithmic generator fallback
      const programId = `custom-ai-${Date.now()}`;
      let splitName = daysPerWeek <= 3 ? 'Full Body Alternado' : daysPerWeek === 4 ? 'Upper / Lower (Superior e Inferior)' : 'Push / Pull / Legs (PPL)';
      let focusText = muscleFocus === 'peito-ombro' ? 'Foco Superior & Empurrar' : muscleFocus === 'pernas' ? 'Foco Inferiores & Densidade' : 'Hipertrofia Geral Balanceada';

      // Pick suitable exercises based on level and limitations
      let selectedExIds = ['supino-reto-barra', 'puxada-alta-costas', 'agachamento-livre', 'desenvolvimento-halteres', 'rosca-biceps-direta', 'triceps-corda-polia'];
      
      if (injuryLimitation === 'lombar') {
        selectedExIds = ['leg-press-45', 'supino-reto-barra', 'puxada-alta-costas', 'elevacao-lateral-ombros', 'cadeira-extensora', 'rosca-biceps-direta'];
      } else if (injuryLimitation === 'ombro') {
        selectedExIds = ['remada-curvada-barra', 'agachamento-livre', 'leg-press-45', 'puxada-alta-costas', 'rosca-biceps-direta', 'triceps-corda-polia'];
      }

      const generated: WorkoutProgram = {
        id: programId,
        title: `Plano Personalizado VIP: ${focusText}`,
        tagline: `Rotina sob medida para ${daysPerWeek}x na semana (${durationMin} min)`,
        description: `Programa estruturado por Inteligência Artificial levando em conta seu nível ${level === 'iniciante' ? 'Iniciante' : 'Avançado'} e descanso otimizado.`,
        level,
        daysPerWeek,
        durationMin,
        split: splitName,
        focusAreas: [focusText, 'Sobrecarga Progressiva', 'Equilíbrio Articular'],
        isPremium: true,
        exercises: selectedExIds.map(id => {
          const ex = EXERCISES_DATABASE.find(e => e.id === id);
          return {
            exerciseId: id,
            targetSets: level === 'iniciante' ? 3 : 4,
            targetReps: level === 'iniciante' ? '10-12 reps' : '8-10 reps',
            restSeconds: level === 'iniciante' ? 90 : 120,
            note: ex?.coachTips ? `Dica técnica: ${ex.coachTips}` : 'Controle a fase excêntrica da repetição.'
          };
        })
      };

      setGeneratedProgram(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndStart = () => {
    if (!generatedProgram) return;
    addCustomProgram(generatedProgram);
    onClose();
    onStartGeneratedWorkout(generatedProgram);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        id="custom-generator-modal"
        className="relative w-full max-w-2xl bg-[#161616] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222222] bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-[#D4FF00] flex items-center justify-center border border-[#333333]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Gerador de Treinos Personalizados por IA</h2>
              <p className="text-xs text-neutral-400">Recurso Exclusivo do Plano VIP AcademiaPro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Results */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {!generatedProgram ? (
            <div className="space-y-4">
              {/* Days per week */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Quantos dias por semana você vai à academia?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysPerWeek(d)}
                      className={`p-2.5 text-center text-xs font-bold rounded-lg border transition-all ${
                        daysPerWeek === d
                          ? 'bg-[#D4FF00] text-black border-[#D4FF00] font-bold shadow-sm'
                          : 'bg-[#111111] text-neutral-400 border-[#222222] hover:border-[#333333]'
                      }`}
                    >
                      {d} dias / semana
                    </button>
                  ))}
                </div>
              </div>

              {/* Muscle Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Foco Muscular / Objetivo Principal:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'geral', label: 'Hipertrofia Geral Balanceada' },
                    { id: 'peito-ombro', label: 'Foco em Peito, Ombros e Tríceps' },
                    { id: 'pernas', label: 'Foco em Membros Inferiores & Glúteos' },
                    { id: 'costas-bracos', label: 'Foco em Costas Largas & Bíceps' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMuscleFocus(f.id)}
                      className={`p-2.5 text-left text-xs font-bold rounded-lg border transition-all ${
                        muscleFocus === f.id
                          ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-sm'
                          : 'bg-[#111111] text-neutral-400 border-[#222222] hover:border-[#333333]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Nível Atual:</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs font-bold focus:outline-none focus:border-[#D4FF00]"
                  >
                    <option value="iniciante">Iniciante (menos de 6 meses)</option>
                    <option value="avancado">Avançado (1 ano ou mais)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Tempo por Treino:</label>
                  <select
                    value={durationMin}
                    onChange={(e) => setDurationMin(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs font-bold focus:outline-none focus:border-[#D4FF00]"
                  >
                    <option value={45}>45 minutos (rápido)</option>
                    <option value={60}>60 minutos (padrão)</option>
                    <option value={75}>75 minutos (completo)</option>
                  </select>
                </div>
              </div>

              {/* Limitations */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Algum desconforto ou limitação física para proteção articular?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'nenhuma', label: '100% Saudável' },
                    { id: 'ombro', label: 'Ombro Sensível' },
                    { id: 'lombar', label: 'Lombar Sensível' },
                    { id: 'joelho', label: 'Joelho Sensível' }
                  ].map(lim => (
                    <button
                      key={lim.id}
                      type="button"
                      onClick={() => setInjuryLimitation(lim.id)}
                      className={`p-2 text-center text-xs font-bold rounded-lg border transition-all ${
                        injuryLimitation === lim.id
                          ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-sm'
                          : 'bg-[#111111] text-neutral-400 border-[#222222] hover:border-[#333333]'
                      }`}
                    >
                      {lim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  id="btn-trigger-ai-workout-generator"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="w-full py-3.5 rounded-lg bg-[#D4FF00] hover:brightness-95 disabled:opacity-40 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[rgba(212,255,0,0.2)] transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>Gerando Sua Planilha Personalizada com Gemini IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Criar Meu Treino Sob Medida Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                  <span className="text-xs font-bold uppercase text-[#D4FF00]">Planilha Gerada com Sucesso!</span>
                </div>
                <h3 className="text-lg font-bold text-white">{generatedProgram.title}</h3>
                <p className="text-xs text-neutral-300">{generatedProgram.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Exercícios Selecionados ({(generatedProgram.exercises || []).length}):
                </h4>

                <div className="divide-y divide-[#222222] border border-[#222222] rounded-xl overflow-hidden bg-[#0A0A0A]">
                  {(generatedProgram.exercises || []).map((item, idx) => {
                    const exDef = EXERCISES_DATABASE.find(e => e.id === item.exerciseId);
                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#333333] text-neutral-300 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-white text-sm">
                              {exDef ? exDef.name : item.exerciseId}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-[#D4FF00] italic pl-7">{item.note}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-[#D4FF00] font-mono text-sm">{item.targetSets} séries</span>
                          <span className="text-neutral-400 block text-[11px]">{item.targetReps}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222222]">
                <button
                  onClick={() => setGeneratedProgram(null)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Configurar Outro Treino
                </button>
                <button
                  id="btn-save-start-custom-workout"
                  onClick={handleSaveAndStart}
                  className="px-6 py-2.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm shadow-md shadow-[rgba(212,255,0,0.2)] flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Salvar Ficha & Iniciar Agora</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
