import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertTriangle, BookOpen, Clock, MapPin } from 'lucide-react';
import { DifficultyLevel, DIFFICULTY_LABELS, FixedClassSlot, Subject, DAYS_NAMES } from '../types';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  initialSubject?: Subject | null;
}

const PRESET_COLORS = [
  '#dc2626', // Red
  '#ea580c', // Orange
  '#d97706', // Amber
  '#059669', // Emerald
  '#0284c7', // Sky
  '#2563eb', // Blue
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#c026d3', // Fuchsia
  '#475569', // Slate
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [currentScore, setCurrentScore] = useState<number>(75);
  const [targetScore, setTargetScore] = useState<number>(85);
  const [isLowScoreFlagged, setIsLowScoreFlagged] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#4f46e5');
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState<'any' | 'morning' | 'afternoon' | 'evening'>('any');
  const [suggestedSessionLengthMinutes, setSuggestedSessionLengthMinutes] = useState<60 | 90 | 120>(60);
  const [includeInSchedule, setIncludeInSchedule] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [fixedClasses, setFixedClasses] = useState<FixedClassSlot[]>([]);

  useEffect(() => {
    if (initialSubject) {
      setCode(initialSubject.code);
      setName(initialSubject.name);
      setCredits(initialSubject.credits);
      setDifficulty(initialSubject.difficulty);
      setCurrentScore(initialSubject.currentScore);
      setTargetScore(initialSubject.targetScore);
      setIsLowScoreFlagged(initialSubject.isLowScoreFlagged);
      setColor(initialSubject.color);
      setPreferredTimeOfDay(initialSubject.preferredTimeOfDay || 'any');
      setSuggestedSessionLengthMinutes(initialSubject.suggestedSessionLengthMinutes || 60);
      setIncludeInSchedule(initialSubject.includeInSchedule !== false);
      setNotes(initialSubject.notes || '');
      setFixedClasses(initialSubject.fixedClasses || []);
    } else {
      setCode('');
      setName('');
      setCredits(3);
      setDifficulty(3);
      setCurrentScore(75);
      setTargetScore(85);
      setIsLowScoreFlagged(false);
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setPreferredTimeOfDay('any');
      setSuggestedSessionLengthMinutes(60);
      setIncludeInSchedule(true);
      setNotes('');
      setFixedClasses([]);
    }
  }, [initialSubject, isOpen]);

  // Automatically suggest flagging if score drops below 70%
  const handleScoreChange = (score: number) => {
    setCurrentScore(score);
    if (score < 70 && !isLowScoreFlagged) {
      setIsLowScoreFlagged(true);
    }
  };

  const addFixedClass = () => {
    const newClass: FixedClassSlot = {
      id: `class_${Date.now()}`,
      day: 0,
      startMinutes: 600, // 10:00 AM
      durationMinutes: 60,
      location: 'Lecture Hall 101',
    };
    setFixedClasses([...fixedClasses, newClass]);
  };

  const removeFixedClass = (id: string) => {
    setFixedClasses(fixedClasses.filter((c) => c.id !== id));
  };

  const updateFixedClass = (id: string, updates: Partial<FixedClassSlot>) => {
    setFixedClasses(fixedClasses.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const subjectToSave: Subject = {
      id: initialSubject?.id || `subj_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      credits: Number(credits),
      difficulty,
      currentScore: Number(currentScore),
      targetScore: Number(targetScore),
      isLowScoreFlagged,
      color,
      preferredTimeOfDay,
      suggestedSessionLengthMinutes,
      includeInSchedule,
      notes: notes.trim(),
      fixedClasses,
    };

    onSave(subjectToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialSubject ? `Edit ${initialSubject.code}` : 'Add Course'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Code, Name, Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS 161"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures & Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums font-mono"
              />
            </div>
          </div>

          {/* Difficulty Rating Feature */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Student Difficulty Rating (Scale 1–5)
              </label>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${DIFFICULTY_LABELS[difficulty].color}`}>
                {DIFFICULTY_LABELS[difficulty].label} ({difficulty}/5)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {DIFFICULTY_LABELS[difficulty].description}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((level) => {
                const info = DIFFICULTY_LABELS[level];
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="text-sm font-bold font-mono">{level}</div>
                    <div className="truncate text-[11px]">{info.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Low Score & Grades Feature */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Academic Performance & Deficit
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lower scores trigger higher study priority in the scheduling engine.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Score Deficit: </span>
                <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                  {100 - currentScore}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Current Score</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{currentScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentScore}
                  onChange={(e) => handleScoreChange(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Target Goal</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{targetScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Low Score Flag Toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLowScoreFlagged}
                  onChange={(e) => setIsLowScoreFlagged(e.target.checked)}
                  className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Flag as Low-Score / Priority Grade Recovery Subject
                    </span>
                    {isLowScoreFlagged && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded">
                        Active Recovery Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Allocates longer study blocks (90m), increases weekly frequency, and schedules during prime alertness hours without lecture conflicts.
                  </p>
                </div>
              </label>
            </div>

            {/* Timetable Inclusion Choice */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInSchedule}
                  onChange={(e) => setIncludeInSchedule(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Include Course in Weekly Study Timetable
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose whether this subject should have study blocks generated. (Uncheck if you only want to focus on other courses this week).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Session Duration & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Suggested Session Block Length
              </label>
              <select
                value={suggestedSessionLengthMinutes}
                onChange={(e) => setSuggestedSessionLengthMinutes(Number(e.target.value) as 60 | 90 | 120)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={60}>60 minutes (Standard focus)</option>
                <option value={90}>90 minutes (Deep work recommended for Hard courses)</option>
                <option value={120}>120 minutes (Intensive problem set / lab block)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Study Alertness
              </label>
              <select
                value={preferredTimeOfDay}
                onChange={(e) => setPreferredTimeOfDay(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="any">Any Available Free Time</option>
                <option value="morning">Morning (08:00 – 12:00) Peak Alertness</option>
                <option value="afternoon">Afternoon (13:00 – 17:00)</option>
                <option value="evening">Evening (18:00 – 22:00) Quiet Focus</option>
              </select>
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-slate-900 dark:border-white shadow' : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Fixed Lectures & Class Times */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Fixed Recurring Lectures & Labs
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  These time slots are locked onto your timetable as classes and never overwritten.
                </p>
              </div>
              <button
                type="button"
                onClick={addFixedClass}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lecture Time</span>
              </button>
            </div>

            {fixedClasses.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                No lecture times added. Click &quot;Add Lecture Time&quot; to set fixed class hours.
              </div>
            ) : (
              <div className="space-y-2">
                {fixedClasses.map((item) => {
                  const hour = Math.floor(item.startMinutes / 60);
                  const min = item.startMinutes % 60;
                  const timeVal = `${hour < 10 ? '0' + hour : hour}:${min < 10 ? '0' + min : min}`;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <select
                        value={item.day}
                        onChange={(e) => updateFixedClass(item.id, { day: Number(e.target.value) as any })}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {DAYS_NAMES.map((dayName, idx) => (
                          <option key={idx} value={idx}>
                            {dayName}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="time"
                          value={timeVal}
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(':').map(Number);
                            updateFixedClass(item.id, { startMinutes: (h * 60) + m });
                          }}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 font-mono"
                        />
                      </div>

                      <select
                        value={item.durationMinutes}
                        onChange={(e) => updateFixedClass(item.id, { durationMinutes: Number(e.target.value) })}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200"
                      >
                        <option value={50}>50 min</option>
                        <option value={60}>60 min (1 hr)</option>
                        <option value={80}>80 min</option>
                        <option value={90}>90 min (1.5 hr)</option>
                        <option value={120}>120 min (2 hr)</option>
                      </select>

                      <div className="flex-1 min-w-[120px] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Location / Room"
                          value={item.location || ''}
                          onChange={(e) => updateFixedClass(item.id, { location: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFixedClass(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Struggling Topics & Focus Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Graph BFS/DFS, Dynamic programming memoization, Eigenvalue diagonalization"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
            >
              {initialSubject ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
