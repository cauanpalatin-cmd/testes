import {
  Heart,
  CheckCircle2,
  Bell,
  Navigation,
  MapPin,
  Clock,
  Globe,
  Sparkles,
  Star,
} from 'lucide-react';
import type { CulturalEvent, UserLocation } from '@/types';
import {
  formatDistance,
  formatDate,
  formatTime,
  eventDistance,
  estimateTravelTime,
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
        'hc-card group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md',
        happening && 'ring-2 ring-emerald-400'
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {happening && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Acontecendo agora
            </span>
          )}
          {event.is_ai_generated && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles size={12} /> IA
            </span>
          )}
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur">
            {CategoryIcon && <CategoryIcon size={12} />}
            {event.category}
          </span>
        </button>
      )}

      <div className="flex flex-1 flex-col p-4">
        <button onClick={onSelect} className="text-left">
          <h3 className="hc-text line-clamp-1 font-semibold text-slate-900 group-hover:text-sky-600">
            {event.title}
          </h3>
        </button>
        <p className="hc-muted mt-1 line-clamp-2 text-sm text-slate-500">{event.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {formatDate(event.start_time)} • {formatTime(event.start_time)}
          </span>
          {event.is_virtual ? (
            <span className="flex items-center gap-1 text-sky-600">
              <Globe size={13} /> Virtual
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {dist != null ? formatDistance(dist) : event.address ?? '—'}
            </span>
          )}
          {dist != null && !event.is_virtual && (
            <span className="hidden items-center gap-1 sm:flex">
              <Navigation size={13} />
              {estimateTravelTime(dist)}
            </span>
          )}
          {event.is_free ? (
            <span className="font-semibold text-emerald-600">Gratuito</span>
          ) : (
            <span className="font-semibold text-amber-600">Pago</span>
          )}
          {avgRating != null && (
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star size={13} fill="currentColor" /> {avgRating.toFixed(1)}
            </span>
          )}
        </div>

        {!compact && (
          <p className="mt-2 text-xs text-slate-400">
            Por <span className="font-medium text-slate-600">{event.organizer_name}</span>
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
          <button
            onClick={onToggleFavorite}
            title="Favoritar"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              isFavorite
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            )}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onToggleParticipated}
            title="Já participei"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              hasParticipated
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            )}
          >
            <CheckCircle2 size={18} />
          </button>
          <button
            onClick={onToggleReminder}
            title="Ativar lembrete"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              hasReminder
                ? 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            )}
          >
            <Bell size={18} fill={hasReminder ? 'currentColor' : 'none'} />
          </button>
          {!event.is_virtual && (
            <button
              onClick={onRoute}
              title="Traçar rota"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <Navigation size={18} />
            </button>
          )}
          <button
            onClick={onSelect}
            className="ml-auto rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}
