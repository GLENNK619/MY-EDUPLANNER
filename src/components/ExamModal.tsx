import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Exam, Subject } from '../types';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Exam) => void;
  subjects: Subject[];
  initialExam?: Exam | null;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  initialExam,
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [weightPercent, setWeightPercent] = useState<number>(30);
  const [difficultyMultiplier, setDifficultyMultiplier] = useState<number>(1.2);
  const [topicsCovered, setTopicsCovered] = useState('');

  useEffect(() => {
    if (initialExam) {
      setSubjectId(initialExam.subjectId);
      setTitle(initialExam.title);
      setDate(initialExam.date);
      setTime(initialExam.time || '10:00');
      setWeightPercent(initialExam.weightPercent);
      setDifficultyMultiplier(initialExam.difficultyMultiplier || 1.2);
      setTopicsCovered(initialExam.topicsCovered || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      // Default to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDate(defaultDate.toISOString().split('T')[0]);
      setTime('10:00');
      setWeightPercent(30);
      setDifficultyMultiplier(1.2);
      setTopicsCovered('');
    }
  }, [initialExam, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title.trim() || !date) return;

    const examToSave: Exam = {
      id: initialExam?.id || `exam_${Date.now()}`,
      subjectId,
      title: title.trim(),
      date,
      time,
      weightPercent: Number(weightPercent),
      difficultyMultiplier: Number(difficultyMultiplier),
      topicsCovered: topicsCovered.trim(),
    };

    onSave(examToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialExam ? 'Edit Exam' : 'Schedule New Exam / Midterm'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Course */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course *
            </label>
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} (Diff: {s.difficulty}/5)
                </option>
              ))}
            </select>
          </div>

          {/* Exam Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exam Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm 2, Final Comprehensive Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Weight & Multiplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Grade Weight</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{weightPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={weightPercent}
                onChange={(e) => setWeightPercent(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Multiplier
              </label>
              <select
                value={difficultyMultiplier}
                onChange={(e) => setDifficultyMultiplier(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1.0}>1.0x (Standard difficulty)</option>
                <option value={1.2}>1.2x (Challenging)</option>
                <option value={1.4}>1.4x (High rigor / heavy proofs)</option>
                <option value={1.6}>1.6x (Extreme final exam)</option>
              </select>
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Topics Covered / Study Scope
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Chapters 4-7, Proofs, Maxwell Equations, BST rotations"
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Explanation Alert */}
          <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-xs text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
            <p>
              The scheduler will automatically block dedicated study slots in the days leading up to this exam date and boost this subject&apos;s priority weight.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              {initialExam ? 'Save Exam' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
