import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, MessageSquare, Trash2, 
  CheckCircle2, ShieldCheck, Dumbbell, AlertCircle 
} from 'lucide-react';
import { COACHES_PROFILES, getOfflineCoachReply } from '../data/coachesData';
import { useWorkout } from '../context/WorkoutContext';
import { ChatMessage, CoachProfile } from '../types';

export const CoachChat: React.FC = () => {
  const { chatHistories, addChatMessage, clearChatHistory, userProfile } = useWorkout();

  const [selectedCoach, setSelectedCoach] = useState<CoachProfile>(COACHES_PROFILES[0]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coachSavedMessages = (chatHistories && chatHistories[selectedCoach.id]) || [];
  const chatMessages: ChatMessage[] = coachSavedMessages.length > 0 
    ? coachSavedMessages 
    : [
        {
          id: `welcome-${selectedCoach.id}`,
          sender: 'coach',
          coachId: selectedCoach.id,
          text: selectedCoach.welcomeMessage,
          timestamp: 'Agora'
        }
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');

    // Add user message
    addChatMessage(selectedCoach.id, {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    setIsLoading(true);

    try {
      // Call backend API (proxied to Gemini with system prompt)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: selectedCoach.id,
          message: text,
          userContext: {
            name: userProfile.name,
            level: userProfile.level,
            weightKg: userProfile.weightKg,
            goal: userProfile.goal,
            streakDays: userProfile.streakDays
          },
          history: (chatMessages || []).slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await res.json();
      if (data.reply) {
        addChatMessage(selectedCoach.id, {
          sender: 'coach',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        throw new Error('Sem resposta da API');
      }
    } catch (err) {
      // Graceful fallback to rich offline knowledge base (especially on GitHub Pages / client-only mode)
      const offlineReply = getOfflineCoachReply(selectedCoach.id, text);
      addChatMessage(selectedCoach.id, {
        sender: 'coach',
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestions based on selected coach
  const quickQuestions: Record<string, string[]> = {
    'coach-rafael': [
      'Como funciona a sobrecarga progressiva em cada treino?',
      'Quantas séries semanais por grupamento para hipertrofia máxima?',
      'Vale a pena treinar até a falha em todas as séries?'
    ],
    'coach-camila': [
      'Como tomar creatina: precisa fazer fase de saturação?',
      'O que comer no pré e pós-treino para ter energia e anabolismo?',
      'Como atingir 2g de proteína/kg sem gastar muito?'
    ],
    'coach-lucas': [
      'Sou iniciante na academia: quantas vezes por semana devo treinar?',
      'Sinto muita dor no dia seguinte ao treino (DOMS), o que fazer?',
      'Como ajustar as máquinas da academia para a minha altura?'
    ],
    'coach-beatriz': [
      'Sinto dor na lombar após o levantamento terra, o que pode ser?',
      'Como proteger o ombro e manguito rotador no supino pesado?',
      'Qual o melhor aquecimento articular antes de agachar?'
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#161616] border border-[#222222] space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Suporte Técnico Online</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Chat com Treinadores Especializados
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Tire dúvidas em tempo real sobre execução de movimentos, ajuste de cargas, nutrição esportiva e prevenção de lesões com nossos profissionais dedicados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Coach Selector Sidebar (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-[#161616] border border-[#222222] space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Escolha o Especialista:</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              4 Disponíveis
            </span>
          </div>

          <div className="space-y-2">
            {COACHES_PROFILES.map((coach) => {
              const isSelected = selectedCoach.id === coach.id;

              return (
                <div
                  key={coach.id}
                  id={`select-coach-${coach.id}`}
                  onClick={() => setSelectedCoach(coach)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1A1A1A] border-[#D4FF00]/50 shadow-sm'
                      : 'bg-[#111111] border-[#222222] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={coach.avatarUrl || coach.avatar}
                      alt={coach.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#333333] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{coach.name}</h4>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#D4FF00] shrink-0"></span>}
                      </div>
                      <p className="text-[11px] font-semibold text-[#D4FF00] truncate">{coach.role}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{coach.specialty}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Coach Bio Card */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#D4FF00]" />
              <span>Credenciais do Especialista</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedCoach.bio}
            </p>
            <div className="text-[10px] text-neutral-400 font-mono">
              CREF/CRN: {selectedCoach.credentials}
            </div>
          </div>
        </div>

        {/* Chat Conversation Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-[#161616] border border-[#222222] overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#111111]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedCoach.avatarUrl || selectedCoach.avatar}
                  alt={selectedCoach.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#333333]"
                  referrerPolicy="no-referrer"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111111] absolute -bottom-0.5 -right-0.5"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedCoach.name}</h3>
                <p className="text-xs text-emerald-400 font-medium">Online • Responde em segundos</p>
              </div>
            </div>

            <button
              onClick={() => clearChatHistory(selectedCoach.id)}
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-[#222222] transition-colors"
              title="Limpar histórico de mensagens"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[440px] bg-[#0E0E0E]">
            {(chatMessages || []).map((msg) => {
              const isUser = msg.sender === 'user';
              const coachSender = msg.coachId 
                ? COACHES_PROFILES.find(c => c.id === msg.coachId) || selectedCoach 
                : selectedCoach;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <img
                      src={coachSender.avatarUrl || coachSender.avatar}
                      alt={coachSender.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[#333333] shrink-0 self-end"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        isUser
                          ? 'bg-[#D4FF00] text-black font-semibold rounded-br-none'
                          : 'bg-[#161616] border border-[#222222] text-[#EDEDED] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-neutral-500 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#333333] text-[#D4FF00] flex items-center justify-center font-bold text-xs shrink-0 self-end">
                      EU
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-neutral-400">
                <img
                  src={selectedCoach.avatarUrl || selectedCoach.avatar}
                  alt={selectedCoach.name}
                  className="w-8 h-8 rounded-lg object-cover border border-[#333333] animate-pulse"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222] text-[#D4FF00] font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping"></span>
                  <span>{selectedCoach.name} está digitando sua orientação técnica...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="p-3 border-t border-[#222222] bg-[#111111] overflow-x-auto scrollbar-none flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase whitespace-nowrap">Sugestões:</span>
            {(selectedCoach.quickQuestions || quickQuestions[selectedCoach.id] || []).map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-neutral-300 text-xs font-medium border border-[#333333] whitespace-nowrap transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <div className="p-3 sm:p-4 border-t border-[#222222] bg-[#111111]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                id="coach-chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Mensagem para ${selectedCoach.name} (${selectedCoach.role})...`}
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-lg bg-[#161616] border border-[#333333] text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4FF00]"
              />
              <button
                type="submit"
                id="btn-send-coach-chat"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 rounded-lg bg-[#D4FF00] hover:brightness-95 disabled:opacity-30 text-black font-bold shadow-md shadow-[rgba(212,255,0,0.2)] transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
