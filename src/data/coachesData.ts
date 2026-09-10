import { CoachProfile } from '../types';

export const COACHES_DATABASE: CoachProfile[] = [
  {
    id: 'hypertrophy',
    name: 'Prof. Rafael Silva',
    role: 'Head Coach de Hipertrofia & Força',
    badge: 'Mestre em Fisiologia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    specialty: 'Sobrecarga progressiva, quebra de platô, periodização avançada e técnica de alta intensidade.',
    experience: '15+ anos preparando atletas e alunos de todos os níveis',
    welcomeMessage: 'E aí, campeão! Eu sou o Rafael. Meu foco é fazer cada minuto do seu treino render o dobro com biomecânica refinada e progressão real de carga. Em qual exercício ou divisão você quer evoluir hoje?',
    quickQuestions: [
      'Como progredir carga no supino sem arrebentar o ombro?',
      'Qual a diferença de treinar com 6-8 reps vs 10-12 reps para hipertrofia?',
      'Quantas séries semanais devo fazer para cada músculo?',
      'Estou travado na mesma carga há 1 mês, o que fazer?'
    ]
  },
  {
    id: 'nutrition',
    name: 'Dra. Camila Duarte',
    role: 'Nutricionista Esportiva Clínica',
    badge: 'CRN Especialista',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    specialty: 'Cálculo de macros, dietas para hipertrofia e definição limpa, suplementação e refeições práticas.',
    experience: 'Mais de 3.000 alunos orientados com dieta sustentável',
    welcomeMessage: 'Olá! Sou a Dra. Camila. A academia constrói o estímulo, mas é a sua alimentação e recuperação que constroem os músculos. Me conte sua rotina ou me pergunte sobre cálculo de proteínas, suplementos e timing das refeições!',
    quickQuestions: [
      'Como calcular quanta proteína preciso no meu dia?',
      'O que comer 1 hora antes de ir para o treino?',
      'Creatina engorda ou retém líquido fora do músculo?',
      'Como ganhar massa magra sem acumular gordura na barriga?'
    ]
  },
  {
    id: 'beginner',
    name: 'Treinador Lucas Mendes',
    role: 'Coach de Iniciantes & Adaptação',
    badge: 'Especialista em Base',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    specialty: 'Primeiros passos na academia, perda da timidez, postura correta, respiração e criação de disciplina.',
    experience: 'Especialista em transformar quem nunca pisou numa academia em praticante assíduo',
    welcomeMessage: 'Fala, guerreiro! Lucas aqui. Se você está começando ou voltando agora, fique tranquilo: todo mundo começou do zero. Aqui não tem julgamento. Qual é a sua maior dúvida ou receio sobre os treinos na academia?',
    quickQuestions: [
      'Tenho vergonha de ir para a área de pesos livres, o que fazer?',
      'Como respirar corretamente durante as repetições?',
      'É normal sentir muitas dores nos primeiros dias?',
      'Devo fazer aeróbico antes ou depois da musculação?'
    ]
  },
  {
    id: 'physio',
    name: 'Dra. Beatriz Santos',
    role: 'Fisioterapeuta & Biomecânica',
    badge: 'Crefito Especialista',
    avatar: 'https://images.unsplash.com/photo-1594824813576-96947b1f3c30?auto=format&fit=crop&w=300&q=80',
    specialty: 'Mobilidade articular, prevenção de lesões em ombros/joelhos/coluna, e aquecimento pré-treino.',
    experience: 'Fisioterapeuta de atletas de força e praticantes diários',
    welcomeMessage: 'Bem-vindo(a)! Sou a Dra. Beatriz. Treinar pesado só funciona se o corpo estiver livre de compensações e dores articulares. Sentiu algum desconforto no joelho, ombro ou lombar? Me explique o que está sentindo!',
    quickQuestions: [
      'Sinto dor no ombro quando faço desenvolvimento, como ajustar?',
      'Como melhorar a mobilidade do tornozelo para agachar mais fundo?',
      'Como aquecer as articulações antes de colocar muito peso na barra?',
      'O que fazer para proteger a lombar no levantamento terra?'
    ]
  }
];

// Export COACHES_PROFILES alias with avatarUrl fallback
export const COACHES_PROFILES: CoachProfile[] = COACHES_DATABASE.map(c => ({
  ...c,
  avatarUrl: c.avatar,
  bio: c.specialty + ' ' + c.experience,
  credentials: c.badge
}));

