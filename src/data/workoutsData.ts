import { WorkoutProgram } from '../types';

export const WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'iniciante-fullbody',
    title: 'Adaptação & Base Muscular (Full Body)',
    tagline: 'Ideal para os primeiros 2 meses de academia. Aprenda a técnica e crie o hábito sem dores excessivas.',
    level: 'iniciante',
    split: 'Full Body 3x por semana (Seg / Qua / Sex)',
    daysPerWeek: 3,
    durationMin: 45,
    description: 'Ficha focada em consolidar padrões fundamentais de movimento (empurrar, puxar e agachar) com segurança máxima e baixo volume por grupo em cada sessão, permitindo recuperação rápida.',
    focusAreas: ['Aprender execução correta', 'Construir força de base', 'Adaptação articular'],
    isPremium: false,
    exercises: [
      {
        exerciseId: 'leg-press-45',
        targetSets: 3,
        targetReps: '12-15',
        restSeconds: 90,
        targetRPE: 6,
        note: 'Foque na descida suave e controle a respiração.'
      },
      {
        exerciseId: 'supino-reto-barra',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 90,
        targetRPE: 7,
        note: 'Mantenha escápulas retraídas no banco.'
      },
      {
        exerciseId: 'puxada-alta-frente',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 75,
        targetRPE: 7,
        note: 'Puxe direcionando os cotovelos para baixo.'
      },
      {
        exerciseId: 'desenvolvimento-halteres',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 75,
        targetRPE: 7,
        note: 'Banco a 80 graus, não arqueie as costas.'
      },
      {
        exerciseId: 'mesa-flexora',
        targetSets: 3,
        targetReps: '12-15',
        restSeconds: 60,
        targetRPE: 7,
        note: 'Controle o retorno sem soltar o peso de vez.'
      },
      {
        exerciseId: 'triceps-corda-polia',
        targetSets: 2,
        targetReps: '12-15',
        restSeconds: 60,
        targetRPE: 7,
        note: 'Abra a corda no final da extensão.'
      }
    ]
  },
  {
    id: 'iniciante-abc',
    title: 'Divisão ABC de Hipertrofia',
    tagline: 'O treino clássico e mais eficiente para alunos de 3 a 12 meses de treino consistente.',
    level: 'iniciante',
    split: 'ABC 3 a 5x por semana',
    daysPerWeek: 4,
    durationMin: 55,
    description: 'Organiza os grupos musculares sinérgicos: A (Peito, Ombros e Tríceps), B (Costas e Bíceps), C (Pernas completas e Abdômen). Excelente frequência para ganho de massa magra.',
    focusAreas: ['Ganho de massa muscular', 'Progressão gradual de peso', 'Densidade nos grupos principais'],
    isPremium: false,
    exercises: [
      {
        exerciseId: 'supino-reto-barra',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 90,
        targetRPE: 8,
        note: 'Aquecimento prévio com barra vazia.'
      },
      {
        exerciseId: 'desenvolvimento-halteres',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 90,
        targetRPE: 8,
        note: 'Mantenha o core contraído.'
      },
      {
        exerciseId: 'elevacao-lateral-halteres',
        targetSets: 4,
        targetReps: '12-15',
        restSeconds: 60,
        targetRPE: 9,
        note: 'Cadência lenta na descida (2 segundos).'
      },
      {
        exerciseId: 'triceps-corda-polia',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 60,
        targetRPE: 8,
        note: 'Contração de pico por 1 segundo.'
      }
    ]
  },
  {
    id: 'avancado-ppl',
    title: 'Push / Pull / Legs (PPL de Alta Performance)',
    tagline: 'A divisão dourada da ciência esportiva para intermediários e avançados.',
    level: 'avancado',
    split: 'PPL 6 dias por semana (Push A, Pull A, Legs A, Descanso, Repete)',
    daysPerWeek: 6,
    durationMin: 65,
    description: 'Permite treinar cada grupo muscular duas vezes a cada 7-8 dias com volume otimizado de 12 a 18 séries semanais por músculo, maximizando a síntese proteica muscular.',
    focusAreas: ['Sobrecarga progressiva pesada', 'Frequência 2x por semana', 'Estímulo mecânico e metabólico'],
    isPremium: false,
    exercises: [
      {
        exerciseId: 'agachamento-livre',
        targetSets: 4,
        targetReps: '6-8',
        restSeconds: 120,
        targetRPE: 8,
        note: 'Profundidade paralela garantida.'
      },
      {
        exerciseId: 'afundo-bulgaro',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 90,
        targetRPE: 9,
        note: 'Trabalho unilateral de alto impacto nos glúteos e quadríceps.'
      },
      {
        exerciseId: 'leg-press-45',
        targetSets: 3,
        targetReps: '12-15',
        restSeconds: 90,
        targetRPE: 9,
        note: 'Série final com drop set se tiver spotter.'
      },
      {
        exerciseId: 'mesa-flexora',
        targetSets: 4,
        targetReps: '10-12',
        restSeconds: 60,
        targetRPE: 9,
        note: 'Isole os isquiotibiais sem mexer o quadril.'
      }
    ]
  },
  {
    id: 'avancado-power-hypertrophy',
    title: 'Força & Densidade Muscular (Heavy Compound)',
    tagline: 'Focado em progressão nos 3 grandes levantamentos olímpicos e ganhos de força bruta.',
    level: 'avancado',
    split: 'Divisão de Carga Pesada (4x semana)',
    daysPerWeek: 4,
    durationMin: 70,
    description: 'Ideal para quem atingiu um platô de ganho de massa e precisa quebrar barreiras neuromusculares. Trabalha com RPE 8-9 e intervalos longos para máxima reposição de ATP-CP.',
    focusAreas: ['Recordes pessoais (PR)', 'Espessura e densidade de costas', 'Força neuromuscular'],
    isPremium: true,
    exercises: [
      {
        exerciseId: 'levantamento-terra',
        targetSets: 4,
        targetReps: '5-6',
        restSeconds: 150,
        targetRPE: 8.5,
        note: 'Respire fundo no solo antes de cada repetição.'
      },
      {
        exerciseId: 'remada-curvada-barra',
        targetSets: 4,
        targetReps: '8',
        restSeconds: 90,
        targetRPE: 8.5,
        note: 'Puxe com força dorsal sem elevar o tronco.'
      },
      {
        exerciseId: 'puxada-alta-frente',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 75,
        targetRPE: 9,
        note: 'Alongamento máximo no topo.'
      },
      {
        exerciseId: 'rosca-direta-barra-w',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 75,
        targetRPE: 9,
        note: 'Controle rigoroso da fase excêntrica (3s).'
      }
    ]
  },
  {
    id: 'vip-custom-routine',
    title: 'Ficha Customizada VIP / Personalizada por IA',
    tagline: 'Montada exclusivamente para sua rotina, tempo de treino e objetivos específicos.',
    level: 'avancado',
    split: 'Personalizado',
    daysPerWeek: 5,
    durationMin: 60,
    description: 'Prescrição adaptável baseada na sua frequência de treinos, histórico de cargas e pontos fracos a desenvolver.',
    focusAreas: ['Periodização ondulatória', 'Acompanhamento remoto', 'Ajuste de volume individualizado'],
    isPremium: true,
    exercises: [
      {
        exerciseId: 'supino-reto-barra',
        targetSets: 4,
        targetReps: '8-12',
        restSeconds: 90,
        targetRPE: 8
      },
      {
        exerciseId: 'remada-curvada-barra',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 90,
        targetRPE: 8
      },
      {
        exerciseId: 'agachamento-livre',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 120,
        targetRPE: 8
      },
      {
        exerciseId: 'elevacao-lateral-halteres',
        targetSets: 4,
        targetReps: '12-15',
        restSeconds: 60,
        targetRPE: 9
      }
    ]
  }
];
