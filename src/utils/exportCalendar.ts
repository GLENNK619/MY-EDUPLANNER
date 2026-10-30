import { ScheduledSession, Subject } from '../types';

export function exportTimetableToICS(
  sessions: ScheduledSession[],
  subjects: Subject[],
  calendarName: string = 'OptiSchedule Timetable'
): void {
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Reference Monday of current week
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday
  const distanceToMonday = (currentDay + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OptiSchedule//Student Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
  ];

  for (const session of sessions) {
    const subject = subjectMap.get(session.subjectId);

    // Calculate actual date for this session
    const sessionDate = new Date(monday);
    sessionDate.setDate(monday.getDate() + session.day);

    const startH = Math.floor(session.startMinutes / 60);
    const startM = session.startMinutes % 60;
    sessionDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(sessionDate.getTime() + (session.durationMinutes * 60 * 1000));

    const formatICSDate = (d: Date): string => {
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    const typePrefix = session.type === 'exam' ? '[EXAM] ' : session.type === 'class' ? '[CLASS] ' : '[STUDY] ';
    const summary = `${typePrefix}${session.title}`;
    const description = `${session.subtitle || ''}\\nPriority Reason: ${session.reason || 'Study Session'}\\nSubject: ${subject ? subject.name : ''}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${session.id}-${Date.now()}@optischedule.app`,
      `DTSTAMP:${formatICSDate(now)}Z`,
      `DTSTART:${formatICSDate(sessionDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${summary.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      session.subtitle ? `LOCATION:${session.subtitle.replace(/,/g, '\\,')}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  const icsContent = lines.filter(Boolean).join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `study-schedule-${new Date().toISOString().split('T')[0]}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
