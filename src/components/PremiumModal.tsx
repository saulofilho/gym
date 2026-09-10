import React from 'react';
import { 
  X, Check, Sparkles, Award, TrendingUp, ShieldCheck, 
  Dumbbell, MessageSquare, Zap, CheckCircle2 
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGenerator: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onOpenGenerator
}) => {
  const { userProfile, togglePremiumStatus } = useWorkout();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        id="premium-modal-card"
        className="relative w-full max-w-xl bg-[#161616] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="p-6 sm:p-8 bg-[#111111] border-b border-[#222222] space-y-3 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center mx-auto shadow-lg shadow-[rgba(212,255,0,0.2)]">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4FF00]">
              Plano de Assinatura AcademiaPro VIP
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Desbloqueie Resultados Otimizados
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto mt-1">
              Treinos personalizados gerados por IA, análise avançada de sobrecarga e acompanhamento remoto constante.
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="space-y-3">
            {[
              {
                icon: Dumbbell,
                title: 'Treinos Personalizados por Inteligência Artificial',
                desc: 'Planilhas adaptadas à sua divisão semanal (3 a 6 dias), foco muscular e tempo disponível.'
              },
              {
                icon: TrendingUp,
                title: 'Análise de Dados Avançada & Alerta de Platô',
                desc: 'Auditoria contínua da evolução de volume em kg e curva de 1RM nos exercícios compostos.'
              },
              {
                icon: ShieldCheck,
                title: 'Acompanhamento Remoto Detalhado',
                desc: 'Recomendações técnicas periódicas da coordenação para otimizar cadência e descanso.'
              },
              {
                icon: MessageSquare,
                title: 'Acesso VIP Ilimitado aos 4 Treinadores',
                desc: 'Consultas sem limites com fisioterapeuta, nutricionista esportiva e treinadores de força.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
                <div className="p-2 rounded-lg bg-[#1A1A1A] text-[#D4FF00] border border-[#333333] shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription State & Action */}
          <div className="pt-4 border-t border-[#222222] space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div>
                <span className="text-xs font-bold text-white">Status da Sua Assinatura:</span>
                <div className="text-sm font-bold text-[#D4FF00]">
                  {userProfile.isPremium ? 'Membro VIP Ativo (Acesso Total)' : 'Plano Básico Gratuito'}
                </div>
              </div>

              <button
                id="btn-toggle-premium-mode"
                onClick={() => {
                  togglePremiumStatus();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  userProfile.isPremium
                    ? 'bg-[#1A1A1A] border border-[#333333] text-neutral-300 hover:text-white'
                    : 'bg-[#D4FF00] hover:brightness-95 text-black shadow-md shadow-[rgba(212,255,0,0.2)]'
                }`}
              >
                {userProfile.isPremium ? 'Desativar VIP' : 'Ativar Acesso VIP Grátis'}
              </button>
            </div>

            {userProfile.isPremium && (
              <button
                id="btn-go-to-ai-generator"
                onClick={() => {
                  onClose();
                  onOpenGenerator();
                }}
                className="w-full py-3.5 rounded-lg bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[rgba(212,255,0,0.2)] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Abrir Gerador de Treinos por IA</span>
              </button>
            )}

            <p className="text-[10px] text-center text-neutral-500">
              Ambiente de demonstração: Você pode alternar o status VIP livremente para testar todas as funcionalidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
