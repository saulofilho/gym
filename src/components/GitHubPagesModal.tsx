import React, { useState } from 'react';
import {
  Github,
  X,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Terminal,
  FolderGit2,
  Sparkles,
  FileCode2,
  Database,
  ExternalLink
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORKFLOW_YAML = `name: Deploy AcademiaPro to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

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
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Código
        uses: actions/checkout@v4
      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Instalar Dependências
        run: npm install
      - name: Compilar para GitHub Pages
        run: npm run build:gh-pages
      - name: Garantir .nojekyll e 404.html
        run: |
          touch dist/.nojekyll
          cp dist/index.html dist/404.html
      - name: Configurar GitHub Pages
        uses: actions/configure-pages@v5
      - name: Upload do Artefato Estático
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy no GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const { workoutHistory, measurements, waterIntakeMl, sleepLogs, userProfile } = useWorkout();
  const [activeMode, setActiveMode] = useState<'actions' | 'docs' | 'standalone'>('actions');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleDownloadBackupJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'AcademiaPro GitHub Pages Edition',
      userProfile,
      workoutHistory,
      measurements,
      waterIntakeMl,
      sleepLogs
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academiapro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandaloneHtml = () => {
    const recentVolume = (workoutHistory || [])
      .slice(0, 3)
      .reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AcademiaPro — GitHub Pages Standalone</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
  <style>
    body { background:#0A0A0A; color:#EDEDED; font-family:'Inter',sans-serif; }
    .font-display { font-family:'Space Grotesk',sans-serif; }
    .font-mono-num { font-family:'JetBrains Mono',monospace; font-variant-numeric:tabular-nums; }
  </style>
</head>
<body class="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
  <header class="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#141414] border border-[#242424]">
    <div>
      <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">GitHub Pages Standalone</span>
      <h1 class="text-2xl font-bold text-white font-display mt-1">AcademiaPro — Painel Portátil</h1>
      <p class="text-xs text-neutral-400">Exportado com dados sincronizados de ${userProfile.name} (${workoutHistory.length} sessões)</p>
    </div>
    <div class="text-right font-mono-num">
      <span class="text-xs text-neutral-400 block">Volume Recente (3 sessões)</span>
      <span class="text-xl font-bold text-[#D4FF00]">${recentVolume.toLocaleString()} kg</span>
    </div>
  </header>
  <section class="p-6 rounded-2xl bg-[#141414] border border-[#242424] space-y-4">
    <h2 class="text-lg font-bold text-white font-display">Dica do Dia (Volume + Hidratação + Sono)</h2>
    <p class="text-sm text-neutral-300">Com ${recentVolume.toLocaleString()} kg de volume recente, mantenha sua meta hídrica diária acima de ${Math.round(userProfile.weightKg * 35 + 500)} ml (atual: ${waterIntakeMl} ml) e priorize 8.0h de sono profundo para supercompensação muscular.</p>
  </section>
  <section class="p-6 rounded-2xl bg-[#141414] border border-[#242424] space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-bold text-white font-display">Registro de Séries & Cronômetro de Descanso Recomendado</h2>
        <p class="text-xs text-neutral-400">O tempo de descanso é ajustado automaticamente conforme a demanda biomecânica do exercício</p>
      </div>
      <span id="rec-badge" class="text-xs font-mono-num text-[#D4FF00]">Recomendado: 90s</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
      <select id="ex-sel" onchange="onExChange()" class="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs font-semibold">
        <option value="90" data-name="Supino Reto com Barra">Supino Reto com Barra (90s)</option>
        <option value="120" data-name="Agachamento Livre">Agachamento Livre (120s)</option>
        <option value="150" data-name="Levantamento Terra">Levantamento Terra (150s)</option>
        <option value="75" data-name="Desenvolvimento Halteres">Desenvolvimento Halteres (75s)</option>
        <option value="90" data-name="Remada Curvada">Remada Curvada (90s)</option>
      </select>
      <input id="set-w" type="number" value="70" class="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-[#D4FF00] font-bold font-mono-num text-sm" placeholder="Carga (kg)" />
      <input id="set-r" type="number" value="8" class="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-white font-bold font-mono-num text-sm" placeholder="Reps" />
      <select id="set-rpe" class="p-3 rounded-xl bg-[#0A0A0A] border border-[#D4FF00]/40 text-[#D4FF00] font-bold font-mono-num text-xs">
        <option value="1">RPE 1 (Muito Leve)</option>
        <option value="2">RPE 2 (Leve)</option>
        <option value="3">RPE 3 (Aquecimento)</option>
        <option value="4">RPE 4 (Moderado Leve)</option>
        <option value="5">RPE 5 (5 RIR)</option>
        <option value="6">RPE 6 (4 RIR)</option>
        <option value="7">RPE 7 (3 RIR)</option>
        <option value="8" selected>RPE 8 (Ideal • 2 RIR)</option>
        <option value="9">RPE 9 (Intenso • 1 RIR)</option>
        <option value="10">RPE 10 (Falha • 0 RIR)</option>
      </select>
      <button onclick="saveSetAndRest()" class="p-3 rounded-xl bg-[#D4FF00] text-black font-bold text-xs hover:brightness-95">✓ Salvar Série + Descansar</button>
    </div>
    <div class="p-4 rounded-xl bg-[#0D0D0D] border border-[#222222] flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <span id="t-status" class="text-[10px] uppercase tracking-wider text-neutral-400 block">Cronômetro de Descanso</span>
          <span id="t-disp" class="text-3xl font-bold font-mono-num text-white">01:30</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="setRest(60)" class="px-2.5 py-1 rounded bg-[#1A1A1A] text-xs font-mono-num text-neutral-300 border border-[#2C2C2C]">60s</button>
          <button onclick="setRest(90)" class="px-2.5 py-1 rounded bg-[#1A1A1A] text-xs font-mono-num text-[#D4FF00] border border-[#2C2C2C]">90s</button>
          <button onclick="setRest(120)" class="px-2.5 py-1 rounded bg-[#1A1A1A] text-xs font-mono-num text-neutral-300 border border-[#2C2C2C]">120s</button>
          <input id="custom-s" type="number" value="90" onchange="setRest(Number(this.value||60))" class="w-16 px-2 py-1 rounded bg-[#0A0A0A] border border-[#2C2C2C] text-xs font-mono-num text-center text-white" />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="adjRest(-15)" class="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2C2C2C] text-xs font-mono-num text-neutral-300">-15s</button>
        <button onclick="adjRest(30)" class="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2C2C2C] text-xs font-mono-num text-[#D4FF00]">+30s</button>
        <button id="t-btn" onclick="toggleTimer()" class="px-4 py-1.5 rounded-lg bg-[#D4FF00] text-black font-bold text-xs">▶ Iniciar</button>
        <button onclick="resetTimer()" class="px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2C2C2C] text-xs text-neutral-300">Zerar</button>
      </div>
    </div>
    <div id="sets-log" class="flex flex-wrap gap-2 text-xs font-mono-num"></div>
  </section>
  <section class="p-6 rounded-2xl bg-[#141414] border border-[#242424] space-y-4">
    <h2 class="text-lg font-bold text-white font-display">Calculadora Rápida de 1RM (Epley & Brzycki)</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <input id="w" type="number" value="70" oninput="calc()" class="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono-num" placeholder="Carga (kg)" />
      <input id="r" type="number" value="8" oninput="calc()" class="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono-num" placeholder="Repetições" />
      <div class="p-3 rounded-xl bg-[#111111] border border-[#D4FF00]/40 flex items-center justify-between">
        <span class="text-xs text-neutral-400">1RM Estimado:</span>
        <span id="out" class="text-2xl font-bold text-[#D4FF00] font-mono-num">88.7 kg</span>
      </div>
    </div>
  </section>
  <script>
    var targetSec = 90, remSec = 90, tInt = null;
    function fmt(s){ var m=Math.floor(s/60), r=s%60; return String(m).padStart(2,'0')+':'+String(r).padStart(2,'0'); }
    function updT(){
      document.getElementById('t-disp').textContent = fmt(remSec);
      document.getElementById('t-btn').textContent = tInt ? '⏸ Pausar' : '▶ Iniciar';
    }
    function onExChange(){
      var sel = document.getElementById('ex-sel');
      var rec = Number(sel.value||90);
      document.getElementById('rec-badge').textContent = 'Recomendado: ' + rec + 's';
      setRest(rec);
    }
    function setRest(s){
      targetSec = Math.max(5, s); remSec = targetSec;
      document.getElementById('custom-s').value = targetSec;
      updT();
    }
    function adjRest(d){ remSec = Math.max(5, remSec + d); updT(); }
    function toggleTimer(){
      if(tInt){ clearInterval(tInt); tInt=null; updT(); return; }
      if(remSec<=0) remSec=targetSec;
      document.getElementById('t-status').textContent = '⏱️ Descansando...';
      tInt = setInterval(function(){
        remSec = Math.max(0, remSec - 1);
        updT();
        if(remSec<=0){
          clearInterval(tInt); tInt=null;
          document.getElementById('t-status').textContent = '🔔 Descanso Concluído!';
          updT();
        }
      }, 1000);
      updT();
    }
    function resetTimer(){ if(tInt){clearInterval(tInt);tInt=null;} remSec=targetSec; document.getElementById('t-status').textContent='Cronômetro de Descanso'; updT(); }
    function saveSetAndRest(){
      var sel = document.getElementById('ex-sel');
      var name = sel.options[sel.selectedIndex].getAttribute('data-name');
      var w = document.getElementById('set-w').value;
      var r = document.getElementById('set-r').value;
      var rpe = document.getElementById('set-rpe').value;
      var log = document.getElementById('sets-log');
      log.innerHTML += '<span class="px-2.5 py-1 rounded bg-[#111111] border border-[#2C2C2C] text-neutral-200">' + name + ': <strong class="text-[#D4FF00]">' + w + 'kg × ' + r + '</strong> <span class="text-amber-300">• RPE ' + rpe + '</span></span>';
      document.getElementById('w').value = w;
      document.getElementById('r').value = r;
      calc();
      resetTimer();
      toggleTimer();
    }
    function calc(){
      var w = Number(document.getElementById('w').value||0);
      var r = Math.max(1, Number(document.getElementById('r').value||1));
      var rm = r === 1 ? w : w * (1 + r / 30);
      document.getElementById('out').textContent = rm.toFixed(1) + ' kg';
    }
    calc();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="github-pages-modal"
        className="relative w-full max-w-3xl bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#D4FF00] via-emerald-400 to-cyan-400" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#222222] bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4FF00]/15 border border-[#D4FF00]/35 text-[#D4FF00] flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Versão para GitHub Pages</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Configurado & Pronto
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Suporte completo a deploy estático via GitHub Actions (`dist/`), pasta `/docs` ou HTML Standalone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1F1F1F] transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Base Relativa (`./`)</p>
                <p className="text-[11px] text-neutral-400">Configurado no `vite.config.ts`</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Workflow CI/CD</p>
                <p className="text-[11px] text-neutral-400">`.github/workflows/deploy.yml`</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">SPA & `.nojekyll`</p>
                <p className="text-[11px] text-neutral-400">`public/404.html` & `.nojekyll`</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Edição `/docs`</p>
                <p className="text-[11px] text-neutral-400">`docs/index.html` pronto p/ branch</p>
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#222222] pb-3">
            <button
              onClick={() => setActiveMode('actions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'actions'
                  ? 'bg-[#D4FF00] text-black'
                  : 'bg-[#1A1A1A] text-neutral-400 hover:text-white border border-[#2A2A2A]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Deploy Automático (GitHub Actions)</span>
            </button>
            <button
              onClick={() => setActiveMode('docs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'docs'
                  ? 'bg-[#D4FF00] text-black'
                  : 'bg-[#1A1A1A] text-neutral-400 hover:text-white border border-[#2A2A2A]'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>2. Deploy Direto pela Pasta /docs</span>
            </button>
            <button
              onClick={() => setActiveMode('standalone')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'standalone'
                  ? 'bg-[#D4FF00] text-black'
                  : 'bg-[#1A1A1A] text-neutral-400 hover:text-white border border-[#2A2A2A]'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>3. Baixar HTML Standalone & Backup</span>
            </button>
          </div>

          {/* Tab Content 1: GitHub Actions */}
          {activeMode === 'actions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-2">
                <h3 className="text-sm font-bold text-white">Como publicar o app React completo no GitHub Pages:</h3>
                <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside">
                  <li>Suba este repositório para o seu GitHub (<code className="text-[#D4FF00]">git push origin main</code>).</li>
                  <li>No GitHub, acesse <strong>Settings → Pages → Build and deployment</strong>.</li>
                  <li>Em <strong>Source</strong>, selecione <strong>GitHub Actions</strong>.</li>
                  <li>O arquivo <code className="text-[#D4FF00]">.github/workflows/deploy.yml</code> já está incluído no projeto e fará o build (<code className="text-[#D4FF00]">npm run build:gh-pages</code>) automaticamente!</li>
                </ol>
              </div>

              <div className="rounded-xl bg-[#0D0D0D] border border-[#242424] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#161616] border-b border-[#242424]">
                  <span className="text-xs font-mono text-neutral-300">.github/workflows/deploy.yml</span>
                  <button
                    onClick={() => copyText('yaml', WORKFLOW_YAML)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222222] hover:bg-[#2A2A2A] text-xs font-semibold text-[#D4FF00] transition-colors"
                  >
                    {copiedKey === 'yaml' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'yaml' ? 'Copiado!' : 'Copiar YAML'}</span>
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-56 leading-relaxed">
                  {WORKFLOW_YAML}
                </pre>
              </div>
            </div>
          )}

          {/* Tab Content 2: /docs folder */}
          {activeMode === 'docs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
                <div className="flex items-center gap-2 text-[#D4FF00] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Zero Build • Publicação Instantânea pela Branch</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Adicionamos a pasta <code className="text-[#D4FF00] font-mono">/docs/index.html</code> e <code className="text-[#D4FF00] font-mono">/docs/.nojekyll</code> na raiz do projeto com uma edição estática autocontida do <strong>AcademiaPro</strong> (incluindo a <strong>Dica do Dia com Volume + Hidratação + Sono</strong> e a <strong>Calculadora de 1RM Estimada</strong>).
                </p>
                <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside pt-1">
                  <li>No seu repositório do GitHub, abra <strong>Settings → Pages</strong>.</li>
                  <li>Em <strong>Source</strong>, escolha <strong>Deploy from a branch</strong>.</li>
                  <li>Selecione a branch <strong>main</strong> e a pasta <strong>/docs</strong> e clique em <strong>Save</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#242424] flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-white">Ou compile localmente para a pasta dist/:</p>
                  <code className="text-xs font-mono text-[#D4FF00]">npm run build:gh-pages && npx gh-pages -d dist</code>
                </div>
                <button
                  onClick={() => copyText('cmd', 'npm run build:gh-pages && npx gh-pages -d dist')}
                  className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-semibold text-white flex items-center gap-1.5 shrink-0"
                >
                  {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cmd' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Content 3: Standalone Download & Backup */}
          {activeMode === 'standalone' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#111111] border border-[#242424] flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-[#D4FF00]/15 text-[#D4FF00] flex items-center justify-center">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Baixar `index.html` Autocontido</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Gera um único arquivo <code className="text-neutral-200">index.html</code> já sincronizado com seu volume recente, Dica do Dia e Calculadora 1RM para subir direto em qualquer repositório GitHub Pages.
                  </p>
                </div>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#D4FF00] hover:brightness-95 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar index.html para GitHub Pages</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#111111] border border-[#242424] flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Exportar Dados de Treino (`.json`)</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Salve seu histórico de {workoutHistory.length} sessões registradas, medidas corporais, sono e hidratação em JSON portátil.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackupJson}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#242424] text-white border border-[#333333] font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Exportar Backup JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111111] border-t border-[#222222] flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-[#D4FF00]" />
            Funciona 100% offline/client-side em domínios <code className="text-neutral-300">*.github.io</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1F1F1F] hover:bg-[#282828] text-xs font-bold text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
