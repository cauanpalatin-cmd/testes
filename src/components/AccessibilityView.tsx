import { Accessibility, Eye, Type, Volume2, Contrast, EyeOff } from 'lucide-react';
import type * as Icons from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { cn } from '@/lib/utils';

export default function AccessibilityView() {
  const { highContrast, setHighContrast, colorblind, setColorblind, fontSize, setFontSize, audioDescriptions, setAudioDescriptions } = useAccessibility();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
          <Accessibility size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Acessibilidade</h1>
          <p className="text-sm text-[var(--text-secondary)]">Ajuste a plataforma para suas necessidades</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <Row icon={Contrast} title="Alto contraste" desc="Aumenta o contraste das cores para melhor legibilidade">
          <Toggle on={highContrast} onToggle={() => setHighContrast(!highContrast)} />
        </Row>

        <Divider />

        <div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
              <Eye size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Filtro para daltonismo</div>
              <div className="text-xs text-[var(--text-muted)]">Ajusta cores para diferentes tipos de daltonismo</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Nenhum', value: 'none' },
              { label: 'Protanopia', value: 'protanopia' },
              { label: 'Deuteranopia', value: 'deuteranopia' },
              { label: 'Tritanopia', value: 'tritanopia' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setColorblind(opt.value as typeof colorblind)}
                className={cn('rounded-lg border py-2 text-xs font-medium transition-all', colorblind === opt.value ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]')}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
              <Type size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Tamanho da fonte</div>
              <div className="text-xs text-[var(--text-muted)]">Aumente o texto para facilitar a leitura</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[
              { label: 'Pequena', value: 'sm' },
              { label: 'Média', value: 'md' },
              { label: 'Grande', value: 'lg' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setFontSize(opt.value as typeof fontSize)}
                className={cn('flex flex-1 flex-col items-center gap-1 rounded-lg border py-3 transition-all', fontSize === opt.value ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]')}>
                <span className={cn('font-bold', opt.value === 'sm' && 'text-base', opt.value === 'md' && 'text-xl', opt.value === 'lg' && 'text-2xl')}>A</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <Row icon={Volume2} title="Descrição em áudio dos cards" desc="Prepara a plataforma para leitura por voz dos cards">
          <Toggle on={audioDescriptions} onToggle={() => setAudioDescriptions(!audioDescriptions)} />
        </Row>

        <Divider />

        <Row icon={EyeOff} title="Compatibilidade com leitores de tela" desc="A plataforma é compatível com leitores de tela nativos">
          <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">Ativo</span>
        </Row>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">As preferências são aplicadas imediatamente e permanecem durante sua visita.</p>
    </div>
  );
}

function Row({ icon: Icon, title, desc, children }: { icon: Icons.LucideIcon; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
        <div className="text-xs text-[var(--text-muted)]">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[var(--border)]" />;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );
}
