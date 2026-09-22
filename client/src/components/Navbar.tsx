import React, { useState } from 'react';
import { Lock, Share2, Sun, Moon, Check, LogIn, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { User } from '../types';

interface NavbarProps {
  title: string;
  isAdmin: boolean;
  isLandingPage?: boolean;
  currentUser: User | null;
  onToggleAdmin: () => void;
  onOpenAuth: () => void;
  shareUrl: string;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  isAdmin,
  isLandingPage = false,
  currentUser,
  onToggleAdmin,
  onOpenAuth,
  shareUrl,
  onOpenInstallModal,
  isStandalone = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-paper transition-colors duration-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex justify-between items-center h-20">
        {/* Brand & Privacy Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => {
              if (isAdmin) {
                onToggleAdmin();
              } else if (!isLandingPage) {
                window.location.href = '/';
              }
            }}
            className="text-left group"
          >
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-primary group-hover:opacity-90 transition-opacity">
              {!title || title === 'Minha Lista de Presentes' ? (
                <>
                  Minha Lista de{' '}
                  <span className="font-cursive text-3xl sm:text-4xl text-accent-amber font-normal inline-block transform -rotate-1">
                    Presentes
                  </span>
                </>
              ) : (
                title
              )}
            </h1>
          </button>
          
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-low border border-border text-on-surface-variant text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-primary" />
            {isLandingPage ? 'Espaço Privado' : 'Link Privado'}
          </span>
        </div>

        {/* Desktop Quick Nav Links */}
        {!isAdmin && !isLandingPage && (
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium">
            <a
              href="#presentes"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              🎁 Presentes
            </a>
            <a
              href="#inspiracoes"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              ✨ Gostos & Inspirações
            </a>
          </nav>
        )}

        {/* Actions: Theme Toggle, Share, Auth/Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-label="Alternar tema de cores"
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-surface-low border border-border text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2 text-xs font-medium"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-accent-amber" />
                <span className="hidden md:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-primary" />
                <span className="hidden md:inline">Escuro</span>
              </>
            )}
          </button>

          {/* Install App Button */}
          {!isStandalone && onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              title="Instalar aplicativo no celular"
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-surface-low border border-border text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* Copy Link Button */}
          {!isAdmin && !isLandingPage && (
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 bg-surface-low border border-border text-on-surface px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-surface-container transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-primary font-semibold">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar Link</span>
                </>
              )}
            </button>
          )}

          {/* If Logged In: Meu Painel / Voltar */}
          {currentUser ? (
            <button
              onClick={onToggleAdmin}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
                isAdmin
                  ? 'bg-surface-container text-on-surface hover:bg-border'
                  : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span>{isAdmin ? 'Ver Lista Pública' : 'Meu Painel'}</span>
            </button>
          ) : (
            /* If Not Logged In: Entrar com Google */
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar / Criar Lista</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
