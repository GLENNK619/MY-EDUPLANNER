import {
  AvailabilityGrid,
  DayOfWeek,
  Exam,
  OptimizerSettings,
  ScheduledSession,
  Subject,
  SubjectPriorityBreakdown,
} from '../types';

export const START_HOUR = 7; // 07:00 AM
export const END_HOUR = 23; // 11:00 PM
export const SLOTS_PER_HOUR = 2; // 30-minute intervals
export const TOTAL_HOURS = END_HOUR - START_HOUR; // 16 hours
export const SLOTS_PER_DAY = TOTAL_HOURS * SLOTS_PER_HOUR; // 32 slots

export function slotIndexToMinutes(slotIndex: number): number {
  return (START_HOUR * 60) + (slotIndex * 30);
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${ampm}`;
}

export function calculateDaysRemaining(examDateStr: string, referenceDate: Date = new Date()): number {
  const [year, month, day] = examDateStr.split('-').map(Number);
  const examDate = new Date(year, month - 1, day, 23, 59, 59);
  const diffTime = examDate.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculates priority index and study hour allocation for all subjects
 */
export function calculateSubjectPriorities(
  subjects: Subject[],
  exams: Exam[],
  settings: OptimizerSettings,
  totalAvailableHours: number
): SubjectPriorityBreakdown[] {
  if (subjects.length === 0) return [];

  const breakdowns: SubjectPriorityBreakdown[] = [];

  const wDeficit = settings.deficitWeight / 100;
  const wDiff = settings.difficultyWeight / 100;
  const wLoad = settings.courseLoadWeight / 100;
  const wExam = settings.examUrgencyWeight / 100;

  for (const subject of subjects) {
    // 1. Score Deficit Factor: High weight when score is low!
    const scoreDeficit = Math.max(0, 100 - subject.currentScore) / 100;
    const gapToTarget = Math.max(0, subject.targetScore - subject.currentScore) / 100;
    let scoreFactor = (scoreDeficit * 0.7) + (gapToTarget * 0.3);

    // If explicitly marked as low-score flagged, grant an extra +35% priority surge
    if (subject.isLowScoreFlagged) {
      scoreFactor *= 1.35;
    }

    // 2. Difficulty Factor: 1 (0.2) to 5 (1.0)
    const difficultyFactor = Math.max(1, Math.min(5, subject.difficulty)) / 5;

    // 3. Course Load Factor: Credits normalized
    const loadFactor = Math.min(subject.credits, 6) / 4;

    // 4. Upcoming Exam Urgency
    const subjectExams = exams.filter((e) => e.subjectId === subject.id);
    let nearestExam: SubjectPriorityBreakdown['nearestExam'] | undefined = undefined;
    let urgencyMultiplier = 1.0;

    if (subjectExams.length > 0) {
      const sortedExams = [...subjectExams].sort((a, b) => {
        return calculateDaysRemaining(a.date) - calculateDaysRemaining(b.date);
      });
      const closest = sortedExams[0];
      const days = calculateDaysRemaining(closest.date);

      nearestExam = {
        title: closest.title,
        date: closest.date,
        daysRemaining: days,
        weight: closest.weightPercent,
      };

      if (days <= 21) {
        const proximityScore = Math.max(0, (21 - days) / 21); // 0 to 1
        const weightScore = Math.min(closest.weightPercent, 50) / 30; // ~0.5 to 1.6
        const examDiff = closest.difficultyMultiplier || 1.2;

        let proximityBoost = proximityScore * weightScore * examDiff * (wExam * 2.2);
        if (days <= 3) {
          proximityBoost += 0.85; // Final 72-hour crunch bonus
        } else if (days <= 7) {
          proximityBoost += 0.45;
        }
        urgencyMultiplier = 1.0 + proximityBoost;
      }
    }

    // Combine base factors
    const baseScore = (scoreFactor * wDeficit * 1.6) + (difficultyFactor * wDiff * 1.4) + (loadFactor * wLoad * 0.7);

    // Final Composite Priority Index
    const cpi = Math.max(0.15, baseScore * urgencyMultiplier);

    // Recommended session length: Low score / difficult subjects get longer sessions (90-120m)
    let recommendedLength = 60;
    if (subject.suggestedSessionLengthMinutes) {
      recommendedLength = subject.suggestedSessionLengthMinutes;
    } else if (subject.isLowScoreFlagged || subject.difficulty >= 4) {
      recommendedLength = 90;
    }

    breakdowns.push({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      color: subject.color,
      currentScore: subject.currentScore,
      scoreDeficit: 100 - subject.currentScore,
      difficulty: subject.difficulty,
      credits: subject.credits,
      isLowScoreFlagged: subject.isLowScoreFlagged,
      nearestExam,
      scoreFactor,
      difficultyFactor,
      loadFactor,
      urgencyMultiplier,
      compositePriorityIndex: cpi,
      allocatedHours: 0,
      percentageOfStudyTime: 0,
      recommendedSessionLength: recommendedLength,
    });
  }

  // Allocate available hours proportionally
  const totalCpi = breakdowns.reduce((sum, b) => sum + b.compositePriorityIndex, 0);

  const minFloor = settings.minWeeklyHoursPerSubject;
  const reservePool = minFloor * breakdowns.length;
  const dynamicPool = Math.max(0, totalAvailableHours - reservePool);

  let allocatedSum = 0;
  for (const b of breakdowns) {
    const proportionalShare = totalCpi > 0 ? (b.compositePriorityIndex / totalCpi) : (1 / breakdowns.length);
    const calculatedHours = minFloor + (dynamicPool * proportionalShare);
    const roundedHours = Math.max(minFloor, Math.round(calculatedHours * 2) / 2);
    b.allocatedHours = roundedHours;
    allocatedSum += roundedHours;
  }

  for (const b of breakdowns) {
    b.percentageOfStudyTime = allocatedSum > 0 ? Math.round((b.allocatedHours / allocatedSum) * 100) : 0;
  }

  return breakdowns.sort((a, b) => b.compositePriorityIndex - a.compositePriorityIndex);
}

/**
 * Generates full weekly schedule with classes, exams, dedicated exam prep blocks, and study sessions
 */
export function generateTimetable(
  subjects: Subject[],
  exams: Exam[],
  availability: AvailabilityGrid,
  settings: OptimizerSettings
): {
  sessions: ScheduledSession[];
  breakdowns: SubjectPriorityBreakdown[];
  totalStudyHours: number;
  totalClassHours: number;
} {
  const sessions: ScheduledSession[] = [];
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  const occupancy: (string | null)[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: SLOTS_PER_DAY }, () => null)
  );

  let totalClassMinutes = 0;

  // 1. Place Fixed Classes first (cannot be moved or conflicted with)
  for (const subject of subjects) {
    for (const fixed of subject.fixedClasses) {
      const day = fixed.day;
      const startSlot = Math.floor((fixed.startMinutes - (START_HOUR * 60)) / 30);
      const slotCount = Math.ceil(fixed.durationMinutes / 30);

      const sessionId = `class_${subject.id}_${day}_${fixed.startMinutes}`;
      sessions.push({
        id: sessionId,
        subjectId: subject.id,
        type: 'class',
        title: `${subject.code} Lecture`,
        subtitle: fixed.location || 'Classroom',
        day,
        startMinutes: fixed.startMinutes,
        durationMinutes: fixed.durationMinutes,
        completed: false,
        priorityScore: 0,
        reason: 'Fixed Course Lecture / Lab (Protected)',
      });

      totalClassMinutes += fixed.durationMinutes;

      for (let s = startSlot; s < startSlot + slotCount && s < SLOTS_PER_DAY; s++) {
        if (s >= 0) {
          occupancy[day][s] = sessionId;
        }
      }
    }
  }

  // 2. Place Scheduled Exams
  for (const exam of exams) {
    const subject = subjectMap.get(exam.subjectId);
    if (!subject) continue;

    const [year, month, day] = exam.date.split('-').map(Number);
    const examDate = new Date(year, month - 1, day);
    const jsDay = examDate.getDay();
    const scheduleDay = ((jsDay + 6) % 7) as DayOfWeek;

    const [examHour, examMinute] = (exam.time || '10:00').split(':').map(Number);
    const examStartMinutes = (examHour * 60) + (examMinute || 0);
    const examDurationMinutes = 120;

    if (examStartMinutes >= START_HOUR * 60 && examStartMinutes < END_HOUR * 60) {
      const startSlot = Math.floor((examStartMinutes - (START_HOUR * 60)) / 30);
      const slotCount = Math.ceil(examDurationMinutes / 30);
      const examSessionId = `exam_${exam.id}`;

      sessions.push({
        id: examSessionId,
        subjectId: subject.id,
        type: 'exam',
        title: `${subject.code} ${exam.title}`,
        subtitle: `${exam.weightPercent}% Weight · ${exam.topicsCovered ? exam.topicsCovered.slice(0, 40) + '...' : 'Major Exam'}`,
        day: scheduleDay,
        startMinutes: examStartMinutes,
        durationMinutes: examDurationMinutes,
        completed: false,
        priorityScore: 999,
        reason: `Final/Midterm Exam Assessment (${exam.weightPercent}% of grade)`,
        examId: exam.id,
      });

      for (let s = startSlot; s < startSlot + slotCount && s < SLOTS_PER_DAY; s++) {
        if (s >= 0) {
          occupancy[scheduleDay][s] = examSessionId;
        }
      }
    }
  }

  // 3. Count available free study slots within student's chosen study hours
  const earliestAllowed = settings.earliestStudyStartMinutes ?? (START_HOUR * 60);
  const latestAllowed = settings.latestStudyEndMinutes ?? (END_HOUR * 60);

  let availableSlotsCount = 0;
  for (let d = 0; d < 7; d++) {
    for (let s = 0; s < SLOTS_PER_DAY; s++) {
      const slotMin = slotIndexToMinutes(s);
      if (slotMin < earliestAllowed || slotMin + 30 > latestAllowed) {
        continue;
      }
      const key = `${d}_${s}`;
      const status = availability.slots[key] || 'available';
      if (status !== 'blocked' && occupancy[d][s] === null) {
        availableSlotsCount++;
      }
    }
  }

  const totalAvailableStudyHours = (availableSlotsCount * 30) / 60;

  // 4. Calculate Priority and Hours allocation only for chosen subjects
  const subjectsToSchedule = subjects.filter((s) => s.includeInSchedule !== false);

  const breakdowns = calculateSubjectPriorities(
    subjectsToSchedule,
    exams,
    settings,
    totalAvailableStudyHours
  );

  const dailyStudyMinutes = Array.from({ length: 7 }, () => 0);
  const maxDailyMinutes = (settings.maxDailyStudyHours || 6) * 60;

  const subjectDaySessions: Record<string, number[]> = {};
  for (const s of subjects) {
    subjectDaySessions[s.id] = [0, 0, 0, 0, 0, 0, 0];
  }

  let totalScheduledStudyMinutes = 0;

  // 5. Dedicated Pre-Exam Study Blocking:
  // For exams approaching in <= 14 days, inject dedicated exam-prep drill blocks
  for (const exam of exams) {
    const daysLeft = calculateDaysRemaining(exam.date);
    const subject = subjectMap.get(exam.subjectId);
    if (!subject) continue;

    if (daysLeft <= 14) {
      // Allocate dedicated exam cram sessions (2 to 4 blocks depending on urgency)
      const prepBlocksCount = daysLeft <= 4 ? 3 : daysLeft <= 7 ? 2 : 1;
      const [year, month, day] = exam.date.split('-').map(Number);
      const examDate = new Date(year, month - 1, day);
      const examDayOfWeek = ((examDate.getDay() + 6) % 7) as DayOfWeek;

      for (let p = 0; p < prepBlocksCount; p++) {
        // Target 1-3 days prior to exam
        const targetDay = ((examDayOfWeek - 1 - p + 7) % 7) as DayOfWeek;
        const blockDuration = 90; // 90 min deep exam review
        const neededSlots = 3;

        // Find best free slot on target day respecting student study start time
        let foundSlot = -1;
        for (let s = 0; s <= SLOTS_PER_DAY - neededSlots; s++) {
          const slotMin = slotIndexToMinutes(s);
          if (slotMin < earliestAllowed || slotMin + blockDuration > latestAllowed) {
            continue;
          }

          let free = true;
          for (let check = 0; check < neededSlots; check++) {
            const key = `${targetDay}_${s + check}`;
            if (occupancy[targetDay][s + check] !== null || availability.slots[key] === 'blocked') {
              free = false;
              break;
            }
          }
          if (free) {
            foundSlot = s;
            break;
          }
        }

        if (foundSlot !== -1 && dailyStudyMinutes[targetDay] + blockDuration <= maxDailyMinutes) {
          const startMin = slotIndexToMinutes(foundSlot);
          const prepId = `examprep_${exam.id}_${targetDay}_${startMin}`;

          sessions.push({
            id: prepId,
            subjectId: subject.id,
            type: 'exam_prep',
            title: `${subject.code} Dedicated Exam Drill`,
            subtitle: `Countdown Prep: ${exam.title} (${daysLeft}d left)`,
            day: targetDay,
            startMinutes: startMin,
            durationMinutes: blockDuration,
            completed: false,
            priorityScore: 500 - (p * 50),
            reason: `Dedicated Pre-Exam Blocking: ${exam.title} on ${exam.date}`,
            examId: exam.id,
          });

          for (let s = foundSlot; s < foundSlot + neededSlots; s++) {
            occupancy[targetDay][s] = prepId;
          }
          dailyStudyMinutes[targetDay] += blockDuration;
          subjectDaySessions[subject.id][targetDay]++;
          totalScheduledStudyMinutes += blockDuration;
        }
      }
    }
  }

  // 6. General Subject Study Sessions
  for (const breakdown of breakdowns) {
    const subject = subjectMap.get(breakdown.subjectId);
    if (!subject) continue;

    // Determine session block length:
    // Low score flagged or hard subjects get longer 90m blocks for deep learning!
    let sessionBlockMinutes = settings.sessionLengthMinutes || 60;
    if (settings.allowLongerBlocksForFlagged && (subject.isLowScoreFlagged || subject.difficulty >= 4)) {
      sessionBlockMinutes = 90;
    } else if (subject.suggestedSessionLengthMinutes) {
      sessionBlockMinutes = subject.suggestedSessionLengthMinutes;
    }

    let minutesToSchedule = breakdown.allocatedHours * 60;

    // Reason tag for student transparency
    const reasonTags: string[] = [];
    if (subject.isLowScoreFlagged) {
      reasonTags.push(`Low Score Recovery (${subject.currentScore}% vs Target ${subject.targetScore}%)`);
    } else if (subject.currentScore < 70) {
      reasonTags.push(`Score Deficit (${subject.currentScore}%)`);
    }
    if (subject.difficulty >= 4) {
      reasonTags.push(`High Difficulty (${subject.difficulty}/5)`);
    }
    if (breakdown.nearestExam && breakdown.nearestExam.daysRemaining <= 14) {
      reasonTags.push(`Exam in ${breakdown.nearestExam.daysRemaining}d`);
    }
    const priorityReason = reasonTags.length > 0 ? reasonTags.join(' · ') : 'Standard Course Mastery';

    while (minutesToSchedule >= 30) {
      const currentBlockMinutes = minutesToSchedule >= sessionBlockMinutes ? sessionBlockMinutes : 30;
      const neededSlots = currentBlockMinutes / 30;

      let bestDay: DayOfWeek = 0;
      let bestStartSlot = -1;
      let highestFitScore = -999999;

      for (let day = 0; day < 7; day++) {
        if (dailyStudyMinutes[day] + currentBlockMinutes > maxDailyMinutes) {
          continue;
        }

        const existingSessionsToday = subjectDaySessions[subject.id][day];
        // Low score subjects can have up to 2 sessions per day; others capped at 1 for spaced practice
        const maxSessionsPerDay = (subject.isLowScoreFlagged || (breakdown.nearestExam && breakdown.nearestExam.daysRemaining <= 5)) ? 2 : 1;
        if (existingSessionsToday >= maxSessionsPerDay) {
          continue;
        }

        for (let s = 0; s <= SLOTS_PER_DAY - neededSlots; s++) {
          const slotMin = slotIndexToMinutes(s);
          if (slotMin < earliestAllowed || slotMin + currentBlockMinutes > latestAllowed) {
            continue;
          }

          let allFree = true;
          let preferredSlotsCount = 0;

          for (let check = 0; check < neededSlots; check++) {
            const slotIdx = s + check;
            const key = `${day}_${slotIdx}`;
            const status = availability.slots[key] || 'available';

            if (occupancy[day][slotIdx] !== null || status === 'blocked') {
              allFree = false;
              break;
            }
            if (status === 'preferred') {
              preferredSlotsCount++;
            }
          }

          if (!allFree) continue;

          let fitScore = 100;
          // Peak alertness slots
          fitScore += preferredSlotsCount * 35;

          const slotHour = START_HOUR + Math.floor(s / 2);
          if (subject.preferredTimeOfDay === 'morning' && slotHour >= 8 && slotHour <= 12) {
            fitScore += 30;
          } else if (subject.preferredTimeOfDay === 'afternoon' && slotHour >= 13 && slotHour <= 17) {
            fitScore += 30;
          } else if (subject.preferredTimeOfDay === 'evening' && slotHour >= 18 && slotHour <= 22) {
            fitScore += 30;
          }

          // Hard or low score subjects prioritized in morning focus hours if unassigned
          if ((subject.difficulty >= 4 || subject.isLowScoreFlagged) && slotHour >= 9 && slotHour <= 14) {
            fitScore += 25;
          }

          // Spaced distribution penalty
          fitScore -= existingSessionsToday * 60;

          // Days leading to exam
          if (breakdown.nearestExam && breakdown.nearestExam.daysRemaining <= 7) {
            fitScore += (7 - breakdown.nearestExam.daysRemaining) * 8;
          }

          // Balance daily distribution
          fitScore -= (dailyStudyMinutes[day] / 60) * 10;

          if (fitScore > highestFitScore) {
            highestFitScore = fitScore;
            bestDay = day as DayOfWeek;
            bestStartSlot = s;
          }
        }
      }

      if (bestStartSlot === -1) {
        break;
      }

      const startMin = slotIndexToMinutes(bestStartSlot);
      const sessionId = `study_${subject.id}_${bestDay}_${startMin}`;

      sessions.push({
        id: sessionId,
        subjectId: subject.id,
        type: 'study',
        title: `${subject.code} Study Session`,
        subtitle: subject.name,
        day: bestDay,
        startMinutes: startMin,
        durationMinutes: currentBlockMinutes,
        completed: false,
        priorityScore: breakdown.compositePriorityIndex,
        reason: priorityReason,
        isFlaggedRecovery: subject.isLowScoreFlagged,
      });

      for (let s = bestStartSlot; s < bestStartSlot + neededSlots; s++) {
        occupancy[bestDay][s] = sessionId;
      }

      dailyStudyMinutes[bestDay] += currentBlockMinutes;
      subjectDaySessions[subject.id][bestDay]++;
      minutesToSchedule -= currentBlockMinutes;
      totalScheduledStudyMinutes += currentBlockMinutes;
    }
  }

  sessions.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.startMinutes - b.startMinutes;
  });

  return {
    sessions,
    breakdowns,
    totalStudyHours: Math.round((totalScheduledStudyMinutes / 60) * 10) / 10,
    totalClassHours: Math.round((totalClassMinutes / 60) * 10) / 10,
  };
}
