import { useState, useEffect } from 'react';
import {
  X,
  Heart,
  CheckCircle2,
  Bell,
  Navigation,
  MapPin,
  Clock,
  Globe,
  Calendar,
  User,
  Sparkles,
  Star,
  ExternalLink,
  Info,
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="hc-card relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {event.images[0] && (
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img src={event.images[0]} alt={event.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                {happening && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Acontecendo agora
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
                  {CategoryIcon && <CategoryIcon size={12} />}
                  {event.category}
                </span>
                {event.is_ai_generated && (
                  <span className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    <Sparkles size={12} /> Encontrado por IA
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            <h2 className="hc-text text-2xl font-bold text-slate-900">{event.title}</h2>
            <p className="hc-muted mt-1 text-sm text-slate-500">
              Por <span className="font-medium text-slate-700">{event.organizer_name}</span>
              {event.is_ai_generated && event.source_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-0.5 text-sky-600 hover:underline"
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
                      className={s <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {avgRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}

            <p className="hc-text mt-4 leading-relaxed text-slate-600">{event.description}</p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
                <Calendar size={18} className="mt-0.5 shrink-0 text-sky-500" />
                <div>
                  <div className="text-xs font-medium text-slate-400">Data</div>
                  <div className="text-sm font-medium text-slate-700">
                    {formatDate(event.start_time)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-sky-500" />
                <div>
                  <div className="text-xs font-medium text-slate-400">Horário</div>
                  <div className="text-sm font-medium text-slate-700">
                    {formatTime(event.start_time)}
                    {event.end_time && ` – ${formatTime(event.end_time)}`}
                  </div>
                </div>
              </div>
              {event.is_virtual ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-sky-50 p-3">
                  <Globe size={18} className="mt-0.5 shrink-0 text-sky-600" />
                  <div>
                    <div className="text-xs font-medium text-sky-400">Modalidade</div>
                    <div className="text-sm font-medium text-sky-700">Evento Virtual</div>
                    {event.virtual_link && (
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline"
                      >
                        Acessar transmissão <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-sky-500" />
                  <div>
                    <div className="text-xs font-medium text-slate-400">Local</div>
                    <div className="text-sm font-medium text-slate-700">{event.address ?? '—'}</div>
                    {dist != null && (
                      <div className="text-xs text-slate-500">
                        {formatDistance(dist)} • {estimateTravelTime(dist)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-500" />
                <div>
                  <div className="text-xs font-medium text-slate-400">Entrada</div>
                  <div className={cn('text-sm font-semibold', event.is_free ? 'text-emerald-600' : 'text-amber-600')}>
                    {event.is_free ? 'Gratuito' : 'Pago'}
                  </div>
                </div>
              </div>
            </div>

            {event.participation_info && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50 p-3">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
                <div>
                  <div className="text-xs font-medium text-sky-500">Como participar</div>
                  <div className="text-sm text-sky-800">{event.participation_info}</div>
                </div>
              </div>
            )}

            {/* Rating section */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="hc-text text-sm font-semibold text-slate-700">
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
                        (hoverRating || ratingValue) >= s ? 'text-amber-400' : 'text-slate-200'
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
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                rows={2}
              />
              <button
                onClick={() => onSubmitRating(ratingValue, ratingComment)}
                disabled={ratingValue === 0}
                className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {userRating ? 'Atualizar avaliação' : 'Enviar avaliação'}
              </button>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t border-slate-100 bg-white p-4">
          {showReminderPicker ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Avisar:</span>
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
                      ? 'border-sky-500 bg-sky-50 text-sky-600'
                      : 'border-slate-200 text-slate-600 hover:border-sky-300'
                  )}
                >
                  {m < 60 ? `${m} min antes` : m < 1440 ? `${m / 60}h antes` : '1 dia antes'}
                </button>
              ))}
              <button
                onClick={() => setShowReminderPicker(false)}
                className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
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
                  isFavorite ? 'bg-rose-50 text-rose-500' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                Favoritar
              </button>
              <button
                onClick={onToggleParticipated}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-colors',
                  hasParticipated ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-100'
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
                  hasReminder ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Bell size={20} fill={hasReminder ? 'currentColor' : 'none'} />
                {hasReminder ? 'Lembrete ativo' : 'Lembrete'}
              </button>
              {!event.is_virtual && (
                <button
                  onClick={onRoute}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
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
