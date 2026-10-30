import React, { useState, useEffect } from 'react';
import { X, Target, HelpCircle } from 'lucide-react';
import { StudyGoal, Subject, GoalMetricType } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: StudyGoal) => void;
  subjects: Subject[];
  initialGoal?: StudyGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  initialGoal,
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [metricType, setMetricType] = useState<GoalMetricType>('problems');
  const [targetValue, setTargetValue] = useState<number>(25);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('problems');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setSubjectId(initialGoal.subjectId);
      setTitle(initialGoal.title);
      setMetricType(initialGoal.metricType);
      setTargetValue(initialGoal.targetValue);
      setCurrentValue(initialGoal.currentValue);
      setUnit(initialGoal.unit);
      setNotes(initialGoal.notes || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      setMetricType('problems');
      setTargetValue(25);
      setCurrentValue(0);
      setUnit('problems');
      setNotes('');
    }
  }, [initialGoal, isOpen, subjects]);

  const handleMetricTypeChange = (type: GoalMetricType) => {
    setMetricType(type);
    if (type === 'problems') {
      setUnit('problems');
      if (!title) setTitle('Solve textbook & practice problem sets');
    } else if (type === 'hours') {
      setUnit('hours');
      if (!title) setTitle('Focused deep-work study hours');
    } else if (type === 'flashcards') {
      setUnit('cards');
      if (!title) setTitle('Review Anki & Quizlet flashcards');
    } else if (type === 'chapters') {
      setUnit('chapters');
      if (!title) setTitle('Read required syllabus chapters');
    } else if (type === 'mock_exams') {
      setUnit('mock exams');
      if (!title) setTitle('Complete timed past exam papers');
    } else {
      setUnit('items');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title.trim() || targetValue <= 0) return;

    const goalToSave: StudyGoal = {
      id: initialGoal?.id || `goal_${Date.now()}`,
      subjectId,
      title: title.trim(),
      metricType,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit: unit.trim() || 'units',
      notes: notes.trim(),
      completed: Number(currentValue) >= Number(targetValue),
    };

    onSave(goalToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialGoal ? 'Edit Weekly Study Target' : 'Define Weekly Study Target'}
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
              Select Course *
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

          {/* Metric Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Metric Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'problems' as GoalMetricType, label: 'Practice Problems' },
                { type: 'hours' as GoalMetricType, label: 'Study Hours' },
                { type: 'flashcards' as GoalMetricType, label: 'Flashcards' },
                { type: 'mock_exams' as GoalMetricType, label: 'Mock Exams' },
                { type: 'chapters' as GoalMetricType, label: 'Chapters' },
                { type: 'custom' as GoalMetricType, label: 'Custom' },
              ].map((m) => (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => handleMetricTypeChange(m.type)}
                  className={`py-2 px-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                    metricType === m.type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Objective / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dynamic Programming practice problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Target Value, Current Value & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weekly Target *
              </label>
              <input
                type="number"
                min="1"
                step={metricType === 'hours' ? '0.5' : '1'}
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Already Done
              </label>
              <input
                type="number"
                min="0"
                step={metricType === 'hours' ? '0.5' : '1'}
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Label
              </label>
              <input
                type="text"
                placeholder="e.g. problems"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Details / Resource Link
            </label>
            <input
              type="text"
              placeholder="e.g. Textbook chapter 6 review exercises or LeetCode tag"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
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
              {initialGoal ? 'Save Target' : 'Create Weekly Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
