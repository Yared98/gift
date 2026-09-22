import React from 'react';
import { Film, Music, Gamepad2, Shirt, Sparkles, HeartHandshake } from 'lucide-react';
import type { InterestCategory } from '../types';

interface InspirationsSectionProps {
  interests: InterestCategory[];
}

export const InspirationsSection: React.FC<InspirationsSectionProps> = ({ interests }) => {
  if (!interests || interests.length === 0) return null;

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'film':
        return <Film className="w-5 h-5 text-primary" />;
      case 'music':
        return <Music className="w-5 h-5 text-primary" />;
      case 'gamepad2':
      case 'games':
        return <Gamepad2 className="w-5 h-5 text-primary" />;
      case 'shirt':
      case 'sizes':
        return <Shirt className="w-5 h-5 text-primary" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const formatCategoryTitle = (title: string) => {
    return title.replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\s]+/u, '').trim();
  };

  return (
    <section id="inspiracoes" className="scroll-mt-24 space-y-8 pt-6">
      {/* Section Header */}
      <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border shadow-paper relative overflow-hidden transition-colors duration-200">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-low border border-border text-primary text-xs font-semibold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Inspirações & Universo Pessoal</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-on-surface font-medium tracking-tight">
            Ideias para lembranças criativas e fora da lista
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Se você preferir presentear com algo diferente, criativo ou afetivo (como livros, pôsteres, vinis, camisetas temáticas ou lembrancinhas artesanais), aqui estão as obras, artistas e medidas que você sempre acerta comigo:
          </p>
        </div>
      </div>

      {/* Grid of Interests Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interests.map((cat) => (
          <article
            key={cat.id}
            className="flex flex-col justify-between bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-paper hover:shadow-paper-hover transition-all duration-300"
          >
            <div className="space-y-4">
              {/* Card Title & Icon */}
              <div className="flex items-center gap-3 pb-3 border-b border-border/70">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {getIcon(cat.icon)}
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-on-surface">
                  {formatCategoryTitle(cat.title)}
                </h3>
              </div>

              {/* Tags Cloud */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Favoritos & Referências
                </span>
                <div className="flex flex-wrap gap-2">
                  {cat.tags && cat.tags.length > 0 ? (
                    cat.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-low border border-border text-on-surface hover:border-primary/40 transition-colors shadow-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-on-surface-variant italic">
                      Nenhum item adicionado ainda.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes / Tips Footer */}
            {cat.notes && (
              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="inline-flex items-start gap-2 p-3 rounded-xl bg-surface-low border border-border text-xs text-on-surface leading-relaxed w-full">
                  <Sparkles className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-on-surface">Dica do anfitrião:</strong>{' '}
                    <span className="text-on-surface-variant">{cat.notes}</span>
                  </span>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
