import { useState } from 'react';
import {
  Map,
  Heart,
  CalendarPlus,
  PlusCircle,
  HelpCircle,
  BarChart3,
  Accessibility,
  SlidersHorizontal,
  LogIn,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import type { ViewName } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  view: ViewName;
  setView: (v: ViewName) => void;
  onOpenFilters: () => void;
  onOpenAuth: () => void;
  activeFilterCount: number;
}

const NAV_ITEMS: { id: ViewName; label: string; icon: typeof Map; needsAuth?: boolean }[] = [
  { id: 'map', label: 'Mapa', icon: Map },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'create', label: 'Criar', icon: PlusCircle, needsAuth: true },
  { id: 'favorites', label: 'Favoritos', icon: Heart, needsAuth: true },
  { id: 'calendar', label: 'Agenda', icon: CalendarPlus, needsAuth: true },
  { id: 'data', label: 'Dados', icon: BarChart3 },
  { id: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
];

export default function Header({ view, setView, onOpenFilters, onOpenAuth, activeFilterCount }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.needsAuth && !user) {
      onOpenAuth();
      return;
    }
    setView(item.id);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button
            onClick={() => setView('map')}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <span className="hc-text hidden text-lg font-bold text-slate-900 sm:block">
              Cultura<span className="text-sky-500">Perto</span>
            </span>
          </button>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {view === 'map' && (
              <button
                onClick={onOpenFilters}
                className="relative flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <div className="text-xs text-slate-400">Conectado</div>
                  <div className="max-w-[140px] truncate text-sm font-medium text-slate-700">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  title="Sair"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
