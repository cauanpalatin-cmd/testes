import { useState, useEffect } from 'react';
import { X, Heart, CircleCheck as CheckCircle2, Bell, Navigation, MapPin, Clock, Globe, Calendar, Sparkles, Star, ExternalLink, Info } from 'lucide-react';
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

interface EventDetailModalProps {
  event: CulturalEvent | null;
  userLocation: UserLocation | null;
  isFavorite: boolean;
  hasParticipated: boolean;
  hasReminder: boolean;
  reminderMinutes: number | null;
  avgRating: number | null;
  ratingCount: number;
  userRating: number | null;
  onClose: () => void;
  onToggleFavorite: () => void;
  onToggleParticipated: () => void;
  onToggleReminder: (minutes: number) => void;
  onRoute: () => void;
  onSubmitRating: (rating: number, comment: string) => void;
}

const REMINDER_OPTIONS = [15, 30, 60, 120, 1440];

export default function EventDetailModal({
  event,
  userLocation,
  isFavorite,
  hasParticipated,
  hasReminder,
  reminderMinutes,
  avgRating,
  ratingCount,
  userRating,
  onClose,
  onToggleFavorite,
  onToggleParticipated,
  onToggleReminder,
  onRoute,
  onSubmitRating,
}: EventDetailModalProps) {
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    setRatingValue(userRating ?? 0);
    setShowReminderPicker(false);
  }, [event, userRating]);

  if (!event) return null;

  const dist = userLocation ? eventDistance(event, userLocation) : null;
  const happening = isHappeningNow(event);
  const CategoryIcon = Icons[CATEGORY_ICONS[event.category] as keyof typeof Icons] as Icons.LucideIcon | undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl animate-slide-up sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {event.images[0] && (
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img src={event.images[0]} alt={event.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                {happening && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Acontecendo agora
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {CategoryIcon && <CategoryIcon size={12} />}
                  {event.category}
                </span>
                {event.is_ai_generated && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--accent)]/90 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles size={12} /> Encontrado por IA
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{event.title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Por <span className="font-medium text-[var(--text-primary)]">{event.organizer_name}</span>
              {event.source_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-0.5 text-[var(--accent)] hover:underline"
                >
                  fonte <ExternalLink size={11} />
                </a>
              )}
            </p>

            {avgRating != null && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(avgRating) ? 'text-amber-400' : 'text-[var(--border)]'}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {avgRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}

            <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">{event.description}</p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                <Calendar size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <div className="text-xs font-medium text-[var(--text-muted)]">Data</div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{formatDate(event.start_time)}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <div className="text-xs font-medium text-[var(--text-muted)]">Horário</div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {formatTime(event.start_time)}
                    {event.end_time && ` – ${formatTime(event.end_time)}`}
                  </div>
                </div>
              </div>
              {event.is_virtual ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                  <Globe size={18} className="mt-0.5 shrink-0 text-sky-400" />
                  <div>
                    <div className="text-xs font-medium text-sky-400/70">Modalidade</div>
                    <div className="text-sm font-medium text-sky-300">Evento Virtual</div>
                    {event.virtual_link && (
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:underline"
                      >
                        Acessar transmissão <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <div>
                    <div className="text-xs font-medium text-[var(--text-muted)]">Local</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{event.address ?? '—'}</div>
                    {dist != null && (
                      <div className="text-xs text-[var(--text-muted)]">
                        {formatDistance(dist)} • {estimateTravelTime(dist)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                <Info size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <div className="text-xs font-medium text-[var(--text-muted)]">Entrada</div>
                  <div className={cn('text-sm font-semibold', event.is_free ? 'text-emerald-400' : 'text-amber-400')}>
                    {event.is_free ? 'Gratuito' : 'Pago'}
                  </div>
                </div>
              </div>
            </div>

            {event.participation_info && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-3">
                <Info size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <div className="text-xs font-medium text-[var(--accent)]/80">Como participar</div>
                  <div className="text-sm text-[var(--text-primary)]">{event.participation_info}</div>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {userRating ? 'Sua avaliação' : 'Avalie esta atividade'}
              </h3>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRatingValue(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={cn(
                        (hoverRating || ratingValue) >= s ? 'text-amber-400' : 'text-[var(--border)]'
                      )}
                      fill={(hoverRating || ratingValue) >= s ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Deixe um comentário (opcional)"
                className="mt-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
                rows={2}
              />
              <button
                onClick={() => onSubmitRating(ratingValue, ratingComment)}
                disabled={ratingValue === 0}
                className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {userRating ? 'Atualizar avaliação' : 'Enviar avaliação'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          {showReminderPicker ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Avisar:</span>
              {REMINDER_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onToggleReminder(m);
                    setShowReminderPicker(false);
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    reminderMinutes === m
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40'
                  )}
                >
                  {m < 60 ? `${m} min antes` : m < 1440 ? `${m / 60}h antes` : '1 dia antes'}
                </button>
              ))}
              <button
                onClick={() => setShowReminderPicker(false)}
                className="rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFavorite}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-colors',
                  isFavorite ? 'bg-rose-500/15 text-rose-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                )}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                Favoritar
              </button>
              <button
                onClick={onToggleParticipated}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-colors',
                  hasParticipated ? 'bg-emerald-500/15 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                )}
              >
                <CheckCircle2 size={20} />
                Já participei
              </button>
              <button
                onClick={() => {
                  if (hasReminder) {
                    onToggleReminder(0);
                  } else {
                    setShowReminderPicker(true);
                  }
                }}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-colors',
                  hasReminder ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                )}
              >
                <Bell size={20} fill={hasReminder ? 'currentColor' : 'none'} />
                {hasReminder ? 'Lembrete ativo' : 'Lembrete'}
              </button>
              {!event.is_virtual && (
                <button
                  onClick={onRoute}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <Navigation size={20} />
                  Traçar rota
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
