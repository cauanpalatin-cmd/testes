import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import type { CulturalEvent } from '@/types';
import { supabase } from '@/lib/supabase';

interface ChatAssistantProps {
  events: CulturalEvent[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Quais eventos gratuitos tem em agosto?',
  'Me recomenda algo para o fim de semana',
  'Tem show de rock na região?',
  'O que fazer com a família?',
];

export default function ChatAssistant({ events }: ChatAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          events: events.map((e) => ({
            title: e.title,
            category: e.category,
            description: e.description,
            start_time: e.start_time,
            address: e.address,
            is_free: e.is_free,
            organizer_name: e.organizer_name,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `Erro: ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Desculpe, não entendi. Pode repetir?' }]);
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Não consegui conectar agora. Tente novamente em instantes.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Abrir assistente"
      >
        <MessageCircle size={26} />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-white">
          AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--accent)] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <div>
            <p className="text-sm font-semibold">Assistente Cultural</p>
            <p className="text-[10px] text-white/80">Pergunte sobre eventos da região</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-lg p-1 transition-colors hover:bg-white/20">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10">
              <Bot size={24} className="text-[var(--accent)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Olá! Sou seu guia cultural.</p>
            <p className="text-xs text-[var(--text-secondary)]">Posso te ajudar a encontrar eventos, recomendar programas e tirar dúvidas sobre a agenda cultural da região.</p>
            <div className="mt-2 flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-white rounded-br-md'
                  : 'bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[var(--bg-hover)] px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Pergunte sobre eventos..."
            disabled={loading}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
