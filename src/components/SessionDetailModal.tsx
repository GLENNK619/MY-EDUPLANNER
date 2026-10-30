import React from 'react';
import { X, CheckCircle2, Clock, Calendar, BookOpen, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';
import { ScheduledSession, Subject, DAYS_NAMES } from '../types';
import { minutesToTimeString } from '../utils/optimizer';

interface SessionDetailModalProps {
  session: ScheduledSession | null;
  subject?: Subject;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (sessionId: string) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  subject,
  isOpen,
  onClose,
  onToggleComplete,
}) => {
  if (!isOpen || !session) return null;

  const startStr = minutesToTimeString(session.startMinutes);
  const endStr = minutesToTimeString(session.startMinutes + session.durationMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Accent Bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
        />

        <div className="p-6 space-y-5">
          {/* Top header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                >
                  {subject ? subject.code : 'SCHEDULE'}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {session.type === 'exam_prep'
                    ? 'Dedicated Exam Drill'
                    : session.type === 'class'
                    ? 'Fixed Class Lecture'
                    : session.type === 'exam'
                    ? 'Major Exam'
                    : 'Study Session'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {session.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Time & Day info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Day</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {DAYS_NAMES[session.day]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Time Interval</span>
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {startStr} – {endStr} ({session.durationMinutes} min)
              </span>
            </div>
          </div>

          {/* Why this session was prioritized */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Why was this scheduled?
            </h4>
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                {session.isFlaggedRecovery ? (
                  <Flame className="w-4 h-4 text-rose-600 shrink-0 fill-rose-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
                <span>{session.reason}</span>
              </div>
              {subject && (
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Course Difficulty: {subject.difficulty}/5 · Current Grade: {subject.currentScore}% (Deficit: {100 - subject.currentScore}%)
                </p>
              )}
            </div>
          </div>

          {/* Subject Notes / Topics if any */}
          {subject?.notes && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Course Study Focus / Notes
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 italic">
                &quot;{subject.notes}&quot;
              </p>
            </div>
          )}

          {/* Complete Toggle Action */}
          {session.type !== 'class' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onToggleComplete(session.id);
                  onClose();
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  session.completed
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{session.completed ? 'Mark as Not Completed' : 'Mark as Studied & Completed'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
