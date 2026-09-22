import React from 'react';
import {
  Smartphone,
  X,
  Share,
  PlusSquare,
  Sparkles,
  Download
} from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  if (!isOpen) return null;

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-on-surface">
                Instalar no Celular
              </h3>
              <p className="text-xs text-on-surface-variant">
                Adicione o app à sua tela inicial
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

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Features list */}
          <div className="p-4 rounded-2xl bg-surface-low border border-border space-y-2.5 text-xs text-on-surface">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-amber shrink-0" />
              <span><strong>Compartilhar direto:</strong> Envie produtos da Amazon e Mercado Livre para sua lista com 1 toque.</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary shrink-0" />
              <span><strong>Tela cheia:</strong> Navegação rápida sem barras de navegador como um app nativo.</span>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                Como instalar no iPhone (Safari):
              </h4>
              <div className="space-y-2.5 text-xs text-on-surface-variant">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    1. Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <div>
                    3. Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!
                  </div>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            /* Android / Desktop Native Prompt */
            <div className="space-y-3">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Clique no botão abaixo para adicionar o aplicativo à tela inicial do seu dispositivo.
              </p>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicativo</span>
              </button>
            </div>
          ) : (
            /* Fallback generic instructions */
            <div className="space-y-2 text-xs text-on-surface-variant">
              <p>
                Abra o menu do seu navegador (três pontinhos ⋮ ou botão de compartilhar) e selecione <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à Tela Inicial</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
