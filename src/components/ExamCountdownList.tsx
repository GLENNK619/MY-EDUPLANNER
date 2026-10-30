import React from 'react';
import { Plus, Calendar, AlertTriangle, Clock, Edit2, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Exam, Subject } from '../types';
import { calculateDaysRemaining } from '../utils/optimizer';

interface ExamCountdownListProps {
  exams: Exam[];
  subjects: Subject[];
  onAddExam: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}

export const ExamCountdownList: React.FC<ExamCountdownListProps> = ({
  exams,
  subjects,
  onAddExam,
  onEditExam,
  onDeleteExam,
}) => {
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Sort exams by days remaining
  const sortedExams = [...exams].sort((a, b) => {
    return calculateDaysRemaining(a.date) - calculateDaysRemaining(b.date);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Upcoming Exams & Countdown Scheduler
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            The timetable engine automatically reserves dedicated pre-exam study blocks in the days leading up to each assessment.
          </p>
        </div>

        <button
          onClick={onAddExam}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Date</span>
        </button>
      </div>

      {/* Exam List */}
      {sortedExams.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No upcoming exams scheduled</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Add your midterms, finals, or quizzes. The scheduler will prioritize those subjects and automatically insert countdown study sessions.
          </p>
          <button
            onClick={onAddExam}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Schedule Your First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedExams.map((exam) => {
            const subject = subjectMap.get(exam.subjectId);
            const daysLeft = calculateDaysRemaining(exam.date);

            const isCritical = daysLeft <= 3;
            const isUrgent = daysLeft > 3 && daysLeft <= 7;
            const isApproaching = daysLeft > 7 && daysLeft <= 14;

            return (
              <div
                key={exam.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all hover:shadow-md overflow-hidden ${
                  isCritical
                    ? 'border-rose-400 dark:border-rose-800 shadow-rose-100 dark:shadow-none'
                    : isUrgent
                    ? 'border-amber-400 dark:border-amber-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Accent Header */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                />

                <div className="p-5 space-y-4">
                  {/* Countdown Badge & Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                      {exam.date} at {exam.time || '10:00'}
                    </span>

                    {isCritical ? (
                      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 rounded-full">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>{daysLeft === 0 ? 'Today!' : `${daysLeft}d Crunch`}</span>
                      </span>
                    ) : isUrgent ? (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{daysLeft} days left</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">
                        {daysLeft} days away
                      </span>
                    )}
                  </div>

                  {/* Course & Title */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                      >
                        {subject ? subject.code : 'COURSE'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {subject ? subject.name : ''}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {exam.title}
                    </h3>
                  </div>

                  {/* Weight & Impact */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Grade Weight</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {exam.weightPercent}% of Final
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Difficulty Mult.</span>
                      <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {exam.difficultyMultiplier || 1.2}x Multiplier
                      </span>
                    </div>
                  </div>

                  {/* Topics */}
                  {exam.topicsCovered && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                      <span className="font-semibold block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        Syllabus / Topics:
                      </span>
                      <p className="line-clamp-2 italic">
                        &quot;{exam.topicsCovered}&quot;
                      </p>
                    </div>
                  )}

                  {/* Timetable Auto-Block Notification */}
                  <div className="p-2 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                    <span>
                      {daysLeft <= 4
                        ? '3 dedicated 90m cram sessions scheduled'
                        : daysLeft <= 14
                        ? 'Dedicated review sessions placed in timetable'
                        : 'Standard pacing applied'}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onEditExam(exam)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteExam(exam.id)}
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
