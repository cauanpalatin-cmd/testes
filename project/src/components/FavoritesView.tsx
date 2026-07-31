import { useMemo } from 'react';
import { Heart, History, CheckCircle2 } from 'lucide-react';
import type { CulturalEvent, Favorite, Participation } from '@/types';
import type { UserLocation } from '@/types';
import EventCard from '@/components/EventCard';

interface FavoritesViewProps {
  events: CulturalEvent[];
  favorites: Favorite[];
  participations: Participation[];
  userLocation: UserLocation | null;
  favoriteIds: Set<string>;
  participatedIds: Set<string>;
  reminderIds: Set<string>;
  ratingsAvg: Record<string, number>;
  onSelectEvent: (id: string) => void;
  onToggleFavorite: (eventId: string) => void;
  onToggleParticipated: (eventId: string) => void;
  onToggleReminder: (eventId: string, minutes: number) => void;
  onRoute: (event: CulturalEvent) => void;
}

export default function FavoritesView({
  events,
  favorites,
  participations,
  userLocation,
  favoriteIds,
  participatedIds,
  reminderIds,
  ratingsAvg,
  onSelectEvent,
  onToggleFavorite,
  onToggleParticipated,
  onToggleReminder,
  onRoute,
}: FavoritesViewProps) {
  const favoriteEvents = useMemo(
    () => events.filter((e) => favoriteIds.has(e.id)),
    [events, favoriteIds]
  );
  const participatedEvents = useMemo(
    () => events.filter((e) => participatedIds.has(e.id)),
    [events, participatedIds]
  );

  const sortedParticipated = useMemo(() => {
    return participations
      .map((p) => ({
        event: events.find((e) => e.id === p.event_id),
        participatedAt: p.created_at,
      }))
      .filter((x) => x.event)
      .sort((a, b) => new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime());
  }, [participations, events]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500 text-white">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="hc-text text-2xl font-bold text-slate-900">Favoritos e histórico</h1>
          <p className="hc-muted text-sm text-slate-500">Suas atividades salvas e das quais você participou</p>
        </div>
      </div>

      {/* Favorites */}
      <section className="mb-10">
        <h2 className="hc-text mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Heart size={18} className="text-rose-500" />
          Favoritados ({favoriteEvents.length})
        </h2>
        {favoriteEvents.length === 0 ? (
          <div className="hc-card rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Heart size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="hc-muted text-slate-500">Você ainda não favoritou nenhuma atividade.</p>
            <p className="hc-muted text-sm text-slate-400">Toque no coração de um evento para salvá-lo aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteEvents.map((event) => (
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
              />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="hc-text mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <History size={18} className="text-emerald-500" />
          Histórico de participação ({sortedParticipated.length})
        </h2>
        {sortedParticipated.length === 0 ? (
          <div className="hc-card rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="hc-muted text-slate-500">Você ainda não marcou nenhuma atividade como participada.</p>
            <p className="hc-muted text-sm text-slate-400">Use "Já participei" nos cards para construir seu histórico.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedParticipated.map(({ event, participatedAt }) => (
              <button
                key={event!.id}
                onClick={() => onSelectEvent(event!.id)}
                className="hc-card flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
              >
                {event!.images[0] && (
                  <img src={event!.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{event!.title}</div>
                  <div className="text-xs text-slate-500">{event!.category} • {event!.organizer_name}</div>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  Participou em
                  <div>{new Date(participatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
