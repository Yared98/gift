import React, { useState } from 'react';
import { ExternalLink, Tag, Sparkles, Gift as GiftIcon, Heart } from 'lucide-react';
import type { Gift } from '../types';

interface GiftCardProps {
  gift: Gift;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift }) => {
  const [imgError, setImgError] = useState(false);

  const formatPrice = (value: number) => {
    if (!value || value <= 0) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <article className="group flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shadow-paper hover:shadow-paper-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Product Image Container - Vitrine Style */}
      <div className="relative aspect-square bg-white dark:bg-zinc-900/60 p-4 flex items-center justify-center overflow-hidden border-b border-border">
        {gift.image_url && !imgError ? (
          <img
            src={gift.image_url}
            alt={gift.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 p-4">
            <GiftIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
            <span className="text-xs font-serif italic">Ideia de presente</span>
          </div>
        )}

        {/* Subtle Favorite Heart Icon (Only for Marked Items) */}
        {gift.priority === 1 && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-900/90 border border-border/80 shadow-sm backdrop-blur-md"
              title="Favorito"
              aria-label="Favorito"
            >
              <Heart className="w-4 h-4 fill-favorite text-favorite" />
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category Pill in Card Body for Guaranteed Contrast */}
          {gift.category && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-surface-low border border-border text-primary">
                <Tag className="w-3 h-3" />
                {gift.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {gift.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl font-semibold text-primary">
              {formatPrice(gift.price)}
            </span>
            {gift.price > 0 && (
              <span className="text-xs text-on-surface-variant font-medium">estimado</span>
            )}
          </div>

          {/* Custom Notes (Size, Color, etc.) with High-Contrast Box */}
          {gift.notes && (
            <div className="pt-1.5">
              <div className="inline-flex items-start gap-2 p-2.5 rounded-xl bg-surface-low border border-border text-xs w-full text-on-surface leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
                <span>
                  <strong className="text-on-surface font-semibold">Nota:</strong>{' '}
                  <span className="text-on-surface-variant">{gift.notes}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Direct Store Link */}
        <div className="pt-2">
          {gift.url ? (
            <a
              href={gift.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98] shadow-sm"
            >
              <span>Ver na Loja</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="w-full text-center py-2 text-xs text-on-surface-variant italic">
              Item sem link externo especificado
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
