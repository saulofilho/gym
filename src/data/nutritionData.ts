export interface NutritionGuide {
  id: string;
  category: 'fundamentos' | 'pre-pos-treino' | 'suplementacao' | 'hidratacao' | 'refeicoes';
  title: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  scientificNote: string;
}

export const NUTRITION_GUIDES: NutritionGuide[] = [
  {
    id: 'proteina-macros',
    category: 'fundamentos',
    title: 'A Regra de Ouro das Proteínas e Macronutrientes',
    summary: 'Como dosar proteínas, carboidratos e gorduras para construir massa muscular sem acumular gordura excessiva.',
    keyPoints: [
      'Ingestão ideal de proteínas: 1,6g a 2,2g por kg de peso corporal ao dia para hipertrofia.',
      'Distribua as proteínas em 3 a 5 refeições com 25g a 40g de proteína cada, acionando o gatilho da leucina (síntese proteica).',
      'Carboidratos são o combustível do glicogênio muscular: sem eles, seu treino perde rendimento e intensidade.',
      'Gorduras saudáveis (0,8g a 1g/kg) são fundamentais para a produção de testosterona e hormônios anabólicos.'
    ],
    recommendations: [
      'Fontes ricas de proteína: Peito de frango, ovos caipiras, patinho moído, tilápia, tofu, queijo cottage e Whey Protein.',
      'Fontes de carboidratos complexos: Aveia, arroz branco/integral, batata doce, mandioca e frutas frescas.',
      'Fontes de lipídios de qualidade: Azeite de oliva extravirgem, castanhas, abacate e gema de ovo.'
    ],
    scientificNote: 'Meta-análises de Schoenfeld & Aragon comprovam que o total diário de proteína é o fator mais determinante para ganhos hipertróficos a longo prazo.'
  },
  {
    id: 'pre-pos-treino-timing',
    category: 'pre-pos-treino',
    title: 'Timing Nutricional: Pré-Treino e Pós-Treino',
    summary: 'O que comer antes e depois para ter energia explosiva nos pesos e acelerar a reconstrução muscular.',
    keyPoints: [
      '1 a 2 horas antes do treino: Refeição sólida contendo carboidratos de absorção gradual e proteína magra.',
      '30 a 45 minutos antes (se necessário): Carboidrato de rápida digestão (banana com aveia e mel, ou pão com geleia) com pouca fibra e gordura para não pesar no estômago.',
      'Pós-treino imediato: A clássica "janela de oportunidade" não dura apenas 30 minutos, mas comer até 1-2 horas após o treino acelera a reposição de glicogênio e reparo tecidual.'
    ],
    recommendations: [
      'Exemplo Pré-Treino sólido (90 min antes): 150g de arroz com 120g de frango grelhado e legumes leves.',
      'Exemplo Pré-Treino rápido (30 min antes): 1 banana amassada com 2 colheres de aveia e 1 colher de mel.',
      'Exemplo Pós-Treino prático: 1 dose de Whey Protein (30g) batida com 1 banana e água, ou prato completo com arroz, feijão, ovos e carne magra.'
    ],
    scientificNote: 'A ingestão combinada de carboidratos com proteínas no pós-treino estimula a insulina, que atua sinergicamente na inibição da degradação proteica muscular.'
  },
  {
    id: 'hidratacao-muscular',
    category: 'hidratacao',
    title: 'Hidratação de Alta Performance',
    summary: 'Músculos são compostos por mais de 70% de água. A desidratação reduz drasticamente a força e o pump.',
    keyPoints: [
      'Beba entre 35ml e 50ml de água por kg de peso corporal todos os dias.',
      'Uma perda de apenas 2% do peso corporal em líquidos reduz o rendimento de força na musculação em até 15%.',
      'A água é responsável pelo transporte de aminoácidos para dentro das células e pelo volume intracelular (pump muscular).'
    ],
    recommendations: [
      'Tenha uma garrafa de 1 litro com você e monitore o consumo ao longo do dia.',
      'Tome de 500ml a 800ml de água em pequenos goles durante a sessão de treino.',
      'Verifique a cor da urina: ela deve estar amarelo bem claro (quase transparente).'
    ],
    scientificNote: 'Células musculares bem hidratadas apresentam maior tensão osmótica, enviando um sinal celular direto para aumento da síntese de proteínas.'
  },
  {
    id: 'suplementacao-cientifica',
    category: 'suplementacao',
    title: 'Guia de Suplementos Comprovados pela Ciência',
    summary: 'Quais suplementos realmente funcionam e quais são apenas desperdício de dinheiro.',
    keyPoints: [
      'CREATINA MONOHIDRATADA (Nível de evidência A): O suplemento mais estudado do mundo. Aumenta os estoques de fosfocreatina, força máxima e volume celular. Dose: 3g a 5g todos os dias, com ou sem treino.',
      'WHEY PROTEIN (Nível de evidência A): Praticidade para atingir a meta proteica diária com alto valor biológico e rápida absorção.',
      'CAFEÍNA (Nível de evidência A): Potente estimulante do sistema nervoso central, reduz a percepção de fadiga e aumenta o foco e a força em 3-6mg/kg cerca de 45 min antes do treino.',
      'BETA-ALANINA: Eficaz para treinos com repetições mais altas e diminuição da queimação de ácido lático (2 a 5g diários).'
    ],
    recommendations: [
      'Tome a Creatina com alguma fonte de carboidrato para melhor captação celular.',
      'Não é obrigatório fazer fase de saturação da creatina; 5g contínuos saturam em 3 a 4 semanas.',
      'Evite pré-treinos com doses excessivas de estimulantes perto da hora de dormir para não prejudicar o sono.'
    ],
    scientificNote: 'A Sociedade Internacional de Nutrição Esportiva (ISSN) classifica a Creatina Monohidratada como o suplemento ergogênico nutricional mais eficaz disponível para atletas.'
  }
];

export const SAMPLE_MEAL_PLAN = [
  {
    meal: 'Café da Manhã (Anabólico)',
    time: '07:30',
    description: '3 ovos mexidos + 2 fatias de pão integral com azeite ou queijo branco + 1 fruta (maçã ou mamão) + café preto sem açúcar.',
    macros: '32g Proteína | 45g Carbos | 16g Gorduras (~450 kcal)'
  },
  {
    meal: 'Almoço de Construção',
    time: '12:30',
    description: '150g de peito de frango grelhado ou carne magra + 150g de arroz (branco ou integral) + 1 concha de feijão + salada verde à vontade com azeite.',
    macros: '42g Proteína | 55g Carbos | 12g Gorduras (~520 kcal)'
  },
  {
    meal: 'Lanche da Tarde / Pré-Treino',
    time: '16:30',
    description: '1 iogurte natural ou 30g de Whey Protein + 40g de aveia em flocos + 1 banana fatiada com canela.',
    macros: '28g Proteína | 48g Carbos | 6g Gorduras (~360 kcal)'
  },
  {
    meal: 'Jantar Reparador (Pós-Treino)',
    time: '20:30',
    description: '160g de patinho moído ou peixe grelhado + 200g de batata doce ou mandioca assada + brócolis e legumes refogados.',
    macros: '44g Proteína | 50g Carbos | 10g Gorduras (~470 kcal)'
  }
];
