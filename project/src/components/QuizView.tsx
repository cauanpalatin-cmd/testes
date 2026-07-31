import { useState } from 'react';
import { HelpCircle, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
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
        <div className="hc-card overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-lg animate-scale-in">
          {result.images[0] && (
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img src={result.images[0]} alt={result.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-600">
              <Sparkles size={18} />
              Encontramos uma atividade que combina com você
            </div>
            <h2 className="hc-text text-2xl font-bold text-slate-900">{result.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {Icon && <Icon size={16} />}
              {result.category}
              {result.is_free ? <span className="text-emerald-600">• Gratuito</span> : <span className="text-amber-600">• Pago</span>}
            </div>
            <p className="hc-muted mt-3 text-slate-600">{result.description}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => onSelectEvent(result.id)}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                Ver atividade <ArrowRight size={16} />
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
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
      <div className="hc-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-600">
          <HelpCircle size={18} />
          Quiz cultural
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h2 className="hc-text text-xl font-bold text-slate-900">{q.text}</h2>
        <div className="mt-5 space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(q.id, opt.label)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition-all hover:border-sky-300 hover:bg-sky-50'
              )}
            >
              {opt.label}
              <ArrowRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
        <div className="mt-5 text-center text-xs text-slate-400">
          Pergunta {step + 1} de {QUESTIONS.length}
        </div>
      </div>
    </div>
  );
}
