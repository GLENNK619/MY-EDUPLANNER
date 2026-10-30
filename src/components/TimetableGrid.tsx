import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Flame,
  Printer,
  RefreshCw,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import {
  DAYS_NAMES,
  DAYS_SHORT,
  DayOfWeek,
  ScheduledSession,
  Subject,
  DIFFICULTY_LABELS,
} from '../types';
import {
  START_HOUR,
  END_HOUR,
  minutesToTimeString,
} from '../utils/optimizer';

interface TimetableGridProps {
  sessions: ScheduledSession[];
  subjects: Subject[];
  totalStudyHours: number;
  totalClassHours: number;
  earliestStudyStartMinutes: number;
  onChangeEarliestStartTime: (minutes: number) => void;
  onToggleIncludeSubject: (subjectId: string) => void;
  onToggleComplete: (sessionId: string) => void;
  onSelectSession: (session: ScheduledSession) => void;
  onRegenerate: () => void;
  onExportICS: () => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  sessions,
  subjects,
  totalStudyHours,
  totalClassHours,
  earliestStudyStartMinutes,
  onChangeEarliestStartTime,
  onToggleIncludeSubject,
  onToggleComplete,
  onSelectSession,
  onRegenerate,
  onExportICS,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'agenda'>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(0); // Monday
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Completed study hours calculation
  const completedMinutes = sessions
    .filter((s) => s.completed && (s.type === 'study' || s.type === 'exam_prep'))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const completedHours = Math.round((completedMinutes / 60) * 10) / 10;
  const progressPercent = totalStudyHours > 0 ? Math.min(100, Math.round((completedHours / totalStudyHours) * 100)) : 0;

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (filterSubjectId !== 'all' && s.subjectId !== filterSubjectId) return false;
    if (filterType !== 'all') {
      if (filterType === 'study' && s.type !== 'study' && s.type !== 'exam_prep') return false;
      if (filterType === 'class' && s.type !== 'class') return false;
      if (filterType === 'exam' && s.type !== 'exam') return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Metrics Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Optimized Weekly Timetable
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded">
              Balanced for Difficulties & Low Scores
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Color-coded schedule balancing lecture commitments, low score recovery, and upcoming exams.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Week Grid
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Agenda List
            </button>
          </div>

          <button
            onClick={onRegenerate}
            title="Re-run scheduler"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Optimize</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print schedule"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Weekly Study Progress</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <strong className="font-mono text-slate-900 dark:text-white">{completedHours}</strong> of{' '}
            <strong className="font-mono text-slate-900 dark:text-white">{totalStudyHours} hrs</strong> completed
          </div>
        </div>

        {/* Study Allocation */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block mb-1">
            Planned Study Time
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {totalStudyHours} <span className="text-xs font-normal text-slate-500">hours / week</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across {sessions.filter((s) => s.type === 'study' || s.type === 'exam_prep').length} study blocks
          </span>
        </div>

        {/* Fixed Lecture Time */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block mb-1">
            Protected Class Hours
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {totalClassHours} <span className="text-xs font-normal text-slate-500">hours / week</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Fixed lecture & lab periods
          </span>
        </div>

        {/* Flagged Subjects Recovery */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block mb-1">
            Priority Recovery Focus
          </span>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {subjects.filter((s) => s.isLowScoreFlagged).length}{' '}
            <span className="text-xs font-normal text-slate-500">flagged courses</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Awarded longer blocks & prime slots
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Course:</span>
          </div>
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

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Session Types</option>
            <option value="study">Study Sessions Only</option>
            <option value="class">Fixed Classes Only</option>
            <option value="exam">Exams & Preps Only</option>
          </select>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Student chosen study start time */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-500 font-medium">Start Studies At:</span>
            <select
              value={earliestStudyStartMinutes}
              onChange={(e) => onChangeEarliestStartTime(Number(e.target.value))}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold font-mono"
            >
              <option value={420}>07:00 AM</option>
              <option value={480}>08:00 AM</option>
              <option value={540}>09:00 AM (Recommended)</option>
              <option value={600}>10:00 AM</option>
              <option value={660}>11:00 AM</option>
              <option value={780}>01:00 PM (Afternoon)</option>
              <option value={840}>02:00 PM</option>
              <option value={960}>04:00 PM (After Classes)</option>
              <option value={1080}>06:00 PM (Evening)</option>
            </select>
          </div>
        </div>

        {viewMode === 'day' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDay(((selectedDay - 1 + 7) % 7) as DayOfWeek)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900 dark:text-white px-2">
              {DAYS_NAMES[selectedDay]}
            </span>
            <button
              onClick={() => setSelectedDay(((selectedDay + 1) % 7) as DayOfWeek)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Student Choice: Active Subjects Pill Strip */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Choose Courses to Put in Schedule:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {subjects.map((s) => {
              const isIncluded = s.includeInSchedule !== false;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onToggleIncludeSubject(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                    isIncluded
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-dashed border-slate-300 dark:border-slate-700 line-through'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.code}</span>
                  <span className="text-[10px] opacity-80">({s.difficulty}/5)</span>
                </button>
              );
            })}
          </div>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {subjects.filter((s) => s.includeInSchedule !== false).length} of {subjects.length} courses active
        </span>
      </div>

      {/* VIEW 1: WEEKLY CALENDAR GRID */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 overflow-x-auto shadow-xs print-page">
          <div className="min-w-[960px]">
            {/* Header: Monday to Sunday */}
            <div className="grid grid-cols-8 gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
              <div className="text-slate-400 font-normal">Time</div>
              {DAYS_NAMES.map((dayName, dayIndex) => {
                const daySessions = filteredSessions.filter((s) => s.day === dayIndex);
                const dayStudyHrs =
                  daySessions
                    .filter((s) => s.type === 'study' || s.type === 'exam_prep')
                    .reduce((sum, s) => sum + s.durationMinutes, 0) / 60;

                return (
                  <div key={dayIndex} className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {dayName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {dayStudyHrs > 0 ? `${dayStudyHrs} hrs study` : 'Rest / Class'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid View */}
            <div className="relative pt-2">
              {/* Vertical Columns Background */}
              <div className="grid grid-cols-8 gap-2 min-h-[720px]">
                {/* Time Axis Column */}
                <div className="space-y-[48px] pt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500 text-right pr-2 select-none">
                  {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
                    const hour = START_HOUR + i;
                    const displayHour =
                      hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
                    return (
                      <div key={hour} className="h-6">
                        {displayHour}
                      </div>
                    );
                  })}
                </div>

                {/* 7 Days Columns */}
                {Array.from({ length: 7 }).map((_, day) => {
                  const daySessions = filteredSessions.filter((s) => s.day === day);

                  return (
                    <div
                      key={day}
                      className="relative border-l border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40 rounded-lg p-1 min-h-[720px]"
                    >
                      {/* Hour divider guidelines */}
                      {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full border-b border-slate-100 dark:border-slate-800/50"
                          style={{ top: `${i * 48}px` }}
                        />
                      ))}

                      {/* Render Sessions for this day */}
                      {daySessions.map((session) => {
                        const subject = subjectMap.get(session.subjectId);
                        const topMinutes = session.startMinutes - START_HOUR * 60;
                        const topPx = (topMinutes / 60) * 48;
                        const heightPx = Math.max(38, (session.durationMinutes / 60) * 48 - 4);

                        const isExam = session.type === 'exam';
                        const isExamPrep = session.type === 'exam_prep';
                        const isClass = session.type === 'class';

                        return (
                          <div
                            key={session.id}
                            onClick={() => onSelectSession(session)}
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`,
                              backgroundColor: subject
                                ? isClass
                                  ? `${subject.color}15`
                                  : isExam
                                  ? '#dc262625'
                                  : isExamPrep
                                  ? `${subject.color}25`
                                  : `${subject.color}20`
                                : '#e2e8f0',
                              borderLeft: `4px solid ${subject ? subject.color : '#6366f1'}`,
                            }}
                            className={`absolute left-1 right-1 rounded-md p-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.02] hover:shadow-md z-10 flex flex-col justify-between overflow-hidden ${
                              session.completed
                                ? 'opacity-60 saturate-50'
                                : ''
                            } ${
                              isExam
                                ? 'ring-1 ring-rose-500'
                                : isExamPrep
                                ? 'ring-1 ring-amber-500/70'
                                : ''
                            }`}
                          >
                            <div>
                              {/* Header: Code & Type & Complete Checkbox */}
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span
                                    className="text-[10px] font-bold px-1 rounded text-white shrink-0"
                                    style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                                  >
                                    {subject ? subject.code : 'CODE'}
                                  </span>

                                  {isExam ? (
                                    <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                                      EXAM
                                    </span>
                                  ) : isExamPrep ? (
                                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                                      <Flame className="w-2.5 h-2.5" /> Prep
                                    </span>
                                  ) : session.isFlaggedRecovery ? (
                                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                                      Recovery
                                    </span>
                                  ) : null}
                                </div>

                                {/* Checkbox for study sessions */}
                                {!isClass && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleComplete(session.id);
                                    }}
                                    title={session.completed ? 'Mark not complete' : 'Mark complete'}
                                    className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                  >
                                    <CheckCircle2
                                      className={`w-3.5 h-3.5 ${
                                        session.completed ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Title */}
                              <div
                                className={`text-[11px] font-semibold text-slate-900 dark:text-white truncate leading-tight mt-0.5 ${
                                  session.completed ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {isClass ? `${subject?.code} Lecture` : session.title}
                              </div>
                            </div>

                            {/* Footer: Time & Duration */}
                            <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between pt-0.5">
                              <span>{minutesToTimeString(session.startMinutes)}</span>
                              <span>{session.durationMinutes}m</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {DAYS_NAMES[selectedDay]} Schedule
              </h3>
              <p className="text-xs text-slate-500">
                {filteredSessions.filter((s) => s.day === selectedDay).length} activities planned
              </p>
            </div>
            <div className="flex items-center gap-1">
              {DAYS_SHORT.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx as DayOfWeek)}
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    selectedDay === idx
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-4 space-y-3">
            {filteredSessions.filter((s) => s.day === selectedDay).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No classes or study sessions scheduled on this day.
              </div>
            ) : (
              filteredSessions
                .filter((s) => s.day === selectedDay)
                .map((session) => {
                  const subject = subjectMap.get(session.subjectId);
                  const isClass = session.type === 'class';
                  const isExam = session.type === 'exam';

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                        >
                          {subject?.code.split(' ')[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {session.title}
                            </span>
                            {session.isFlaggedRecovery && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded">
                                Recovery
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {minutesToTimeString(session.startMinutes)} –{' '}
                            {minutesToTimeString(session.startMinutes + session.durationMinutes)} (
                            {session.durationMinutes} min)
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{session.reason}</div>
                        </div>
                      </div>

                      {!isClass && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(session.id);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              session.completed ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Full Weekly Study & Exam Agenda
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {filteredSessions.length} total sessions
            </span>
          </div>

          <div className="space-y-6">
            {DAYS_NAMES.map((dayName, dayIndex) => {
              const daySessions = filteredSessions.filter((s) => s.day === dayIndex);
              if (daySessions.length === 0) return null;

              return (
                <div key={dayIndex} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {dayName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({daySessions.length} events)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {daySessions.map((session) => {
                      const subject = subjectMap.get(session.subjectId);
                      const isClass = session.type === 'class';
                      const isExam = session.type === 'exam';

                      return (
                        <div
                          key={session.id}
                          onClick={() => onSelectSession(session)}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-400 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-10 rounded-full shrink-0"
                              style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  {session.title}
                                </span>
                                {isExam ? (
                                  <span className="text-[10px] font-bold px-1.5 bg-rose-100 text-rose-700 rounded">
                                    EXAM
                                  </span>
                                ) : session.isFlaggedRecovery ? (
                                  <span className="text-[10px] font-bold px-1.5 bg-rose-100 text-rose-700 rounded">
                                    Recovery
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {minutesToTimeString(session.startMinutes)} –{' '}
                                {minutesToTimeString(session.startMinutes + session.durationMinutes)} (
                                {session.durationMinutes} min)
                              </div>
                              <div className="text-[10px] text-slate-400">{session.reason}</div>
                            </div>
                          </div>

                          {!isClass && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleComplete(session.id);
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                            >
                              <CheckCircle2
                                className={`w-5 h-5 ${
                                  session.completed ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
