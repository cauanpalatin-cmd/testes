import { X, SlidersHorizontal, Radio } from 'lucide-react';
import type { CulturalEvent } from '@/types';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterState {
  categories: string[];
  maxDistance: number | null;
  priceFilter: 'all' | 'free' | 'paid';
  modeFilter: 'all' | 'in-person' | 'virtual';
  happeningNow: boolean;
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  eventCount: number;
}

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  maxDistance: null,
  priceFilter: 'all',
  modeFilter: 'all',
  happeningNow: false,
};

export function applyFilters(
  events: CulturalEvent[],
  filters: FilterState,
  userLoc: { latitude: number; longitude: number } | null,
  searchQuery: string
): CulturalEvent[] {
  const q = searchQuery.trim().toLowerCase();
  return events.filter((e) => {
    if (e.status !== 'active') return false;
    if (q) {
      const haystack = `${e.title} ${e.description} ${e.category} ${e.address ?? ''} ${e.organizer_name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false;
    if (filters.priceFilter === 'free' && !e.is_free) return false;
    if (filters.priceFilter === 'paid' && e.is_free) return false;
    if (filters.modeFilter === 'in-person' && e.is_virtual) return false;
    if (filters.modeFilter === 'virtual' && !e.is_virtual) return false;
    if (filters.happeningNow) {
      const now = new Date();
      const start = new Date(e.start_time);
      const end = e.end_time ? new Date(e.end_time) : new Date(start.getTime() + 2 * 3600 * 1000);
      if (now < start || now > end) return false;
    }
    if (filters.maxDistance != null && userLoc && e.latitude != null && e.longitude != null) {
      const R = 6371;
      const dLat = ((e.latitude - userLoc.latitude) * Math.PI) / 180;
      const dLon = ((e.longitude - userLoc.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((userLoc.latitude * Math.PI) / 180) *
          Math.cos((e.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist > filters.maxDistance) return false;
    }
    return true;
  });
}

export default function FilterPanel({
  open,
  onClose,
  filters,
  setFilters,
  eventCount,
}: FilterPanelProps) {
  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: next });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-80 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">Filtros</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <Radio size={16} className="animate-pulse" />
              Acontecendo agora
            </span>
            <button
              onClick={() => setFilters({ ...filters, happeningNow: !filters.happeningNow })}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                filters.happeningNow ? 'bg-emerald-500' : 'bg-[var(--border)]'
              )}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', filters.happeningNow ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </label>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Categorias</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = Icons[CATEGORY_ICONS[cat] as keyof typeof Icons] as Icons.LucideIcon | undefined;
                const active = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                    )}
                  >
                    {Icon && <Icon size={13} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Distância máxima</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Qualquer', value: null },
                { label: '2 km', value: 2 },
                { label: '5 km', value: 5 },
                { label: '10 km', value: 10 },
                { label: '25 km', value: 25 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setFilters({ ...filters, maxDistance: opt.value })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                    filters.maxDistance === opt.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Preço</h3>
            <div className="flex gap-2">
              {[
                { label: 'Todos', value: 'all' },
                { label: 'Gratuitos', value: 'free' },
                { label: 'Pagos', value: 'paid' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters({ ...filters, priceFilter: opt.value as FilterState['priceFilter'] })}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    filters.priceFilter === opt.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Modalidade</h3>
            <div className="flex gap-2">
              {[
                { label: 'Todos', value: 'all' },
                { label: 'Presenciais', value: 'in-person' },
                { label: 'Virtuais', value: 'virtual' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters({ ...filters, modeFilter: opt.value as FilterState['modeFilter'] })}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    filters.modeFilter === opt.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-3 text-center text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">{eventCount}</span>{' '}
            {eventCount === 1 ? 'evento encontrado' : 'eventos encontrados'}
          </div>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="w-full rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            Limpar filtros
          </button>
        </div>
      </aside>
    </>
  );
}
