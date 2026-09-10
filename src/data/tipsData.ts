import { DailyTip } from '../types';

export const DAILY_TIPS_DATABASE: DailyTip[] = [
  // FORMA & BIOMECÂNICA
  {
    id: 'forma-supino-escapulas',
    category: 'forma',
    title: 'Retração e Depressão Escapular no Supino',
    tag: 'Biomecânica de Peito',
    content: 'Nunca faça supino com as costas retas e "soltas" no banco. Junte as escápulas como se estivesse segurando uma caneta entre elas e puxe-as para baixo (depressão escapular).',
    practicalAction: 'Antes de tirar a barra do suporte, enterre os trapézios no estofado, aperte as escápulas e mantenha essa ponte peitoral estável até guardar a barra.',
    scientificOrCoachNote: 'Essa base sólida cria uma plataforma rígida de empurrar, protege o manguito rotador do impacto subacromial e transfere 100% da tensão mecânica para as fibras peitorais.',
    exerciseId: 'supino-reto-barra',
    authorBadge: 'Prof. Rafael Silva'
  },
  {
    id: 'forma-agachamento-chao',
    category: 'forma',
    title: 'Agachamento: "Abrindo o Chão" com os Pés',
    tag: 'Estabilidade de Joelho',
    content: 'Em vez de apenas descer o corpo, crie torque rotacional nos quadris: imagine que você está tentando rasgar o chão ao meio empurrando os pés para fora, sem tirá-los do lugar.',
    practicalAction: 'Gire levemente os joelhos para fora na mesma linha dos dedos dos pés. Isso elimina o perigoso valgo dinâmico (joelhos colapsando para dentro).',
    scientificOrCoachNote: 'O torque externo aciona imediatamente o glúteo médio e os rotadores profundos do quadril, blindando ligamentos (como o LCA) em cargas pesadas.',
    exerciseId: 'agachamento-livre',
    authorBadge: 'Dra. Beatriz Santos'
  },
  {
    id: 'forma-terra-empurrar',
    category: 'forma',
    title: 'Levantamento Terra: Empurre o Piso em Vez de Puxar',
    tag: 'Proteção Lombar',
    content: 'Muitos praticantes encaram o Terra como um exercício de "puxada com a coluna". O segredo do Terra convencional é encará-lo como um leg press contra o solo.',
    practicalAction: 'Prenda a barra colada nas canelas, encha a barriga de ar (Valsalva), contraia as dorsais e empurre a Terra para longe de você com a sola dos pés.',
    scientificOrCoachNote: 'Ao gerar força a partir do assoalho e dos quadríceps/glúteos na saída, o momento de alavanca sobre os discos lombares diminui drasticamente.',
    exerciseId: 'levantamento-terra',
    authorBadge: 'Prof. Rafael Silva'
  },
  {
    id: 'forma-puxada-ganchos',
    category: 'forma',
    title: 'Puxadas: Suas Mãos São Apenas Ganchos',
    tag: 'Conexão Mente-Músculo',
    content: 'Se você sente o antebraço e o bíceps queimarem antes das costas na puxada ou remada, você está puxando com as mãos em vez dos cotovelos.',
    practicalAction: 'Adote a pegada sem polegar (falsa pegada ou thumbless grip) e concentre todo o pensamento em cravar a ponta dos cotovelos na cintura.',
    scientificOrCoachNote: 'Estudos eletromiográficos mostram que direcionar o foco atencional interno para os cotovelos aumenta a ativação do grande dorsal em até 22%.',
    exerciseId: 'puxada-alta-frente',
    authorBadge: 'Treinador Lucas Mendes'
  },
  {
    id: 'forma-elevacao-plano-escapular',
    category: 'forma',
    title: 'Elevação Lateral no Plano Escapular (30° à Frente)',
    tag: 'Saúde dos Ombros',
    content: 'Não levante os halteres totalmente alinhados para os lados (plano frontal puro a 180°). Incline os braços cerca de 20° a 30° à frente da linha do corpo.',
    practicalAction: 'Eleve os halteres em um suave formato de "V", liderando o movimento pelos cotovelos e pausando meio segundo no topo.',
    scientificOrCoachNote: 'O plano escapular respeita a anatomia da cavidade glenóide e da cabeça do úmero, permitindo livre deslizamento sem pinçamento do tendão supraespinhal.',
    exerciseId: 'elevacao-lateral-halteres',
    authorBadge: 'Dra. Beatriz Santos'
  },
  {
    id: 'forma-bulgaro-postura',
    category: 'forma',
    title: 'Agachamento Búlgaro: A Cura das Assimetrias',
    tag: 'Hipertrofia de Glúteo',
    content: 'O afundo búlgaro é um dos construtores mais potentes de glúteo e quadríceps porque isola cada membro, corrigindo déficits de força entre o lado direito e esquerdo.',
    practicalAction: 'Incline ligeiramente o tronco 15° para frente durante a descida para estirar o glúteo máximo com máxima tensão excêntrica.',
    scientificOrCoachNote: 'Exercícios unilaterais acionam o "déficit bilateral", gerando maior somatório de força do que agachamentos bilaterais com metade do impacto axial na coluna.',
    exerciseId: 'afundo-bulgaro',
    authorBadge: 'Prof. Rafael Silva'
  },
  {
    id: 'forma-cadencia-excentrica',
    category: 'forma',
    title: 'Cadência Excêntrica: Onde a Hipertrofia Acontece',
    tag: 'Tempo Sob Tensão',
    content: 'Deixar o peso despencar na volta anula metade do estímulo hipertrófico da sua série. A fase excêntrica (descida do peso) causa o maior dano adaptativo de fibras musculares.',
    practicalAction: 'Conte mentalmente "1, 2, 3" segundos na descida de cada repetição, controlando a gravidade com foco absoluto no músculo alvo.',
    scientificOrCoachNote: 'A fase excêntrica permite suportar cargas maiores com menor custo metabólico, recrutando unidades motoras de alto limiar responsáveis pelo ganho de massa.',
    authorBadge: 'Prof. Rafael Silva'
  },
  {
    id: 'forma-triceps-corda-abrir',
    category: 'forma',
    title: 'Tríceps na Corda: Afaste as Mãos no Fim',
    tag: 'Encurtamento Total',
    content: 'No tríceps polia com corda, estender os braços reto para baixo ativa apenas parcialmente as fibras. A corda existe justamente para permitir rotação terminal.',
    practicalAction: 'Ao estender os cotovelos, puxe as extremidades da corda para fora passando pelas laterais das coxas e aperte o tríceps por 1 segundo.',
    scientificOrCoachNote: 'Esse movimento de pronação/abertura terminal solicita com intensidade a cabeça lateral do tríceps em encurtamento máximo.',
    exerciseId: 'triceps-corda-polia',
    authorBadge: 'Treinador Lucas Mendes'
  },

  // NUTRIÇÃO & TIMING
  {
    id: 'nutri-leucina-mTOR',
    category: 'nutricao',
    title: 'O Gatilho da Leucina e Síntese Proteica',
    tag: 'Construção Muscular',
    content: 'Para que o seu corpo ative o gatilho da síntese de novas proteínas musculares (via mTOR), cada refeição precisa fornecer entre 2,5g a 3g do aminoácido Leucina.',
    practicalAction: 'Garanta de 25g a 40g de proteína de alto valor biológico (ex: 120g de frango, 4 ovos inteiros ou 1 scoop de Whey) em cada uma das suas refeições principais.',
    scientificOrCoachNote: 'Comer pequenas doses espalhadas de 5g ou 10g de proteína não atinge o limiar mínimo de leucina, gerando menor resposta anabólica ao longo do dia.',
    nutritionCategory: 'fundamentos',
    authorBadge: 'Dra. Camila Duarte'
  },
  {
    id: 'nutri-hidratacao-forca',
    category: 'nutricao',
    title: 'Hidratação de Precisão: Água é Força Pura',
    tag: 'Performance Celular',
    content: 'Seus músculos são compostos por mais de 70% de água. Uma queda de míseros 2% nos fluidos corporais reduz em até 15% sua capacidade de realizar repetições com cargas pesadas.',
    practicalAction: 'Consuma de 35ml a 50ml de água para cada kg do seu peso todos os dias (ex: 70kg × 40ml = 2,8 litros). Mantenha uma garrafa de 1L ao alcance.',
    scientificOrCoachNote: 'A água é o solvente do transporte de eletrólitos (sódio e potássio), essencial para o potencial de ação neuromuscular e o pump intracelular.',
    nutritionCategory: 'hidratacao',
    authorBadge: 'Dra. Camila Duarte'
  },
  {
    id: 'nutri-creatina-consistencia',
    category: 'nutricao',
    title: 'Creatina: O Suplemento Mais Estudado do Mundo',
    tag: 'Força & Potência',
    content: 'A creatina não funciona por efeito agudo como a cafeína. Ela funciona por saturação contínua dos estoques intramusculares de fosfocreatina (sistema ATP-CP).',
    practicalAction: 'Tome de 3g a 5g de creatina todos os dias, inclusive nos dias em que não treinar, preferencialmente junto a uma refeição contendo carboidratos.',
    scientificOrCoachNote: 'A insulina liberada pelos carboidratos atua como carreador facilitador da captação de creatina pelas células musculares esqueléticas.',
    nutritionCategory: 'suplementacao',
    authorBadge: 'Dra. Camila Duarte'
  },
  {
    id: 'nutri-carboidratos-combustivel',
    category: 'nutricao',
    title: 'Carboidratos: O Verdadeiro Poupador Muscular',
    tag: 'Energia de Treino',
    content: 'Dietas muito restritivas em carboidratos esvaziam os estoques de glicogênio muscular, fazendo você se sentir fraco, desmotivado e forçando o corpo a catabolizar aminoácidos.',
    practicalAction: 'Consuma boas fontes de carboidratos lentos (arroz, batata, aveia, mandioca) cerca de 90 a 120 minutos antes do treino para treinar com vigor total.',
    scientificOrCoachNote: 'A musculação de alta intensidade depende quase exclusivamente da via glicolítica anaeróbia; sem glicogênio, a produção de força máxima desaba.',
    nutritionCategory: 'pre-pos-treino',
    authorBadge: 'Dra. Camila Duarte'
  },
  {
    id: 'nutri-gorduras-hormonios',
    category: 'nutricao',
    title: 'Gorduras Boas e a Produção de Testosterona',
    tag: 'Ambiente Hormonal',
    content: 'Nunca zere as gorduras da dieta para "secar". Gorduras boas são o bloco construtor básico do colesterol, que por sua vez sintetiza a testosterona livre e hormônios anabólicos.',
    practicalAction: 'Mantenha entre 0,8g e 1,0g de gorduras saudáveis por kg de peso corporal, priorizando azeite de oliva extravirgem, castanhas, abacate e gemas de ovos caipiras.',
    scientificOrCoachNote: 'Estudos clínicos demonstram que dietas com menos de 15% de calorias provenientes de lipídios causam queda significativa nos níveis séricos de andrógenos.',
    nutritionCategory: 'fundamentos',
    authorBadge: 'Dra. Camila Duarte'
  },
  {
    id: 'nutri-pos-treino-realidade',
    category: 'nutricao',
    title: 'Janela Pós-Treino: Nem Imediata, Nem Eterna',
    tag: 'Recuperação Muscular',
    content: 'Você não precisa engolir um shake no vestiário em 5 minutos desesperadamente, mas também não deve ficar 4 horas em jejum após moer os músculos no treino.',
    practicalAction: 'Faça uma refeição contendo carboidratos e proteínas de qualidade entre 45 minutos e 2 horas após o término do treino.',
    scientificOrCoachNote: 'A sensibilidade à insulina muscular permanece elevada por até 2 a 3 horas pós-exercício, maximizando a taxa de ressíntese de glicogênio e reparo tecidual.',
    nutritionCategory: 'pre-pos-treino',
    authorBadge: 'Dra. Camila Duarte'
  },

  // MOTIVAÇÃO, DISCIPLINA & MINDSET
  {
    id: 'moti-sobrecarga-progressiva',
    category: 'motivacao',
    title: 'A Lei Fundamental da Sobrecarga Progressiva',
    tag: 'Evolução Real',
    content: 'Se você fizer o mesmo treino com o mesmo peso e as mesmas repetições pelo próximo ano, seu corpo não terá motivo algum para crescer ou se transformar.',
    practicalAction: 'Em cada treino, busque progredir ao menos 1 repetição com a mesma carga, adicionar 0,5kg a 1kg por lado ou melhorar a pausa excêntrica na descida.',
    scientificOrCoachNote: 'O princípio da sobrecarga progressiva estabelece que os sistemas biológicos só adaptam fibras quando expostos a um estresse gradualmente superior ao habitual.',
    authorBadge: 'Prof. Rafael Silva'
  },
  {
    id: 'moti-sono-anabolico',
    category: 'motivacao',
    title: 'Sono: O Maior Anabólico Natural e Gratuito',
    tag: 'Recuperação Noturna',
    content: 'Na academia você não ganha músculo; você apenas destrói fibras e envia o sinal biológico. A reconstrução real e os ganhos acontecem enquanto você dorme profundamente.',
    practicalAction: 'Durma entre 7 a 9 horas por noite em quarto escuro e fresco. Desligue telas luminosas 30 minutos antes de se deitar.',
    scientificOrCoachNote: 'Mais de 70% da liberação diária do hormônio do crescimento (GH) ocorre durante o sono profundo não-REM, juntamente com a regeneração das fibras miofibrilares.',
    authorBadge: 'Dra. Beatriz Santos'
  },
  {
    id: 'moti-regra-dois-minutos',
    category: 'motivacao',
    title: 'A Regra dos 2 Minutos para os Dias Sem Vontade',
    tag: 'Combate à Procrastinação',
    content: 'Haverá dias em que o cansaço mental ou a preguiça tentarão te convencer a ficar no sofá. A motivação é volúvel; a disciplina é o que te constrói.',
    practicalAction: 'Faça um pacto consigo mesmo: "Vou colocar a roupa, o tênis e ir para a academia fazer só o aquecimento de 5 minutos". Em 95% dos casos, você conclui o treino com energia renovada.',
    scientificOrCoachNote: 'A ação frequentemente precede a motivação. Ao iniciar o movimento físico, o sistema nervoso simpático e a dopamina são ativados por feedback biofisiológico.',
    authorBadge: 'Treinador Lucas Mendes'
  },
  {
    id: 'moti-rpe-reserva',
    category: 'motivacao',
    title: 'Treine Perto da Falha, Não Até a Destruição Total',
    tag: 'Gestão de Fadiga',
    content: 'Ir até a falha concêntrica absoluta com técnica horrível em todas as séries não acelera resultados; apenas explode sua fadiga sistêmica e atrasa a recuperação.',
    practicalAction: 'Termine suas séries de trabalho com 1 a 2 repetições na reserva (RIR 1-2). Isso significa parar quando você sabe que ainda conseguiria fazer 1 repetição com boa postura.',
    scientificOrCoachNote: 'Pesquisas científicas demonstram que treinar a RPE 8-9 (1-2 reps da falha) entrega 98% dos benefícios hipertróficos com metade da fadiga neuromuscular acumulada.',
    authorBadge: 'Prof. Rafael Silva'
  },
  {
    id: 'moti-consistencia-vence',
    category: 'motivacao',
    title: 'Consistência Sempre Vence Intensidade Esporádica',
    tag: 'Mentalidade Vencedora',
    content: 'De nada adianta passar 3 horas na academia durante 2 semanas e depois faltar 1 mês inteiro por exaustão ou lesão. Resultados sólidos são construídos gota a gota.',
    practicalAction: 'Priorize manter sua frequência semanal sem faltas. Um treino mediano é infinitamente superior a um treino que nunca aconteceu.',
    scientificOrCoachNote: 'A densidade de frequência semanal mantém a síntese proteica continuamente estimulada e reforça as vias neurais de recrutamento motor no córtex.',
    authorBadge: 'Treinador Lucas Mendes'
  },
  {
    id: 'moti-ego-lifting',
    category: 'motivacao',
    title: 'Deixe o Ego na Porta da Academia',
    tag: 'Segurança & Longevidade',
    content: 'Colocar peso demais e encurtar o movimento pela metade para impressionar quem está ao redor é o caminho mais rápido para uma tendinite ou ruptura muscular.',
    practicalAction: 'Abaixe a carga se for preciso para sentir o músculo contraindo e alongando por toda a amplitude natural. Ninguém com físico invejável se importa com o peso alheio.',
    scientificOrCoachNote: 'O estiramento sob carga máxima com arco articular completo produz hipertrofia mediada por estiramento mecânico, impossível de obter com repetições parciais por excesso de peso.',
    authorBadge: 'Dra. Beatriz Santos'
  }
];

/**
 * Returns a daily tip deterministically based on today's calendar date,
 * ensuring users get a consistent tip of the day every day.
 */
export function getDailyTipForToday(category?: 'forma' | 'nutricao' | 'motivacao'): DailyTip {
  const pool = category 
    ? DAILY_TIPS_DATABASE.filter(t => t.category === category)
    : DAILY_TIPS_DATABASE;
  
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  
  const index = Math.abs(dayOfYear) % pool.length;
  return pool[index];
}

/**
 * Returns a random tip different from the current one.
 */
export function getRandomTip(
  currentId?: string, 
  category?: 'forma' | 'nutricao' | 'motivacao'
): DailyTip {
  const pool = category 
    ? DAILY_TIPS_DATABASE.filter(t => t.category === category)
    : DAILY_TIPS_DATABASE;
    
  if (pool.length <= 1) return pool[0];
  
  const eligible = currentId ? pool.filter(t => t.id !== currentId) : pool;
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}
