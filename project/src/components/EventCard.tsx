import { Heart, CircleCheck as CheckCircle2, Bell, Navigation, MapPin, Clock, Globe, Sparkles, Star } from 'lucide-react';
import type { CulturalEvent, UserLocation } from '@/types';
import {
  formatDistance,
  formatDate,
  formatTime,
  eventDistance,
  isHappeningNow,
  cn,
} from '@/lib/utils';
import { CATEGORY_ICONS } from '@/types';
import * as Icons from 'lucide-react';

interface EventCardProps {
  event: CulturalEvent;
  userLocation: UserLocation | null;
  isFavorite: boolean;
  hasParticipated: boolean;
  hasReminder: boolean;
  avgRating: number | null;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onToggleParticipated: () => void;
  onToggleReminder: () => void;
  onRoute: () => void;
  compact?: boolean;
}

export default function EventCard({
  event,
  userLocation,
  isFavorite,
  hasParticipated,
  hasReminder,
  avgRating,
  onSelect,
  onToggleFavorite,
  onToggleParticipated,
  onToggleReminder,
  onRoute,
  compact,
}: EventCardProps) {
  const dist = userLocation ? eventDistance(event, userLocation) : null;
  const happening = isHappeningNow(event);
  const CategoryIcon = Icons[CATEGORY_ICONS[event.category] as keyof typeof Icons] as Icons.LucideIcon | undefined;
  const img = event.images[0];

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-[var(--bg-card)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-hover)]',
        happening ? 'border-emerald-500/40' : 'border-[var(--border)]'
      )}
    >
      {img && (
        <button onClick={onSelect} className="relative block aspect-[16/10] w-full overflow-hidden">
          <img
            src={img}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {happening && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Agora
            </span>
          )}
          {event.is_ai_generated && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles size={12} /> IA
            </span>
          )}
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {CategoryIcon && <CategoryIcon size={12} />}
            {event.category}
          </span>
        </button>
      )}

      <div className="flex flex-1 flex-col p-3.5">
        <button onClick={onSelect} className="text-left">
          <h3 className="line-clamp-1 font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
            {event.title}
          </h3>
        </button>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{event.description}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(event.start_time)} • {formatTime(event.start_time)}
          </span>
          {event.is_virtual ? (
            <span className="flex items-center gap-1 text-sky-400">
              <Globe size={12} /> Virtual
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {dist != null ? formatDistance(dist) : event.address ?? '—'}
            </span>
          )}
          {event.is_free ? (
            <span className="font-semibold text-emerald-400">Gratuito</span>
          ) : (
            <span className="font-semibold text-amber-400">Pago</span>
          )}
          {avgRating != null && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star size={12} fill="currentColor" /> {avgRating.toFixed(1)}
            </span>
          )}
        </div>

        {!compact && (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Por <span className="font-medium text-[var(--text-secondary)]">{event.organizer_name}</span>
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border)] pt-3">
          <button
            onClick={onToggleFavorite}
            title="Favoritar"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              isFavorite
                ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onToggleParticipated}
            title="Já participei"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              hasParticipated
                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <CheckCircle2 size={16} />
          </button>
          <button
            onClick={onToggleReminder}
            title="Lembrete"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              hasReminder
                ? 'bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <Bell size={16} fill={hasReminder ? 'currentColor' : 'none'} />
          </button>
          {!event.is_virtual && (
            <button
              onClick={onRoute}
              title="Traçar rota"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <Navigation size={16} />
            </button>
          )}
          <button
            onClick={onSelect}
            className="ml-auto rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}
