import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  Flame,
  Award,
  RefreshCw,
  Sparkles,
  FileQuestion,
  Layers,
  FileText,
} from 'lucide-react';
import { StudyGoal, Subject, ScheduledSession, GoalMetricType } from '../types';

interface GoalsProps {
  goals: StudyGoal[];
  subjects: Subject[];
  sessions: ScheduledSession[];
  onAddGoal: () => void;
  onEditGoal: (goal: StudyGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateGoalProgress: (goalId: string, newValue: number) => void;
  onSyncHoursWithTimetable: () => void;
}

export const Goals: React.FC<GoalsProps> = ({
  goals,
  subjects,
  sessions,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onUpdateGoalProgress,
  onSyncHoursWithTimetable,
}) => {
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Calculations
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.currentValue >= g.targetValue || g.completed).length;
  const overallPercent = totalGoals > 0
    ? Math.round(
        (goals.reduce((sum, g) => sum + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) /
          totalGoals)
      )
    : 0;

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    if (filterSubjectId !== 'all' && g.subjectId !== filterSubjectId) return false;
    if (filterType !== 'all' && g.metricType !== filterType) return false;
    return true;
  });

  const getMetricIcon = (type: GoalMetricType) => {
    switch (type) {
      case 'problems':
        return <FileQuestion className="w-4 h-4 text-indigo-500" />;
      case 'hours':
        return <Clock className="w-4 h-4 text-emerald-500" />;
      case 'flashcards':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'mock_exams':
        return <Award className="w-4 h-4 text-rose-500" />;
      case 'chapters':
        return <BookOpen className="w-4 h-4 text-sky-500" />;
      default:
        return <Target className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Weekly Study Targets & Progress
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded">
              Practice Problems, Hours & Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define weekly problem sets, study hours, or past papers per course and log your progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onSyncHoursWithTimetable}
            title="Auto-update study hour goals from completed timetable sessions"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Sync Timetable Hours</span>
          </button>

          <button
            onClick={onAddGoal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Weekly Target</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion Progress */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Weekly Target Rate</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{overallPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Average across all active course goals
          </div>
        </div>

        {/* Goals Achieved */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block mb-1">
            Goals Achieved
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {completedGoals} / {totalGoals}{' '}
            <span className="text-xs font-normal text-slate-500">targets met</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {totalGoals - completedGoals} targets in progress
          </span>
        </div>

        {/* Total Practice Problems */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block mb-1">
            Practice Problems Logged
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {goals
              .filter((g) => g.metricType === 'problems')
              .reduce((sum, g) => sum + g.currentValue, 0)}{' '}
            <span className="text-xs font-normal text-slate-500">
              / {goals.filter((g) => g.metricType === 'problems').reduce((sum, g) => sum + g.targetValue, 0)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Solved across technical problem sets
          </span>
        </div>

        {/* High Difficulty Coverage */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block mb-1">
            Hard Course Targets
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {goals.filter((g) => {
              const subj = subjectMap.get(g.subjectId);
              return subj && subj.difficulty >= 4;
            }).length}{' '}
            <span className="text-xs font-normal text-slate-500">active targets</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Targeting Difficulties 4 & 5
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium">Filter by Course:</span>
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Courses ({subjects.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name} ({s.difficulty}/5)
              </option>
            ))}
          </select>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span className="text-slate-500 font-medium">Metric:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Target Metrics</option>
            <option value="problems">Practice Problems</option>
            <option value="hours">Study Hours</option>
            <option value="flashcards">Flashcards</option>
            <option value="mock_exams">Mock Exams</option>
            <option value="chapters">Chapters</option>
          </select>
        </div>

        <span className="text-slate-400 dark:text-slate-500 font-mono">
          Showing {filteredGoals.length} targets
        </span>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No weekly targets matching filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Define quantitative targets like solving 30 practice problems or completing 6 study hours for each course.
          </p>
          <button
            onClick={onAddGoal}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Create Your First Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const subject = subjectMap.get(goal.subjectId);
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isDone = goal.currentValue >= goal.targetValue;

            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all hover:shadow-md overflow-hidden ${
                  isDone
                    ? 'border-emerald-300 dark:border-emerald-900/60 ring-1 ring-emerald-100 dark:ring-emerald-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Accent Color Strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                />

                <div className="p-5 space-y-4">
                  {/* Top Line: Course Tag & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                      >
                        {subject ? subject.code : 'COURSE'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        {subject ? subject.name : ''}
                      </span>
                    </div>

                    {isDone ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed!</span>
                      </span>
                    ) : percent >= 60 ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full">
                        On Track ({percent}%)
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full">
                        In Progress ({percent}%)
                      </span>
                    )}
                  </div>

                  {/* Title & Metric Type */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      {getMetricIcon(goal.metricType)}
                      <span className="capitalize font-medium">{goal.metricType.replace('_', ' ')} Target</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {goal.title}
                    </h3>
                  </div>

                  {/* Progress Visualization */}
                  <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Progress: <strong className="font-mono text-slate-900 dark:text-white">{goal.currentValue}</strong>{' '}
                        / <span className="font-mono text-slate-500">{goal.targetValue} {goal.unit}</span>
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {percent}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isDone
                            ? 'bg-emerald-500'
                            : percent < 40
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {goal.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5 line-clamp-1">
                        &quot;{goal.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Quick Logger Controls (+1, +5, -1) */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Log:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                        className="px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateGoalProgress(goal.id, goal.currentValue + 1)}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded transition-colors"
                      >
                        +1 {goal.unit}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateGoalProgress(goal.id, goal.currentValue + 5)}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors shadow-xs"
                      >
                        +5 {goal.unit}
                      </button>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
