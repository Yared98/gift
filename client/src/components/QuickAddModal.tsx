import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Check,
  RefreshCw,
  ExternalLink,
  Star,
  LogIn,
  AlertCircle
} from 'lucide-react';
import type { User, ScrapeResponse } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  rawSharedText: string;
  currentUser: User | null;
  authToken: string;
  onClose: () => void;
  onOpenAuthModal: () => void;
  onGiftAdded: () => void;
}

export const extractUrlFromText = (text: string): string => {
  if (!text) return '';
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : text.trim();
};

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  rawSharedText,
  currentUser,
  authToken,
  onClose,
  onOpenAuthModal,
  onGiftAdded,
}) => {
  const [productUrl, setProductUrl] = useState('');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<number>(2);
  const [category, setCategory] = useState('Tech & Games');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const standardCategories = [
    'Tech & Games',
    'Livros',
    'Casa & Café',
    'Vestuário',
    'Hobbies',
    'Outros',
  ];

  useEffect(() => {
    if (!isOpen || !rawSharedText) return;

    const extracted = extractUrlFromText(rawSharedText);
    setProductUrl(extracted);
    setSavedSuccess(false);
    setError('');

    if (extracted.startsWith('http://') || extracted.startsWith('https://')) {
      handleScrapeUrl(extracted);
    }
  }, [isOpen, rawSharedText]);

  const handleScrapeUrl = async (urlToScrape: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScrape }),
      });

      if (!res.ok) {
        throw new Error('Não foi possível extrair dados automaticamente.');
      }

      const data: ScrapeResponse = await res.json();
      if (data.title) setTitle(data.title);
      if (data.image_url) setImageUrl(data.image_url);
      if (data.price && data.price > 0) {
        setPrice(data.price.toFixed(2).replace('.', ','));
      }
    } catch (err) {
      console.warn('Scraping fallback:', err);
      setError('Não conseguimos carregar todos os dados automaticamente. Complete os campos abaixo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authToken || !currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!title.trim()) {
      setError('Por favor, informe o título do presente.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const parsedPrice = price ? parseFloat(price.replace(/\./g, '').replace(',', '.')) : 0.0;
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          url: productUrl.trim(),
          image_url: imageUrl.trim(),
          price: isNaN(parsedPrice) ? 0.0 : parsedPrice,
          priority,
          category,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao salvar presente.');
      }

      setSavedSuccess(true);
      onGiftAdded();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with pill handle on mobile */}
        <div className="pt-3 pb-2 px-5 sm:p-5 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-semibold text-on-surface">
                Adicionar Presente Compartilhado
              </h3>
              <p className="text-xs text-on-surface-variant line-clamp-1">
                Recebido via compartilhamento rápido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-low text-on-surface-variant flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm font-medium text-on-surface">
                Buscando informações do produto... ✨
              </p>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Identificando título, foto e preço da loja
              </p>
            </div>
          ) : savedSuccess ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-serif text-xl font-semibold text-on-surface">
                Adicionado com Sucesso!
              </h4>
              <p className="text-xs text-on-surface-variant">
                O produto já está na sua lista pessoal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Product Preview Card */}
              <div className="flex gap-3 p-3 bg-surface-low border border-border rounded-xl">
                <div className="w-20 h-20 rounded-lg bg-white dark:bg-zinc-900 border border-border shrink-0 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-contain p-1"
                      onError={() => setImageUrl('')}
                    />
                  ) : (
                    <span className="text-[10px] text-on-surface-variant/50">Sem foto</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-0.5">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Tênis Esportivo"
                      className="w-full px-2 py-1 bg-surface border border-border rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-primary">
                      {price ? `R$ ${price}` : 'Sem preço'}
                    </span>
                    {productUrl && (
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-on-surface-variant hover:text-primary flex items-center gap-0.5 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Ver loja</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-9 px-3 bg-surface-low border border-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
                    Prioridade
                  </label>
                  <div className="flex items-center gap-1.5 h-9 px-2 bg-surface-low border border-border rounded-lg">
                    {[1, 2, 3].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPriority(star)}
                        className="p-1 text-on-surface-variant hover:text-amber-500 transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= priority
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[10px] text-on-surface-variant ml-auto font-medium">
                      {priority === 3 ? 'Adoraria' : priority === 2 ? 'Gostaria' : 'Legal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-surface-low border border-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  {standardCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes / Observations */}
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Tamanho M, cor preta..."
                  className="w-full h-9 px-3 bg-surface-low border border-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {!currentUser ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-on-surface-variant flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-primary shrink-0" />
                      <span>Conecte-se com sua conta Google para salvar este produto na sua lista.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Keep product info in state/storage so user can resume
                        sessionStorage.setItem('pending_quick_add', JSON.stringify({
                          title, productUrl, imageUrl, price, priority, category, notes
                        }));
                        onOpenAuthModal();
                      }}
                      className="w-full h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Entrar com Google e Salvar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving || !title.trim()}
                    className="w-full h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Salvando na lista...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmar e Salvar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
