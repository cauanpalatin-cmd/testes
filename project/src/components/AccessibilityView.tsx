import { Accessibility, Eye, Type, Volume2, Contrast, EyeOff } from 'lucide-react';
import type * as Icons from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { cn } from '@/lib/utils';

export default function AccessibilityView() {
  const { highContrast, setHighContrast, colorblind, setColorblind, fontSize, setFontSize, audioDescriptions, setAudioDescriptions } = useAccessibility();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
          <Accessibility size={24} />
        </div>
        <div>
          <h1 className="hc-text text-2xl font-bold text-slate-900">Acessibilidade</h1>
          <p className="hc-muted text-sm text-slate-500">Ajuste a plataforma para suas necessidades</p>
        </div>
      </div>

      <div className="hc-card space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* High contrast */}
        <Row icon={Contrast} title="Alto contraste" desc="Aumenta o contraste das cores para melhor legibilidade">
          <Toggle on={highContrast} onToggle={() => setHighContrast(!highContrast)} />
        </Row>

        <Divider />

        {/* Colorblind */}
        <div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Eye size={18} />
            </div>
            <div className="flex-1">
              <div className="hc-text text-sm font-semibold text-slate-800">Filtro para daltonismo</div>
              <div className="hc-muted text-xs text-slate-500">Ajusta cores para diferentes tipos de daltonismo</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Nenhum', value: 'none' },
              { label: 'Protanopia', value: 'protanopia' },
              { label: 'Deuteranopia', value: 'deuteranopia' },
              { label: 'Tritanopia', value: 'tritanopia' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setColorblind(opt.value as typeof colorblind)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-medium transition-all',
                  colorblind === opt.value
                    ? 'border-sky-500 bg-sky-50 text-sky-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Font size */}
        <div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Type size={18} />
            </div>
            <div className="flex-1">
              <div className="hc-text text-sm font-semibold text-slate-800">Tamanho da fonte</div>
              <div className="hc-muted text-xs text-slate-500">Aumente o texto para facilitar a leitura</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[
              { label: 'Pequena', value: 'sm', sample: 'A' },
              { label: 'Média', value: 'md', sample: 'A' },
              { label: 'Grande', value: 'lg', sample: 'A' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value as typeof fontSize)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border py-3 transition-all',
                  fontSize === opt.value
                    ? 'border-sky-500 bg-sky-50 text-sky-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                <span
                  className={cn(
                    'font-bold',
                    opt.value === 'sm' && 'text-base',
                    opt.value === 'md' && 'text-xl',
                    opt.value === 'lg' && 'text-2xl'
                  )}
                >
                  {opt.sample}
                </span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Audio descriptions */}
        <Row icon={Volume2} title="Descrição em áudio dos cards" desc="Prepara a plataforma para leitura por voz dos cards">
          <Toggle on={audioDescriptions} onToggle={() => setAudioDescriptions(!audioDescriptions)} />
        </Row>

        <Divider />

        {/* Screen reader note */}
        <Row icon={EyeOff} title="Compatibilidade com leitores de tela" desc="A plataforma é compatível com leitores de tela nativos">
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">Ativo</span>
        </Row>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        As preferências são aplicadas imediatamente e permanecem durante sua visita.
      </p>
    </div>
  );
}

function Row({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: Icons.LucideIcon;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="hc-text text-sm font-semibold text-slate-800">{title}</div>
        <div className="hc-muted text-xs text-slate-500">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100" />;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        on ? 'bg-sky-500' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          on ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
