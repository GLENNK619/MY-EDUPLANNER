import React from 'react';
import { X, Sparkles, Sliders, Check, RotateCcw } from 'lucide-react';
import { OptimizerSettings } from '../types';
import { DEFAULT_OPTIMIZER_SETTINGS } from '../utils/presets';

interface StrategySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OptimizerSettings;
  onSave: (settings: OptimizerSettings) => void;
}

export const StrategySettingsModal: React.FC<StrategySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [current, setCurrent] = React.useState<OptimizerSettings>(settings);

  React.useEffect(() => {
    setCurrent(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handlePresetStrategy = (strategy: OptimizerSettings['strategy']) => {
    if (strategy === 'exam_crunch') {
      setCurrent({
        ...current,
        strategy: 'exam_crunch',
        examUrgencyWeight: 95,
        difficultyWeight: 70,
        deficitWeight: 75,
        sessionLengthMinutes: 90,
      });
    } else if (strategy === 'grade_recovery') {
      setCurrent({
        ...current,
        strategy: 'grade_recovery',
        deficitWeight: 95,
        difficultyWeight: 80,
        examUrgencyWeight: 70,
        allowLongerBlocksForFlagged: true,
      });
    } else if (strategy === 'deep_work') {
      setCurrent({
        ...current,
        strategy: 'deep_work',
        sessionLengthMinutes: 90,
        difficultyWeight: 85,
        deficitWeight: 75,
      });
    } else {
      // Balanced
      setCurrent({
        ...current,
        strategy: 'balanced',
        deficitWeight: 80,
        difficultyWeight: 75,
        examUrgencyWeight: 85,
        sessionLengthMinutes: 60,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Optimize Timetable Priorities
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Preset Strategy Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Optimization Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetStrategy('balanced')}
                className={`p-2.5 text-left rounded-lg border text-xs transition-colors ${
                  current.strategy === 'balanced'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">Balanced Mastery</div>
                <div className="text-[10px] text-slate-500">Steady pace across all courses</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetStrategy('grade_recovery')}
                className={`p-2.5 text-left rounded-lg border text-xs transition-colors ${
                  current.strategy === 'grade_recovery'
                    ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-rose-600 dark:text-rose-400">Low-Score Recovery</div>
                <div className="text-[10px] text-slate-500">Heavily boosts subjects with low scores</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetStrategy('exam_crunch')}
                className={`p-2.5 text-left rounded-lg border text-xs transition-colors ${
                  current.strategy === 'exam_crunch'
                    ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-amber-600 dark:text-amber-400">Exam Crunch Sprint</div>
                <div className="text-[10px] text-slate-500">Dedicates maximum hours to upcoming exams</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetStrategy('deep_work')}
                className={`p-2.5 text-left rounded-lg border text-xs transition-colors ${
                  current.strategy === 'deep_work'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">Deep Work (90m Blocks)</div>
                <div className="text-[10px] text-slate-500">Extended blocks for high difficulty</div>
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Low-Score Deficit Weight</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">{current.deficitWeight}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={current.deficitWeight}
                onChange={(e) => setCurrent({ ...current, deficitWeight: Number(e.target.value) })}
                className="w-full accent-rose-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Student Difficulty Weight</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{current.difficultyWeight}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={current.difficultyWeight}
                onChange={(e) => setCurrent({ ...current, difficultyWeight: Number(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Exam Urgency Weight</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{current.examUrgencyWeight}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={current.examUrgencyWeight}
                onChange={(e) => setCurrent({ ...current, examUrgencyWeight: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Daily limits, start time & block size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Earliest Study Start Time
              </label>
              <select
                value={current.earliestStudyStartMinutes || 540}
                onChange={(e) => setCurrent({ ...current, earliestStudyStartMinutes: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              >
                <option value={420}>07:00 AM</option>
                <option value={480}>08:00 AM</option>
                <option value={540}>09:00 AM</option>
                <option value={600}>10:00 AM</option>
                <option value={660}>11:00 AM</option>
                <option value={780}>01:00 PM</option>
                <option value={840}>02:00 PM</option>
                <option value={960}>04:00 PM</option>
                <option value={1080}>06:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Daily Study Hours
              </label>
              <select
                value={current.maxDailyStudyHours}
                onChange={(e) => setCurrent({ ...current, maxDailyStudyHours: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
                <option value={5.5}>5.5 hours</option>
                <option value={7}>7 hours</option>
                <option value={9}>9 hours</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Block Duration
              </label>
              <select
                value={current.sessionLengthMinutes}
                onChange={(e) => setCurrent({ ...current, sessionLengthMinutes: Number(e.target.value) as any })}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
          </div>

          {/* Longer blocks for flagged */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={current.allowLongerBlocksForFlagged}
                onChange={(e) => setCurrent({ ...current, allowLongerBlocksForFlagged: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
              <span>Allow 90-120m deep study blocks for flagged low score / hard subjects</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrent(DEFAULT_OPTIMIZER_SETTINGS)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
              >
                Apply & Re-Generate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
