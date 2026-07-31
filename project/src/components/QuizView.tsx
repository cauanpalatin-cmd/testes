import { useState } from 'react';
import { Circle as HelpCircle, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import type { CulturalEvent, EventCategory } from '@/types';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizViewProps {
  events: CulturalEvent[];
  favoriteCategories: EventCategory[];
  participatedCategories: EventCategory[];
  onSelectEvent: (id: string) => void;
}

const QUESTIONS = [
  {
    id: 'vibe',
    text: 'O que mais combina com você num final de semana?',
    options: [
      { label: 'Música ao vivo', cats: ['Música'] },
      { label: 'Uma boa peça de teatro', cats: ['Teatro'] },
      { label: 'Experimentar comidas novas', cats: ['Gastronomia'] },
      { label: 'Mergulhar num livro ou debate', cats: ['Literatura'] },
    ],
  },
  {
    id: 'style',
    text: 'Que tipo de cultura te move?',
    options: [
      { label: 'Dança e movimento', cats: ['Dança'] },
      { label: 'Artes visuais e exposições', cats: ['Artes Visuais'] },
      { label: 'Cultura geek e quadrinhos', cats: ['Cultura Geek'] },
      { label: 'Tecnologia e inovação', cats: ['Tecnologia'] },
    ],
  },
  {
    id: 'craft',
    text: 'Você prefere atividades mais...',
    options: [
      { label: 'Manuais e artesanais', cats: ['Artesanato'] },
      { label: 'Cinematográficas', cats: ['Cinema'] },
      { label: 'Musicais', cats: ['Música'] },
      { label: 'Gastronômicas', cats: ['Gastronomia'] },
    ],
  },
  {
    id: 'format',
    text: 'Como você gosta de participar?',
    options: [
      { label: 'Eventos presenciais', cats: [] },
      { label: 'Atividades online', cats: [] },
      { label: 'Ao ar livre', cats: [] },
      { label: 'Em teatros e salas', cats: [] },
    ],
  },
];

export default function QuizView({
  events,
  favoriteCategories,
  participatedCategories,
  onSelectEvent,
}: QuizViewProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CulturalEvent | null>(null);

  const handleAnswer = (qId: string, optionLabel: string) => {
    const next = { ...answers, [qId]: optionLabel };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      computeResult(next);
    }
  };

  const computeResult = (allAnswers: Record<string, string>) => {
    const score: Record<string, number> = {};
    CATEGORIES.forEach((c) => (score[c] = 0));

    QUESTIONS.forEach((q) => {
      const chosen = q.options.find((o) => o.label === allAnswers[q.id]);
      chosen?.cats.forEach((c) => (score[c] = (score[c] ?? 0) + 2));
    });

    favoriteCategories.forEach((c) => (score[c] = (score[c] ?? 0) + 3));
    participatedCategories.forEach((c) => (score[c] = (score[c] ?? 0) + 2));

    const sortedCats = Object.entries(score).sort((a, b) => b[1] - a[1]);
    for (const [cat] of sortedCats) {
      const upcoming = events
        .filter((e) => e.status === 'active' && e.category === cat)
        .sort((a, b) => Math.abs(Date.now() - new Date(a.start_time).getTime()) - Math.abs(Date.now() - new Date(b.start_time).getTime()));
      if (upcoming.length > 0) {
        setResult(upcoming[0]);
        return;
      }
    }
    const fallback = events.find((e) => e.status === 'active');
    setResult(fallback ?? null);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    const Icon = Icons[CATEGORY_ICONS[result.category] as keyof typeof Icons] as Icons.LucideIcon | undefined;
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg animate-scale-in">
          {result.images[0] && (
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img src={result.images[0]} alt={result.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              <Sparkles size={18} />
              Encontramos uma atividade que combina com você
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{result.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
              {Icon && <Icon size={16} />}
              {result.category}
              {result.is_free ? <span className="text-emerald-400">• Gratuito</span> : <span className="text-amber-400">• Pago</span>}
            </div>
            <p className="mt-3 text-[var(--text-secondary)]">{result.description}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => onSelectEvent(result.id)} className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]">
                Ver atividade <ArrowRight size={16} />
              </button>
              <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]">
                <RotateCcw size={16} /> Refazer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
          <HelpCircle size={18} />
          Quiz cultural
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-primary)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{q.text}</h2>
        <div className="mt-5 space-y-3">
          {q.options.map((opt) => (
            <button key={opt.label} onClick={() => handleAnswer(q.id, opt.label)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3.5 text-left text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/10">
              {opt.label}
              <ArrowRight size={16} className="text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
        <div className="mt-5 text-center text-xs text-[var(--text-muted)]">Pergunta {step + 1} de {QUESTIONS.length}</div>
      </div>
    </div>
  );
}
