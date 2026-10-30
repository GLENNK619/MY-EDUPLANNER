import React from 'react';
import { Sliders, HelpCircle, Flame, AlertCircle, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { OptimizerSettings, SubjectPriorityBreakdown, DIFFICULTY_LABELS } from '../types';
import { DEFAULT_OPTIMIZER_SETTINGS } from '../utils/presets';

interface PriorityAnalyticsProps {
  breakdowns: SubjectPriorityBreakdown[];
  settings: OptimizerSettings;
  onChangeSettings: (newSettings: OptimizerSettings) => void;
  totalAvailableHours: number;
}

export const PriorityAnalytics: React.FC<PriorityAnalyticsProps> = ({
  breakdowns,
  settings,
  onChangeSettings,
  totalAvailableHours,
}) => {
  const handleSliderChange = (key: keyof OptimizerSettings, value: number) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleResetSettings = () => {
    onChangeSettings(DEFAULT_OPTIMIZER_SETTINGS);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Priority Algorithm & Study Time Allocation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent breakdown of how your low scores, difficulty ratings, course loads, and upcoming exams determine study hours.
          </p>
        </div>

        <button
          onClick={handleResetSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Weights</span>
        </button>
      </div>

      {/* Algorithm Tuning Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Deficit Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Low Score Deficit Weight
            </span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {settings.deficitWeight}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.deficitWeight}
            onChange={(e) => handleSliderChange('deficitWeight', Number(e.target.value))}
            className="w-full accent-rose-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Drives study hours toward subjects where your current grade is lowest.
          </p>
        </div>

        {/* Difficulty Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Difficulty Rating Weight
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {settings.difficultyWeight}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.difficultyWeight}
            onChange={(e) => handleSliderChange('difficultyWeight', Number(e.target.value))}
            className="w-full accent-amber-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Weighs student-assigned difficulty scale (1 to 5).
          </p>
        </div>

        {/* Exam Urgency Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Exam Urgency Multiplier
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {settings.examUrgencyWeight}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.examUrgencyWeight}
            onChange={(e) => handleSliderChange('examUrgencyWeight', Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Exponentially boosts subjects with midterms or finals approaching in &le; 14 days.
          </p>
        </div>

        {/* Course Load Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Course Load (Credits)
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {settings.courseLoadWeight}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.courseLoadWeight}
            onChange={(e) => handleSliderChange('courseLoadWeight', Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Gives higher credit courses (4-5 credits) proportionally more baseline hours.
          </p>
        </div>
      </div>

      {/* Flagged Longer Blocks Option */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={settings.allowLongerBlocksForFlagged}
            onChange={(e) => onChangeSettings({ ...settings, allowLongerBlocksForFlagged: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span>Suggest & Allocate Longer Study Blocks (90m) for Flagged Low-Score & Hard Courses</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Default Session Block:</span>
          <select
            value={settings.sessionLengthMinutes}
            onChange={(e) => onChangeSettings({ ...settings, sessionLengthMinutes: Number(e.target.value) as any })}
            className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value={45}>45 min (Short burst)</option>
            <option value={60}>60 min (Standard)</option>
            <option value={90}>90 min (Deep focus)</option>
            <option value={120}>120 min (Extended)</option>
          </select>
        </div>
      </div>

      {/* Priority Allocation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Subject Priority Matrix
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ranked by Composite Priority Index (CPI)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Score & Deficit</th>
                <th className="py-3 px-3">Low-Score Flag</th>
                <th className="py-3 px-3">Nearest Exam</th>
                <th className="py-3 px-3 text-right">Priority Index (CPI)</th>
                <th className="py-3 px-4 text-right">Weekly Allocation</th>
                <th className="py-3 px-4 text-right">Block Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {breakdowns.map((b, idx) => {
                const diff = DIFFICULTY_LABELS[b.difficulty];

                return (
                  <tr key={b.subjectId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: b.color }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {b.subjectCode}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                            {b.subjectName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${diff.color}`}>
                        {diff.label} ({b.difficulty}/5)
                      </span>
                    </td>

                    {/* Score & Deficit */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {b.currentScore}%
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                        Deficit: -{b.scoreDeficit}%
                      </div>
                    </td>

                    {/* Low-Score Flag */}
                    <td className="py-3.5 px-3">
                      {b.isLowScoreFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px]">
                          <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                          Standard
                        </span>
                      )}
                    </td>

                    {/* Nearest Exam */}
                    <td className="py-3.5 px-3">
                      {b.nearestExam ? (
                        <div>
                          <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {b.nearestExam.daysRemaining <= 3 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-bold">
                                In {b.nearestExam.daysRemaining} days (Crunch!)
                              </span>
                            ) : (
                              `In ${b.nearestExam.daysRemaining} days`
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {b.nearestExam.title} ({b.nearestExam.weight}%)
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">No exams</span>
                      )}
                    </td>

                    {/* Priority Index (CPI) */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {b.compositePriorityIndex.toFixed(2)}
                      </span>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        Rank #{idx + 1}
                      </div>
                    </td>

                    {/* Allocated Hours & Percentage */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {b.allocatedHours} hrs / wk
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {b.percentageOfStudyTime}% of study time
                      </div>
                    </td>

                    {/* Block Length */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200">
                        {b.recommendedSessionLength}m
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
