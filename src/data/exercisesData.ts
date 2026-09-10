import { Exercise } from '../types';

export const EXERCISES_DATABASE: Exercise[] = [
  {
    id: 'supino-reto-barra',
    name: 'Supino Reto com Barra',
    level: 'iniciante',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Banco e Barra Olímpica',
    youtubeId: 'rT7DgCr-3pg', // Form guide
    setupInstructions: [
      'Deite no banco com os olhos diretamente sob a barra.',
      'Apoie os pés firmemente no chão, sem levantá-los durante o movimento.',
      'Faça a retração escapular (junte as escápulas e apoie as costas no banco).',
      'Segure a barra com uma pegada um pouco além da largura dos ombros.',
      'Gire os punhos levemente para que a barra repouse sobre o calcanhar da mão.'
    ],
    executionSteps: [
      'Tire a barra do suporte e posicione-a sobre a linha dos mamilos com os braços estendidos.',
      'Desça a barra controladamente (2 a 3 segundos) até tocar suavemente o meio do peitoral.',
      'Mantenha os cotovelos a aproximadamente 45° a 70° em relação ao tronco (não abra 90°).',
      'Empurre a barra de volta com explosão controlada, soltando o ar no final da subida.'
    ],
    commonMistakes: [
      'Bater a barra no peito como uma mola (risco ao esterno).',
      'Tirar o glúteo do banco durante o esforço.',
      'Abrir os cotovelos em 90 graus na linha dos ombros (impacto subacromial).',
      'Deixar os punhos hiperestendidos para trás.'
    ],
    coachTips: 'Pense em empurrar seu corpo contra o banco e não apenas empurrar a barra para longe. Isso ativa o peitoral com máxima tensão mecânica.',
    defaultSets: 4,
    defaultReps: '8-12',
    defaultRestSeconds: 90
  },
  {
    id: 'agachamento-livre',
    name: 'Agachamento Livre com Barra',
    level: 'iniciante',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posterior', 'Abdômen'],
    equipment: 'Gaiola de Agachamento e Barra',
    youtubeId: 'bEv6CCg2BC8',
    setupInstructions: [
      'Posicione a barra sobre o trapézio médio (pegada alta) ou sobre os deltóides posteriores (pegada baixa).',
      'Afaste os pés na largura dos ombros ou ligeiramente mais largos, com as pontas dos pés viradas 15° a 30° para fora.',
      'Ative o abdômen profundamente (manobra de Valsalva) antes de iniciar a descida.'
    ],
    executionSteps: [
      'Inicie o movimento quebrando o quadril e os joelhos simultaneamente.',
      'Desça até que a dobra do quadril fique pelo menos no mesmo nível do topo dos joelhos (paralelo ou abaixo).',
      'Mantenha os joelhos apontando na mesma direção das pontas dos pés.',
      'Suba empurrando o chão com o meio do pé e calcanhar, mantendo o peito erguido.'
    ],
    commonMistakes: [
      'Valgo dinâmico (joelhos colapsando para dentro na subida).',
      'Perder a curvatura neutra da coluna (retroversão pélvica excessiva ou "butt wink").',
      'Tirar os calcanhares do chão durante a descida.'
    ],
    coachTips: 'Imagine que você está tentando "abrir o chão" para os lados com os pés. Isso recruta instantaneamente seus glúteos e estabiliza os joelhos.',
    defaultSets: 4,
    defaultReps: '6-10',
    defaultRestSeconds: 120
  },
  {
    id: 'puxada-alta-frente',
    name: 'Puxada Alta no Pulley (Lat Pulldown)',
    level: 'iniciante',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polia Alta (Pulley) com Barra Aberta',
    youtubeId: 'CAwf7n6Luuc',
    setupInstructions: [
      'Ajuste o rolo de apoio das coxas para que suas pernas fiquem firmemente presas.',
      'Segure a barra aberta com pegada pronada (palmas para a frente), um pouco mais larga que os ombros.',
      'Sente-se mantendo o tronco ereto, peito estufado e leve inclinação de 10-15° para trás.'
    ],
    executionSteps: [
      'Inicie deprimindo as escápulas para baixo antes de dobrar os cotovelos.',
      'Puxe a barra em direção à parte superior do peito/clavícula.',
      'Pense em puxar com os cotovelos apontando para baixo e para trás.',
      'Retorne de forma controlada até o alongamento completo das dorsais.'
    ],
    commonMistakes: [
      'Jogar o corpo excessivamente para trás usando impulso lombar.',
      'Puxar a barra atrás da nuca (sobrecarga nociva à articulação do ombro).',
      'Subir os ombros nas orelhas durante a fase excêntrica.'
    ],
    coachTips: 'Foque na conexão mente-músculo: imagine que suas mãos são apenas ganchos e você está puxando o cabo diretamente pelos seus cotovelos.',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75
  },
  {
    id: 'desenvolvimento-halteres',
    name: 'Desenvolvimento de Ombros com Halteres',
    level: 'iniciante',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Peito'],
    equipment: 'Banco 80° e Halteres',
    youtubeId: 'qEwKCR5JCog',
    setupInstructions: [
      'Ajuste o banco em uma inclinação de cerca de 75° a 80° (quase reto, mas com apoio confortável).',
      'Apoie os halteres nas coxas e dê um impulso com os joelhos para posicioná-los na altura dos ombros.',
      'Pés firmes no chão, coluna neutra apoiada no encosto.'
    ],
    executionSteps: [
      'Mantenha os cotovelos no plano escapular (cerca de 30° à frente da linha dos ombros, não totalmente abertos).',
      'Empurre os halteres para cima em arco suave até quase estender os braços, sem tocar os pesos no topo.',
      'Desça de forma controlada até a altura das orelhas ou queixo.'
    ],
    commonMistakes: [
      'Hiperestender a coluna lombar (descolar a lombar do banco para compensar peso).',
      'Bater os halteres com força no topo da repetição.',
      'Deixar os cotovelos caírem muito para trás.'
    ],
    coachTips: 'Não junte nem bata os halteres no topo; mantenha a linha de força vertical para que o deltóide fique sob tensão contínua durante todo o arco.',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 90
  },
  {
    id: 'levantamento-terra',
    name: 'Levantamento Terra Convencional (Deadlift)',
    level: 'avancado',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Glúteos', 'Posterior', 'Quadríceps', 'Abdômen'],
    equipment: 'Barra Olímpica e Anilhas no Chão',
    youtubeId: 'op9kVnSso6Q',
    setupInstructions: [
      'Fique de pé com a barra sobre a metade do pé (cerca de 2 a 3 cm da canela).',
      'Pés na largura do quadril, apontando para a frente.',
      'Dobre o quadril para trás e segure a barra logo por fora dos joelhos.',
      'Encoste as canelas na barra sem empurrá-la para frente.',
      'Estufe o peito, tracione os dorsais e trave a respiração diafragmática.'
    ],
    executionSteps: [
      'Puxe a barra do chão empurrando o chão com as pernas, mantendo a barra colada nas canelas.',
      'Barra e quadril sobem em sincronia até passar dos joelhos.',
      'Finalize estendendo o quadril e contraindo os glúteos em posição ereta neutra (sem hiperextender para trás).',
      'Desça empurrando o quadril para trás até a barra passar os joelhos, então dobre os joelhos até tocar o solo.'
    ],
    commonMistakes: [
      'Arredondar a coluna lombar durante a saída da barra.',
      'Afastar a barra do corpo durante a subida.',
      'Jogar o tronco excessivamente para trás no bloqueio superior.'
    ],
    coachTips: 'O Terra é um exercício de empurrar o chão e não de puxar com a coluna. Pense em leg press contra o solo!',
    defaultSets: 4,
    defaultReps: '5-8',
    defaultRestSeconds: 150
  },
  {
    id: 'elevacao-lateral-halteres',
    name: 'Elevação Lateral com Halteres',
    level: 'iniciante',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas'],
    equipment: 'Par de Halteres',
    youtubeId: '3VcKaXpzqRo',
    setupInstructions: [
      'Fique em pé com os pés na largura dos ombros e joelhos levemente destravados.',
      'Incline o tronco cerca de 5° a 10° para a frente.',
      'Segure os halteres ao lado do corpo com cotovelos levemente flexionados (10-15°).'
    ],
    executionSteps: [
      'Eleve os braços para os lados no plano escapular até a altura dos ombros.',
      'Pense em liderar o movimento pelos cotovelos e não pelos pulsos.',
      'Pause por meio segundo no topo para pico de contração do deltóide lateral.',
      'Desça controlando a carga por 2 segundos sem deixar o peso descansar nas coxas.'
    ],
    commonMistakes: [
      'Usar balanço do quadril para iniciar a repetição com peso excessivo.',
      'Subir as mãos mais alto do que os cotovelos.',
      'Encolher os ombros ativando o trapézio em excesso.'
    ],
    coachTips: 'Imagine que você está derramando água de duas jarras no topo do movimento. Isso posiciona o deltóide lateral sob tensão máxima!',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60
  },
  {
    id: 'leg-press-45',
    name: 'Leg Press 45 Graus',
    level: 'iniciante',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posterior'],
    equipment: 'Aparelho Leg Press 45°',
    youtubeId: 'IZxyjW7MPJQ',
    setupInstructions: [
      'Sente no aparelho com as costas e a lombar perfeitamente apoiadas no encosto.',
      'Posicione os pés na plataforma na largura dos ombros, na altura média ou ligeiramente alta.',
      'Destrave as travas de segurança segurando as alças laterais com firmeza.'
    ],
    executionSteps: [
      'Flexione os joelhos trazendo a plataforma em direção ao tronco de forma controlada.',
      'Desça até atingir cerca de 90° de flexão de joelho, sem permitir que a lombar descole do banco.',
      'Empurre a plataforma de volta aplicando força pelo meio do pé e calcanhares.',
      'Pare logo antes do bloqueio total das articulações dos joelhos (evite hiperextensão).'
    ],
    commonMistakes: [
      'Deixar a lombar descolar do banco no ponto mais fundo (risco alto de hérnia discal).',
      'Travar/estalar os joelhos no topo sob alta carga.',
      'Colocar as mãos sobre os joelhos para ajudar.'
    ],
    coachTips: 'Puxe as alças de apoio firmemente para manter seu quadril colado no banco durante toda a descida!',
    defaultSets: 4,
    defaultReps: '10-15',
    defaultRestSeconds: 90
  },
  {
    id: 'rosca-direta-barra-w',
    name: 'Rosca Direta com Barra W',
    level: 'iniciante',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    equipment: 'Barra W e Anilhas',
    youtubeId: 'kwG2ipFRgfo',
    setupInstructions: [
      'Fique em pé com postura ereta, peito aberto e pés paralelos.',
      'Segure a barra W nas curvaturas internas (pegada anatômica que protege os punhos).',
      'Mantenha os cotovelos fixados ao lado do tronco.'
    ],
    executionSteps: [
      'Flexione os cotovelos contraindo o bíceps e erguendo a barra até a altura do peito.',
      'Aperte o bíceps por 1 segundo no topo do movimento.',
      'Desça lentamente estendendo quase que totalmente os braços para alongar a fibra muscular.'
    ],
    commonMistakes: [
      'Balançar o tronco para trás no início da subida.',
      'Projetar os cotovelos excessivamente para a frente, transferindo o trabalho para os deltóides frontais.'
    ],
    coachTips: 'Cole os cotovelos na cintura como se estivesse segurando um livro entre os cotovelos e as costelas.',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60
  },
  {
    id: 'triceps-corda-polia',
    name: 'Tríceps na Polia com Corda',
    level: 'iniciante',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia Alta com Corda',
    youtubeId: 'vB5OHsJ3EME',
    setupInstructions: [
      'Prenda a corda no ponto mais alto da polia.',
      'Segure as pontas da corda, dê um passo para trás e incline o tronco cerca de 15°.',
      'Fixe os cotovelos junto às laterais do corpo.'
    ],
    executionSteps: [
      'Estenda os cotovelos empurrando a corda para baixo.',
      'No final da extensão, afaste as pontas da corda para fora para máxima contração da cabeça lateral do tríceps.',
      'Suba a corda controladamente até o ângulo de 90 graus nos cotovelos.'
    ],
    commonMistakes: [
      'Mover os cotovelos para frente e para trás em vez de isolar a articulação.',
      'Deixar os ombros subirem em direção ao pescoço.'
    ],
    coachTips: 'Abra a corda no final como se estivesse tentando passar as mãos pelas coxas. Isso ativa o tríceps em encurtamento máximo!',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60
  },
  {
    id: 'remada-curvada-barra',
    name: 'Remada Curvada com Barra',
    level: 'avancado',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Posterior', 'Abdômen'],
    equipment: 'Barra Olímpica e Anilhas',
    youtubeId: 'G8l_8chR5BE',
    setupInstructions: [
      'Fique de pé com a barra na largura dos ombros.',
      'Flexione levemente os joelhos e incline o tronco para a frente a cerca de 45° a 60°, mantendo a coluna retilínea.',
      'Braços pendurados verticalmente sob a barra.'
    ],
    executionSteps: [
      'Puxe a barra em direção ao umbigo, tracionando os cotovelos para trás e para cima.',
      'Aperte as escápulas uma contra a outra no topo do movimento.',
      'Desça a barra com controle até os braços estenderem, mantendo o tronco estático.'
    ],
    commonMistakes: [
      'Ficar quase de pé durante as repetições perdendo o ângulo das dorsais.',
      'Arredondar a coluna toracolombar durante o esforço.'
    ],
    coachTips: 'Trave o abdômen e glúteos para ancorar a postura. Se a coluna começar a curvar, reduza o peso imediatamente.',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90
  },
  {
    id: 'afundo-bulgaro',
    name: 'Agachamento Búlgaro com Halteres',
    level: 'avancado',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Quadríceps', 'Posterior'],
    equipment: 'Banco e Dois Halteres',
    youtubeId: '2C-uNgKwPLE',
    setupInstructions: [
      'Posicione-se de costas para um banco plano, a cerca de dois a três passos de distância.',
      'Apoie a ponta de um pé no banco atrás de você.',
      'Mantenha o tronco levemente inclinado para frente para maior ênfase no glúteo.'
    ],
    executionSteps: [
      'Desça o joelho de trás em direção ao solo até que a coxa da frente fique paralela ao chão.',
      'Mantenha o joelho da frente estável e alinhado com o segundo dedo do pé.',
      'Suba empurrando o calcanhar da frente contra o piso até quase estender a perna.'
    ],
    commonMistakes: [
      'Colocar o pé da frente muito perto do banco, forçando excessivamente a patela.',
      'Deixar o joelho colapsar para dentro (valgo).'
    ],
    coachTips: 'O melhor exercício unilateral para hipertrofia de membros inferiores e correção de assimetrias musculares!',
    defaultSets: 3,
    defaultReps: '10-12 cada perna',
    defaultRestSeconds: 90
  },
  {
    id: 'mesa-flexora',
    name: 'Mesa Flexora Deitada',
    level: 'iniciante',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Aparelho Mesa Flexora',
    youtubeId: 'ELOCsoDSmrg',
    setupInstructions: [
      'Deite de bruços no aparelho com o rolo de apoio posicionado logo acima dos calcanhares (no tendão de Aquiles).',
      'Alinhe a articulação do joelho com o eixo de rotação do aparelho.',
      'Segure firme nas alças laterais e pressione a pelve contra o estofamento.'
    ],
    executionSteps: [
      'Puxe os calcanhares em direção aos glúteos flexionando os joelhos.',
      'Segure a contração máxima por 1 segundo no topo.',
      'Retorne de forma lenta e controlada, resistindo ao peso na descida.'
    ],
    commonMistakes: [
      'Levantar o quadril do estofamento durante a puxada.',
      'Usar impulso com a coluna lombar.'
    ],
    coachTips: 'Mantenha os pés em dorsiflexão (pontas apontadas para as canelas) para maximizar o recrutamento dos isquiotibiais.',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 60
  }
];
