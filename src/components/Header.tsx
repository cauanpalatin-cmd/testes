import { useState } from 'react';
import { Map, Heart, CalendarDays, CirclePlus as PlusCircle, Circle as HelpCircle, ChartBar as BarChart3, Accessibility, SlidersHorizontal, LogIn, LogOut, Search, X, ChevronDown } from 'lucide-react';
import type { ViewName } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  view: ViewName;
  setView: (v: ViewName) => void;
  onOpenFilters: () => void;
  onOpenAuth: () => void;
  activeFilterCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const NAV_ITEMS: { id: ViewName; label: string; icon: typeof Map; needsAuth?: boolean }[] = [
  { id: 'map', label: 'Mapa', icon: Map },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'create', label: 'Criar', icon: PlusCircle, needsAuth: true },
  { id: 'favorites', label: 'Salvos', icon: Heart, needsAuth: true },
  { id: 'calendar', label: 'Agenda', icon: CalendarDays, needsAuth: true },
  { id: 'data', label: 'Dados', icon: BarChart3 },
  { id: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
];

export default function Header({
  view,
  setView,
  onOpenFilters,
  onOpenAuth,
  activeFilterCount,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNav = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.needsAuth && !user) {
      onOpenAuth();
      return;
    }
    setView(item.id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-secondary)]/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4">
        <button onClick={() => setView('map')} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
            <Map size={20} />
          </div>
        </button>

        <div className="relative mx-auto hidden max-w-md flex-1 md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos, lugares, categorias..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
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
                    ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {view === 'map' && (
            <button
              onClick={onOpenFilters}
              className="relative flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] py-1.5 pl-2 pr-3 transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-xs font-bold text-white">
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <ChevronDown size={14} className="text-[var(--text-muted)]" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-2xl animate-scale-in">
                    <div className="border-b border-[var(--border)] px-3 py-2">
                      <div className="text-xs text-[var(--text-muted)]">Conectado</div>
                      <div className="truncate text-sm font-medium text-[var(--text-primary)]">{user.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-[var(--border)] px-4 py-2.5 md:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 lg:hidden">
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
                    active
                      ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
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
  );
}