// Offline expert fallback responses (useful for GitHub Pages or when offline)
export const OFFLINE_EXPERT_KNOWLEDGE: Record<string, string> = {
  'supino': `**Guia Mestre de Supino do Prof. Rafael:**
1. **Retração e Depressão Escapular:** Junte as escápulas como se segurasse uma caneta entre elas. Não perca essa trava ao empurrar a barra.
2. **Ângulo dos Cotovelos:** Mantenha os cotovelos entre 45° e 70° em relação ao tronco. Nunca abra em 90°, pois isso causa pinçamento no tendão do supraespinhal.
3. **Pernas Firmes (Leg Drive):** Pressione os calcanhares no chão para estabilizar toda a cadeia posterior.
4. **Sobrecarga Progressiva:** Aumente primeiro repetições (ex: passe de 8 para 12 com 20kg de cada lado), e só então aumente 1 a 2kg de cada lado.`,

  'proteina': `**Orientação de Proteínas da Dra. Camila:**
- **Quantidade Alvo:** Consuma entre 1,6g e 2,2g por kg de peso corporal ao dia. Exemplo: se você pesa 75kg, sua meta fica entre 120g e 165g de proteína pura ao dia.
- **Distribuição Ideal:** Faça de 3 a 4 refeições com cerca de 30g a 40g de proteína cada para estimular a síntese proteica via leucina.
- **Fontes baratas e ricas:** Ovos (6g por ovo), Peito de frango (30g de proteína a cada 100g pesado cru), Atum, Queijo cottage e Whey Protein concentrado.`,

  'iniciante': `**Conselhos Dourados do Treinador Lucas para Iniciantes:**
1. **Ninguém está te julgando:** Todo mundo na academia está concentrado na própria dor e no espelho!
2. **Priorize a forma sobre a carga:** O peso é apenas uma ferramenta. Aprenda o movimento com barra vazia ou pesos leves nas primeiras 2 a 3 semanas.
3. **Frequência vence intensidade:** É muito melhor treinar 3 dias por semana durante 6 meses do que treinar 6 dias empolgado e desistir na terceira semana!
4. **Respiração:** Puxe o ar na descida (fase excêntrica) e solte o ar na subida (fase concêntrica da força).`,

  'ombro': `**Prevenção de Lesões no Ombro com a Dra. Beatriz:**
- No desenvolvimento e supino, execute no **plano escapular** (braços apontando cerca de 30° à frente da linha coronal).
- Aqueça o manguito rotador com rotação externa leve na polia (1 a 2 séries de 15 repetições leves).
- Fortaleça as costas: um peitoral forte sem dorsais equilibradas traciona os ombros para frente, gerando impacto subacromial.`,

  'creatina': `**Tudo sobre Creatina com a Dra. Camila:**
- **Como funciona:** Aumenta os estoques de fosfocreatina nas células musculares, permitindo realizar 1 a 3 repetições a mais com carga alta.
- **Dosagem:** 3g a 5g todos os dias (inclusive aos sábados e domingos sem treino).
- **Mito da retenção:** A creatina retém água DENTRO da célula muscular (efeito anabólico e hidratação celular), ela NÃO causa inchaço sob a pele nem gordura!`,

  'dor': `**Dica da Fisioterapeuta Beatriz sobre dores pós-treino:**
- **Dor Muscular Tardia (DMT):** Aparece 24h a 48h após um estímulo novo e é difusa no ventre muscular. É normal e faz parte da adaptação.
- **Dor Articular/Aguda:** Pontada perto do tendão ou articulação que piora com o movimento: pare imediatamente o exercício, aplique gelo e procure avaliação profissional.`
};

export function getOfflineCoachReply(coachId: string, message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('supino') || lower.includes('peitoral') || lower.includes('peito')) {
    return OFFLINE_EXPERT_KNOWLEDGE['supino'];
  }
  if (lower.includes('proteina') || lower.includes('proteína') || lower.includes('frango') || lower.includes('ovo')) {
    return OFFLINE_EXPERT_KNOWLEDGE['proteina'];
  }
  if (lower.includes('creatina') || lower.includes('suplemento') || lower.includes('whey')) {
    return OFFLINE_EXPERT_KNOWLEDGE['creatina'];
  }
  if (lower.includes('ombro') || lower.includes('manguito') || lower.includes('desenvolvimento')) {
    return OFFLINE_EXPERT_KNOWLEDGE['ombro'];
  }
  if (lower.includes('iniciante') || lower.includes('começar') || lower.includes('primeiro')) {
    return OFFLINE_EXPERT_KNOWLEDGE['iniciante'];
  }
  if (lower.includes('dor') || lower.includes('machucou') || lower.includes('lesão') || lower.includes('lesao')) {
    return OFFLINE_EXPERT_KNOWLEDGE['dor'];
  }

  const coach = COACHES_DATABASE.find(c => c.id === coachId) || COACHES_DATABASE[0];
  return `Olá! Sou o(a) ${coach.name}. Excelente pergunta sobre seu treinamento. Como regra de ouro: mantenha a cadência de 2 a 3 segundos na fase excêntrica (descida do peso), controle a respiração soltando o ar no ponto de esforço máximo e anote cada série no app para aplicar a sobrecarga progressiva. Se precisar de uma estratégia específica, me dê mais detalhes de qual exercício você está executando!`;
}

