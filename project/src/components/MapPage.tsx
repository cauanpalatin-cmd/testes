import { useMemo } from 'react';
import { Map as MapIcon, List, Navigation, Sparkles, Radio, MapPin } from 'lucide-react';
import type { CulturalEvent, UserLocation, Favorite, Participation, Reminder } from '@/types';
import MapView from '@/components/MapView';
import EventCard from '@/components/EventCard';
import { cn, isHappeningNow, eventDistance, formatDistance } from '@/lib/utils';

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
  const aiCount = useMemo(() => events.filter((e) => e.is_ai_generated).length, [events]);

  return (
    <div className="relative isolate h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Map */}
      <MapView
        events={events}
        userLocation={userLocation}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEvent}
      />

      {/* Top overlay info */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center p-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow-md backdrop-blur">
          <MapPin size={14} className="text-sky-500" />
          {userLocation ? 'Eventos próximos de você' : 'Todos os eventos'}
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <Radio size={12} /> {happeningCount} agora
          </span>
          {aiCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Sparkles size={12} /> {aiCount} por IA
              </span>
            </>
          )}
        </div>
      </div>

      {/* List toggle button */}
      <button
        onClick={() => setListOpen(!listOpen)}
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-slate-700"
      >
        {listOpen ? <MapIcon size={16} /> : <List size={16} />}
        {listOpen ? 'Ver mapa' : `Ver lista (${events.length})`}
      </button>

      {/* Event list drawer */}
      <div
        className={cn(
          'absolute right-0 top-0 z-20 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300',
          listOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h2 className="hc-text flex items-center gap-2 font-semibold text-slate-900">
              <List size={18} /> Atividades ({events.length})
            </h2>
            <button
              onClick={() => setListOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <Navigation size={18} className="rotate-45" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4">
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
                <div className="py-10 text-center text-sm text-slate-400">
                  Nenhuma atividade encontrada com os filtros atuais.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
