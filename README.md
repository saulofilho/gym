# 🏋️ AcademiaPro — Treinamento Inteligente, Nutrição & IA

> Aplicativo completo para academia com foco em iniciantes e avançados: vídeos instrutivos de postura biomecânica, registro de carga série a série, controle mensal de evolução, nutrição esportiva calculada, suporte via chat com treinadores especializados e plano de assinatura VIP com treinos personalizados gerados por IA.

---

## 🚀 Funcionalidades Principais

### 1. 🎬 Fichas Estruturadas & Vídeos Instrutivos HD
- **Filtros por Nível & Músculo**: Alterne rapidamente entre programas para **Iniciantes** (Adaptação, Full Body 3x, ABC) e **Avançados** (Push/Pull/Legs - PPL, Força e Densidade Muscular).
- **Player Biomecânico**: Vídeos demonstrativos integrados em alta definição.
- **Passo a Passo Técnico**: Instruções de setup postural, execução biomecânica e lista de erros graves para prevenção de lesões articulares.
- **Dicas de Ouro**: Recomendações dos treinadores para ativação neuromuscular otimizada.

### 2. ⚡ Registro de Carga Série a Série (Gym-Mode)
- **Interface Otimizada para Celular**: Desenvolvida para operação rápida com uma mão durante o treino na academia.
- **Histórico Instantâneo**: Exibe na própria tabela a carga e repetições executadas no último treino para facilitar a sobrecarga progressiva.
- **Timer de Descanso Flutuante**: Cronômetro regressivo sonoro e visual automático após cada série concluída (+30s, pular).
- **Cálculo de Tonelagem**: Mede em tempo real os quilogramas totais levantados na sessão.

### 3. 📈 Controle Mensal de Progresso & Medidas Físicas
- **Calendário de Frequência Mensal**: Heatmap dos dias treinados no mês com meta de consistência.
- **Curva de 1RM Estimada**: Acompanhamento de força máxima nos 3 grandes levantamentos (*Supino Reto, Agachamento Livre e Levantamento Terra*) pela fórmula de Epley.
- **Composição Corporal**: Tabela antropométrica com cálculo automático de delta (*Peso, % Gordura, Tórax, Braço, Cintura e Coxa*).
- **Análise Remota por IA**: Relatório técnico emitido pelo personal remoto analisando volume e prevenindo estagnação.

### 4. 🥗 Nutrição Básica & Calculadora de Macros
- **Calculadora Científica Mifflin-St Jeor**: Calcula a Taxa Metabólica Basal (TMB), Gasto Calórico Total (TDEE) e divide os macronutrientes exatos (*Proteínas 2.0g/kg, Carboidratos e Gorduras 0.9g/kg*) para **Hipertrofia**, **Definição** ou **Manutenção**.
- **Controle de Hidratação Diária**: Registro de copos e garrafas com barra de progresso em tempo real.
- **Exemplo Prático de Cardápio**: 4 refeições balanceadas de fácil preparo.
- **Guias Científicos**: Tudo sobre dosagem de Creatina, Whey Protein, timing pré/pós treino e sono anabólico.

### 5. 💬 Suporte via Chat com 4 Treinadores Especializados
- **Prof. Rafael Silva** — *Mestre em Fisiologia*: Hipertrofia máxima e sobrecarga progressiva.
- **Dra. Camila Duarte** — *Nutricionista Esportiva CRN*: Macros, dieta limpa e suplementação.
- **Treinador Lucas Mendes** — *Coach de Adaptação*: Primeiros passos, postura e confiança para iniciantes.
- **Dra. Beatriz Santos** — *Fisioterapeuta Desportiva*: Prevenção de dores em ombros, joelhos e coluna.
- **Gemini AI + Fallback Offline**: Respostas inteligentes em tempo real com memória contextual do seu nível e dados físicos.

### 6. 👑 Assinatura Premium VIP
- **Gerador de Treinos Personalizados por IA**: Cria planilhas sob medida com base em dias disponíveis (3 a 6x), foco muscular e restrições articulares.
- **Análise de Dados Avançada**: Detecção de assimetrias e recomendações personalizadas.
- **Acompanhamento Remoto Constante**: Feedback contínuo da coordenação técnica.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend / API**: Node.js com Express e `@google/genai` (Google Gemini 3.8 Flash).
- **Persistência**: `localStorage` no cliente para dados do usuário, histórico e medições (funciona 100% offline).
- **Bundler & Dev**: Vite e esbuild.

---

## 📦 Como Rodar Localmente

### Pré-requisitos
- Node.js versão 18 ou superior instalado.

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USUARIO/academia-pro.git
cd academia-pro
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente (opcional para IA local)
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Adicione sua chave de API Gemini no `.env` (se desejar usar os recursos de IA na máquina local):
```env
GEMINI_API_KEY=sua_chave_aqui
```
*(Nota: mesmo sem a chave, o app conta com o motor de conhecimento e treinadores em modo offline inteligente).*

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em: `http://localhost:3000`.

---

## 🌐 Publicação no GitHub Pages

O projeto foi preparado com suporte a caminhos relativos para funcionar no **GitHub Pages** como uma Single Page Application (SPA).

### Opção 1: Build Local e Envio manual

1. Execute o comando de compilação específico para o GitHub Pages:
```bash
npm run build:gh-pages
```
2. A pasta gerada `dist/` conterá todos os arquivos estáticos compilados com caminhos relativos `./`.
3. Você pode publicar o conteúdo da pasta `dist/` diretamente na branch `gh-pages` usando o pacote `gh-pages`:
```bash
npx gh-pages -d dist
```

### Opção 2: Deploy Automático via GitHub Actions

Crie um arquivo em `.github/workflows/deploy.yml` com o seguinte conteúdo:

```yaml
name: Deploy AcademiaPro to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependências
        run: npm ci

      - name: Compilar para GitHub Pages
        run: npm run build:gh-pages

      - name: Configurar GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy no GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Depois, acesse o painel do seu repositório no GitHub em **Settings > Pages** e escolha **Source: GitHub Actions**. A cada push na branch `main`, seu app será publicado automaticamente!

---

## 📱 Suporte a Dispositivos Móveis

O AcademiaPro foi construído com grid adaptativo e botões de toque com tamanho mínimo de 44px, permitindo uso fluido tanto no smartphone durante o treino quanto em monitores desktop e tablets.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Sinta-se livre para usar, modificar e evoluir!
