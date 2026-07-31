import { useMemo } from 'react';
import { CalendarDays, Clock, Bell, TriangleAlert as AlertTriangle, MapPin, Globe } from 'lucide-react';
import type { CulturalEvent, Reminder, UserLocation } from '@/types';
import { formatTime, eventDistance, formatDistance, cn } from '@/lib/utils';

interface CalendarViewProps {
  events: CulturalEvent[];
  reminders: Reminder[];
  favoriteIds: Set<string>;
  participatedIds: Set<string>;
  userLocation: UserLocation | null;
  onSelectEvent: (id: string) => void;
}

export default function CalendarView({
  events,
  reminders,
  favoriteIds,
  participatedIds,
  userLocation,
  onSelectEvent,
}: CalendarViewProps) {
  const upcoming = useMemo(() => {
    const now = new Date();
    const ids = new Set([...favoriteIds, ...participatedIds]);
    return events
      .filter((e) => ids.has(e.id) && new Date(e.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [events, favoriteIds, participatedIds]);

  const reminderMap = useMemo(() => {
    const m: Record<string, number> = {};
    reminders.forEach((r) => (m[r.event_id] = r.minutes_before));
    return m;
  }, [reminders]);

  const conflicts = useMemo(() => {
    const conflictMap: Record<string, boolean> = {};
    for (let i = 0; i < upcoming.length; i++) {
      for (let j = i + 1; j < upcoming.length; j++) {
        const a = upcoming[i];
        const b = upcoming[j];
        const aStart = new Date(a.start_time).getTime();
        const aEnd = new Date(a.end_time ?? a.start_time).getTime() + 2 * 3600 * 1000;
        const bStart = new Date(b.start_time).getTime();
        if (bStart < aEnd && bStart >= aStart) {
          conflictMap[a.id] = true;
          conflictMap[b.id] = true;
        }
      }
    }
    return conflictMap;
  }, [upcoming]);

  const grouped = useMemo(() => {
    const groups: Record<string, CulturalEvent[]> = {};
    upcoming.forEach((e) => {
      const key = new Date(e.start_time).toDateString();
      (groups[key] ??= []).push(e);
    });
    return groups;
  }, [upcoming]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
          <CalendarDays size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Minha agenda</h1>
          <p className="text-sm text-[var(--text-secondary)]">Eventos futuros, lembretes e conflitos de horário</p>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
          <CalendarDays size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-secondary)]">Sua agenda está vazia.</p>
          <p className="text-sm text-[var(--text-muted)]">Favorite eventos para acompanhar seus compromissos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateStr, dayEvents]) => (
            <div key={dateStr}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
                <Clock size={15} className="text-[var(--accent)]" />
                {new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const dist = userLocation ? eventDistance(event, userLocation) : null;
                  const hasConflict = conflicts[event.id];
                  const reminderMin = reminderMap[event.id];
                  return (
                    <button
                      key={event.id}
                      onClick={() => onSelectEvent(event.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border bg-[var(--bg-card)] p-3 text-left transition-colors hover:bg-[var(--bg-hover)]',
                        hasConflict ? 'border-amber-500/40' : 'border-[var(--border)]'
                      )}
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-[var(--bg-primary)] py-2">
                        <span className="text-lg font-bold text-[var(--text-primary)]">{formatTime(event.start_time)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{event.title}</span>
                          {hasConflict && (
                            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                              <AlertTriangle size={11} /> Conflito
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--text-muted)]">
                          {event.is_virtual ? (
                            <span className="flex items-center gap-0.5 text-sky-400"><Globe size={11} /> Virtual</span>
                          ) : (
                            <span className="flex items-center gap-0.5"><MapPin size={11} /> {dist != null ? formatDistance(dist) : event.address}</span>
                          )}
                          {reminderMin != null && (
                            <span className="flex items-center gap-0.5 text-[var(--accent)]">
                              <Bell size={11} /> {reminderMin < 60 ? `${reminderMin}min` : reminderMin < 1440 ? `${reminderMin / 60}h` : '1d'} antes
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
