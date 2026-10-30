export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Monday, 6 = Sunday

export const DAYS_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, { label: string; description: string; color: string }> = {
  1: { label: 'Very Easy', description: 'Light reading, minimal homework', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  2: { label: 'Easy', description: 'Straightforward concepts, predictable assignments', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400' },
  3: { label: 'Medium', description: 'Standard college workload, regular problem sets', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  4: { label: 'Hard', description: 'Demanding proofs, rigorous projects, heavy exams', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  5: { label: 'Extremely Hard', description: 'Brutal curves, deep conceptual difficulty', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
};

export interface FixedClassSlot {
  id: string;
  day: DayOfWeek;
  startMinutes: number; // e.g. 540 = 09:00
  durationMinutes: number; // e.g. 60 or 90
  location?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS 161", "MATH 240"
  name: string; // e.g. "Data Structures & Algorithms"
  credits: number; // 1 to 6
  currentScore: number; // 0 to 100 (percentage)
  targetScore: number; // 0 to 100
  difficulty: DifficultyLevel; // 1 to 5 scale
  isLowScoreFlagged: boolean; // Flagged by student or system for intensive recovery
  color: string; // Hex color e.g. "#4F46E5"
  fixedClasses: FixedClassSlot[];
  preferredTimeOfDay?: 'any' | 'morning' | 'afternoon' | 'evening';
  suggestedSessionLengthMinutes?: 60 | 90 | 120; // Suggest longer blocks for low score / hard subjects
  includeInSchedule?: boolean; // Student choice whether to schedule study for this course
  notes?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string; // e.g. "Midterm 2", "Final Exam"
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" e.g. "14:00"
  weightPercent: number; // e.g. 35
  difficultyMultiplier?: number; // 1.0 to 1.5
  topicsCovered?: string;
  autoBlockLeadDays?: number; // How many days prior to inject dedicated crunch prep
}

export type SlotStatus = 'available' | 'blocked' | 'preferred';

export interface AvailabilityGrid {
  // 7 days x 32 slots of 30-min from 07:00 (420 min) to 23:00 (1380 min)
  // key is `${day}_${slotIndex}`
  slots: Record<string, SlotStatus>;
}

export interface OptimizerSettings {
  deficitWeight: number; // 0 to 100 (weight for low score deficit)
  difficultyWeight: number; // 0 to 100 (weight for student-set difficulty)
  examUrgencyWeight: number; // 0 to 100 (weight for proximity of exams)
  courseLoadWeight: number; // 0 to 100 (weight for course credits)
  sessionLengthMinutes: 45 | 60 | 90 | 120;
  minWeeklyHoursPerSubject: number; // e.g. 1.5
  maxDailyStudyHours: number; // e.g. 6
  distributeAcrossDays: boolean; // avoid clumping
  strategy: 'balanced' | 'exam_crunch' | 'grade_recovery' | 'deep_work';
  allowLongerBlocksForFlagged: boolean; // Flagged low scores get 90-120m sessions
  earliestStudyStartMinutes: number; // Student chosen study start time (e.g. 540 = 09:00 AM)
  latestStudyEndMinutes: number; // Student chosen study end time (e.g. 1320 = 10:00 PM)
}

export interface ScheduledSession {
  id: string;
  subjectId: string;
  type: 'study' | 'class' | 'exam' | 'exam_prep';
  title: string;
  subtitle?: string;
  day: DayOfWeek;
  startMinutes: number; // Minutes from midnight, e.g. 9 * 60 = 540
  durationMinutes: number;
  completed: boolean;
  priorityScore: number;
  reason: string;
  examId?: string;
  isFlaggedRecovery?: boolean;
}

export interface SubjectPriorityBreakdown {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: string;
  currentScore: number;
  scoreDeficit: number; // 100 - score
  difficulty: DifficultyLevel;
  credits: number;
  isLowScoreFlagged: boolean;
  nearestExam?: {
    title: string;
    date: string;
    daysRemaining: number;
    weight: number;
  };
  scoreFactor: number;
  difficultyFactor: number;
  loadFactor: number;
  urgencyMultiplier: number;
  compositePriorityIndex: number; // Final weighted score
  allocatedHours: number; // Resulting hours per week
  percentageOfStudyTime: number;
  recommendedSessionLength: number;
}

export type GoalMetricType = 'hours' | 'problems' | 'flashcards' | 'chapters' | 'mock_exams' | 'custom';

export interface StudyGoal {
  id: string;
  subjectId: string;
  title: string; // e.g. "Dynamic Programming practice questions"
  metricType: GoalMetricType;
  targetValue: number; // e.g. 35
  currentValue: number; // e.g. 21
  unit: string; // e.g. "problems", "hours", "cards", "exams"
  notes?: string;
  completed: boolean;
}
