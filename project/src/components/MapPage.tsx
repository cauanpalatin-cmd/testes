import { useMemo } from 'react';
import { Map as MapIcon, List, Radio, MapPin, Navigation } from 'lucide-react';
import type { CulturalEvent, UserLocation } from '@/types';
import MapView from '@/components/MapView';
import EventCard from '@/components/EventCard';
import { cn, isHappeningNow, eventDistance } from '@/lib/utils';

interface MapPageProps {
  events: CulturalEvent[];
  userLocation: UserLocation | null;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  favoriteIds: Set<string>;
  participatedIds: Set<string>;
  reminderIds: Set<string>;
  ratingsAvg: Record<string, number>;
  onToggleFavorite: (eventId: string) => void;
  onToggleParticipated: (eventId: string) => void;
  onToggleReminder: (eventId: string, minutes: number) => void;
  onRoute: (event: CulturalEvent) => void;
  listOpen: boolean;
  setListOpen: (v: boolean) => void;
}

export default function MapPage({
  events,
  userLocation,
  selectedEventId,
  onSelectEvent,
  favoriteIds,
  participatedIds,
  reminderIds,
  ratingsAvg,
  onToggleFavorite,
  onToggleParticipated,
  onToggleReminder,
  onRoute,
  listOpen,
  setListOpen,
}: MapPageProps) {
  const sortedEvents = useMemo(() => {
    if (!userLocation) return events;
    return [...events].sort((a, b) => {
      const da = eventDistance(a, userLocation) ?? Infinity;
      const db = eventDistance(b, userLocation) ?? Infinity;
      return da - db;
    });
  }, [events, userLocation]);

  const happeningCount = useMemo(() => events.filter(isHappeningNow).length, [events]);

  return (
    <div className="relative isolate flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Map */}
      <div className="relative flex-1">
        <MapView
          events={events}
          userLocation={userLocation}
          selectedEventId={selectedEventId}
          onSelectEvent={onSelectEvent}
        />

        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center p-3">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)]/95 px-4 py-2 text-xs font-medium text-[var(--text-secondary)] backdrop-blur">
            <MapPin size={14} className="text-[var(--accent)]" />
            {userLocation ? 'Eventos próximos' : 'Campinas & região'}
            <span className="text-[var(--text-muted)]">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Radio size={12} /> {happeningCount} agora
            </span>
          </div>
        </div>

        <button
          onClick={() => setListOpen(!listOpen)}
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
        >
          {listOpen ? <MapIcon size={16} /> : <List size={16} />}
          {listOpen ? 'Ver mapa' : `Ver lista (${events.length})`}
        </button>
      </div>

      {/* Right panel — always visible on desktop, drawer on mobile */}
      <div
        className={cn(
          'absolute right-0 top-0 z-20 h-full w-full max-w-[440px] border-l border-[var(--border)] bg-[var(--bg-secondary)] transition-transform duration-300',
          'md:relative md:translate-x-0',
          listOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <List size={18} className="text-[var(--accent)]" />
              Eventos ({events.length})
            </h2>
            <button
              onClick={() => setListOpen(false)}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <Navigation size={18} className="rotate-45" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 gap-3">
              {sortedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userLocation={userLocation}
                  isFavorite={favoriteIds.has(event.id)}
                  hasParticipated={participatedIds.has(event.id)}
                  hasReminder={reminderIds.has(event.id)}
                  avgRating={ratingsAvg[event.id] ?? null}
                  onSelect={() => onSelectEvent(event.id)}
                  onToggleFavorite={() => onToggleFavorite(event.id)}
                  onToggleParticipated={() => onToggleParticipated(event.id)}
                  onToggleReminder={() => onToggleReminder(event.id, 60)}
                  onRoute={() => onRoute(event)}
                  compact
                />
              ))}
              {events.length === 0 && (
                <div className="py-10 text-center text-sm text-[var(--text-muted)]">
                  Nenhum evento encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
