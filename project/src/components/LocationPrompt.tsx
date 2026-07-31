import { MapPin, LocateFixed, X } from 'lucide-react';

interface LocationPromptProps {
  onAllow: () => void;
  onSkip: () => void;
  denied: boolean;
}

export default function LocationPrompt({ onAllow, onSkip, denied }: LocationPromptProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-slide-up px-2">
      <div className="hc-card relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <button
          onClick={onSkip}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100"
          title="Fechar"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <LocateFixed size={22} />
          </div>
          <div className="flex-1 pr-6">
            <h2 className="hc-text text-sm font-bold text-slate-900">Ative sua localização</h2>
            <p className="hc-muted mt-0.5 text-xs text-slate-500">
              Para mostrar as atividades culturais próximas de você. Sem necessidade de conta.
            </p>
            {denied && (
              <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-600">
                Permissão negada. Tente novamente ou continue sem localização.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={onAllow}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-600"
              >
                <MapPin size={14} /> Permitir
              </button>
              <button
                onClick={onSkip}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
