export type FitnessLevel = 'iniciante' | 'intermediario' | 'avancado';

export type MuscleGroup = 
  | 'Peito' 
  | 'Costas' 
  | 'Pernas' 
  | 'Quadríceps' 
  | 'Posterior' 
  | 'Glúteos' 
  | 'Ombros' 
  | 'Bíceps' 
  | 'Tríceps' 
  | 'Abdômen' 
  | 'Panturrilha';

export interface Exercise {
  id: string;
  name: string;
  level: FitnessLevel;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: string;
  youtubeId: string; // Real instructional video embed
  videoTimestamp?: number;
  setupInstructions: string[];
  executionSteps: string[];
  commonMistakes: string[];
  coachTips: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
}

export interface ProgramExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  targetRPE?: number; // Rate of perceived exertion (1-10)
  note?: string;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  tagline: string;
  level: FitnessLevel;
  split: string; // e.g. "Full Body 3x", "ABC", "PPL (Push/Pull/Legs)", "ABCDE"
  daysPerWeek: number;
  durationMin: number;
  description: string;
  exercises: ProgramExercise[];
  focusAreas: string[];
  isPremium?: boolean;
}

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
  best1RM?: number;
}

export interface WorkoutSession {
  id: string;
  programId?: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  totalVolumeKg: number; // Sum of (weight * reps) across completed sets
  exercises: ExerciseLog[];
  feeling?: 'otimo' | 'bom' | 'cansado' | 'desafiador';
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercent?: number;
  chestCm?: number;
  waistCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
}

export interface WorkoutGoals {
  dailyVolumeTargetKg: number; // Objetivo de volume total em kg (peso x reps)
  weeklyFrequencyTargetDays: number; // Objetivo de treinos por semana (dias)
  weeklyCardioTargetMinutes?: number; // Objetivo semanal de aeróbico (minutos)
}

export type TipCategory = 'forma' | 'nutricao' | 'motivacao';

export interface DailyTip {
  id: string;
  category: TipCategory;
  title: string;
  tag: string;
  content: string;
  practicalAction: string;
  scientificOrCoachNote?: string;
  exerciseId?: string; // Reference to exercise in EXERCISES_DATABASE
  nutritionCategory?: string; // Reference to nutrition guide
  authorBadge?: string;
}

export type CardioType = 
  | 'esteira' 
  | 'corrida' 
  | 'bicicleta' 
  | 'ciclismo_rua' 
  | 'escada' 
  | 'eliptico' 
  | 'caminhada' 
  | 'natacao' 
  | 'remo' 
  | 'hiit';

export interface CardioLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: CardioType;
  title?: string;
  durationMinutes: number;
  distanceKm?: number;
  caloriesBurned?: number;
  avgHeartRateBpm?: number;
  perceivedExertionRPE?: number; // 1 to 10
  inclinePercent?: number; // % (e.g. 8% na esteira)
  paceMinPerKm?: string; // e.g. "5:30"
  notes?: string;
}

export type SleepQuality = 'excelente' | 'bom' | 'regular' | 'ruim';

export interface SleepLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hoursSlept: number; // e.g. 7.5
  quality: SleepQuality;
  deepSleepHours?: number; // e.g. 2.1
  bedTime?: string; // e.g. "23:00"
  wakeTime?: string; // e.g. "07:00"
  perceivedEnergy?: number; // 1 to 10 (disposição física ao acordar)
  notes?: string;
}

export type BeverageType = 'agua' | 'eletrolitos' | 'cha' | 'shake' | 'outro';

export interface HydrationLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number; // e.g. 250, 500
  timestamp: string; // HH:mm
  type?: BeverageType;
  note?: string;
}

export interface HydrationGoalSettings {
  dailyTargetMl: number;
  autoCalculateFromWeight: boolean;
  mlPerKg: number;
  workoutBonusMl: number;
}

export interface CoachProfile {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatar: string;
  avatarUrl?: string;
  specialty: string;
  experience: string;
  welcomeMessage: string;
  quickQuestions: string[];
  bio?: string;
  credentials?: string;
}

export interface ChatMessage {
  id: string;
  coachId?: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  level: FitnessLevel;
  goal: 'hipertrofia' | 'emagrecimento' | 'forca' | 'recomposicao';
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'masculino' | 'feminino';
  activityLevel: 'sedentario' | 'moderado' | 'intenso';
  isPremium: boolean;
  premiumExpiry?: string;
  streakDays: number;
}
