import React from 'react';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Tag,
  ArrowRight,
  Gift,
  Lock,
  Compass,
  CheckCircle2,
  ShoppingBag,
  Palette,
  Send,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-12">
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-sm text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
          <span>O Cantinho Privado para suas Ideias de Presentes</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-on-surface tracking-tight leading-[1.15]">
          Presentes que você{' '}
          <span className="font-cursive text-5xl sm:text-6xl md:text-7xl font-normal text-primary inline-block transform -rotate-1 px-1">
            realmente ama
          </span>
          , sem palpites errados.
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Crie uma lista de desejos elegante com fotos, links diretos, tamanhos de roupa e suas sagas e músicas favoritas. Compartilhe apenas com amigos e família através de um link secreto e seguro.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-medium text-sm sm:text-base hover:bg-primary-hover active:scale-[0.98] transition-all shadow-paper hover:shadow-paper-hover flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-accent-amber" />
            <span>Criar ou Acessar Minha Lista</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-on-surface-variant/80">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" />
            Não indexado no Google (noindex)
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            100% privado via link com token
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-accent-amber" />
            Feito para seu círculo próximo
          </span>
        </div>
      </section>

      {/* 2. Visual Preview Demonstration */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-paper space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Exemplo Real da Experiência</span>
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mt-1">
                Como seus amigos visualizam a sua lista
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-low border border-border text-xs text-on-surface-variant font-medium self-start sm:self-auto">
              <Lock className="w-3 h-3 text-primary" />
              <span>/u/seu-nome?token=secreto</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Mock Gift Card */}
            <div className="flex flex-col bg-surface-low rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-surface-container overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"
                  alt="Exemplo Livro"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-900/90 border border-border/80 shadow-sm backdrop-blur-md"
                    title="Favorito"
                  >
                    <Heart className="w-4 h-4 fill-favorite text-favorite" />
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-surface border border-border text-primary">
                    <Tag className="w-2.5 h-2.5" />
                    Livros & Colecionáveis
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-on-surface">
                    Edição Especial Capa Dura: O Senhor dos Anéis
                  </h3>
                  <div className="font-serif text-xl font-semibold text-primary">
                    R$ 189,90 <span className="text-xs text-on-surface-variant font-sans font-normal">estimado</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface border border-border text-xs text-on-surface flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica de compra:</strong> Versão traduzida com ilustrações do Alan Lee.
                  </span>
                </div>
              </div>
            </div>

            {/* Mock Inspirations Card */}
            <div className="flex flex-col justify-between bg-surface-low rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-xs">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-on-surface">
                      Gostos, Universos & Medidas
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Para lembrancinhas artesanais ou criativas fora da lista
                    </p>
                  </div>
                </div>

                {/* Tags preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Sagas e Universos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['O Senhor dos Anéis', 'Studio Ghibli', 'Star Wars', 'Duna'].map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-xs bg-surface border border-border text-on-surface font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Medidas e Preferências
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Camiseta M', 'Calçado 41', 'Cores: Verde musgo, Preto', 'Café especial'].map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-xs bg-surface border border-border text-on-surface font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border text-xs text-on-surface flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Seus amigos nunca mais vão precisar perguntar seu tamanho ou gosto!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Connected Horizontal Flow ("Como Funciona") */}
      <section className="max-w-5xl mx-auto px-4 space-y-12 sm:space-y-14">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Fluxo Simples & Afetivo
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-on-surface">
            Como funciona em 3 passos
          </h2>
          <p className="text-sm text-on-surface-variant">
            Sem burocracia, sem cadastros infinitos: do link da loja ao carinho dos seus amigos.
          </p>
        </div>

        {/* Timeline Flow Container */}
        <div className="relative">
          {/* Connecting line behind steps on desktop */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 group">
              {/* Icon Circle */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-primary/30 shadow-paper flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary group-hover:shadow-paper-hover transition-all duration-300">
                  <ShoppingBag className="w-8 h-8 stroke-[1.6]" />
                </div>
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-[11px] font-serif font-bold text-primary shadow-xs">
                  01
                </span>
              </div>

              {/* Text */}
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-on-surface group-hover:text-primary transition-colors">
                  Cole seus desejos
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                  Viu algo que gostou em qualquer loja? Cole o link e o sistema busca a foto, título e valor estimado na hora.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 group">
              {/* Icon Circle */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-accent-amber/40 shadow-paper flex items-center justify-center text-accent-amber group-hover:scale-105 group-hover:border-accent-amber group-hover:shadow-paper-hover transition-all duration-300">
                  <Palette className="w-8 h-8 stroke-[1.6]" />
                </div>
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-[11px] font-serif font-bold text-accent-amber shadow-xs">
                  02
                </span>
              </div>

              {/* Text */}
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-on-surface group-hover:text-accent-amber transition-colors">
                  Revele seus gostos
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                  Compartilhe suas sagas, bandas favoritas, jogos e medidas para quem prefere dar presentes artesanais ou lembranças afetivas.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 group">
              {/* Icon Circle */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-primary/30 shadow-paper flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary group-hover:shadow-paper-hover transition-all duration-300">
                  <Send className="w-8 h-8 stroke-[1.6] translate-x-0.5 -translate-y-0.5" />
                </div>
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-[11px] font-serif font-bold text-primary shadow-xs">
                  03
                </span>
              </div>

              {/* Text */}
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-on-surface group-hover:text-primary transition-colors">
                  Compartilhe com afeto
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                  Envie seu link com token secreto somente para quem você quer convidar. Blindado contra o Google, sem anúncios e sem curiosos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Privacy & Circle Philosophy Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-surface-low rounded-3xl border border-border p-6 sm:p-10 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border text-primary mx-auto flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-on-surface">
              Um espaço privado, feito para amigos
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              O sistema não tem anúncios, não vende dados e protege seus desejos com cabeçalhos estritos contra indexação de busca. Novos membros passam por aprovação de 1 clique ou entram direto se você pré-aprovar na Whitelist.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 rounded-xl bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-hover transition-all shadow-sm inline-flex items-center gap-2 active:scale-[0.98]"
            >
              <Gift className="w-4 h-4" />
              <span>Acessar com o Google</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
