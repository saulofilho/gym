import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WorkoutSession, 
  BodyMeasurement, 
  UserProfile, 
  WorkoutProgram, 
  Exercise, 
  ExerciseLog, 
  LoggedSet,
  ChatMessage,
  CardioLogEntry,
  WorkoutGoals,
  SleepLogEntry,
  HydrationLogEntry
} from '../types';
import { WORKOUT_PROGRAMS } from '../data/workoutsData';
import { EXERCISES_DATABASE } from '../data/exercisesData';

interface ActiveWorkoutState {
  programId?: string;
  title: string;
  startTime: number;
  elapsedSeconds: number;
  exercises: {
    exercise: Exercise;
    sets: LoggedSet[];
    targetSets: number;
    targetReps: string;
    restSeconds: number;
    notes?: string;
  }[];
  currentExerciseIndex: number;
  isPaused: boolean;
}

interface WorkoutContextType {
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  togglePremiumStatus: () => void;
  
  // Active Workout Session
  activeWorkout: ActiveWorkoutState | null;
  startWorkout: (program: WorkoutProgram) => void;
  startQuickWorkoutWithExercise: (exercise: Exercise) => void;
  cancelActiveWorkout: () => void;
  finishActiveWorkout: (feeling: WorkoutSession['feeling'], notes?: string) => WorkoutSession;
  addSetToActiveExercise: (exerciseIndex: number, weightKg: number, reps: number, rpe?: number) => void;
  toggleSetCompleted: (exerciseIndex: number, setIndex: number) => void;
  updateSetValues: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number, rpe?: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  addNewSetToExercise: (exerciseIndex: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  setCurrentExerciseIndex: (index: number) => void;
  
  // Rest Timer
  restTimerSeconds: number;
  isRestTimerRunning: boolean;
  startRestTimer: (seconds: number) => void;
  cancelRestTimer: () => void;

  // History & Records
  workoutHistory: WorkoutSession[];
  getLastLoadForExercise: (exerciseId: string) => LoggedSet[] | null;
  getExerciseMax1RM: (exerciseId: string) => number;
  
  // Measurements
  measurements: BodyMeasurement[];
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  deleteMeasurement: (id: string) => void;

  // Cardio & Aerobic Activities
  cardioLogs: CardioLogEntry[];
  addCardioLog: (entry: Omit<CardioLogEntry, 'id'>) => void;
  deleteCardioLog: (id: string) => void;
  monthlyCardioMinutes: number;
  monthlyCardioCalories: number;
  monthlyCardioDistanceKm: number;
  weeklyCardioMinutes: number;

  // Custom Routines
  customPrograms: WorkoutProgram[];
  addCustomProgram: (program: WorkoutProgram) => void;

  // Chat messages
  chatHistories: Record<string, ChatMessage[]>;
  addChatMessage: (coachId: string, message: Omit<ChatMessage, 'id' | 'coachId'>) => void;
  clearChatHistory: (coachId: string) => void;

  // Stats
  monthlyCompletedCount: number;
  monthlyTotalVolumeKg: number;

  // Workout Goals
  workoutGoals: WorkoutGoals;
  updateWorkoutGoals: (goals: Partial<WorkoutGoals>) => void;
  todayCompletedVolumeKg: number;
  activeWorkoutCurrentVolumeKg: number;
  todayTotalVolumeKg: number;
  thisWeekWorkoutsCount: number;
  thisWeekDaysStatus: {
    date: string;
    dayName: string;
    dayNum: number;
    hasWorkout: boolean;
    hasCardio: boolean;
    isToday: boolean;
  }[];
  thisWeekCardioMinutes: number;

  // Sleep Tracking
  sleepLogs: SleepLogEntry[];
  addSleepLog: (entry: Omit<SleepLogEntry, 'id'>) => void;
  deleteSleepLog: (id: string) => void;

  // Hydration Tracking
  hydrationLogs: HydrationLogEntry[];
  addHydrationLog: (entry: Omit<HydrationLogEntry, 'id'>) => void;
  deleteHydrationLog: (id: string) => void;
  clearTodayHydration: () => void;
  hydrationDailyTargetMl: number;
  setHydrationDailyTargetMl: (ml: number) => void;
  todayHydrationTotalMl: number;
  todayHydrationLogs: HydrationLogEntry[];
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Initial Seed Data for realistic demonstration
const INITIAL_MEASUREMENTS: BodyMeasurement[] = [
  { id: 'm-1', date: '2026-06-01', weightKg: 78.5, bodyFatPercent: 19.2, chestCm: 98, waistCm: 86, armCm: 34.5, thighCm: 56 },
  { id: 'm-2', date: '2026-07-01', weightKg: 77.8, bodyFatPercent: 18.0, chestCm: 99, waistCm: 84.5, armCm: 35.2, thighCm: 56.5 },
  { id: 'm-3', date: '2026-08-01', weightKg: 77.2, bodyFatPercent: 16.8, chestCm: 100.5, waistCm: 83.0, armCm: 36.0, thighCm: 57.0 },
  { id: 'm-4', date: '2026-09-01', weightKg: 76.9, bodyFatPercent: 15.6, chestCm: 102.0, waistCm: 81.5, armCm: 36.8, thighCm: 58.0 }
];

const INITIAL_CARDIO_LOGS: CardioLogEntry[] = [
  {
    id: 'c-1',
    date: '2026-08-26',
    type: 'esteira',
    title: 'Caminhada Inclinada Pós-Treino',
    durationMinutes: 25,
    distanceKm: 2.3,
    caloriesBurned: 195,
    avgHeartRateBpm: 128,
    perceivedExertionRPE: 5,
    inclinePercent: 8,
    notes: 'Zona 2 aeróbica para recuperação ativa e queima de gordura.'
  },
  {
    id: 'c-2',
    date: '2026-08-29',
    type: 'escada',
    title: 'Simulador de Escada Intenso',
    durationMinutes: 20,
    caloriesBurned: 220,
    avgHeartRateBpm: 154,
    perceivedExertionRPE: 8,
    notes: 'Ritmo 7 a 9 constante. Ativação excelente de glúteos e panturrilha.'
  },
  {
    id: 'c-3',
    date: '2026-09-01',
    type: 'corrida',
    title: 'Corrida ao Ar Livre 5K',
    durationMinutes: 28,
    distanceKm: 5.0,
    caloriesBurned: 340,
    avgHeartRateBpm: 162,
    perceivedExertionRPE: 7.5,
    paceMinPerKm: '5:36',
    notes: 'Treino de resistência no parque. Frequência cardíaca controlada.'
  },
  {
    id: 'c-4',
    date: '2026-09-04',
    type: 'bicicleta',
    title: 'Spinning / Bicicleta Ergométrica',
    durationMinutes: 30,
    distanceKm: 12.5,
    caloriesBurned: 260,
    avgHeartRateBpm: 135,
    perceivedExertionRPE: 6,
    notes: 'Cadência moderada 85 RPM com resistências variadas.'
  }
];

const INITIAL_SLEEP_LOGS: SleepLogEntry[] = [
  {
    id: 'sl-1',
    date: '2026-08-25',
    hoursSlept: 7.5,
    quality: 'bom',
    deepSleepHours: 1.8,
    bedTime: '23:15',
    wakeTime: '06:45',
    perceivedEnergy: 8,
    notes: 'Sono reparador antes do Treino A de Peito e Ombros.'
  },
  {
    id: 'sl-2',
    date: '2026-08-26',
    hoursSlept: 6.8,
    quality: 'regular',
    deepSleepHours: 1.4,
    bedTime: '00:10',
    wakeTime: '06:58',
    perceivedEnergy: 6,
    notes: 'Dia de cardio leve. Demorou a pegar no sono.'
  },
  {
    id: 'sl-3',
    date: '2026-08-27',
    hoursSlept: 8.2,
    quality: 'excelente',
    deepSleepHours: 2.3,
    bedTime: '22:30',
    wakeTime: '06:42',
    perceivedEnergy: 9,
    notes: 'Noite perfeita! Carga no treino de Costas e Bíceps subiu expressivamente.'
  },
  {
    id: 'sl-4',
    date: '2026-08-28',
    hoursSlept: 7.2,
    quality: 'bom',
    deepSleepHours: 1.7,
    bedTime: '23:30',
    wakeTime: '06:42',
    perceivedEnergy: 7,
    notes: 'Descanso muscular ativo.'
  },
  {
    id: 'sl-5',
    date: '2026-08-29',
    hoursSlept: 8.0,
    quality: 'excelente',
    deepSleepHours: 2.2,
    bedTime: '22:45',
    wakeTime: '06:45',
    perceivedEnergy: 9,
    notes: 'Ótima recuperação para o treino pesado de Pernas (Leg Day).'
  },
  {
    id: 'sl-6',
    date: '2026-08-30',
    hoursSlept: 5.5,
    quality: 'ruim',
    deepSleepHours: 0.9,
    bedTime: '01:00',
    wakeTime: '06:30',
    perceivedEnergy: 4,
    notes: 'Insônia e ansiedade. Sensação de cansaço durante o dia.'
  },
  {
    id: 'sl-7',
    date: '2026-08-31',
    hoursSlept: 6.5,
    quality: 'regular',
    deepSleepHours: 1.3,
    bedTime: '23:45',
    wakeTime: '06:15',
    perceivedEnergy: 6,
    notes: 'Treino de Peito realizado com RPE mais elevado devido ao sono curto.'
  },
  {
    id: 'sl-8',
    date: '2026-09-01',
    hoursSlept: 7.8,
    quality: 'bom',
    deepSleepHours: 1.9,
    bedTime: '23:00',
    wakeTime: '06:48',
    perceivedEnergy: 8,
    notes: 'Corrida ao ar livre fluiu muito bem após boa noite de sono.'
  },
  {
    id: 'sl-9',
    date: '2026-09-02',
    hoursSlept: 8.5,
    quality: 'excelente',
    deepSleepHours: 2.5,
    bedTime: '22:15',
    wakeTime: '06:45',
    perceivedEnergy: 10,
    notes: 'Recuperação máxima do SNC! Treino de Costas rendeu volume recorde.'
  },
  {
    id: 'sl-10',
    date: '2026-09-03',
    hoursSlept: 7.0,
    quality: 'bom',
    deepSleepHours: 1.6,
    bedTime: '23:20',
    wakeTime: '06:20',
    perceivedEnergy: 7,
    notes: 'Sono constante e sem despertares noturnos.'
  },
  {
    id: 'sl-11',
    date: '2026-09-04',
    hoursSlept: 8.1,
    quality: 'excelente',
    deepSleepHours: 2.3,
    bedTime: '22:40',
    wakeTime: '06:46',
    perceivedEnergy: 9,
    notes: 'Agachamento com estabilidade e força excelentes.'
  },
  {
    id: 'sl-12',
    date: '2026-09-05',
    hoursSlept: 7.6,
    quality: 'bom',
    deepSleepHours: 1.8,
    bedTime: '23:10',
    wakeTime: '06:46',
    perceivedEnergy: 8,
    notes: 'Acordou descansado e pronto para o treino.'
  }
];

const INITIAL_HYDRATION_LOGS: HydrationLogEntry[] = [
  { id: 'h-1', date: '2026-08-31', amountMl: 500, timestamp: '08:00', type: 'agua', note: 'Água em jejum' },
  { id: 'h-2', date: '2026-08-31', amountMl: 500, timestamp: '11:00', type: 'agua' },
  { id: 'h-3', date: '2026-08-31', amountMl: 750, timestamp: '14:30', type: 'eletrolitos', note: 'Intra-treino' },
  { id: 'h-4', date: '2026-08-31', amountMl: 500, timestamp: '17:30', type: 'agua' },
  { id: 'h-5', date: '2026-08-31', amountMl: 500, timestamp: '20:30', type: 'cha' },

  { id: 'h-6', date: '2026-09-01', amountMl: 500, timestamp: '07:30', type: 'agua' },
  { id: 'h-7', date: '2026-09-01', amountMl: 600, timestamp: '10:30', type: 'agua' },
  { id: 'h-8', date: '2026-09-01', amountMl: 800, timestamp: '14:00', type: 'eletrolitos', note: 'Corrida 5K' },
  { id: 'h-9', date: '2026-09-01', amountMl: 600, timestamp: '17:30', type: 'agua' },
  { id: 'h-10', date: '2026-09-01', amountMl: 700, timestamp: '21:00', type: 'agua' },

  { id: 'h-11', date: '2026-09-02', amountMl: 500, timestamp: '08:00', type: 'agua' },
  { id: 'h-12', date: '2026-09-02', amountMl: 600, timestamp: '11:15', type: 'agua' },
  { id: 'h-13', date: '2026-09-02', amountMl: 750, timestamp: '15:00', type: 'eletrolitos', note: 'Treino Costas' },
  { id: 'h-14', date: '2026-09-02', amountMl: 550, timestamp: '18:00', type: 'agua' },
  { id: 'h-15', date: '2026-09-02', amountMl: 500, timestamp: '21:30', type: 'cha' },

  { id: 'h-16', date: '2026-09-03', amountMl: 500, timestamp: '07:45', type: 'agua' },
  { id: 'h-17', date: '2026-09-03', amountMl: 600, timestamp: '10:30', type: 'agua' },
  { id: 'h-18', date: '2026-09-03', amountMl: 750, timestamp: '14:30', type: 'agua' },
  { id: 'h-19', date: '2026-09-03', amountMl: 650, timestamp: '17:45', type: 'shake' },
  { id: 'h-20', date: '2026-09-03', amountMl: 600, timestamp: '21:00', type: 'agua' },

  { id: 'h-21', date: '2026-09-04', amountMl: 500, timestamp: '08:15', type: 'agua' },
  { id: 'h-22', date: '2026-09-04', amountMl: 500, timestamp: '11:30', type: 'agua' },
  { id: 'h-23', date: '2026-09-04', amountMl: 600, timestamp: '15:15', type: 'eletrolitos' },
  { id: 'h-24', date: '2026-09-04', amountMl: 500, timestamp: '18:30', type: 'agua' },
  { id: 'h-25', date: '2026-09-04', amountMl: 500, timestamp: '21:30', type: 'cha' },

  { id: 'h-26', date: '2026-09-05', amountMl: 500, timestamp: '07:30', type: 'agua', note: 'Água com limão' },
  { id: 'h-27', date: '2026-09-05', amountMl: 750, timestamp: '10:45', type: 'agua' },
  { id: 'h-28', date: '2026-09-05', amountMl: 800, timestamp: '14:00', type: 'eletrolitos', note: 'Treino de Pernas' },
  { id: 'h-29', date: '2026-09-05', amountMl: 700, timestamp: '17:30', type: 'agua' },
  { id: 'h-30', date: '2026-09-05', amountMl: 600, timestamp: '21:00', type: 'agua' },

  { id: 'h-31', date: '2026-09-06', amountMl: 450, timestamp: '07:45', type: 'agua', note: 'Hidratação ao acordar' },
  { id: 'h-32', date: '2026-09-06', amountMl: 500, timestamp: '10:00', type: 'agua', note: 'Garrafinha de mesa' },
  { id: 'h-33', date: '2026-09-06', amountMl: 400, timestamp: '12:30', type: 'agua' },
  { id: 'h-34', date: '2026-09-06', amountMl: 500, timestamp: '15:00', type: 'eletrolitos', note: 'Intra-treino' },
  { id: 'h-35', date: '2026-09-06', amountMl: 300, timestamp: '16:30', type: 'agua' }
];

const INITIAL_SESSIONS: WorkoutSession[] = [
  {
    id: 'ws-1',
    programId: 'iniciante-abc',
    title: 'Treino A - Peito, Ombros e Tríceps',
    date: '2026-08-25',
    startTime: Date.now() - 11 * 86400000,
    durationMinutes: 52,
    totalVolumeKg: 6420,
    feeling: 'otimo',
    exercises: [
      {
        exerciseId: 'supino-reto-barra',
        exerciseName: 'Supino Reto com Barra',
        sets: [
          { setNumber: 1, weightKg: 50, reps: 12, rpe: 7, completed: true },
          { setNumber: 2, weightKg: 55, reps: 10, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 60, reps: 8, rpe: 8.5, completed: true },
          { setNumber: 4, weightKg: 60, reps: 8, rpe: 9, completed: true }
        ]
      },
      {
        exerciseId: 'desenvolvimento-halteres',
        exerciseName: 'Desenvolvimento de Ombros com Halteres',
        sets: [
          { setNumber: 1, weightKg: 16, reps: 12, rpe: 7.5, completed: true },
          { setNumber: 2, weightKg: 18, reps: 10, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 18, reps: 9, rpe: 8.5, completed: true }
        ]
      }
    ]
  },
  {
    id: 'ws-2',
    programId: 'iniciante-abc',
    title: 'Treino B - Costas e Bíceps',
    date: '2026-08-28',
    startTime: Date.now() - 8 * 86400000,
    durationMinutes: 48,
    totalVolumeKg: 7150,
    feeling: 'bom',
    exercises: [
      {
        exerciseId: 'puxada-alta-frente',
        exerciseName: 'Puxada Alta no Pulley',
        sets: [
          { setNumber: 1, weightKg: 45, reps: 12, rpe: 7, completed: true },
          { setNumber: 2, weightKg: 50, reps: 10, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 55, reps: 9, rpe: 8.5, completed: true }
        ]
      },
      {
        exerciseId: 'remada-curvada-barra',
        exerciseName: 'Remada Curvada com Barra',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 10, rpe: 7.5, completed: true },
          { setNumber: 2, weightKg: 45, reps: 8, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 50, reps: 8, rpe: 9, completed: true }
        ]
      }
    ]
  },
  {
    id: 'ws-3',
    programId: 'avancado-ppl',
    title: 'Treino C - Pernas Completo',
    date: '2026-09-02',
    startTime: Date.now() - 3 * 86400000,
    durationMinutes: 62,
    totalVolumeKg: 11480,
    feeling: 'desafiador',
    exercises: [
      {
        exerciseId: 'agachamento-livre',
        exerciseName: 'Agachamento Livre com Barra',
        sets: [
          { setNumber: 1, weightKg: 70, reps: 10, rpe: 7.5, completed: true },
          { setNumber: 2, weightKg: 80, reps: 8, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 90, reps: 6, rpe: 9, completed: true }
        ]
      },
      {
        exerciseId: 'leg-press-45',
        exerciseName: 'Leg Press 45 Graus',
        sets: [
          { setNumber: 1, weightKg: 140, reps: 15, rpe: 8, completed: true },
          { setNumber: 2, weightKg: 160, reps: 12, rpe: 8.5, completed: true },
          { setNumber: 3, weightKg: 180, reps: 10, rpe: 9.5, completed: true }
        ]
      }
    ]
  }
];

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('academiapro_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: 'Atleta AcademiaPro',
      level: 'iniciante',
      goal: 'hipertrofia',
      weightKg: 76.9,
      heightCm: 178,
      age: 26,
      gender: 'masculino',
      activityLevel: 'moderado',
      isPremium: false,
      streakDays: 4
    };
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('academiapro_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SESSIONS;
  });

  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => {
    const saved = localStorage.getItem('academiapro_measurements');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MEASUREMENTS;
  });

  const [cardioLogs, setCardioLogs] = useState<CardioLogEntry[]>(() => {
    const saved = localStorage.getItem('academiapro_cardio_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CARDIO_LOGS;
  });

  const [sleepLogs, setSleepLogs] = useState<SleepLogEntry[]>(() => {
    const saved = localStorage.getItem('academiapro_sleep_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SLEEP_LOGS;
  });

  const [hydrationLogs, setHydrationLogs] = useState<HydrationLogEntry[]>(() => {
    const saved = localStorage.getItem('academiapro_hydration_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_HYDRATION_LOGS;
  });

  const [hydrationDailyTargetMl, setHydrationDailyTargetMl] = useState<number>(() => {
    const saved = localStorage.getItem('academiapro_hydration_target_ml');
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num > 0) return num;
    }
    return 3000;
  });

  const [customPrograms, setCustomPrograms] = useState<WorkoutProgram[]>(() => {
    const saved = localStorage.getItem('academiapro_custom_programs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('academiapro_chat_histories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  // Active workout state
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(() => {
    const saved = localStorage.getItem('academiapro_active_workout');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Workout Goals
  const DEFAULT_WORKOUT_GOALS: WorkoutGoals = {
    dailyVolumeTargetKg: 8000,
    weeklyFrequencyTargetDays: 4,
    weeklyCardioTargetMinutes: 60
  };

  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoals>(() => {
    const saved = localStorage.getItem('academiapro_workout_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_WORKOUT_GOALS;
  });

  const updateWorkoutGoals = (updates: Partial<WorkoutGoals>) => {
    setWorkoutGoals(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('academiapro_workout_goals', JSON.stringify(updated));
      return updated;
    });
  };

  // Rest Timer
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('academiapro_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('academiapro_sessions', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('academiapro_measurements', JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem('academiapro_cardio_logs', JSON.stringify(cardioLogs));
  }, [cardioLogs]);

  useEffect(() => {
    localStorage.setItem('academiapro_sleep_logs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem('academiapro_hydration_logs', JSON.stringify(hydrationLogs));
  }, [hydrationLogs]);

  useEffect(() => {
    localStorage.setItem('academiapro_hydration_target_ml', hydrationDailyTargetMl.toString());
  }, [hydrationDailyTargetMl]);

  useEffect(() => {
    localStorage.setItem('academiapro_custom_programs', JSON.stringify(customPrograms));
  }, [customPrograms]);

  useEffect(() => {
    localStorage.setItem('academiapro_chat_histories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    localStorage.setItem('academiapro_workout_goals', JSON.stringify(workoutGoals));
  }, [workoutGoals]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('academiapro_active_workout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('academiapro_active_workout');
    }
  }, [activeWorkout]);

  // Active Workout elapsed timer
  useEffect(() => {
    if (!activeWorkout || activeWorkout.isPaused) return;

    const interval = setInterval(() => {
      setActiveWorkout(prev => {
        if (!prev || prev.isPaused) return prev;
        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.isPaused, !!activeWorkout]);

  // Rest timer countdown
  useEffect(() => {
    if (!isRestTimerRunning || restTimerSeconds <= 0) {
      setIsRestTimerRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setRestTimerSeconds(prev => {
        if (prev <= 1) {
          setIsRestTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRestTimerRunning, restTimerSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerRunning(true);
  };

  const cancelRestTimer = () => {
    setRestTimerSeconds(0);
    setIsRestTimerRunning(false);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const togglePremiumStatus = () => {
    setUserProfile(prev => ({
      ...prev,
      isPremium: !prev.isPremium,
      premiumExpiry: !prev.isPremium ? '2027-01-01' : undefined
    }));
  };

  // Start program session
  const startWorkout = (program: WorkoutProgram) => {
    const exercisesList = (program.exercises || []).map(item => {
      const exerciseDef = EXERCISES_DATABASE.find(e => e.id === item.exerciseId) || {
        id: item.exerciseId,
        name: 'Exercício',
        level: program.level,
        primaryMuscle: 'Peito' as const,
        secondaryMuscles: [],
        equipment: 'Aparelho',
        youtubeId: 'rT7DgCr-3pg',
        setupInstructions: [],
        executionSteps: [],
        commonMistakes: [],
        coachTips: '',
        defaultSets: item.targetSets,
        defaultReps: item.targetReps,
        defaultRestSeconds: item.restSeconds
      };

      // Check last used load for this exercise
      const lastSets = getLastLoadForExercise(item.exerciseId);
      const defaultWeight = lastSets && lastSets.length > 0 ? lastSets[0].weightKg : 20;

      const initialSets: LoggedSet[] = Array.from({ length: item.targetSets }, (_, i) => {
        const lastSetForNum = lastSets && lastSets[i] ? lastSets[i].weightKg : defaultWeight;
        const lastRepsForNum = lastSets && lastSets[i] ? lastSets[i].reps : parseInt(item.targetReps) || 10;
        return {
          setNumber: i + 1,
          weightKg: lastSetForNum,
          reps: lastRepsForNum,
          rpe: item.targetRPE,
          completed: false
        };
      });

      return {
        exercise: exerciseDef,
        sets: initialSets,
        targetSets: item.targetSets,
        targetReps: item.targetReps,
        restSeconds: item.restSeconds,
        notes: item.note
      };
    });

    setActiveWorkout({
      programId: program.id,
      title: program.title,
      startTime: Date.now(),
      elapsedSeconds: 0,
      exercises: exercisesList,
      currentExerciseIndex: 0,
      isPaused: false
    });
  };

  const startQuickWorkoutWithExercise = (exercise: Exercise) => {
    const lastSets = getLastLoadForExercise(exercise.id);
    const defaultWeight = lastSets && lastSets.length > 0 ? lastSets[0].weightKg : 20;

    const initialSets: LoggedSet[] = Array.from({ length: exercise.defaultSets || 3 }, (_, i) => ({
      setNumber: i + 1,
      weightKg: lastSets && lastSets[i] ? lastSets[i].weightKg : defaultWeight,
      reps: parseInt(exercise.defaultReps) || 10,
      rpe: 8,
      completed: false
    }));

    setActiveWorkout({
      title: `Treino: ${exercise.name}`,
      startTime: Date.now(),
      elapsedSeconds: 0,
      exercises: [
        {
          exercise,
          sets: initialSets,
          targetSets: exercise.defaultSets || 3,
          targetReps: exercise.defaultReps || '10',
          restSeconds: exercise.defaultRestSeconds || 60,
          notes: exercise.coachTips
        }
      ],
      currentExerciseIndex: 0,
      isPaused: false
    });
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(null);
    cancelRestTimer();
  };

  const finishActiveWorkout = (feeling: WorkoutSession['feeling'] = 'bom', notes?: string): WorkoutSession => {
    if (!activeWorkout) throw new Error('Nenhum treino ativo');

    let totalTonnage = 0;
    const completedExercises: ExerciseLog[] = [];

    activeWorkout.exercises.forEach(item => {
      const completedSets = item.sets.filter(s => s.completed);
      if (completedSets.length > 0) {
        let max1RM = 0;
        completedSets.forEach(s => {
          totalTonnage += (s.weightKg * s.reps);
          // Epley formula: 1RM = weight * (1 + reps/30)
          const est1RM = Math.round(s.weightKg * (1 + s.reps / 30));
          if (est1RM > max1RM) max1RM = est1RM;
        });

        completedExercises.push({
          exerciseId: item.exercise.id,
          exerciseName: item.exercise.name,
          sets: completedSets,
          best1RM: max1RM
        });
      }
    });

    const durationMin = Math.max(1, Math.round(activeWorkout.elapsedSeconds / 60));
    const todayStr = new Date().toISOString().split('T')[0];

    const newSession: WorkoutSession = {
      id: `ws-${Date.now()}`,
      programId: activeWorkout.programId,
      title: activeWorkout.title,
      date: todayStr,
      startTime: activeWorkout.startTime,
      endTime: Date.now(),
      durationMinutes: durationMin,
      totalVolumeKg: Math.round(totalTonnage),
      exercises: completedExercises,
      feeling,
      notes
    };

    setWorkoutHistory(prev => [newSession, ...prev]);
    setActiveWorkout(null);
    cancelRestTimer();

    // Increment user streak
    setUserProfile(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1
    }));

    return newSession;
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    let shouldStartRest = false;
    let restTime = 60;

    setActiveWorkout(prev => {
      if (!prev) return null;
      const exercisesCopy = [...prev.exercises];
      const targetEx = { ...exercisesCopy[exerciseIndex] };
      const setsCopy = [...targetEx.sets];
      
      const wasCompleted = setsCopy[setIndex].completed;
      setsCopy[setIndex] = {
        ...setsCopy[setIndex],
        completed: !wasCompleted
      };
      
      targetEx.sets = setsCopy;
      exercisesCopy[exerciseIndex] = targetEx;

      // If set just marked completed, flag to trigger rest timer
      if (!wasCompleted) {
        shouldStartRest = true;
        restTime = targetEx.restSeconds || 60;
      }

      return {
        ...prev,
        exercises: exercisesCopy
      };
    });

    if (shouldStartRest) {
      startRestTimer(restTime);
    }
  };

  const updateSetValues = (exerciseIndex: number, setIndex: number, weightKg: number, reps: number, rpe?: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const exercisesCopy = [...prev.exercises];
      const targetEx = { ...exercisesCopy[exerciseIndex] };
      const setsCopy = [...targetEx.sets];

      setsCopy[setIndex] = {
        ...setsCopy[setIndex],
        weightKg: Math.max(0, weightKg),
        reps: Math.max(1, reps),
        rpe: rpe !== undefined ? rpe : setsCopy[setIndex].rpe
      };

      targetEx.sets = setsCopy;
      exercisesCopy[exerciseIndex] = targetEx;

      return {
        ...prev,
        exercises: exercisesCopy
      };
    });
  };

  const addSetToActiveExercise = (exerciseIndex: number, weightKg: number, reps: number, rpe?: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const exercisesCopy = [...prev.exercises];
      const targetEx = { ...exercisesCopy[exerciseIndex] };
      const newSetNumber = targetEx.sets.length + 1;

      targetEx.sets = [
        ...targetEx.sets,
        {
          setNumber: newSetNumber,
          weightKg,
          reps,
          rpe: rpe || 8,
          completed: true
        }
      ];

      exercisesCopy[exerciseIndex] = targetEx;
      return { ...prev, exercises: exercisesCopy };
    });
  };

  const addNewSetToExercise = (exerciseIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const exercisesCopy = [...prev.exercises];
      const targetEx = { ...exercisesCopy[exerciseIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSetNumber = targetEx.sets.length + 1;

      targetEx.sets = [
        ...targetEx.sets,
        {
          setNumber: newSetNumber,
          weightKg: lastSet ? lastSet.weightKg : 20,
          reps: lastSet ? lastSet.reps : 10,
          rpe: lastSet ? lastSet.rpe : 8,
          completed: false
        }
      ];

      exercisesCopy[exerciseIndex] = targetEx;
      return { ...prev, exercises: exercisesCopy };
    });
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const exercisesCopy = [...prev.exercises];
      const targetEx = { ...exercisesCopy[exerciseIndex] };

      targetEx.sets = (targetEx.sets || [])
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      exercisesCopy[exerciseIndex] = targetEx;
      return { ...prev, exercises: exercisesCopy };
    });
  };

  const nextExercise = () => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const nextIdx = Math.min(prev.exercises.length - 1, prev.currentExerciseIndex + 1);
      return { ...prev, currentExerciseIndex: nextIdx };
    });
  };

  const prevExercise = () => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const prevIdx = Math.max(0, prev.currentExerciseIndex - 1);
      return { ...prev, currentExerciseIndex: prevIdx };
    });
  };

  const setCurrentExerciseIndex = (index: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return { ...prev, currentExerciseIndex: index };
    });
  };

  // Helper to fetch last recorded load for an exercise
  const getLastLoadForExercise = (exerciseId: string): LoggedSet[] | null => {
    for (const session of workoutHistory) {
      const match = session.exercises.find(e => e.exerciseId === exerciseId);
      if (match && match.sets && match.sets.length > 0) {
        return match.sets;
      }
    }
    return null;
  };

  // Helper to calculate best 1RM recorded for an exercise
  const getExerciseMax1RM = (exerciseId: string): number => {
    let max = 0;
    workoutHistory.forEach(s => {
      const ex = s.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets) {
        ex.sets.forEach(set => {
          const est = Math.round(set.weightKg * (1 + set.reps / 30));
          if (est > max) max = est;
        });
      }
    });
    return max;
  };

  const addMeasurement = (measurement: Omit<BodyMeasurement, 'id'>) => {
    const newEntry: BodyMeasurement = {
      ...measurement,
      id: `m-${Date.now()}`
    };
    setMeasurements(prev => [...prev, newEntry].sort((a, b) => a.date.localeCompare(b.date)));
    if (measurement.weightKg) {
      setUserProfile(p => ({ ...p, weightKg: measurement.weightKg }));
    }
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const addCardioLog = (entry: Omit<CardioLogEntry, 'id'>) => {
    const newEntry: CardioLogEntry = {
      ...entry,
      id: `c-${Date.now()}`
    };
    setCardioLogs(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  };

  const deleteCardioLog = (id: string) => {
    setCardioLogs(prev => prev.filter(c => c.id !== id));
  };

  const addSleepLog = (entry: Omit<SleepLogEntry, 'id'>) => {
    const newEntry: SleepLogEntry = {
      ...entry,
      id: `sl-${Date.now()}`
    };
    setSleepLogs(prev => {
      // Replace if same date or prepend
      const filtered = prev.filter(s => s.date !== entry.date);
      return [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  const deleteSleepLog = (id: string) => {
    setSleepLogs(prev => prev.filter(s => s.id !== id));
  };

  const addHydrationLog = (entry: Omit<HydrationLogEntry, 'id'>) => {
    const newEntry: HydrationLogEntry = {
      ...entry,
      id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    setHydrationLogs(prev => [newEntry, ...prev]);
  };

  const deleteHydrationLog = (id: string) => {
    setHydrationLogs(prev => prev.filter(h => h.id !== id));
  };

  const clearTodayHydration = () => {
    setHydrationLogs(prev => prev.filter(h => h.date !== todayStr));
  };

  const addCustomProgram = (program: WorkoutProgram) => {
    setCustomPrograms(prev => [program, ...prev]);
  };

  const addChatMessage = (coachId: string, message: Omit<ChatMessage, 'id' | 'coachId'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      coachId
    };

    setChatHistories(prev => ({
      ...prev,
      [coachId]: [...(prev[coachId] || []), newMessage]
    }));
  };

  const clearChatHistory = (coachId: string) => {
    setChatHistories(prev => ({
      ...prev,
      [coachId]: []
    }));
  };

  // Monthly stats calculation (current month)
  const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlySessions = workoutHistory.filter(s => s.date.startsWith(currentYearMonth));
  const monthlyCompletedCount = monthlySessions.length;
  const monthlyTotalVolumeKg = monthlySessions.reduce((sum, s) => sum + s.totalVolumeKg, 0);

  // Monthly cardio stats calculation
  const monthlyCardio = (cardioLogs || []).filter(c => c.date.startsWith(currentYearMonth));
  const monthlyCardioMinutes = monthlyCardio.reduce((sum, c) => sum + (c.durationMinutes || 0), 0);
  const monthlyCardioCalories = monthlyCardio.reduce((sum, c) => sum + (c.caloriesBurned || 0), 0);
  const monthlyCardioDistanceKm = monthlyCardio.reduce((sum, c) => sum + (c.distanceKm || 0), 0);

  // Weekly cardio minutes (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const weeklyCardioMinutes = (cardioLogs || [])
    .filter(c => c.date >= oneWeekAgo)
    .reduce((sum, c) => sum + (c.durationMinutes || 0), 0);

  // Daily & Weekly Workout Goals Calculation
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  // Completed sessions today
  const todayCompletedSessions = workoutHistory.filter(s => s.date === todayStr);
  const todayCompletedVolumeKg = todayCompletedSessions.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);

  // Active workout live volume from completed sets
  const activeWorkoutCurrentVolumeKg = activeWorkout
    ? activeWorkout.exercises.reduce((acc, ex) =>
        acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weightKg * s.reps), 0)
      , 0)
    : 0;

  const todayTotalVolumeKg = todayCompletedVolumeKg + activeWorkoutCurrentVolumeKg;

  // Monday of current week
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const mondayStr = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;

  const thisWeekSessions = workoutHistory.filter(s => s.date >= mondayStr);
  const thisWeekTrainedDates = new Set(thisWeekSessions.map(s => s.date));
  if (todayCompletedSessions.length > 0 || (activeWorkout && activeWorkoutCurrentVolumeKg > 0)) {
    thisWeekTrainedDates.add(todayStr);
  }
  const thisWeekWorkoutsCount = thisWeekTrainedDates.size;

  const thisWeekDaysStatus = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return {
      date: dStr,
      dayName: dayNames[i],
      dayNum: d.getDate(),
      hasWorkout: thisWeekTrainedDates.has(dStr),
      hasCardio: (cardioLogs || []).some(c => c.date === dStr),
      isToday: dStr === todayStr
    };
  });

  const thisWeekCardioMinutes = (cardioLogs || [])
    .filter(c => c.date >= mondayStr)
    .reduce((sum, c) => sum + (c.durationMinutes || 0), 0);

  // Today's Hydration summary
  const todayHydrationLogs = (hydrationLogs || []).filter(h => h.date === todayStr);
  const todayHydrationTotalMl = todayHydrationLogs.reduce((acc, h) => acc + (h.amountMl || 0), 0);

  return (
    <WorkoutContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        togglePremiumStatus,
        activeWorkout,
        startWorkout,
        startQuickWorkoutWithExercise,
        cancelActiveWorkout,
        finishActiveWorkout,
        addSetToActiveExercise,
        toggleSetCompleted,
        updateSetValues,
        removeSetFromExercise,
        addNewSetToExercise,
        nextExercise,
        prevExercise,
        setCurrentExerciseIndex,
        restTimerSeconds,
        isRestTimerRunning,
        startRestTimer,
        cancelRestTimer,
        workoutHistory,
        getLastLoadForExercise,
        getExerciseMax1RM,
        measurements,
        addMeasurement,
        deleteMeasurement,
        cardioLogs,
        addCardioLog,
        deleteCardioLog,
        monthlyCardioMinutes,
        monthlyCardioCalories,
        monthlyCardioDistanceKm,
        weeklyCardioMinutes,
        customPrograms,
        addCustomProgram,
        chatHistories,
        addChatMessage,
        clearChatHistory,
        monthlyCompletedCount,
        monthlyTotalVolumeKg,
        workoutGoals,
        updateWorkoutGoals,
        todayCompletedVolumeKg,
        activeWorkoutCurrentVolumeKg,
        todayTotalVolumeKg,
        thisWeekWorkoutsCount,
        thisWeekDaysStatus,
        thisWeekCardioMinutes,
        sleepLogs,
        addSleepLog,
        deleteSleepLog,
        hydrationLogs,
        addHydrationLog,
        deleteHydrationLog,
        clearTodayHydration,
        hydrationDailyTargetMl,
        setHydrationDailyTargetMl,
        todayHydrationTotalMl,
        todayHydrationLogs
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
