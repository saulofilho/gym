import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Moon, 
  Sun, 
  Clock, 
  Sparkles, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Dumbbell, 
  Activity, 
  Check, 
  X, 
  Info, 
  Zap, 
  Calendar, 
  BarChart2, 
  Smile, 
  Meh, 
  Frown, 
  Award,
  ChevronRight,
  Flame,
  Coffee,
  BedDouble
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { SleepLogEntry, SleepQuality } from '../types';

interface SleepMonitorProps {
  onNavigateToWorkout?: () => void;
}

export interface CorrelatedItem {
  date: string;
  formattedDate: string;
  hoursSlept: number;
  quality: SleepQuality;
  deepSleepHours: number;
  perceivedEnergy: number;
  workoutVolumeKg: number | null;
  workoutTitle: string | null;
  workoutFeeling: string | null;
  hasWorkout: boolean;
  notes?: string;
}

export const SleepMonitor: React.FC<SleepMonitorProps> = ({ onNavigateToWorkout }) => {
  const { 
    sleepLogs, 
    addSleepLog, 
    deleteSleepLog, 
    workoutHistory 
  } = useWorkout();

  // Visualization state
  const [chartView, setChartView] = useState<'timeline' | 'scatter'>('timeline');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formHours, setFormHours] = useState<number>(7.5);
  const [formQuality, setFormQuality] = useState<SleepQuality>('bom');
  const [formDeepHours, setFormDeepHours] = useState<number | ''>(1.8);
  const [formBedTime, setFormBedTime] = useState('23:00');
  const [formWakeTime, setFormWakeTime] = useState('06:30');
  const [formEnergy, setFormEnergy] = useState<number>(8);
  const [formNotes, setFormNotes] = useState('');

  // SVG Chart Ref
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // ResizeObserver for fluid responsive chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Merged dataset: correlating each day's sleep with that day's workout volume (or next day)
  const correlatedData: CorrelatedItem[] = useMemo(() => {
    // Map workout sessions by date
    const workoutByDate = new Map<string, { totalVolumeKg: number; title: string; feeling: string }>();
    (workoutHistory || []).forEach(w => {
      workoutByDate.set(w.date, {
        totalVolumeKg: w.totalVolumeKg || 0,
        title: w.title,
        feeling: w.feeling
      });
    });

    // Sort sleep logs chronologically
    const sortedSleep = [...(sleepLogs || [])].sort((a, b) => a.date.localeCompare(b.date));

    return sortedSleep.map(sleep => {
      const workout = workoutByDate.get(sleep.date);
      return {
        date: sleep.date,
        formattedDate: new Date(sleep.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        hoursSlept: sleep.hoursSlept,
        quality: sleep.quality,
        deepSleepHours: sleep.deepSleepHours || 0,
        perceivedEnergy: sleep.perceivedEnergy || 7,
        workoutVolumeKg: workout ? workout.totalVolumeKg : null,
        workoutTitle: workout ? workout.title : null,
        workoutFeeling: workout ? workout.feeling : null,
        hasWorkout: !!workout,
        notes: sleep.notes
      };
    });
  }, [sleepLogs, workoutHistory]);

  // Key KPI stats
  const stats = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) {
      return {
        avgHours: 0,
        avgDeepHours: 0,
        goodSleepCount: 0,
        goodSleepPct: 0,
        avgVolumeOnGoodSleep: 0,
        avgVolumeOnPoorSleep: 0,
        performanceBoostPct: 0
      };
    }

    const totalHours = sleepLogs.reduce((acc, s) => acc + s.hoursSlept, 0);
    const avgHours = parseFloat((totalHours / sleepLogs.length).toFixed(1));

    const withDeep = sleepLogs.filter(s => s.deepSleepHours && s.deepSleepHours > 0);
    const avgDeepHours = withDeep.length > 0 
      ? parseFloat((withDeep.reduce((acc, s) => acc + (s.deepSleepHours || 0), 0) / withDeep.length).toFixed(1))
      : 1.8;

    const goodSleepLogs = sleepLogs.filter(s => s.quality === 'excelente' || s.quality === 'bom');
    const goodSleepPct = Math.round((goodSleepLogs.length / sleepLogs.length) * 100);

    // Correlate with workout performance
    const goodSleepDays = new Set(goodSleepLogs.map(s => s.date));
    const workoutsOnGoodSleep = (workoutHistory || []).filter(w => goodSleepDays.has(w.date));
    const workoutsOnPoorSleep = (workoutHistory || []).filter(w => !goodSleepDays.has(w.date));

    const avgVolumeGood = workoutsOnGoodSleep.length > 0
      ? Math.round(workoutsOnGoodSleep.reduce((acc, w) => acc + w.totalVolumeKg, 0) / workoutsOnGoodSleep.length)
      : 8400;

    const avgVolumePoor = workoutsOnPoorSleep.length > 0
      ? Math.round(workoutsOnPoorSleep.reduce((acc, w) => acc + w.totalVolumeKg, 0) / workoutsOnPoorSleep.length)
      : 6600;

    const performanceBoostPct = avgVolumePoor > 0 
      ? Math.round(((avgVolumeGood - avgVolumePoor) / avgVolumePoor) * 100) 
      : 27;

    return {
      avgHours,
      avgDeepHours,
      goodSleepCount: goodSleepLogs.length,
      goodSleepPct,
      avgVolumeOnGoodSleep: avgVolumeGood,
      avgVolumeOnPoorSleep: avgVolumePoor,
      performanceBoostPct: Math.max(0, performanceBoostPct)
    };
  }, [sleepLogs, workoutHistory]);

  // User target wake up time for recovery scheduling (default '06:30')
  const [targetWakeTime, setTargetWakeTime] = useState<string>(() => {
    try {
      return localStorage.getItem('academiapro_target_wake_time') || '06:30';
    } catch {
      return '06:30';
    }
  });

  const handleSetTargetWakeTime = (time: string) => {
    setTargetWakeTime(time);
    try {
      localStorage.setItem('academiapro_target_wake_time', time);
    } catch (e) {
      console.error(e);
    }
  };

  // Algorithm: Weekly Sleep Average & Dynamic Recovery Schedule
  const recoveryRecommendations = useMemo(() => {
    // 1. Sort logs descending by date
    const sorted = [...(sleepLogs || [])].sort((a, b) => b.date.localeCompare(a.date));

    // Take the 7 most recent recorded days (weekly window)
    const recentWeeklyLogs = sorted.slice(0, 7);
    const count = recentWeeklyLogs.length;

    // Simple weekly average calculation: sum of hours / count
    const weeklySum = recentWeeklyLogs.reduce((sum, item) => sum + item.hoursSlept, 0);
    const weeklyAvgHours = count > 0 
      ? parseFloat((weeklySum / count).toFixed(1))
      : (stats.avgHours > 0 ? stats.avgHours : 7.5);

    // Baseline goal for muscle hypertrophy & CNS repair (8.0 hours)
    const baselineTarget = 8.0;
    const diffFromTarget = parseFloat((weeklyAvgHours - baselineTarget).toFixed(1));
    const weeklyDeficitHours = parseFloat((Math.abs(diffFromTarget) * 7).toFixed(1));

    // Dynamic Bedtime Calculation:
    // Parse target wake time (e.g. "06:30")
    const [wakeH, wakeM] = targetWakeTime.split(':').map(Number);
    const wakeTotalMinutes = (isNaN(wakeH) ? 6 : wakeH) * 60 + (isNaN(wakeM) ? 30 : wakeM);

    // Determine target hours of sleep based on current weekly debt
    // If weekly average is low (< 6.8h), add compensation target
    // Plus 15 minutes of sleep onset latency
    let neededSleepMinutes = 8 * 60; // 480 min = 8.0h
    if (weeklyAvgHours < 6.5) {
      neededSleepMinutes = 8.5 * 60; // 8h30 for recovery
    } else if (weeklyAvgHours < 7.2) {
      neededSleepMinutes = 8 * 60;   // 8h00
    } else if (weeklyAvgHours >= 8.0) {
      neededSleepMinutes = 7.75 * 60; // 7h45 min (already well rested)
    } else {
      neededSleepMinutes = 8 * 60;
    }

    const latencyMinutes = 15;
    const totalTimeInBedMinutes = neededSleepMinutes + latencyMinutes;

    // Ideal bedtime calculation (minutes from 00:00)
    let bedMinutes = (wakeTotalMinutes - totalTimeInBedMinutes) % 1440;
    if (bedMinutes < 0) bedMinutes += 1440;

    const bedHours = Math.floor(bedMinutes / 60);
    const bedMins = Math.floor(bedMinutes % 60);
    const idealBedtimeStr = `${String(bedHours).padStart(2, '0')}:${String(bedMins).padStart(2, '0')}`;

    // Wind-down window (Higiene do sono: 45 min antes do horário de deitar)
    let windDownMinutes = (bedMinutes - 45) % 1440;
    if (windDownMinutes < 0) windDownMinutes += 1440;
    const windHours = Math.floor(windDownMinutes / 60);
    const windMins = Math.floor(windDownMinutes % 60);
    const idealWindDownStr = `${String(windHours).padStart(2, '0')}:${String(windMins).padStart(2, '0')}`;

    // Caffeine & Pre-workout cut-off (8h antes de deitar para proteger receptores de adenosina)
    let caffeineMinutes = (bedMinutes - 480) % 1440;
    if (caffeineMinutes < 0) caffeineMinutes += 1440;
    const caffHours = Math.floor(caffeineMinutes / 60);
    const caffMins = Math.floor(caffeineMinutes % 60);
    const caffeineCurfewStr = `${String(caffHours).padStart(2, '0')}:${String(caffMins).padStart(2, '0')}`;

    // Strategic Power Nap (Cochilo de recuperação)
    // If deficit exists, suggest a 20 min nap between 13:00 and 14:30
    const powerNapRecommended = weeklyAvgHours < 7.2;

    // Status classification based on weekly sleep average
    let statusTheme: {
      badge: string;
      color: string;
      bg: string;
      border: string;
      title: string;
      summary: string;
    };

    if (weeklyAvgHours >= 8.0) {
      statusTheme = {
        badge: 'Recuperação Ótima',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        title: 'Anabolismo e Prontidão Máxima',
        summary: 'Sua média semanal garante síntese proteica acelerada e plena restauração dos estoques neuromusculares.'
      };
    } else if (weeklyAvgHours >= 7.2) {
      statusTheme = {
        badge: 'Recuperação Adequada',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        title: 'Bom Suporte aos Treinos',
        summary: 'Média favorável para manutenção e hipertrofia. Ajustar o horário de deitar em 20 minutos pode aumentar a força de pico.'
      };
    } else if (weeklyAvgHours >= 6.0) {
      statusTheme = {
        badge: 'Déficit Leve de Sono',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        title: 'Fadiga Acumulada no SNC',
        summary: `Débito semanal estimado em ~${weeklyDeficitHours}h. Risco de fadiga neural precoce e estagnação na sobrecarga progressiva.`
      };
    } else {
      statusTheme = {
        badge: 'Déficit Crítico de Sono',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        title: 'Alerta de Sub-Recuperação',
        summary: 'Abaixo de 6h/noite o volume de treino cai até 27% e o cortisol sobe. Priorize deitar mais cedo antes de treinar pesado.'
      };
    }

    return {
      weeklyAvgHours,
      sampleSize: count,
      baselineTarget,
      diffFromTarget,
      weeklyDeficitHours,
      idealBedtimeStr,
      idealWindDownStr,
      caffeineCurfewStr,
      powerNapRecommended,
      statusTheme,
      suggestedSleepHours: (neededSleepMinutes / 60).toFixed(1)
    };
  }, [sleepLogs, targetWakeTime, stats.avgHours]);

  // Quality visual helpers
  const getQualityBadge = (quality: SleepQuality) => {
    switch (quality) {
      case 'excelente':
        return {
          label: 'Excelente',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          dotColor: 'bg-emerald-400',
          icon: Sparkles
        };
      case 'bom':
        return {
          label: 'Bom',
          color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          dotColor: 'bg-cyan-400',
          icon: Smile
        };
      case 'regular':
        return {
          label: 'Regular',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          dotColor: 'bg-amber-400',
          icon: Meh
        };
      case 'ruim':
        return {
          label: 'Ruim',
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          dotColor: 'bg-rose-400',
          icon: Frown
        };
    }
  };

  // D3 Visualization Renderer
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const width = Math.max(340, containerWidth);
    const height = 340;
    const margin = { top: 35, right: 60, bottom: 45, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (correlatedData.length === 0) {
      // Empty state inside SVG
      svg
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#888')
        .attr('font-size', '14px')
        .text('Nenhum registro de sono para exibir. Adicione seu primeiro registro acima.');
      return;
    }

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // TOOLTIP CONTAINER
    const tooltip = d3.select('#sleep-d3-tooltip');

    if (chartView === 'timeline') {
      // -------------------------------------------------------------
      // 1. TIMELINE DUAL-AXIS: Bars = Volume (kg), Line = Sleep Hours
      // -------------------------------------------------------------

      // X Scale: Dates
      const xScale = d3.scaleBand()
        .domain(correlatedData.map(d => d.date))
        .range([0, innerWidth])
        .padding(0.35);

      // Y Scale Left: Workout Volume (kg)
      const maxVolume = d3.max(correlatedData, (d: CorrelatedItem) => d.workoutVolumeKg || 0) || 10000;
      const yScaleVolume = d3.scaleLinear()
        .domain([0, Math.ceil((maxVolume * 1.15) / 1000) * 1000])
        .range([innerHeight, 0]);

      // Y Scale Right: Sleep Hours (4h - 11h)
      const yScaleSleep = d3.scaleLinear()
        .domain([4, 11])
        .range([innerHeight, 0]);

      // Grid lines for Volume
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(yScaleVolume)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#262626')
        .attr('stroke-dasharray', '3,3');
      g.select('.grid .domain').remove();

      // Bars: Workout Volume (kg)
      const workoutDays = correlatedData.filter((d): d is CorrelatedItem & { workoutVolumeKg: number } => d.workoutVolumeKg !== null && d.workoutVolumeKg > 0);
      g.selectAll<SVGRectElement, CorrelatedItem>('.bar-volume')
        .data(workoutDays)
        .enter()
        .append('rect')
        .attr('class', 'bar-volume')
        .attr('x', (d: CorrelatedItem) => xScale(d.date) || 0)
        .attr('y', (d: CorrelatedItem) => yScaleVolume(d.workoutVolumeKg || 0))
        .attr('width', xScale.bandwidth())
        .attr('height', (d: CorrelatedItem) => innerHeight - yScaleVolume(d.workoutVolumeKg || 0))
        .attr('rx', 4)
        .attr('fill', '#D4FF00')
        .attr('fill-opacity', 0.85)
        .style('cursor', 'pointer')
        .on('mouseover', (event: MouseEvent, d: CorrelatedItem) => {
          tooltip
            .style('opacity', '1')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 40}px`)
            .html(`
              <div class="p-2.5 rounded-lg bg-[#181818] border border-[#333] shadow-xl text-xs space-y-1">
                <div class="font-bold text-white">${d.formattedDate}</div>
                <div class="text-[#D4FF00] font-semibold flex items-center gap-1">
                  <span>🏋️ Treino: ${d.workoutTitle || 'Musculação'}</span>
                </div>
                <div class="text-white font-mono">Volume: ${(d.workoutVolumeKg || 0).toLocaleString('pt-BR')} kg</div>
                <div class="text-indigo-300">Sono anterior: ${d.hoursSlept}h (${d.quality})</div>
              </div>
            `);
        })
        .on('mouseout', () => tooltip.style('opacity', '0'));

      // Sleep Trend Line Generator
      const lineGenerator = d3.line<CorrelatedItem>()
        .x((d: CorrelatedItem) => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
        .y((d: CorrelatedItem) => yScaleSleep(d.hoursSlept))
        .curve(d3.curveMonotoneX);

      // Defs: Line glow filter
      const defs = svg.append('defs');
      const filter = defs.append('filter').attr('id', 'neon-glow');
      filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Draw Sleep Trend Line
      g.append('path')
        .datum(correlatedData)
        .attr('fill', 'none')
        .attr('stroke', '#818cf8')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#neon-glow)')
        .attr('d', lineGenerator);

      // Sleep Data Points (Circles)
      g.selectAll<SVGCircleElement, CorrelatedItem>('.dot-sleep')
        .data(correlatedData)
        .enter()
        .append('circle')
        .attr('class', 'dot-sleep')
        .attr('cx', (d: CorrelatedItem) => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
        .attr('cy', (d: CorrelatedItem) => yScaleSleep(d.hoursSlept))
        .attr('r', 5)
        .attr('fill', (d: CorrelatedItem) => {
          if (d.quality === 'excelente') return '#10b981';
          if (d.quality === 'bom') return '#06b6d4';
          if (d.quality === 'regular') return '#f59e0b';
          return '#f43f5e';
        })
        .attr('stroke', '#121212')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', (event: MouseEvent, d: CorrelatedItem) => {
          tooltip
            .style('opacity', '1')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 40}px`)
            .html(`
              <div class="p-2.5 rounded-lg bg-[#181818] border border-[#333] shadow-xl text-xs space-y-1">
                <div class="font-bold text-white">${d.formattedDate}</div>
                <div class="text-indigo-400 font-semibold flex items-center gap-1">
                  <span>🌙 Sono: ${d.hoursSlept}h</span>
                  <span class="capitalize">(${d.quality})</span>
                </div>
                ${d.deepSleepHours ? `<div class="text-neutral-400">Sono Profundo: ${d.deepSleepHours}h</div>` : ''}
                <div class="text-neutral-300">Disposição: ${d.perceivedEnergy}/10</div>
                ${d.workoutVolumeKg ? `<div class="text-[#D4FF00] font-mono">Volume no dia: ${d.workoutVolumeKg.toLocaleString('pt-BR')} kg</div>` : '<div class="text-neutral-500 italic">Sem treino neste dia</div>'}
              </div>
            `);
        })
        .on('mouseout', () => tooltip.style('opacity', '0'));

      // Recommended 7-9h sleep zone reference band
      g.append('rect')
        .attr('x', 0)
        .attr('y', yScaleSleep(9))
        .attr('width', innerWidth)
        .attr('height', yScaleSleep(7) - yScaleSleep(9))
        .attr('fill', '#818cf8')
        .attr('fill-opacity', 0.05)
        .attr('stroke', '#818cf8')
        .attr('stroke-opacity', 0.15)
        .attr('stroke-dasharray', '4,4');

      g.append('text')
        .attr('x', 6)
        .attr('y', yScaleSleep(9) - 6)
        .attr('fill', '#818cf8')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text('Zona Ideal de Sono (7h - 9h)');

      // X Axis (Dates)
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(
          d3.axisBottom(xScale).tickFormat(dateStr => {
            const entry = correlatedData.find(d => d.date === dateStr);
            return entry ? entry.formattedDate : dateStr;
          })
        )
        .selectAll('text')
        .attr('fill', '#a3a3a3')
        .attr('font-size', '10px')
        .attr('dy', '10px');
      g.select('.domain').attr('stroke', '#333');

      // Left Y Axis (Volume kg)
      g.append('g')
        .call(
          d3.axisLeft(yScaleVolume)
            .ticks(5)
            .tickFormat(d => `${Number(d) / 1000}k`)
        )
        .selectAll('text')
        .attr('fill', '#D4FF00')
        .attr('font-size', '10px')
        .attr('font-weight', '600');

      // Left Axis Label
      g.append('text')
        .attr('transform', 'rotate(-9deg)')
        .attr('x', -20)
        .attr('y', -14)
        .attr('fill', '#D4FF00')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('Volume (kg)');

      // Right Y Axis (Sleep hours)
      g.append('g')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(
          d3.axisRight(yScaleSleep)
            .ticks(6)
            .tickFormat(d => `${d}h`)
        )
        .selectAll('text')
        .attr('fill', '#818cf8')
        .attr('font-size', '10px')
        .attr('font-weight', '600');

      // Right Axis Label
      g.append('text')
        .attr('x', innerWidth - 50)
        .attr('y', -14)
        .attr('fill', '#818cf8')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('Sono (horas)');

    } else {
      // -------------------------------------------------------------
      // 2. SCATTER PLOT: X = Sleep Hours, Y = Workout Volume (kg)
      // -------------------------------------------------------------
      const scatterPoints = correlatedData.filter((d): d is CorrelatedItem & { workoutVolumeKg: number } => d.workoutVolumeKg !== null && d.workoutVolumeKg > 0);

      // X Scale: Sleep Hours (5h to 9.5h)
      const minHoursVal = d3.min(scatterPoints, (d: CorrelatedItem) => d.hoursSlept);
      const minHours = Math.max(4, Math.floor(minHoursVal !== undefined ? minHoursVal : 5));
      const maxHoursVal = d3.max(scatterPoints, (d: CorrelatedItem) => d.hoursSlept);
      const maxHours = Math.min(11, Math.ceil(maxHoursVal !== undefined ? maxHoursVal : 9.5));

      const xScale = d3.scaleLinear()
        .domain([minHours - 0.5, maxHours + 0.5])
        .range([0, innerWidth]);

      // Y Scale: Workout Volume (kg)
      const maxVolVal = d3.max(scatterPoints, (d: CorrelatedItem) => d.workoutVolumeKg || 0);
      const maxVol = maxVolVal !== undefined ? maxVolVal : 10000;
      const minVolVal = d3.min(scatterPoints, (d: CorrelatedItem) => d.workoutVolumeKg || 0);
      const minVolBase = minVolVal !== undefined ? minVolVal : 5000;
      const minVol = Math.max(0, minVolBase - 1000);

      const yScale = d3.scaleLinear()
        .domain([minVol, Math.ceil(maxVol * 1.1)])
        .range([innerHeight, 0]);

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#262626')
        .attr('stroke-dasharray', '3,3');
      g.select('.grid .domain').remove();

      // Regression / Trendline Calculation
      if (scatterPoints.length >= 2) {
        const xValues = scatterPoints.map(d => d.hoursSlept);
        const yValues = scatterPoints.map(d => d.workoutVolumeKg || 0);
        const n = scatterPoints.length;
        const xMean = d3.mean(xValues) || 7.5;
        const yMean = d3.mean(yValues) || 7500;

        let num = 0;
        let den = 0;
        for (let i = 0; i < n; i++) {
          num += (xValues[i] - xMean) * (yValues[i] - yMean);
          den += Math.pow(xValues[i] - xMean, 2);
        }
        const slope = den !== 0 ? num / den : 0;
        const intercept = yMean - slope * xMean;

        const x1 = minHours;
        const y1 = slope * x1 + intercept;
        const x2 = maxHours;
        const y2 = slope * x2 + intercept;

        // Draw Trendline
        g.append('line')
          .attr('x1', xScale(x1))
          .attr('y1', yScale(y1))
          .attr('x2', xScale(x2))
          .attr('y2', yScale(y2))
          .attr('stroke', '#D4FF00')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('stroke-opacity', 0.7);

        g.append('text')
          .attr('x', xScale(x2) - 120)
          .attr('y', yScale(y2) - 10)
          .attr('fill', '#D4FF00')
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .text('Tendência: +Sono = +Carga');
      }

      // Scatter Points
      g.selectAll<SVGCircleElement, CorrelatedItem>('.scatter-bubble')
        .data(scatterPoints)
        .enter()
        .append('circle')
        .attr('class', 'scatter-bubble')
        .attr('cx', (d: CorrelatedItem) => xScale(d.hoursSlept))
        .attr('cy', (d: CorrelatedItem) => yScale(d.workoutVolumeKg || 0))
        .attr('r', 8)
        .attr('fill', (d: CorrelatedItem) => {
          if (d.quality === 'excelente') return '#10b981';
          if (d.quality === 'bom') return '#06b6d4';
          if (d.quality === 'regular') return '#f59e0b';
          return '#f43f5e';
        })
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', (event: MouseEvent, d: CorrelatedItem) => {
          tooltip
            .style('opacity', '1')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 40}px`)
            .html(`
              <div class="p-2.5 rounded-lg bg-[#181818] border border-[#333] shadow-xl text-xs space-y-1">
                <div class="font-bold text-white">${d.formattedDate}</div>
                <div class="text-[#D4FF00] font-mono font-bold">Volume: ${(d.workoutVolumeKg || 0).toLocaleString('pt-BR')} kg</div>
                <div class="text-indigo-300">Dormiu: ${d.hoursSlept}h (${d.quality})</div>
                <div class="text-neutral-400 text-[11px]">${d.workoutTitle || 'Treino'}</div>
              </div>
            `);
        })
        .on('mouseout', () => tooltip.style('opacity', '0'));

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d}h`))
        .selectAll('text')
        .attr('fill', '#a3a3a3')
        .attr('font-size', '10px');
      g.select('.domain').attr('stroke', '#333');

      // X Axis Label
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', '#818cf8')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('Duração do Sono na Noite Anterior (horas)');

      // Y Axis
      g.append('g')
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d => `${Number(d).toLocaleString('pt-BR')} kg`)
        )
        .selectAll('text')
        .attr('fill', '#D4FF00')
        .attr('font-size', '10px');

      // Y Axis Label
      g.append('text')
        .attr('x', -20)
        .attr('y', -14)
        .attr('fill', '#D4FF00')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('Volume de Carga Suportado no Treino (kg)');
    }

  }, [correlatedData, chartView, containerWidth]);

  // Form submit handler
  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || formHours <= 0) return;

    addSleepLog({
      date: formDate,
      hoursSlept: formHours,
      quality: formQuality,
      deepSleepHours: formDeepHours !== '' ? Number(formDeepHours) : undefined,
      bedTime: formBedTime || undefined,
      wakeTime: formWakeTime || undefined,
      perceivedEnergy: formEnergy,
      notes: formNotes.trim() || undefined
    });

    setIsAddModalOpen(false);
    // Reset form
    setFormNotes('');
  };

  const hoursPresets = [6, 6.5, 7, 7.5, 8, 8.5, 9];

  return (
    <div id="sleep-monitor-section" className="space-y-6">
      {/* Tooltip floating DOM element for D3 */}
      <div 
        id="sleep-d3-tooltip" 
        className="fixed pointer-events-none z-50 opacity-0 transition-opacity duration-150"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] relative overflow-hidden">
        <div className="flex items-start gap-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Monitor de Sono & Recuperação do SNC
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Correlação D3 com Performance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              O sono reparador restaura o Sistema Nervoso Central, glicogênio e síntese proteica. Registre suas noites e visualize o impacto direto no seu volume de carga suportado.
            </p>
          </div>
        </div>

        <button
          id="btn-open-sleep-modal"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4FF00] hover:bg-[#BCE600] text-black text-xs sm:text-sm font-bold shadow-lg shadow-[rgba(212,255,0,0.15)] transition-all active:scale-95 z-10 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Sono</span>
        </button>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Média de Horas */}
        <div className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Média de Sono</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats.avgHours}
            </span>
            <span className="text-xs font-semibold text-neutral-400">horas / noite</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1">
            {stats.avgHours >= 7.5 ? (
              <span className="text-emerald-400 font-medium">Faixa excelente para hipertrofia</span>
            ) : (
              <span className="text-amber-400 font-medium">Meta recomendada: 7.5h a 8.5h</span>
            )}
          </p>
        </div>

        {/* Card 2: Qualidade Alta */}
        <div className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Qualidade Alta</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats.goodSleepPct}%
            </span>
            <span className="text-xs font-semibold text-neutral-400">noites boas</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5">
            {stats.goodSleepCount} de {sleepLogs.length} noites com nota excelente/boa
          </p>
        </div>

        {/* Card 3: Sono Profundo */}
        <div className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sono Profundo Médio</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats.avgDeepHours}
            </span>
            <span className="text-xs font-semibold text-neutral-400">horas / noite</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5">
            Fase crítica para liberação de GH e reparação
          </p>
        </div>

        {/* Card 4: Impacto no Volume */}
        <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bônus de Carga</span>
            <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#D4FF00] tracking-tight">
              +{stats.performanceBoostPct}%
            </span>
            <span className="text-xs font-semibold text-neutral-400">volume de carga</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5">
            Após noites de sono reparador vs sono curto
          </p>
        </div>
      </div>

      {/* Chart & Recovery Recommendations Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main D3 Chart Container (7 cols on lg, 8 cols on xl) */}
        <div 
          id="d3-chart-container" 
          ref={chartContainerRef}
          className="lg:col-span-7 xl:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
        >
          {/* Chart Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242424] pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#D4FF00]" />
                <span>Correlação Visual: Duração do Sono × Carga Suportada no Treino</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Visualização renderizada via D3.js com escalas temporais, regressão linear e dados combinados
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#1F1F1F] p-1 rounded-xl border border-[#2A2A2A] self-start sm:self-auto">
              <button
                id="btn-view-timeline"
                onClick={() => setChartView('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartView === 'timeline'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tendência Temporal
              </button>
              <button
                id="btn-view-scatter"
                onClick={() => setChartView('scatter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartView === 'scatter'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Dispersão (Scatter Plot)
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 px-1">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#D4FF00]" />
                <span>Volume Total Treinado (kg)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 bg-indigo-400 rounded-full" />
                <span>Duração do Sono (horas)</span>
              </div>
              <div className="flex items-center gap-2 border-l border-[#2B2B2B] pl-3">
                <span className="text-neutral-500 font-medium">Qualidade:</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Excelente</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Bom</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Regular</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Ruim</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 hidden sm:block">
              * Passe o mouse sobre os pontos para detalhes
            </div>
          </div>

          {/* D3 SVG Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              id="d3-sleep-correlation-svg"
              ref={svgRef}
              className="w-full h-auto min-h-[320px] select-none"
            />
          </div>

          {/* Insight Box */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">
                Conclusão da Análise de Recuperação:
              </span>
              <p className="text-neutral-300 leading-relaxed">
                Seus dados mostram uma forte correlação positiva: noites com <strong>8h ou mais</strong> de sono e qualidade classificada como <em>Excelente</em> geraram uma média de <strong>{stats.avgVolumeOnGoodSleep.toLocaleString('pt-BR')} kg</strong> de volume de carga levantada, contra <strong>{stats.avgVolumeOnPoorSleep.toLocaleString('pt-BR')} kg</strong> após noites curtas ou agitadas.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Recomendações de Recuperação (5 cols on lg, 4 cols on xl) */}
        <div 
          id="recovery-recommendations-card"
          className="lg:col-span-5 xl:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4"
        >
          {/* Card Header */}
          <div className="space-y-2 border-b border-[#242424] pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Recomendações de Recuperação
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Sugestão de horários com base no seu padrão semanal
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly Average Pill & Status Badge */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <div 
                id="weekly-avg-pill"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202020] border border-[#303030] text-xs"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-neutral-300">Média Semanal:</span>
                <span className="font-bold text-white font-mono">{recoveryRecommendations.weeklyAvgHours}h</span>
                <span className="text-[10px] text-neutral-500">({recoveryRecommendations.sampleSize} noites)</span>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${recoveryRecommendations.statusTheme.bg} ${recoveryRecommendations.statusTheme.border} ${recoveryRecommendations.statusTheme.color}`}>
                {recoveryRecommendations.statusTheme.badge}
              </span>
            </div>
          </div>

          {/* Interactive Target Wake Time Preference */}
          <div className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Horário habitual de despertar:
              </span>
              <span className="text-[11px] text-neutral-400 font-mono font-bold">
                {targetWakeTime}
              </span>
            </div>

            {/* Quick preset chips & time input */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['05:30', '06:00', '06:30', '07:00', '07:30'].map(time => (
                <button
                  key={time}
                  id={`btn-wake-time-${time.replace(':', '')}`}
                  type="button"
                  onClick={() => handleSetTargetWakeTime(time)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    targetWakeTime === time
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : 'bg-[#252525] text-neutral-300 hover:bg-[#303030] hover:text-white'
                  }`}
                >
                  {time}
                </button>
              ))}

              <input 
                id="input-wake-time-custom"
                type="time" 
                value={targetWakeTime}
                onChange={(e) => e.target.value && handleSetTargetWakeTime(e.target.value)}
                className="px-2 py-1 rounded-lg bg-[#252525] border border-[#3A3A3A] text-xs text-white font-mono focus:outline-none focus:border-[#D4FF00]"
                title="Personalizar horário de acordar"
              />
            </div>
          </div>

          {/* Recommended Schedule Protocol */}
          <div className="space-y-2.5">
            {/* 1. Horário Ideal para Dormir */}
            <div 
              id="ideal-bedtime-metric"
              className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-[#191919] border border-indigo-500/30 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  Horário Ideal de Deitar
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  {recoveryRecommendations.idealBedtimeStr}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Calculado para atingir {recoveryRecommendations.suggestedSleepHours}h de sono puro + 15 min de indução prévia para despertar às {targetWakeTime}.
              </p>
            </div>

            {/* 2. Janela de Desaceleração / Higiene */}
            <div 
              id="wind-down-metric"
              className="p-3 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
                  Desaceleração & Telas
                </span>
                <span className="text-sm sm:text-base font-bold text-cyan-300 font-mono">
                  {recoveryRecommendations.idealWindDownStr}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                45 min antes: desligar luzes brancas e telas para liberar melatonina e reduzir cortisol.
              </p>
            </div>

            {/* 3. Limite de Cafeína & Estimulantes */}
            <div 
              id="caffeine-curfew-metric"
              className="p-3 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  Corte de Cafeína / Pré-Treino
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">
                  Até {recoveryRecommendations.caffeineCurfewStr}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                8 horas antes do sono: a meia-vida da cafeína preserva a integridade do sono profundo (fase de GH).
              </p>
            </div>
          </div>

          {/* Weekly Balance Bar & Scientific Diagnosis */}
          <div id="weekly-balance-bar" className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#282828] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">
                Balanço Semanal (vs 8.0h ideal):
              </span>
              <span className={`font-bold font-mono ${recoveryRecommendations.diffFromTarget >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {recoveryRecommendations.diffFromTarget >= 0 
                  ? `+${recoveryRecommendations.diffFromTarget}h / dia (Saldo Positivo)`
                  : `${recoveryRecommendations.diffFromTarget}h / dia (${recoveryRecommendations.weeklyDeficitHours}h no total)`}
              </span>
            </div>

            {/* Visual ratio bar */}
            <div className="w-full h-2 rounded-full bg-[#282828] overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  recoveryRecommendations.weeklyAvgHours >= 8.0 
                    ? 'bg-emerald-400' 
                    : recoveryRecommendations.weeklyAvgHours >= 7.0 
                    ? 'bg-cyan-400' 
                    : recoveryRecommendations.weeklyAvgHours >= 6.0 
                    ? 'bg-amber-400' 
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(15, (recoveryRecommendations.weeklyAvgHours / 8.0) * 100))}%` }}
              />
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {recoveryRecommendations.statusTheme.summary}
            </p>
          </div>

          {/* Strategic Power Nap Callout (se houver déficit semanal) */}
          {recoveryRecommendations.powerNapRecommended && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white block text-[11px]">
                  Cochilo Estratégico (Power Nap):
                </span>
                <p className="text-[11px] text-amber-200/90 leading-tight">
                  Como há débito semanal, uma sesta de <strong>20 a 25 min entre 13:00 e 14:30</strong> reduz a fadiga neuromuscular sem atrasar o sono noturno.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sleep Logs History Table / Cards */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#161616] border border-[#242424] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Histórico de Noites Registradas
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#222] text-neutral-400 border border-[#333]">
              {sleepLogs.length} noites
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs text-[#D4FF00] hover:underline font-semibold flex items-center gap-1"
          >
            <span>+ Novo Registro</span>
          </button>
        </div>

        {/* List of Entries */}
        <div className="space-y-2.5">
          {sleepLogs.map(log => {
            const badge = getQualityBadge(log.quality);
            const BadgeIcon = badge.icon;
            const matchingWorkout = (workoutHistory || []).find(w => w.date === log.date);

            return (
              <div
                key={log.id}
                id={`sleep-log-item-${log.id}`}
                className="p-4 rounded-xl bg-[#1A1A1A] border border-[#262626] hover:border-[#333] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                {/* Left info: Date & Hours */}
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#222] border border-[#303030] flex flex-col items-center justify-center text-center flex-shrink-0">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">
                      {new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).slice(0, 3)}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {new Date(log.date + 'T12:00:00').getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {log.hoursSlept} horas dormidas
                      </span>

                      {/* Quality Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span className="capitalize">{badge.label}</span>
                      </span>

                      {log.perceivedEnergy && (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          • Disposição: <strong className="text-white">{log.perceivedEnergy}/10</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                      {log.bedTime && log.wakeTime && (
                        <span className="flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" />
                          <span>{log.bedTime} → {log.wakeTime}</span>
                        </span>
                      )}
                      {log.deepSleepHours && (
                        <span className="text-indigo-300">
                          Sono profundo: <strong>{log.deepSleepHours}h</strong>
                        </span>
                      )}
                      {log.notes && (
                        <span className="text-neutral-400 italic">
                          "{log.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right info: Workout match & Delete action */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#262626]">
                  {matchingWorkout ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-xs">
                      <Dumbbell className="w-3.5 h-3.5 text-[#D4FF00]" />
                      <div>
                        <span className="text-[#D4FF00] font-bold font-mono">
                          {matchingWorkout.totalVolumeKg.toLocaleString('pt-BR')} kg
                        </span>
                        <span className="text-neutral-400 text-[11px] ml-1.5 hidden sm:inline">
                          ({matchingWorkout.title})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-neutral-500 italic">
                      Sem treino registrado neste dia
                    </span>
                  )}

                  {deleteConfirmId === log.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          deleteSleepLog(log.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded bg-[#2A2A2A] text-neutral-300 text-[11px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(log.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Registrar Noite de Sono */}
      {isAddModalOpen && (
        <div 
          id="modal-add-sleep-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            id="modal-add-sleep"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#181818] border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#1F1F1F] border-b border-[#2B2B2B]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Registrar Noite de Sono
                  </h3>
                  <span className="text-[11px] text-neutral-400 block">
                    Adicione seus dados para cruzar com sua evolução de carga
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSleep} className="p-5 sm:p-6 space-y-5">
              {/* Row 1: Date & Horas dormidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Data</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Duração do Sono</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {formHours} horas
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="16"
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Quick Hours Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-500 font-semibold mr-1">Atalhos:</span>
                {hoursPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormHours(preset)}
                    className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      formHours === preset
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'bg-[#222] text-neutral-300 hover:bg-[#2C2C2C]'
                    }`}
                  >
                    {preset}h
                  </button>
                ))}
              </div>

              {/* Quality Selector */}
              <div className="space-y-2 pt-2 border-t border-[#262626]">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Qualidade Subjetiva do Sono</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['excelente', 'bom', 'regular', 'ruim'] as SleepQuality[]).map(qual => {
                    const b = getQualityBadge(qual);
                    const Icon = b.icon;
                    const isSelected = formQuality === qual;

                    return (
                      <button
                        key={qual}
                        type="button"
                        onClick={() => setFormQuality(qual)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? `${b.color} shadow-sm ring-1 ring-white/20 font-bold`
                            : 'border-[#2D2D2D] bg-[#141414] text-neutral-400 hover:text-neutral-200 hover:bg-[#1E1E1E]'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <span className="text-xs capitalize">{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Horários & Sono Profundo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#262626]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                    <Moon className="w-3 h-3 text-indigo-400" />
                    <span>Deitou às</span>
                  </label>
                  <input
                    type="time"
                    value={formBedTime}
                    onChange={(e) => setFormBedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>Acordou às</span>
                  </label>
                  <input
                    type="time"
                    value={formWakeTime}
                    onChange={(e) => setFormWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>Sono Profundo (h)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="6"
                    value={formDeepHours}
                    onChange={(e) => setFormDeepHours(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 2.1"
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Energy Level Slider (1 - 10) */}
              <div className="space-y-2 pt-2 border-t border-[#262626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#D4FF00]" />
                    <span>Disposição Física ao Acordar</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#D4FF00]">
                    {formEnergy}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formEnergy}
                  onChange={(e) => setFormEnergy(Number(e.target.value))}
                  className="w-full accent-[#D4FF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                  <span>1 - Letárgico / Esgotado</span>
                  <span>5 - Normal</span>
                  <span>10 - 100% Recuperado</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                <label className="text-xs font-semibold text-neutral-300">
                  Observações (opcional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Tomou melatonina, quarto escuro e gelado, acordou com excelente disposição..."
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white text-xs focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#222] transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D4FF00] hover:bg-[#BCE600] text-black text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Registro de Sono</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
