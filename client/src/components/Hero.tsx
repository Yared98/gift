import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  ownerName: string;
  totalItems: number;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ownerName,
  totalItems,
}) => {
  return (
    <section className="relative bg-surface rounded-2xl border border-border p-6 sm:p-10 lg:p-12 shadow-paper overflow-hidden transition-colors duration-200">
      <div className="max-w-3xl relative z-10 space-y-4">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-low border border-border text-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curadoria Pessoal · Desejos & Ideias</span>
        </div>

        {/* Title / Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight leading-tight">
          {title && title !== 'Minha Lista de Presentes' ? (
            title
          ) : (
            <>
              Ideias de presentes para quem quer me{' '}
              <span className="font-cursive text-4xl sm:text-5xl lg:text-6xl text-primary font-normal inline-block transform -rotate-1">
                mimar com carinho
              </span>
            </>
          )}
        </h2>

        {/* Subtitle / Note */}
        <p className="font-sans text-base sm:text-lg text-on-surface-variant leading-relaxed">
          {subtitle ||
            'Esta é uma seleção de coisas que admiro, preciso ou venho namorando há algum tempo. Fique à vontade para navegar, consultar detalhes específicos e comprar diretamente onde preferir.'}
        </p>

        {/* Metadata stats */}
        <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-on-surface-variant text-xs sm:text-sm border-t border-border/60">
          {ownerName && (
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-accent-amber" />
              <span>Lista de <strong>{ownerName}</strong></span>
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span><strong>{totalItems}</strong> {totalItems === 1 ? 'item desejado' : 'itens desejados'}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
