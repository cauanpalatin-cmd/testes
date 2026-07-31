import { useState } from 'react';
import { CirclePlus as PlusCircle, ImagePlus, X, Globe, MapPin, Check } from 'lucide-react';
import type { EventCategory } from '@/types';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface CreateViewProps {
  onCreated: () => void;
}

export default function CreateView({ onCreated }: CreateViewProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Música' as EventCategory,
    address: '',
    latitude: '',
    longitude: '',
    images: [] as string[],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    is_free: true,
    is_virtual: false,
    virtual_link: '',
    participation_info: '',
    organizer_name: '',
  });
  const [imageInput, setImageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addImage = () => {
    if (imageInput.trim() && form.images.length < 5) {
      setForm({ ...form, images: [...form.images, imageInput.trim()] });
      setImageInput('');
    }
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const startTime = new Date(`${form.startDate}T${form.startTime}`).toISOString();
    const endTime =
      form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}`).toISOString()
        : null;

    const { error } = await supabase.from('events').insert({
      title: form.title,
      description: form.description,
      category: form.category,
      address: form.is_virtual ? null : form.address || null,
      latitude: form.is_virtual ? null : form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.is_virtual ? null : form.longitude ? parseFloat(form.longitude) : null,
      images: form.images,
      start_time: startTime,
      end_time: endTime,
      is_free: form.is_free,
      is_virtual: form.is_virtual,
      virtual_link: form.is_virtual ? form.virtual_link || null : null,
      participation_info: form.participation_info || null,
      organizer_name: form.organizer_name,
      status: 'pending',
    });

    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onCreated();
        setSuccess(false);
        setForm({
          ...form,
          title: '',
          description: '',
          address: '',
          images: [],
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          virtual_link: '',
          participation_info: '',
          organizer_name: '',
        });
      }, 2000);
    }
  };

  const inputClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
          <PlusCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Cadastrar atividade</h1>
          <p className="text-sm text-[var(--text-secondary)]">Compartilhe um evento cultural com a comunidade</p>
        </div>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 animate-slide-up">
          <Check size={20} />
          <span className="text-sm font-medium">Atividade enviada! Ela passará por aprovação e aparecerá no mapa.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Nome do evento *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Festival de Música Independente" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Descrição *</label>
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Conte um pouco sobre a atividade..." rows={3} className={cn(inputClass, 'resize-none')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Categoria *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = Icons[CATEGORY_ICONS[cat] as keyof typeof Icons] as Icons.LucideIcon | undefined;
              const active = form.category === cat;
              return (
                <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                  className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all', active ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]')}>
                  {Icon && <Icon size={13} />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Organizador *</label>
          <input required value={form.organizer_name} onChange={(e) => setForm({ ...form, organizer_name: e.target.value })} placeholder="Nome do responsável ou grupo" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Modalidade</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, is_virtual: false })}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all', !form.is_virtual ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]')}>
              <MapPin size={16} /> Presencial
            </button>
            <button type="button" onClick={() => setForm({ ...form, is_virtual: true })}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all', form.is_virtual ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]')}>
              <Globe size={16} /> Virtual
            </button>
          </div>
        </div>

        {form.is_virtual ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Link da transmissão</label>
            <input value={form.virtual_link} onChange={(e) => setForm({ ...form, virtual_link: e.target.value })} placeholder="https://..." className={inputClass} />
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Endereço</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro, cidade" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Latitude</label>
                <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-23.55" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Longitude</label>
                <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-46.63" className={inputClass} />
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Data de início *</label>
            <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Horário de início *</label>
            <input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Data de fim</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Horário de fim</label>
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Entrada</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, is_free: true })}
              className={cn('flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all', form.is_free ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' : 'border-[var(--border)] text-[var(--text-secondary)]')}>
              Gratuito
            </button>
            <button type="button" onClick={() => setForm({ ...form, is_free: false })}
              className={cn('flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all', !form.is_free ? 'border-amber-500 bg-amber-500/15 text-amber-400' : 'border-[var(--border)] text-[var(--text-secondary)]')}>
              Pago
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Imagens (URLs)</label>
          <div className="flex gap-2">
            <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="https://..." className={inputClass} />
            <button type="button" onClick={addImage} className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
              <ImagePlus size={16} /> Adicionar
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Como participar</label>
          <textarea value={form.participation_info} onChange={(e) => setForm({ ...form, participation_info: e.target.value })} placeholder="Instruções para participar..." rows={2} className={cn(inputClass, 'resize-none')} />
        </div>

        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {submitting ? 'Enviando...' : 'Cadastrar atividade'}
        </button>
        <p className="text-center text-xs text-[var(--text-muted)]">Eventos novos passam por aprovação rápida para evitar spam.</p>
      </form>
    </div>
  );
}
