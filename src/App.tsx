import React, { useState, useEffect, useMemo } from 'react';
import {
  AvailabilityGrid,
  Exam,
  OptimizerSettings,
  ScheduledSession,
  Subject,
  StudyGoal,
} from './types';
import { generateTimetable, calculateDaysRemaining } from './utils/optimizer';
import { PRESETS, DEFAULT_OPTIMIZER_SETTINGS } from './utils/presets';
import { exportTimetableToICS } from './utils/exportCalendar';
import { Header } from './components/Header';
import { TimetableGrid } from './components/TimetableGrid';
import { SubjectManager } from './components/SubjectManager';
import { ExamCountdownList } from './components/ExamCountdownList';
import { Goals } from './components/Goals';
import { AvailabilityPainter } from './components/AvailabilityPainter';
import { PriorityAnalytics } from './components/PriorityAnalytics';
import { CourseModal } from './components/CourseModal';
import { ExamModal } from './components/ExamModal';
import { GoalModal } from './components/GoalModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { StrategySettingsModal } from './components/StrategySettingsModal';

const STORAGE_KEYS = {
  SUBJECTS: 'eduplan_subjects_v1',
  EXAMS: 'eduplan_exams_v1',
  GOALS: 'eduplan_goals_v1',
  AVAILABILITY: 'eduplan_availability_v1',
  SETTINGS: 'eduplan_settings_v1',
  COMPLETED: 'eduplan_completed_sessions_v1',
  THEME: 'eduplan_theme_v1',
};

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'timetable' | 'subjects' | 'exams' | 'goals' | 'availability' | 'analytics'
  >('timetable');

  // Core Data States
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESETS[0].subjects;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESETS[0].exams;
  });

  const [goals, setGoals] = useState<StudyGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESETS[0].goals || [];
  });

  const [availability, setAvailability] = useState<AvailabilityGrid>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESETS[0].availability;
  });

  const [settings, setSettings] = useState<OptimizerSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESETS[0].settings;
  });

  // Track completed sessions by ID
  const [completedSessionIds, setCompletedSessionIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {};
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedSessionIds));
  }, [completedSessionIds]);

  // Generation timestamp for manual re-optimizing trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Generate Timetable via Pure Algorithmic Optimizer
  const { sessions, breakdowns, totalStudyHours, totalClassHours } = useMemo(() => {
    void refreshTrigger;
    const result = generateTimetable(subjects, exams, availability, settings);

    // Merge completed status
    const mappedSessions = result.sessions.map((s) => ({
      ...s,
      completed: !!completedSessionIds[s.id],
    }));

    return {
      sessions: mappedSessions,
      breakdowns: result.breakdowns,
      totalStudyHours: result.totalStudyHours,
      totalClassHours: result.totalClassHours,
    };
  }, [subjects, exams, availability, settings, completedSessionIds, refreshTrigger]);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);

  // Actions for Sessions
  const handleToggleComplete = (sessionId: string) => {
    setCompletedSessionIds((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Actions for Subjects
  const handleToggleLowScoreFlag = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, isLowScoreFlagged: !s.isLowScoreFlagged } : s))
    );
  };

  const handleToggleIncludeSubject = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, includeInSchedule: s.includeInSchedule === false } : s))
    );
  };

  const handleChangeEarliestStartTime = (minutes: number) => {
    setSettings((prev) => ({
      ...prev,
      earliestStudyStartMinutes: minutes,
    }));
  };

  const handleSaveSubject = (savedSubject: Subject) => {
    setSubjects((prev) => {
      const exists = prev.some((s) => s.id === savedSubject.id);
      if (exists) {
        return prev.map((s) => (s.id === savedSubject.id ? savedSubject : s));
      }
      return [...prev, savedSubject];
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (window.confirm('Are you sure you want to remove this course and its timetable entries?')) {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      setExams((prev) => prev.filter((e) => e.subjectId !== subjectId));
      setGoals((prev) => prev.filter((g) => g.subjectId !== subjectId));
    }
  };

  // Actions for Exams
  const handleSaveExam = (savedExam: Exam) => {
    setExams((prev) => {
      const exists = prev.some((e) => e.id === savedExam.id);
      if (exists) {
        return prev.map((e) => (e.id === savedExam.id ? savedExam : e));
      }
      return [...prev, savedExam];
    });
  };

  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled exam?')) {
      setExams((prev) => prev.filter((e) => e.id !== examId));
    }
  };

  // Actions for Goals
  const handleSaveGoal = (savedGoal: StudyGoal) => {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === savedGoal.id);
      if (exists) {
        return prev.map((g) => (g.id === savedGoal.id ? savedGoal : g));
      }
      return [...prev, savedGoal];
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this study target?')) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    }
  };

  const handleUpdateGoalProgress = (goalId: string, newValue: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          currentValue: newValue,
          completed: newValue >= g.targetValue,
        };
      })
    );
  };

  // Automatically sync study hour goals with completed sessions from the timetable
  const handleSyncHoursWithTimetable = () => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.metricType !== 'hours') return g;
        // Sum completed minutes for this subject
        const completedSubjectMinutes = sessions
          .filter((s) => s.subjectId === g.subjectId && s.completed && (s.type === 'study' || s.type === 'exam_prep'))
          .reduce((sum, s) => sum + s.durationMinutes, 0);
        const hours = Math.round((completedSubjectMinutes / 60) * 10) / 10;
        return {
          ...g,
          currentValue: hours,
          completed: hours >= g.targetValue,
        };
      })
    );
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSubjects(found.subjects);
    setExams(found.exams);
    setGoals(found.goals || []);
    setAvailability(found.availability);
    setSettings(found.settings);
    setCompletedSessionIds({});
  };

  const handleExportICS = () => {
    exportTimetableToICS(sessions, subjects, 'EduPlan Semester Timetable');
  };

  const criticalExamsCount = exams.filter((e) => calculateDaysRemaining(e.date) <= 3).length;
  const completedGoalsCount = goals.filter((g) => g.currentValue >= g.targetValue || g.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* 3-Zone Header per Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onExportICS={handleExportICS}
        onSelectPreset={handleSelectPreset}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        examsCount={exams.length}
        criticalExamsCount={criticalExamsCount}
        goalsCount={goals.length}
        completedGoalsCount={completedGoalsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'timetable' && (
          <TimetableGrid
            sessions={sessions}
            subjects={subjects}
            totalStudyHours={totalStudyHours}
            totalClassHours={totalClassHours}
            earliestStudyStartMinutes={settings.earliestStudyStartMinutes || 540}
            onChangeEarliestStartTime={handleChangeEarliestStartTime}
            onToggleIncludeSubject={handleToggleIncludeSubject}
            onToggleComplete={handleToggleComplete}
            onSelectSession={(session) => setSelectedSession(session)}
            onRegenerate={() => setRefreshTrigger((prev) => prev + 1)}
            onExportICS={handleExportICS}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManager
            subjects={subjects}
            onAddSubject={() => {
              setEditingSubject(null);
              setIsCourseModalOpen(true);
            }}
            onEditSubject={(subject) => {
              setEditingSubject(subject);
              setIsCourseModalOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onToggleLowScoreFlag={handleToggleLowScoreFlag}
            onToggleIncludeInSchedule={handleToggleIncludeSubject}
          />
        )}

        {activeTab === 'exams' && (
          <ExamCountdownList
            exams={exams}
            subjects={subjects}
            onAddExam={() => {
              setEditingExam(null);
              setIsExamModalOpen(true);
            }}
            onEditExam={(exam) => {
              setEditingExam(exam);
              setIsExamModalOpen(true);
            }}
            onDeleteExam={handleDeleteExam}
          />
        )}

        {activeTab === 'goals' && (
          <Goals
            goals={goals}
            subjects={subjects}
            sessions={sessions}
            onAddGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onSyncHoursWithTimetable={handleSyncHoursWithTimetable}
          />
        )}

        {activeTab === 'availability' && (
          <AvailabilityPainter
            availability={availability}
            onChangeAvailability={setAvailability}
          />
        )}

        {activeTab === 'analytics' && (
          <PriorityAnalytics
            breakdowns={breakdowns}
            settings={settings}
            onChangeSettings={setSettings}
            totalAvailableHours={totalStudyHours}
          />
        )}
      </main>

      {/* Footer with Creator Credit */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">EduPlan</span>
            <span>·</span>
            <span className="italic">By Vernyuy Glenn</span>
          </div>
          <span>Balances course load, student difficulty, low-score recovery, and exam countdowns</span>
        </div>
      </footer>

      {/* Modals */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        subjects={subjects}
        initialExam={editingExam}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        subjects={subjects}
        initialGoal={editingGoal}
      />

      <SessionDetailModal
        session={selectedSession}
        subject={subjects.find((s) => s.id === selectedSession?.subjectId)}
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        onToggleComplete={handleToggleComplete}
      />

      <StrategySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
