import { useMemo, useState } from 'react';
import { Heart, Factory as History, CircleCheck as CheckCircle2, Search, X } from 'lucide-react';
import type { CulturalEvent, Favorite, Participation, UserLocation } from '@/types';
import EventCard from '@/components/EventCard';
import { CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

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
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const favoriteEvents = useMemo(() => {
    return events
      .filter((e) => favoriteIds.has(e.id))
      .filter((e) => !activeCat || e.category === activeCat)
      .filter((e) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return `${e.title} ${e.description} ${e.organizer_name}`.toLowerCase().includes(q);
      });
  }, [events, favoriteIds, activeCat, search]);

  const sortedParticipated = useMemo(() => {
    return participations
      .map((p) => ({
        event: events.find((e) => e.id === p.event_id),
        participatedAt: p.created_at,
      }))
      .filter((x) => x.event)
      .sort((a, b) => new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime());
  }, [participations, events]);

  const favCategories = useMemo(() => {
    const cats = new Set<string>();
    favorites.forEach((f) => {
      const ev = events.find((e) => e.id === f.event_id);
      if (ev) cats.add(ev.category);
    });
    return Array.from(cats);
  }, [favorites, events]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500 text-white">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Salvos</h1>
          <p className="text-sm text-[var(--text-secondary)]">Suas atividades salvas e histórico de participação</p>
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <Heart size={18} className="text-rose-400" />
            Favoritados ({favoriteEvents.length})
          </h2>
        </div>

        {favCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat(null)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                !activeCat ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              )}
            >
              Todos
            </button>
            {favCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat === activeCat ? null : cat)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  activeCat === cat ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {favoriteEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
            <Heart size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)]">Você ainda não favoritou nenhuma atividade.</p>
            <p className="text-sm text-[var(--text-muted)]">Toque no coração de um evento para salvá-lo aqui.</p>
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

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <History size={18} className="text-emerald-400" />
          Histórico de participação ({sortedParticipated.length})
        </h2>
        {sortedParticipated.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)]">Você ainda não marcou nenhuma atividade como participada.</p>
            <p className="text-sm text-[var(--text-muted)]">Use "Já participei" nos cards para construir seu histórico.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedParticipated.map(({ event, participatedAt }) => (
              <button
                key={event!.id}
                onClick={() => onSelectEvent(event!.id)}
                className="flex w-full items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-left transition-colors hover:bg-[var(--bg-hover)]"
              >
                {event!.images[0] && (
                  <img src={event!.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--text-primary)]">{event!.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{event!.category} • {event!.organizer_name}</div>
                </div>
                <div className="shrink-0 text-right text-xs text-[var(--text-muted)]">
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
