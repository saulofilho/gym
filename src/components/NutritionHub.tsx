import React, { useState } from 'react';
import { 
  Utensils, Droplets, Apple, Flame, Sparkles, Plus, Check, 
  HelpCircle, ChevronDown, ChevronUp, BookOpen, Clock, ShieldCheck
} from 'lucide-react';
import { NUTRITION_GUIDES, SAMPLE_MEAL_PLAN } from '../data/nutritionData';
import { useWorkout } from '../context/WorkoutContext';

export const NutritionHub: React.FC = () => {
  const { userProfile } = useWorkout();

  // Macro Calculator Local State
  const [weight, setWeight] = useState(userProfile.weightKg);
  const [height, setHeight] = useState(userProfile.heightCm);
  const [age, setAge] = useState(userProfile.age);
  const [gender, setGender] = useState<'masculino' | 'feminino'>(userProfile.gender);
  const [activity, setActivity] = useState<'sedentario' | 'moderado' | 'intenso'>('moderado');
  const [goal, setGoal] = useState<'hipertrofia' | 'definicao' | 'manutencao'>('hipertrofia');

  // Water Tracker
  const [waterConsumedMl, setWaterConsumedMl] = useState(1500);

  // Expanded guide state
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('proteina-macros');

  // Calculate Mifflin-St Jeor BMR
  const bmr = gender === 'masculino'
    ? Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5)
    : Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);

  // Activity multiplier
  const activityMultiplier = activity === 'sedentario' ? 1.2 : activity === 'moderado' ? 1.55 : 1.75;
  const maintenanceCalories = Math.round(bmr * activityMultiplier);

  // Goal adjustment
  const targetCalories = goal === 'hipertrofia' 
    ? maintenanceCalories + 300 
    : goal === 'definicao' 
    ? maintenanceCalories - 450 
    : maintenanceCalories;

  // Macros calculation
  // Protein: 2.0g per kg
  const targetProteinGrams = Math.round(weight * 2.0);
  const proteinCalories = targetProteinGrams * 4;

  // Fat: 0.9g per kg
  const targetFatGrams = Math.round(weight * 0.9);
  const fatCalories = targetFatGrams * 9;

  // Remaining calories go to Carbs
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const targetCarbGrams = Math.round(carbCalories / 4);

  // Water target (40ml per kg)
  const targetWaterMl = Math.round(weight * 40);
  const waterProgressPercent = Math.min(100, Math.round((waterConsumedMl / targetWaterMl) * 100));

  const addWater = (amount: number) => {
    setWaterConsumedMl(prev => Math.max(0, prev + amount));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#161616] border border-[#222222] space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-[#D4FF00] text-xs font-bold">
          <Utensils className="w-3.5 h-3.5" />
          <span>Nutrição Baseada em Ciência</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Combustível para Hipertrofia & Definição
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Sem dietas extremas ou restrições insustentáveis. O segredo da evolução muscular está no consumo adequado de proteínas, carboidratos para energia e hidratação celular contínua.
        </p>
      </div>

      {/* Interactive Macro Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#D4FF00]" />
            <span>Calculadora de Macros & Calorias</span>
          </h3>
          <p className="text-xs text-neutral-400">Fórmula de Mifflin-St Jeor individualizada para o seu corpo.</p>

          <div className="space-y-3 pt-2">
            {/* Goal Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Seu Objetivo Principal:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hipertrofia', label: 'Hipertrofia (+300 kcal)' },
                  { id: 'definicao', label: 'Secar / Queima (-450 kcal)' },
                  { id: 'manutencao', label: 'Manutenção' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as any)}
                    className={`p-2 text-center text-xs font-bold rounded-lg border transition-all ${
                      goal === item.id
                        ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-sm'
                        : 'bg-[#111111] text-neutral-400 border-[#222222] hover:border-[#333333]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Peso (kg):</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 60)}
                  className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Altura (cm):</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 170)}
                  className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Idade (anos):</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white font-mono text-sm focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Sexo Biológico:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs font-bold focus:outline-none focus:border-[#D4FF00]"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Frequência de Atividade:</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as any)}
                className="w-full p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white text-xs font-bold focus:outline-none focus:border-[#D4FF00]"
              >
                <option value="sedentario">Sedentário (pouco ou nenhum treino)</option>
                <option value="moderado">Moderado (musculação 3 a 5x por semana)</option>
                <option value="intenso">Intenso (musculação pesada 6x + cardio)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Targets Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4FF00]">Metas Diárias Recomendadas</span>
              <span className="text-xs text-neutral-400">Gasto Basal: {bmr} kcal</span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-4xl sm:text-5xl font-bold text-white font-mono">{targetCalories}</div>
              <span className="text-sm font-bold text-neutral-400">kcal por dia</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {goal === 'hipertrofia'
                ? 'Superávit calórico controlado para construção limpa de tecido muscular com mínimo acúmulo de gordura.'
                : goal === 'definicao'
                ? 'Déficit calórico estratégico para queima de gordura preservando 100% da sua massa muscular.'
                : 'Calorias equilibradas para manutenção do peso e estabilização metabólica.'}
            </p>
          </div>

          {/* Macros Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
              <span className="text-[11px] font-bold text-[#D4FF00] uppercase">Proteínas</span>
              <div className="text-2xl font-bold text-white font-mono">{targetProteinGrams}g</div>
              <span className="text-[10px] text-neutral-400">2.0g/kg (~{proteinCalories} kcal)</span>
            </div>

            {/* Carbs */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
              <span className="text-[11px] font-bold text-neutral-300 uppercase">Carboidratos</span>
              <div className="text-2xl font-bold text-white font-mono">{targetCarbGrams}g</div>
              <span className="text-[10px] text-neutral-400">Energia (~{carbCalories} kcal)</span>
            </div>

            {/* Fats */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Gorduras</span>
              <div className="text-2xl font-bold text-white font-mono">{targetFatGrams}g</div>
              <span className="text-[10px] text-neutral-400">0.9g/kg (~{fatCalories} kcal)</span>
            </div>
          </div>

          {/* Quick macro distribution reminder */}
          <div className="p-3 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-between text-xs text-neutral-300">
            <span>🍗 3 a 4 refeições com ~{Math.round(targetProteinGrams / 4)}g de proteína cada</span>
            <span className="text-[#D4FF00] font-bold">Gatilho de Síntese Proteica</span>
          </div>
        </div>
      </div>

      {/* Water Tracking & Pre/Post Timing Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Water Hydration Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#D4FF00]" />
              <span>Controle Diário de Hidratação</span>
            </h3>
            <span className="text-xs text-[#D4FF00] font-bold">{waterProgressPercent}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Ingerido hoje: <strong className="text-white">{waterConsumedMl} ml</strong></span>
              <span className="text-neutral-400">Meta: {targetWaterMl} ml</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#111111] overflow-hidden border border-[#222222]">
              <div 
                className="h-full bg-[#D4FF00] rounded-full transition-all duration-300"
                style={{ width: `${waterProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => addWater(250)}
              className="flex-1 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-neutral-200 text-xs font-bold border border-[#333333] transition-colors"
            >
              +250ml (Copo)
            </button>
            <button
              onClick={() => addWater(500)}
              className="flex-1 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#D4FF00] text-xs font-bold border border-[#333333] transition-colors"
            >
              +500ml (Garrafa)
            </button>
            <button
              onClick={() => setWaterConsumedMl(0)}
              className="px-3 py-2 rounded-lg bg-[#111111] hover:bg-[#1A1A1A] text-neutral-500 text-xs font-bold transition-colors"
              title="Zerar dia"
            >
              Zerar
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed italic">
            💧 Mais de 70% do tecido muscular é água. A desidratação reduz em até 15% sua força nas séries pesadas.
          </p>
        </div>

        {/* Practical Meal Plan (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4FF00]" />
            <span>Exemplo Prático de Cardápio para Hipertrofia</span>
          </h3>

          <div className="space-y-2.5">
            {SAMPLE_MEAL_PLAN.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{item.meal}</span>
                  <span className="font-mono text-[#D4FF00] text-[11px]">{item.time}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{item.description}</p>
                <span className="text-[10px] text-neutral-400 font-mono block pt-0.5">{item.macros}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Science-Based Nutrition Guides Accordion */}
      <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4FF00]" />
            <span>Guias e Dicas Nutricionais da Coordenação</span>
          </h3>
          <p className="text-xs text-neutral-400">Instruções essenciais para potencializar seu resultado na musculação.</p>
        </div>

        <div className="space-y-3">
          {NUTRITION_GUIDES.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;

            return (
              <div 
                key={guide.id}
                className="rounded-xl border border-[#222222] bg-[#111111] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161616] transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{guide.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{guide.summary}</p>
                  </div>
                  <div className="p-1 rounded-lg text-neutral-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-[#222222] space-y-4 mt-2">
                    {/* Key Points */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4FF00]">Pontos Chave:</span>
                      <ul className="space-y-1">
                        {guide.keyPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="text-xs text-neutral-300 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#D4FF00] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Recomendações Práticas:</span>
                      <ul className="space-y-1">
                        {guide.recommendations.map((rec, rIdx) => (
                          <li key={rIdx} className="text-xs text-neutral-300 flex items-start gap-2">
                            <span className="text-[#D4FF00]">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Scientific Note */}
                    <div className="p-3 rounded-lg bg-[#161616] border border-[#222222] flex items-start gap-2 text-xs text-neutral-400">
                      <ShieldCheck className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                      <span className="italic">{guide.scientificNote}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
