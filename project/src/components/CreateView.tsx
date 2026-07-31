import { useState } from 'react';
import { PlusCircle, ImagePlus, X, Globe, MapPin, Check } from 'lucide-react';
import type { EventCategory } from '@/types';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface CreateViewProps {
  onCreated: () => void;
}

export default function CreateView({ onCreated }: CreateViewProps) {
  const { user } = useAuth();
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
          <PlusCircle size={24} />
        </div>
        <div>
          <h1 className="hc-text text-2xl font-bold text-slate-900">Cadastrar atividade</h1>
          <p className="hc-muted text-sm text-slate-500">Compartilhe um evento cultural com a comunidade</p>
        </div>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700 animate-slide-up">
          <Check size={20} />
          <span className="text-sm font-medium">
            Atividade enviada! Ela passará por uma aprovação rápida e aparecerá no mapa.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="hc-card space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Nome do evento *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex.: Festival de Música Independente"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Descrição *</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Conte um pouco sobre a atividade..."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Categoria *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = Icons[CATEGORY_ICONS[cat] as keyof typeof Icons] as Icons.LucideIcon | undefined;
              const active = form.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                    active ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {Icon && <Icon size={13} />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Organizador *</label>
          <input
            required
            value={form.organizer_name}
            onChange={(e) => setForm({ ...form, organizer_name: e.target.value })}
            placeholder="Nome do responsável ou grupo"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Mode toggle */}
        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Modalidade</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_virtual: false })}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all',
                !form.is_virtual ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-200 text-slate-600'
              )}
            >
              <MapPin size={16} /> Presencial
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_virtual: true })}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all',
                form.is_virtual ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-200 text-slate-600'
              )}
            >
              <Globe size={16} /> Virtual
            </button>
          </div>
        </div>

        {form.is_virtual ? (
          <div>
            <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Link da transmissão</label>
            <input
              value={form.virtual_link}
              onChange={(e) => setForm({ ...form, virtual_link: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Endereço</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Latitude</label>
                <input
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="-23.55"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Longitude</label>
                <input
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="-46.63"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
          </>
        )}

        {/* Date/time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Data de início *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Horário de início *</label>
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Data de fim</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Horário de fim</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Entrada</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_free: true })}
              className={cn(
                'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all',
                form.is_free ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-600'
              )}
            >
              Gratuito
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_free: false })}
              className={cn(
                'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all',
                !form.is_free ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-600'
              )}
            >
              Pago
            </button>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Imagens (URLs)</label>
          <div className="flex gap-2">
            <input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={addImage}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ImagePlus size={16} /> Adicionar
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="hc-text mb-1.5 block text-sm font-medium text-slate-700">Como participar</label>
          <textarea
            value={form.participation_info}
            onChange={(e) => setForm({ ...form, participation_info: e.target.value })}
            placeholder="Instruções para participar..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Cadastrar atividade'}
        </button>
        <p className="text-center text-xs text-slate-400">
          Eventos novos passam por aprovação rápida para evitar spam.
        </p>
      </form>
    </div>
  );
}
