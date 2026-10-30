import React from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, BookOpen, Clock, ArrowUpRight, Flame } from 'lucide-react';
import { Subject, DIFFICULTY_LABELS, DifficultyLevel, DAYS_SHORT } from '../types';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onToggleLowScoreFlag: (subjectId: string) => void;
  onToggleIncludeInSchedule: (subjectId: string) => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onToggleLowScoreFlag,
  onToggleIncludeInSchedule,
}) => {
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const flaggedCount = subjects.filter((s) => s.isLowScoreFlagged).length;
  const avgDifficulty = subjects.length > 0
    ? (subjects.reduce((sum, s) => sum + s.difficulty, 0) / subjects.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Courses, Difficulty Ratings & Scores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set student difficulty ratings and flag courses with low scores to prioritize study hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 pr-3 border-r border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Enrolled</span>
              <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">{subjects.length} courses</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Credits</span>
              <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">{totalCredits} credits</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Avg Difficulty</span>
              <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">{avgDifficulty} / 5</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Flagged Low</span>
              <span className="font-bold font-mono text-sm text-rose-600 dark:text-rose-400">{flaggedCount}</span>
            </div>
          </div>

          <button
            onClick={onAddSubject}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Course List Grid */}
      {subjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No courses configured yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Add your subjects with their current grades and difficulty levels to build an optimized study timetable.
          </p>
          <button
            onClick={onAddSubject}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Add Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const diffInfo = DIFFICULTY_LABELS[subject.difficulty];
            const deficit = 100 - subject.currentScore;
            const isCritical = subject.currentScore < 70;

            return (
              <div
                key={subject.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-shadow hover:shadow-md overflow-hidden ${
                  subject.isLowScoreFlagged
                    ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Strip with Color */}
                <div className="h-1.5 w-full" style={{ backgroundColor: subject.color }} />

                <div className="p-5 space-y-4">
                  {/* Top line: Code, Name, Difficulty */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.code.split(' ')[0]?.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {subject.code}
                          </h3>
                          <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
                          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                            {subject.credits} Credits
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[220px]">
                          {subject.name}
                        </p>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${diffInfo.color}`}>
                        <span>{diffInfo.label}</span>
                        <span className="font-mono text-[11px]">({subject.difficulty}/5)</span>
                      </span>
                    </div>
                  </div>

                  {/* Score & Deficit Bar */}
                  <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Current Score: <strong className="font-mono text-slate-900 dark:text-white">{subject.currentScore}%</strong>
                      </span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Target: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{subject.targetScore}%</strong>
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all ${
                          subject.currentScore < 65
                            ? 'bg-rose-500'
                            : subject.currentScore < 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${subject.currentScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>Deficit to 100%: <strong className="font-mono text-rose-600 dark:text-rose-400">-{deficit}%</strong></span>
                      <span>Target Gap: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{Math.max(0, subject.targetScore - subject.currentScore)}%</strong></span>
                    </div>
                  </div>

                  {/* Low Score Flag & Timetable Inclusion Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onToggleLowScoreFlag(subject.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        subject.isLowScoreFlagged
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-transparent hover:border-slate-300'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${subject.isLowScoreFlagged ? 'text-rose-600 fill-rose-500' : 'text-slate-400'}`} />
                      <span>{subject.isLowScoreFlagged ? 'Low Score (Recovery Active)' : 'Flag Low Score'}</span>
                    </button>

                    {/* Schedule Inclusion Toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={subject.includeInSchedule !== false}
                        onChange={() => onToggleIncludeInSchedule(subject.id)}
                        className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span>{subject.includeInSchedule !== false ? 'In Timetable' : 'Excluded from Timetable'}</span>
                    </label>
                  </div>

                  {/* Lectures preview */}
                  {subject.fixedClasses.length > 0 && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center gap-1.5 flex-wrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">Lectures:</span>
                      {subject.fixedClasses.map((cls, idx) => {
                        const h = Math.floor(cls.startMinutes / 60);
                        const m = cls.startMinutes % 60;
                        const timeStr = `${h}:${m < 10 ? '0' + m : m}`;
                        return (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono">
                            {DAYS_SHORT[cls.day]} {timeStr}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Notes snippet */}
                  {subject.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      &quot;{subject.notes}&quot;
                    </p>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onEditSubject(subject)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteSubject(subject.id)}
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
