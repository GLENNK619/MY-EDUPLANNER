import React, { useState } from 'react';
import { Clock, Check, Ban, Sparkles, RotateCcw } from 'lucide-react';
import { AvailabilityGrid, DAYS_SHORT, DAYS_NAMES, SlotStatus } from '../types';
import { START_HOUR, END_HOUR, SLOTS_PER_DAY } from '../utils/optimizer';
import { getDefaultAvailability } from '../utils/presets';

interface AvailabilityPainterProps {
  availability: AvailabilityGrid;
  onChangeAvailability: (newAvailability: AvailabilityGrid) => void;
}

export const AvailabilityPainter: React.FC<AvailabilityPainterProps> = ({
  availability,
  onChangeAvailability,
}) => {
  const [selectedTool, setSelectedTool] = useState<SlotStatus>('available');
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Calculate statistics
  let totalFreeHalfHours = 0;
  let totalPreferredHalfHours = 0;
  let totalBlockedHalfHours = 0;

  for (let day = 0; day < 7; day++) {
    for (let s = 0; s < SLOTS_PER_DAY; s++) {
      const key = `${day}_${s}`;
      const status = availability.slots[key] || 'available';
      if (status === 'available') totalFreeHalfHours++;
      else if (status === 'preferred') totalPreferredHalfHours++;
      else if (status === 'blocked') totalBlockedHalfHours++;
    }
  }

  const freeHours = (totalFreeHalfHours + totalPreferredHalfHours) * 0.5;
  const preferredHours = totalPreferredHalfHours * 0.5;

  const handleCellClickOrDrag = (day: number, slotIndex: number) => {
    const key = `${day}_${slotIndex}`;
    const newSlots = { ...availability.slots, [key]: selectedTool };
    onChangeAvailability({ slots: newSlots });
  };

  const applyPresetSchedule = (type: 'standard' | 'night_owl' | 'early_bird' | 'all_free') => {
    const newSlots: Record<string, SlotStatus> = {};

    for (let day = 0; day < 7; day++) {
      for (let s = 0; s < SLOTS_PER_DAY; s++) {
        const key = `${day}_${s}`;
        const hour = START_HOUR + Math.floor(s / 2);

        if (type === 'all_free') {
          newSlots[key] = 'available';
        } else if (type === 'early_bird') {
          if (hour < 8 || hour >= 21) {
            newSlots[key] = 'blocked';
          } else if (hour >= 8 && hour <= 12) {
            newSlots[key] = 'preferred';
          } else if (hour === 12 || hour === 18) {
            newSlots[key] = 'blocked';
          } else {
            newSlots[key] = 'available';
          }
        } else if (type === 'night_owl') {
          if (hour < 10) {
            newSlots[key] = 'blocked';
          } else if (hour >= 19 && hour <= 23) {
            newSlots[key] = 'preferred';
          } else if (hour === 13 || hour === 18) {
            newSlots[key] = 'blocked';
          } else {
            newSlots[key] = 'available';
          }
        } else {
          // Standard
          if (hour < 8 || hour >= 22.5) {
            newSlots[key] = 'blocked';
          } else if ((hour >= 9 && hour < 12) || (hour >= 19 && hour < 21)) {
            newSlots[key] = 'preferred';
          } else if (hour === 12 || hour === 18) {
            newSlots[key] = 'blocked';
          } else {
            newSlots[key] = 'available';
          }
        }
      }
    }

    onChangeAvailability({ slots: newSlots });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Weekly Student Availability Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Paint your free study hours and peak alertness slots. The scheduler places low-score and difficult courses into your peak hours.
          </p>
        </div>

        {/* Available Hours Summary */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Total Study Capacity</span>
            <span className="font-bold font-mono text-sm text-indigo-600 dark:text-indigo-400">
              {freeHours} hrs / week
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Peak Focus Slots</span>
            <span className="font-bold font-mono text-sm text-amber-600 dark:text-amber-400">
              {preferredHours} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Brush Selector & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        {/* Brush Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setSelectedTool('available')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              selectedTool === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Free / Available</span>
          </button>

          <button
            onClick={() => setSelectedTool('preferred')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              selectedTool === 'preferred'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peak Alertness (Hard Subjects)</span>
          </button>

          <button
            onClick={() => setSelectedTool('blocked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              selectedTool === 'blocked'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Blocked (Sleep / Work)</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">Presets:</span>
          <button
            onClick={() => applyPresetSchedule('standard')}
            className="px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            Standard College
          </button>
          <button
            onClick={() => applyPresetSchedule('early_bird')}
            className="px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            Early Bird
          </button>
          <button
            onClick={() => applyPresetSchedule('night_owl')}
            className="px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            Night Owl
          </button>
          <button
            onClick={() => applyPresetSchedule('all_free')}
            className="px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            All Free
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 overflow-x-auto select-none"
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
            <div className="text-slate-400 font-normal">Time</div>
            {DAYS_NAMES.map((name, idx) => (
              <div key={idx}>
                <span>{name}</span>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="space-y-1 pt-2">
            {Array.from({ length: END_HOUR - START_HOUR }).map((_, hourOffset) => {
              const hour = START_HOUR + hourOffset;
              const displayHour = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
              const slotIdx0 = hourOffset * 2;
              const slotIdx1 = hourOffset * 2 + 1;

              return (
                <div key={hour} className="grid grid-cols-8 gap-1.5 items-center">
                  {/* Time label */}
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 text-right pr-2">
                    {displayHour}
                  </div>

                  {/* 7 Days Columns */}
                  {Array.from({ length: 7 }).map((_, day) => {
                    const key0 = `${day}_${slotIdx0}`;
                    const key1 = `${day}_${slotIdx1}`;
                    const status0 = availability.slots[key0] || 'available';
                    const status1 = availability.slots[key1] || 'available';

                    const getBgClass = (status: SlotStatus) => {
                      if (status === 'preferred') return 'bg-amber-400 dark:bg-amber-500 hover:opacity-90';
                      if (status === 'blocked') return 'bg-slate-200 dark:bg-slate-800 text-slate-400';
                      return 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200';
                    };

                    return (
                      <div key={day} className="flex gap-1 h-7">
                        <button
                          type="button"
                          onMouseEnter={() => isMouseDown && handleCellClickOrDrag(day, slotIdx0)}
                          onClick={() => handleCellClickOrDrag(day, slotIdx0)}
                          title={`${DAYS_SHORT[day]} ${hour}:00 - ${status0}`}
                          className={`flex-1 rounded transition-colors text-[10px] font-mono flex items-center justify-center ${getBgClass(
                            status0
                          )}`}
                        >
                          :00
                        </button>
                        <button
                          type="button"
                          onMouseEnter={() => isMouseDown && handleCellClickOrDrag(day, slotIdx1)}
                          onClick={() => handleCellClickOrDrag(day, slotIdx1)}
                          title={`${DAYS_SHORT[day]} ${hour}:30 - ${status1}`}
                          className={`flex-1 rounded transition-colors text-[10px] font-mono flex items-center justify-center ${getBgClass(
                            status1
                          )}`}
                        >
                          :30
                        </button>
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
  );
};
