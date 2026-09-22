import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ShieldCheck, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import type { User } from '../types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDevSimulator, setShowDevSimulator] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '505681709545-koqgstp53tb9c4oviddsqg34m8auhhtg.apps.googleusercontent.com';

  const isDevEnvironment =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('dev=true')));

  useEffect(() => {
    if (!isOpen) return;

    const setupGoogle = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) return;
            setIsLoading(true);
            setErrorMsg('');

            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              });

              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Erro ao autenticar com o Google.');
              }

              const data = await res.json();
              localStorage.setItem('wishlist_auth_token', data.token);
              onSuccess(data.user, data.token);
              onClose();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Erro na autenticação com o Google';
              setErrorMsg(msg);
            } finally {
              setIsLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
            locale: 'pt-BR',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          setupGoogle();
        }
      }, 300);
      const timeout = setTimeout(() => clearInterval(interval), 4000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const handleLoginWithEmail = async (email: string, name?: string) => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor, insira um e-mail válido.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name ? name.trim() : email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao autenticar com o servidor.');
      }

      const data = await res.json();
      localStorage.setItem('wishlist_auth_token', data.token);
      onSuccess(data.user, data.token);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na autenticação';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAccounts = [
    { label: '👑 Entrar como Super-Admin (mathyared)', email: 'mathyared@gmail.com', name: 'Yared' },
    { label: '👑 Admin Local (Mock)', email: 'admin@local', name: 'Administrador' },
    { label: '👤 Amigo 1 (Lucas Silva - Pendente)', email: 'lucas.silva@gmail.com', name: 'Lucas Silva' },
    { label: '👤 Amiga 2 (Camila Lima - Pendente)', email: 'camila.lima@gmail.com', name: 'Camila Lima' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-paper space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-on-surface">
            Acessar ou Solicitar Lista
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Faça login com sua conta Google para gerenciar sua lista ou solicitar acesso para criar sua própria wishlist.
          </p>
        </div>

        {/* Google Sign-in Official Container */}
        <div className="flex flex-col items-center justify-center min-h-[52px] py-1">
          <div ref={googleBtnRef} className="flex justify-center w-full min-h-[44px]" />
          
          {!gisLoaded && (
            <button
              onClick={() => handleLoginWithEmail(emailInput || 'meu.email@gmail.com', nameInput)}
              disabled={isLoading}
              className="w-full h-11 bg-surface-low border border-border hover:border-primary/40 rounded-xl font-medium text-xs sm:text-sm text-on-surface flex items-center justify-center gap-3 transition-all hover:bg-surface-container active:scale-[0.98] shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Conectando...' : 'Entrar com Google (Gmail)'}</span>
            </button>
          )}

          {isLoading && (
            <p className="text-xs text-primary font-medium animate-pulse mt-2">
              Validando credenciais com o Google...
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Dev Simulator / Custom Email Accordion - Exibido EXCLUSIVAMENTE em ambiente local de desenvolvimento */}
        {isDevEnvironment && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowDevSimulator(!showDevSimulator)}
              className="w-full flex items-center justify-between text-xs text-on-surface-variant hover:text-on-surface py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                <span>Simulador Dev & Testes Locais</span>
              </span>
              {showDevSimulator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

          {showDevSimulator && (
            <div className="pt-3 space-y-3 animate-in fade-in duration-150">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLoginWithEmail(emailInput, nameInput);
                }}
                className="space-y-2.5"
              >
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Seu nome (ex: Lucas Silva)"
                  className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isLoading || !emailInput}
                  className="w-full h-10 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
                >
                  Continuar com este e-mail
                </button>
              </form>

              {/* Quick test accounts */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
                  Contas de teste rápido:
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleLoginWithEmail(acc.email, acc.name)}
                      className="text-left px-3 py-1.5 rounded-lg bg-surface-low hover:bg-surface-container border border-border/60 text-xs text-on-surface flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">{acc.label}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{acc.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* Explanation footnote */}
        <div className="text-center pt-2 text-[11px] text-on-surface-variant/80 leading-relaxed border-t border-border/50">
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-primary" />
          E-mails pré-aprovados na Whitelist entram direto. Novos e-mails passam por aprovação de 1 clique do administrador.
        </div>
      </div>
    </div>
  );
};
