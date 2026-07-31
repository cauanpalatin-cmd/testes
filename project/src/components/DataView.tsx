import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  Gift,
  Radio,
  Calendar,
  Trophy,
} from 'lucide-react';
import type { CulturalEvent, EventCategory } from '@/types';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataViewProps {
  events: CulturalEvent[];
}

export default function DataView({ events }: DataViewProps) {
  const stats = useMemo(() => {
    const active = events.filter((e) => e.status === 'active');
    const now = new Date();

    const byCategory: Record<string, number> = {};
    active.forEach((e) => (byCategory[e.category] = (byCategory[e.category] ?? 0) + 1));
    const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    const byRegion: Record<string, number> = {};
    active.forEach((e) => {
      if (e.address) {
        const region = e.address.split('-').pop()?.trim() ?? e.address;
        byRegion[region] = (byRegion[region] ?? 0) + 1;
      }
    });
    const sortedRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1]);

    const freeCount = active.filter((e) => e.is_free).length;
    const paidCount = active.length - freeCount;

    const happeningNow = active.filter((e) => {
      const start = new Date(e.start_time);
      const end = e.end_time ? new Date(e.end_time) : new Date(start.getTime() + 2 * 3600 * 1000);
      return now >= start && now <= end;
    }).length;

    const virtualCount = active.filter((e) => e.is_virtual).length;

    const byMonth: Record<string, number> = {};
    active.forEach((e) => {
      const m = new Date(e.start_time).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      byMonth[m] = (byMonth[m] ?? 0) + 1;
    });
    const sortedMonths = Object.entries(byMonth).sort((a, b) => {
      const da = new Date(a[0] + ' 1');
      const db = new Date(b[0] + ' 1');
      return da.getTime() - db.getTime();
    });

    const aiCount = active.filter((e) => e.is_ai_generated).length;

    return {
      total: active.length,
      sortedCategories,
      sortedRegions,
      freeCount,
      paidCount,
      happeningNow,
      virtualCount,
      sortedMonths,
      aiCount,
      maxCat: Math.max(...sortedCategories.map((c) => c[1]), 1),
      maxRegion: Math.max(...sortedRegions.map((r) => r[1]), 1),
      maxMonth: Math.max(...sortedMonths.map((m) => m[1]), 1),
    };
  }, [events]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="hc-text text-2xl font-bold text-slate-900">Painel de dados</h1>
          <p className="hc-muted text-sm text-slate-500">Informações geradas a partir das atividades da plataforma</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Calendar} label="Total de eventos" value={stats.total} color="sky" />
        <StatCard icon={Gift} label="Gratuitos" value={stats.freeCount} color="emerald" />
        <StatCard icon={Radio} label="Acontecendo agora" value={stats.happeningNow} color="amber" />
        <StatCard icon={MapPin} label="Virtuais" value={stats.virtualCount} color="violet" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Categories */}
        <Panel title="Categorias mais populares" icon={Trophy}>
          <div className="space-y-2.5">
            {stats.sortedCategories.map(([cat, count]) => {
              const Icon = Icons[CATEGORY_ICONS[cat as EventCategory] as keyof typeof Icons] as Icons.LucideIcon | undefined;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="flex w-32 shrink-0 items-center gap-1.5 text-sm text-slate-600">
                    {Icon && <Icon size={14} />}
                    <span className="truncate">{cat}</span>
                  </div>
                  <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="flex h-full items-center justify-end rounded-full bg-sky-500 px-2 text-xs font-semibold text-white transition-all"
                      style={{ width: `${(count / stats.maxCat) * 100}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Regions */}
        <Panel title="Regiões com mais eventos" icon={MapPin}>
          {stats.sortedRegions.length === 0 ? (
            <p className="text-sm text-slate-400">Sem dados regionais disponíveis.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.sortedRegions.map(([region, count]) => (
                <div key={region} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 truncate text-sm text-slate-600">{region}</div>
                  <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="flex h-full items-center justify-end rounded-full bg-emerald-500 px-2 text-xs font-semibold text-white"
                      style={{ width: `${(count / stats.maxRegion) * 100}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {stats.sortedRegions.length > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              Regiões com pouca oferta cultural podem ser identificadas pela ausência nesta lista.
            </p>
          )}
        </Panel>

        {/* Free vs Paid */}
        <Panel title="Gratuitos vs. Pagos" icon={Gift}>
          <div className="flex items-center gap-4">
            <Donut free={stats.freeCount} paid={stats.paidCount} />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Gratuitos: <strong>{stats.freeCount}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-slate-600">Pagos: <strong>{stats.paidCount}</strong></span>
              </div>
              <div className="text-sm text-slate-500">
                {stats.total > 0 && Math.round((stats.freeCount / stats.total) * 100)}% gratuitos
              </div>
            </div>
          </div>
        </Panel>

        {/* Growth over time */}
        <Panel title="Crescimento ao longo do tempo" icon={TrendingUp}>
          <div className="flex h-32 items-end gap-2">
            {stats.sortedMonths.map(([month, count]) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-md bg-sky-400 transition-all"
                    style={{ height: `${(count / stats.maxMonth) * 100}%` }}
                    title={`${count} eventos`}
                  />
                </div>
                <span className="text-xs capitalize text-slate-500">{month}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-sky-500" />
          <span>
            <strong className="text-slate-700">{stats.aiCount}</strong> eventos foram descobertos automaticamente por IA em fontes públicas.
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: Icons.LucideIcon;
  label: string;
  value: number;
  color: 'sky' | 'emerald' | 'amber' | 'violet';
}) {
  const colors = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="hc-card rounded-2xl border border-slate-200 bg-white p-4">
      <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-lg', colors[color])}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: Icons.LucideIcon; children: React.ReactNode }) {
  return (
    <div className="hc-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="hc-text mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon size={16} className="text-slate-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Donut({ free, paid }: { free: number; paid: number }) {
  const total = free + paid || 1;
  const freePct = (free / total) * 100;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="shrink-0">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="14"
        strokeDasharray={`${(c * freePct) / 100} ${c}`}
        transform="rotate(-90 55 55)"
        strokeLinecap="round"
      />
      <text x="55" y="50" textAnchor="middle" className="fill-slate-900 text-lg font-bold">
        {total}
      </text>
      <text x="55" y="66" textAnchor="middle" className="fill-slate-400 text-xs">
        eventos
      </text>
    </svg>
  );
}
