import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Specialized Coach Prompts
const COACH_PROMPTS: Record<string, string> = {
  hypertrophy: `Você é o Prof. Rafael Silva, mestre em Fisiologia do Exercício e Treinador Especialista em Hipertrofia e Força Máxima com mais de 15 anos de experiência prática.
Sua postura é motivadora, técnica, precisa e prática.
Você ensina sobre sobrecarga progressiva, volume semanal por grupo muscular (10-20 séries/semana), controle de RPE (taxa de esforço percebido), cadência excêntrica, seleção de exercícios compostos e isoladores, e quebra de platôs.
Responda em Português de forma clara, com tópicos diretos e exemplos práticos com cargas/repetições quando aplicável. Incentive a segurança articular.`,

  nutrition: `Você é a Dra. Camila Duarte, Nutricionista Esportiva especializada em hipertrofia e emagrecimento com base na ciência moderna.
Sua comunicação é acolhedora, clara e sem extremismos ou dietas restritivas malucas.
Você orienta sobre cálculo de proteínas (1.6 a 2.2g/kg), carboidratos para energia de treino, gorduras essenciais, hidratação (35-50ml/kg), timing de pré e pós-treino, e suplementação comprovada (Creatina 3-5g diários, Whey Protein, Cafeína).
Responda em Português com dicas práticas de refeições acessíveis e hábitos sustentáveis.`,

  beginner: `Você é o Treinador Lucas Mendes, especialista em acolhimento e adaptação de alunos iniciantes na musculação.
Você sabe que entrar na academia pode ser intimidador e causar vergonha.
Sua linguagem é encorajadora, empática e descomplicada.
Você foca no aprendizado do padrão motor correto, respiração coordenada (soltar ar na força), não se comparar com os outros, consistência sobre intensidade nas primeiras semanas, e como montar uma base sólida e livre de lesões.
Responda em Português com gentileza e clareza total.`,

  physio: `Você é a Dra. Beatriz Santos, Fisioterapeuta Esportiva com foco em Biomecânica, Mobilidade e Prevenção de Lesões.
Você orienta sobre mobilidade de tornozelo para agachamento, estabilidade escapular no supino, alívio de tensões lombares no terra, aquecimento articular específico e adaptação de exercícios para quem tem desconfortos articulares.
Responda em Português com instruções anatômicas fáceis de aplicar e testes simples de amplitude. Sempre oriente a consultar um médico presencial para dores agudas persistentes.`
};

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { coachId, message, conversationHistory = [], userContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor',
        fallbackNeeded: true
      });
    }

    const basePrompt = COACH_PROMPTS[coachId] || COACH_PROMPTS.hypertrophy;
    const contextInfo = userContext
      ? `\nContexto do Aluno: Nível: ${userContext.level || 'Iniciante'}, Objetivo: ${userContext.goal || 'Hipertrofia'}, Peso: ${userContext.weight || 'N/A'}kg.`
      : '';

    const systemInstruction = `${basePrompt}\n${contextInfo}\nForneça orientações completas, estruturadas e com ótima formatação de leitura.`;

    // Construct prompt with history context
    let formattedPrompt = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      formattedPrompt = `Histórico da conversa recente:\n` +
        recentHistory.map((m: { sender: string; text: string }) => `${m.sender === 'user' ? 'Aluno' : 'Treinador'}: ${m.text}`).join('\n') +
        `\n\nNova pergunta do Aluno: ${message}`;
    } else {
      formattedPrompt = message;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Desculpe, não consegui processar a resposta no momento. Tente novamente.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Erro na rota /api/chat:', error);
    return res.status(500).json({
      error: 'Erro ao gerar resposta do treinador',
      details: error?.message || String(error),
      fallbackNeeded: true
    });
  }
});

// POST /api/generate-routine (VIP Feature)
app.post('/api/generate-routine', async (req, res) => {
  try {
    const { level, daysPerWeek, focus, availableEquipment, timePerWorkout, injuries } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada',
        fallbackNeeded: true
      });
    }

    const prompt = `Como um treinador de elite, elabore um plano de treino personalizado detalhado para:
- Nível: ${level || 'Iniciante'}
- Frequência: ${daysPerWeek || 3} dias por semana
- Foco principal: ${focus || 'Hipertrofia Geral'}
- Equipamentos: ${availableEquipment || 'Academia Completa'}
- Tempo por treino: ${timePerWorkout || '50-60'} minutos
- Restrições/Dores: ${injuries || 'Nenhuma'}

Responda em formato estruturado com:
1. Visão Geral do Período (Divisão de dias recomendada, ex: ABC ou Push/Pull/Legs)
2. Detalhamento de cada dia de treino (Lista de exercícios com Séries, Repetições, Descanso sugerido e RPE)
3. 3 Dicas Mestres para Progressão de Carga e Segurança`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é o Coordenador Técnico da AcademiaPro, especialista em prescrição individualizada de treinamento resistido.',
        temperature: 0.7,
      },
    });

    return res.json({ routineText: response.text });
  } catch (error: any) {
    console.error('Erro na rota /api/generate-routine:', error);
    return res.status(500).json({
      error: 'Erro ao gerar treino personalizado',
      details: error?.message || String(error),
      fallbackNeeded: true
    });
  }
});

// POST /api/analyze-evolution (VIP Feature)
app.post('/api/analyze-evolution', async (req, res) => {
  try {
    const { totalWorkouts, volumeHistory, mainLifts, weightTrend } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada',
        fallbackNeeded: true
      });
    }

    const prompt = `Analise os seguintes dados de evolução mensal de um aluno de musculação:
- Treinos concluídos no mês: ${totalWorkouts || 0}
- Evolução de volume de treino (tonelagem): ${JSON.stringify(volumeHistory || [])}
- Cargas nos exercícios chave: ${JSON.stringify(mainLifts || {})}
- Tendência de peso corporal: ${JSON.stringify(weightTrend || [])}

Forneça um feedback profissional de personal trainer remoto:
1. Avaliação de Consistência e Sobrecarga Progressiva
2. Identificação de Pontos Fortes e Possíveis Assimetrias / Fadiga
3. Plano de Ajuste para o Próximo Mês (Meta de carga e volume recomendado)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é o Avaliador de Desempenho Físico da AcademiaPro, fornecendo feedbacks motivadores e técnicos com base em dados de treino.',
      },
    });

    return res.json({ analysisText: response.text });
  } catch (error: any) {
    console.error('Erro na rota /api/analyze-evolution:', error);
    return res.status(500).json({
      error: 'Erro ao analisar evolução',
      details: error?.message || String(error),
      fallbackNeeded: true
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AcademiaPro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
