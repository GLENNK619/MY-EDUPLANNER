import { AvailabilityGrid, Exam, OptimizerSettings, Subject, StudyGoal } from '../types';

export interface PresetData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  subjects: Subject[];
  exams: Exam[];
  goals: StudyGoal[];
  availability: AvailabilityGrid;
  settings: OptimizerSettings;
}

export function getDefaultAvailability(): AvailabilityGrid {
  const slots: Record<string, 'available' | 'blocked' | 'preferred'> = {};

  for (let day = 0; day < 7; day++) {
    for (let s = 0; s < 32; s++) {
      const key = `${day}_${s}`;
      const hour = 7 + Math.floor(s / 2);

      // Morning buffer (7:00 - 8:00)
      if (s < 2) {
        slots[key] = 'blocked';
      }
      // Late night sleep buffer (22:30 - 23:00)
      else if (s >= 31) {
        slots[key] = 'blocked';
      }
      // Lunch
      else if (hour === 12 && (s % 2 === 0)) {
        slots[key] = 'blocked';
      }
      // Dinner
      else if (hour === 18 && (s % 2 === 0)) {
        slots[key] = 'blocked';
      }
      // Peak morning alertness
      else if (hour >= 9 && hour < 12) {
        slots[key] = 'preferred';
      }
      // Peak evening study focus
      else if (hour >= 19 && hour < 21) {
        slots[key] = 'preferred';
      }
      else {
        slots[key] = 'available';
      }
    }
  }

  return { slots };
}

export const DEFAULT_OPTIMIZER_SETTINGS: OptimizerSettings = {
  deficitWeight: 80,
  difficultyWeight: 75,
  examUrgencyWeight: 85,
  courseLoadWeight: 50,
  sessionLengthMinutes: 60,
  minWeeklyHoursPerSubject: 1.5,
  maxDailyStudyHours: 5.5,
  distributeAcrossDays: true,
  strategy: 'balanced',
  allowLongerBlocksForFlagged: true,
  earliestStudyStartMinutes: 540, // 09:00 AM default
  latestStudyEndMinutes: 1320, // 10:00 PM default
};

function getFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export const PRESETS: PresetData[] = [
  {
    id: 'stem_midterms',
    name: 'STEM Crunch (CS & Engineering)',
    tagline: 'High difficulty subjects with imminent Physics midterm and low Data Structures score',
    description: 'Balancing 4 technical subjects. CS 161 (58% score, diff 5) is flagged for Low Score Recovery; PHYS 150 (midterm in 4 days) receives top urgency pre-exam blocks.',
    settings: {
      ...DEFAULT_OPTIMIZER_SETTINGS,
      deficitWeight: 85,
      difficultyWeight: 80,
      examUrgencyWeight: 90,
      allowLongerBlocksForFlagged: true,
    },
    availability: getDefaultAvailability(),
    subjects: [
      {
        id: 'stem_cs161',
        code: 'CS 161',
        name: 'Data Structures & Algorithms',
        credits: 4,
        currentScore: 58,
        targetScore: 85,
        difficulty: 5, // Extremely Hard
        isLowScoreFlagged: true, // Flagged for low score recovery!
        color: '#dc2626', // Red
        preferredTimeOfDay: 'morning',
        suggestedSessionLengthMinutes: 90,
        fixedClasses: [
          { id: 'cs161_mon', day: 0, startMinutes: 600, durationMinutes: 60, location: 'Turing Hall 102' },
          { id: 'cs161_wed', day: 2, startMinutes: 600, durationMinutes: 60, location: 'Turing Hall 102' },
          { id: 'cs161_fri', day: 4, startMinutes: 600, durationMinutes: 60, location: 'Turing Hall 102' },
        ],
        notes: 'Struggling with Dynamic Programming & Graph BFS/DFS implementations.',
      },
      {
        id: 'stem_phys150',
        code: 'PHYS 150',
        name: 'Electromagnetism & Waves',
        credits: 4,
        currentScore: 71,
        targetScore: 85,
        difficulty: 4, // Hard
        isLowScoreFlagged: false,
        color: '#ea580c', // Orange
        preferredTimeOfDay: 'afternoon',
        suggestedSessionLengthMinutes: 60,
        fixedClasses: [
          { id: 'phys_tue', day: 1, startMinutes: 660, durationMinutes: 90, location: 'Science Center 304' },
          { id: 'phys_thu', day: 3, startMinutes: 660, durationMinutes: 90, location: 'Science Center 304' },
        ],
        notes: 'Midterm 2 covers Gauss Law, Maxwell Equations, and Capacitance.',
      },
      {
        id: 'stem_math240',
        code: 'MATH 240',
        name: 'Linear Algebra & Diff Eq',
        credits: 4,
        currentScore: 66,
        targetScore: 80,
        difficulty: 4, // Hard
        isLowScoreFlagged: true, // Flagged
        color: '#4f46e5', // Indigo
        preferredTimeOfDay: 'evening',
        suggestedSessionLengthMinutes: 90,
        fixedClasses: [
          { id: 'math_mon', day: 0, startMinutes: 840, durationMinutes: 60, location: 'Math Tower 210' },
          { id: 'math_wed', day: 2, startMinutes: 840, durationMinutes: 60, location: 'Math Tower 210' },
        ],
        notes: 'Eigenvalues and Diagonalization proofs require practice problem sets.',
      },
      {
        id: 'stem_engl210',
        code: 'ENGL 210',
        name: 'Technical Writing for Engineers',
        credits: 3,
        currentScore: 89,
        targetScore: 90,
        difficulty: 2, // Easy
        isLowScoreFlagged: false,
        color: '#16a34a', // Emerald
        preferredTimeOfDay: 'any',
        suggestedSessionLengthMinutes: 60,
        fixedClasses: [
          { id: 'engl_tue', day: 1, startMinutes: 900, durationMinutes: 60, location: 'Humanities 108' },
          { id: 'engl_thu', day: 3, startMinutes: 900, durationMinutes: 60, location: 'Humanities 108' },
        ],
        notes: 'Final research proposal draft due in 3 weeks. Solid standing.',
      },
    ],
    exams: [
      {
        id: 'exam_phys_midterm2',
        subjectId: 'stem_phys150',
        title: 'Midterm 2: Electromagnetism',
        date: getFutureDate(4), // in 4 days!
        time: '14:00',
        weightPercent: 30,
        difficultyMultiplier: 1.3,
        topicsCovered: "Gauss's Law, Electric Potential, Capacitors, Magnetic Fields",
      },
      {
        id: 'exam_cs_midterm',
        subjectId: 'stem_cs161',
        title: 'Midterm 1: Graphs & Trees',
        date: getFutureDate(11), // in 11 days
        time: '18:00',
        weightPercent: 35,
        difficultyMultiplier: 1.4,
        topicsCovered: 'Balanced BSTs, Dijkstra shortest path, Disjoint sets',
      },
    ],
    goals: [
      {
        id: 'goal_cs_problems',
        subjectId: 'stem_cs161',
        title: 'Dynamic Programming & Graph Problems',
        metricType: 'problems',
        targetValue: 30,
        currentValue: 18,
        unit: 'problems',
        notes: 'Targeting LeetCode medium DP & graph traversal questions',
        completed: false,
      },
      {
        id: 'goal_phys_hours',
        subjectId: 'stem_phys150',
        title: 'Gauss Law Practice Problems & Review',
        metricType: 'problems',
        targetValue: 25,
        currentValue: 20,
        unit: 'problems',
        notes: 'Chapter 22-24 textbook end-of-chapter problems',
        completed: false,
      },
      {
        id: 'goal_math_hours',
        subjectId: 'stem_math240',
        title: 'Eigenvalue Proofs & Matrix Algebra Hours',
        metricType: 'hours',
        targetValue: 6,
        currentValue: 4.5,
        unit: 'hours',
        notes: 'Focused study hours with timed problem sets',
        completed: false,
      },
      {
        id: 'goal_phys_mock',
        subjectId: 'stem_phys150',
        title: 'Timed Past Physics Midterms',
        metricType: 'mock_exams',
        targetValue: 2,
        currentValue: 1,
        unit: 'mock exams',
        notes: '2024 and 2025 Midterm 2 past papers under test conditions',
        completed: false,
      },
    ],
  },
  {
    id: 'premed_intensive',
    name: 'Pre-Med Clinical Track',
    tagline: 'High volume memorization with Organic Chemistry deficit and Anatomy exam',
    description: 'Prioritizes Organic Chemistry (61% score, difficulty 5, flagged) and Anatomy & Physiology with upcoming lab practical exam in 5 days.',
    settings: {
      ...DEFAULT_OPTIMIZER_SETTINGS,
      deficitWeight: 85,
      difficultyWeight: 80,
      examUrgencyWeight: 85,
    },
    availability: getDefaultAvailability(),
    subjects: [
      {
        id: 'premed_chem',
        code: 'CHEM 331',
        name: 'Organic Chemistry I',
        credits: 4,
        currentScore: 61,
        targetScore: 85,
        difficulty: 5,
        isLowScoreFlagged: true,
        color: '#dc2626',
        preferredTimeOfDay: 'morning',
        suggestedSessionLengthMinutes: 90,
        fixedClasses: [
          { id: 'chem_m', day: 0, startMinutes: 540, durationMinutes: 60, location: 'Lab 4B' },
          { id: 'chem_w', day: 2, startMinutes: 540, durationMinutes: 60, location: 'Lab 4B' },
          { id: 'chem_f', day: 4, startMinutes: 540, durationMinutes: 60, location: 'Lab 4B' },
        ],
        notes: 'Reaction mechanisms SN1/SN2/E1/E2 and stereochemistry.',
      },
      {
        id: 'premed_anat',
        code: 'BIOL 240',
        name: 'Human Anatomy & Physiology',
        credits: 4,
        currentScore: 73,
        targetScore: 88,
        difficulty: 4,
        isLowScoreFlagged: false,
        color: '#9333ea',
        preferredTimeOfDay: 'afternoon',
        suggestedSessionLengthMinutes: 60,
        fixedClasses: [
          { id: 'anat_t', day: 1, startMinutes: 600, durationMinutes: 90, location: 'Anatomy Lab' },
          { id: 'anat_th', day: 3, startMinutes: 600, durationMinutes: 90, location: 'Anatomy Lab' },
        ],
        notes: 'Cardiovascular system histology and nervous system pathways.',
      },
      {
        id: 'premed_stat',
        code: 'STAT 215',
        name: 'Biostatistics in Medicine',
        credits: 3,
        currentScore: 79,
        targetScore: 85,
        difficulty: 3,
        isLowScoreFlagged: false,
        color: '#2563eb',
        preferredTimeOfDay: 'evening',
        fixedClasses: [
          { id: 'stat_m', day: 0, startMinutes: 780, durationMinutes: 60, location: 'Hall 201' },
          { id: 'stat_w', day: 2, startMinutes: 780, durationMinutes: 60, location: 'Hall 201' },
        ],
      },
      {
        id: 'premed_psych',
        code: 'PSYC 101',
        name: 'Behavioral Psychology',
        credits: 3,
        currentScore: 92,
        targetScore: 95,
        difficulty: 2,
        isLowScoreFlagged: false,
        color: '#059669',
        preferredTimeOfDay: 'any',
        fixedClasses: [
          { id: 'psych_t', day: 1, startMinutes: 840, durationMinutes: 60, location: 'Social Sciences' },
          { id: 'psych_th', day: 3, startMinutes: 840, durationMinutes: 60, location: 'Social Sciences' },
        ],
      },
    ],
    exams: [
      {
        id: 'exam_anat_practical',
        subjectId: 'premed_anat',
        title: 'Midterm Lab Practical: Organ Systems',
        date: getFutureDate(5),
        time: '13:00',
        weightPercent: 35,
        difficultyMultiplier: 1.35,
        topicsCovered: 'Heart dissection, arterial branches, muscle origins and insertions',
      },
    ],
    goals: [
      {
        id: 'goal_chem_mech',
        subjectId: 'premed_chem',
        title: 'Organic Chemistry Reaction Mechanisms',
        metricType: 'problems',
        targetValue: 40,
        currentValue: 26,
        unit: 'mechanisms',
        notes: 'SN1, SN2, E1, E2 and stereochemical inversion problems',
        completed: false,
      },
      {
        id: 'goal_anat_flashcards',
        subjectId: 'premed_anat',
        title: 'Anatomy Lab Anki Flashcards',
        metricType: 'flashcards',
        targetValue: 200,
        currentValue: 145,
        unit: 'cards',
        notes: 'Histology slides, vascular tree, muscle attachments',
        completed: false,
      },
      {
        id: 'goal_stat_hours',
        subjectId: 'premed_stat',
        title: 'Biostatistics R-Code & Hypotheses Hours',
        metricType: 'hours',
        targetValue: 5,
        currentValue: 3.5,
        unit: 'hours',
        notes: 'ANOVA tests and Chi-Square distribution reviews',
        completed: false,
      },
    ],
  },
  {
    id: 'business_finance',
    name: 'Finance & Economics Track',
    tagline: 'Managerial Accounting and Econometrics focus with high exam weighting',
    description: 'Designed for commerce students balancing qualitative strategy with quantitative finance modeling.',
    settings: {
      ...DEFAULT_OPTIMIZER_SETTINGS,
      deficitWeight: 75,
      difficultyWeight: 70,
      examUrgencyWeight: 80,
    },
    availability: getDefaultAvailability(),
    subjects: [
      {
        id: 'biz_acct',
        code: 'ACCT 202',
        name: 'Managerial Cost Accounting',
        credits: 3,
        currentScore: 64,
        targetScore: 82,
        difficulty: 4,
        isLowScoreFlagged: true,
        color: '#d97706',
        preferredTimeOfDay: 'morning',
        fixedClasses: [
          { id: 'acct_m', day: 0, startMinutes: 660, durationMinutes: 60, location: 'Business Hall 101' },
          { id: 'acct_w', day: 2, startMinutes: 660, durationMinutes: 60, location: 'Business Hall 101' },
        ],
      },
      {
        id: 'biz_econ',
        code: 'ECON 320',
        name: 'Applied Econometrics',
        credits: 4,
        currentScore: 68,
        targetScore: 85,
        difficulty: 5,
        isLowScoreFlagged: true,
        color: '#dc2626',
        preferredTimeOfDay: 'afternoon',
        fixedClasses: [
          { id: 'econ_t', day: 1, startMinutes: 720, durationMinutes: 90, location: 'Comp Lab 3' },
          { id: 'econ_th', day: 3, startMinutes: 720, durationMinutes: 90, location: 'Comp Lab 3' },
        ],
      },
      {
        id: 'biz_fina',
        code: 'FINA 301',
        name: 'Corporate Financial Decisions',
        credits: 3,
        currentScore: 78,
        targetScore: 85,
        difficulty: 3,
        isLowScoreFlagged: false,
        color: '#0284c7',
        preferredTimeOfDay: 'evening',
        fixedClasses: [
          { id: 'fina_m', day: 0, startMinutes: 840, durationMinutes: 60, location: 'Auditorium B' },
          { id: 'fina_w', day: 2, startMinutes: 840, durationMinutes: 60, location: 'Auditorium B' },
        ],
      },
      {
        id: 'biz_mktg',
        code: 'MKTG 201',
        name: 'Consumer Behavior & Brand',
        credits: 3,
        currentScore: 88,
        targetScore: 90,
        difficulty: 2,
        isLowScoreFlagged: false,
        color: '#10b981',
        preferredTimeOfDay: 'any',
        fixedClasses: [
          { id: 'mktg_t', day: 1, startMinutes: 840, durationMinutes: 60, location: 'Business 205' },
          { id: 'mktg_th', day: 3, startMinutes: 840, durationMinutes: 60, location: 'Business 205' },
        ],
      },
    ],
    exams: [
      {
        id: 'exam_acct_midterm',
        subjectId: 'biz_acct',
        title: 'Cost Analysis & Variance Midterm',
        date: getFutureDate(3),
        time: '11:00',
        weightPercent: 30,
        difficultyMultiplier: 1.25,
        topicsCovered: 'Standard costing, budget variance, activity-based allocation',
      },
    ],
    goals: [
      {
        id: 'goal_acct_problems',
        subjectId: 'biz_acct',
        title: 'Cost Allocation & Variance Practice Problems',
        metricType: 'problems',
        targetValue: 35,
        currentValue: 22,
        unit: 'problems',
        notes: 'Flexible budgets and direct material price variances',
        completed: false,
      },
      {
        id: 'goal_econ_hours',
        subjectId: 'biz_econ',
        title: 'Stata Regression Modeling Hours',
        metricType: 'hours',
        targetValue: 6,
        currentValue: 4,
        unit: 'hours',
        notes: 'Heteroskedasticity and instrumental variables regressions',
        completed: false,
      },
    ],
  },
];
