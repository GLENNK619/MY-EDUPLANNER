import React from 'react';
import { Sparkles, Moon, Sun, Calendar, BookOpen, AlertCircle, Clock, BarChart3, Download, Target } from 'lucide-react';
import { PRESETS } from '../utils/presets';

interface HeaderProps {
  activeTab: 'timetable' | 'subjects' | 'exams' | 'goals' | 'availability' | 'analytics';
  setActiveTab: (tab: 'timetable' | 'subjects' | 'exams' | 'goals' | 'availability' | 'analytics') => void;
  onOpenSettings: () => void;
  onExportICS: () => void;
  onSelectPreset: (presetId: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  examsCount: number;
  criticalExamsCount: number;
  goalsCount: number;
  completedGoalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onExportICS,
  onSelectPreset,
  isDark,
  toggleDarkMode,
  examsCount,
  criticalExamsCount,
  goalsCount,
  completedGoalsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Wordmark & Creator Subtitle per User Request */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-700 transition-colors">
                EP
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  EduPlan
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  By Vernyuy Glenn
                </span>
              </div>
            </a>
            
            {/* Template Selector */}
            <div className="hidden xl:flex items-center pl-3 border-l border-slate-200 dark:border-slate-800">
              <label htmlFor="preset-select" className="text-xs text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap">
                Template:
              </label>
              <select
                id="preset-select"
                onChange={(e) => onSelectPreset(e.target.value)}
                defaultValue="stem_midterms"
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 2: Navigation tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'timetable'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'subjects'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses & Scores</span>
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors relative ${
                activeTab === 'exams'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Exams</span>
              {criticalExamsCount > 0 ? (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
                  {criticalExamsCount}
                </span>
              ) : examsCount > 0 ? (
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  ({examsCount})
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors relative ${
                activeTab === 'goals'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Goals</span>
              {goalsCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full font-mono">
                  {completedGoalsCount}/{goalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'availability'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Availability</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Priority Math</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle color theme"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onExportICS}
              title="Export to Apple / Google / Outlook Calendar (.ics)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .ICS</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
