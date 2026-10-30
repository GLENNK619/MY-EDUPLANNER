import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Flame,
  Target,
  Plus,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Coffee,
  Check,
} from 'lucide-react';
import { ScheduledSession, Subject, StudyGoal, DIFFICULTY_LABELS } from '../types';
import { minutesToTimeString } from '../utils/optimizer';

interface FocusModeProps {
  sessions: ScheduledSession[];
  subjects: Subject[];
  goals: StudyGoal[];
  initialSessionId?: string | null;
  onExit: () => void;
  onToggleComplete: (sessionId: string) => void;
  onUpdateGoalProgress: (goalId: string, newValue: number) => void;
  onAddGoalForSubject: (subjectId: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  sessions,
  subjects,
  goals,
  initialSessionId,
  onExit,
  onToggleComplete,
  onUpdateGoalProgress,
  onAddGoalForSubject,
}) => {
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Find valid study sessions (study or exam_prep)
  const studySessions = sessions.filter((s) => s.type === 'study' || s.type === 'exam_prep');

  // Determine active session
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    if (initialSessionId) return initialSessionId;
    // Default to first incomplete study session, or first study session
    const firstIncomplete = studySessions.find((s) => !s.completed);
    return firstIncomplete ? firstIncomplete.id : studySessions[0]?.id || '';
  });

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || studySessions[0];
  const activeSubject = activeSession ? subjectMap.get(activeSession.subjectId) : undefined;

  // Next session preview
  const activeIndex = studySessions.findIndex((s) => s.id === selectedSessionId);
  const nextSession = activeIndex >= 0 && activeIndex + 1 < studySessions.length ? studySessions[activeIndex + 1] : null;
  const nextSubject = nextSession ? subjectMap.get(nextSession.subjectId) : undefined;

  // Goals specific to this subject
  const subjectGoals = activeSession ? goals.filter((g) => g.subjectId === activeSession.subjectId) : [];

  // Timer mode: 'session' (use scheduled duration, e.g. 60m/90m) or 'pomodoro' (25m / 50m)
  const [timerMode, setTimerMode] = useState<'session' | 'pomodoro_25' | 'pomodoro_50'>('session');

  // Timer duration in seconds
  const getInitialSeconds = () => {
    if (timerMode === 'pomodoro_25') return 25 * 60;
    if (timerMode === 'pomodoro_50') return 50 * 60;
    return (activeSession?.durationMinutes || 60) * 60;
  };

  const [totalSeconds, setTotalSeconds] = useState<number>(getInitialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(getInitialSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isCompletedCelebration, setIsCompletedCelebration] = useState<boolean>(false);

  // Sync timer when activeSession or timerMode changes
  useEffect(() => {
    const secs = getInitialSeconds();
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsActive(false);
    setIsCompletedCelebration(false);
  }, [selectedSessionId, timerMode]);

  // Audio Beep generator using Web Audio API (no external asset needed)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // AudioContext unavailable
    }
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, soundEnabled]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(totalSeconds);
  };

  const adjustTimer = (secondsDelta: number) => {
    setSecondsRemaining((prev) => Math.max(60, prev + secondsDelta));
    setTotalSeconds((prev) => Math.max(60, prev + secondsDelta));
  };

  const handleCompleteSession = () => {
    if (activeSession) {
      onToggleComplete(activeSession.id);
      setIsCompletedCelebration(true);
      playChime();
    }
  };

  // Time calculations
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const elapsedPercent = totalSeconds > 0 ? Math.min(100, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100)) : 0;

  if (!activeSession) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <Clock className="w-12 h-12 text-indigo-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Study Sessions Scheduled</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate a timetable or enable courses to schedule your study sessions first.
        </p>
        <button
          onClick={onExit}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Return to Timetable
        </button>
      </div>
    );
  }

  const diffInfo = activeSubject ? DIFFICULTY_LABELS[activeSubject.difficulty] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Focus Mode</span>
        </button>

        {/* Session Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            Active Study Session:
          </span>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 max-w-[240px] truncate"
          >
            {studySessions.map((s) => {
              const subj = subjectMap.get(s.subjectId);
              return (
                <option key={s.id} value={s.id}>
                  {subj ? subj.code : 'COURSE'} · {s.durationMinutes}m {s.completed ? '✓' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Focus Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Accent Color Strip */}
        <div
          className="h-2 w-full transition-colors"
          style={{ backgroundColor: activeSubject ? activeSubject.color : '#6366f1' }}
        />

        <div className="p-6 sm:p-10 space-y-8">
          {/* Spotlight Header: Course info & why it was prioritized */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded text-white shadow-xs"
                style={{ backgroundColor: activeSubject ? activeSubject.color : '#6366f1' }}
              >
                {activeSubject?.code}
              </span>
              {diffInfo && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${diffInfo.color}`}>
                  {diffInfo.label} ({activeSubject?.difficulty}/5)
                </span>
              )}
              {activeSession.isFlaggedRecovery && (
                <span className="text-xs font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                  <span>Low Score Recovery</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeSubject?.name || activeSession.title}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Priority Focus: <strong className="text-slate-700 dark:text-slate-300">{activeSession.reason}</strong>
            </p>
          </div>

          {/* Countdown Timer Display */}
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Timer mode segmented tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => setTimerMode('session')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timerMode === 'session'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Full Block ({activeSession.durationMinutes}m)
              </button>
              <button
                onClick={() => setTimerMode('pomodoro_25')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timerMode === 'pomodoro_25'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                25m Pomodoro
              </button>
              <button
                onClick={() => setTimerMode('pomodoro_50')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timerMode === 'pomodoro_50'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                50m Deep Work
              </button>
            </div>

            {/* Giant Tabular Countdown */}
            <div className="relative py-4 select-none">
              <div className="text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums drop-shadow-xs">
                {formattedTime}
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full max-w-md space-y-1.5">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                  style={{ width: `${elapsedPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{elapsedPercent}% elapsed</span>
                <span>{Math.round(secondsRemaining / 60)} min remaining</span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustTimer(-300)}
                title="Subtract 5 minutes"
                className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              >
                -5m
              </button>

              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-xl font-bold text-base flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                  isActive
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 dark:shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>{secondsRemaining === totalSeconds ? 'Start Focus' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                title="Reset Timer"
                className="p-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => adjustTimer(300)}
                title="Add 5 minutes"
                className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              >
                +5m
              </button>
            </div>
          </div>

          {/* Subject-Specific Targets / Goals Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Key Weekly Targets for {activeSubject?.code}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Log practice problems or cards solved during this study session in real time.
                </p>
              </div>

              {activeSubject && (
                <button
                  onClick={() => onAddGoalForSubject(activeSubject.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Target</span>
                </button>
              )}
            </div>

            {subjectGoals.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No targets defined yet for {activeSubject?.code}. Set a problem count or hours target to track mastery.
                </p>
                {activeSubject && (
                  <button
                    onClick={() => onAddGoalForSubject(activeSubject.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100"
                  >
                    Set a Goal for {activeSubject.code}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjectGoals.map((goal) => {
                  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  const isDone = goal.currentValue >= goal.targetValue;

                  return (
                    <div
                      key={goal.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {goal.title}
                        </span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Quick Logger Buttons */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-slate-400">Quick Log:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                            className="px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateGoalProgress(goal.id, goal.currentValue + 1)}
                            className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded hover:bg-indigo-100"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateGoalProgress(goal.id, goal.currentValue + 5)}
                            className="px-2.5 py-0.5 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 shadow-xs"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session Scratchpad / Breakthroughs */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Session Focus Notes & Solved Problems
            </label>
            <textarea
              rows={2}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="e.g. Completed DP problem 4 & 5. Remember base case memoization table initialization."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Session Complete & Next Up Row */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Next session preview */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Coffee className="w-4 h-4 text-slate-400" />
              <span>
                {nextSession && nextSubject ? (
                  <>
                    Next up:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {nextSubject.code} ({nextSession.durationMinutes}m)
                    </strong>
                  </>
                ) : (
                  'Last session of the current schedule cycle'
                )}
              </span>
            </div>

            {/* Mark Complete CTA */}
            <button
              onClick={handleCompleteSession}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                activeSession.completed || isCompletedCelebration
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {activeSession.completed || isCompletedCelebration
                  ? 'Session Completed! 🎉'
                  : 'Mark Session as Completed'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
