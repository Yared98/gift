import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface ShareTokenGateProps {
  onApplyToken: (token: string) => void;
  onOpenAdmin: () => void;
}

export const ShareTokenGate: React.FC<ShareTokenGateProps> = ({
  onApplyToken,
  onOpenAdmin,
}) => {
  const [tokenInput, setTokenInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onApplyToken(tokenInput.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-surface rounded-2xl border border-border shadow-paper text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-on-surface">
          Esta Lista é Privada
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Para visualizar os presentes sugeridos, acesse pelo link exclusivo que foi compartilhado com você, ou insira o código de acesso abaixo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Código de acesso da lista..."
            className="w-full h-11 px-4 bg-surface-low border border-border rounded-xl text-sm text-center text-on-surface focus:outline-none focus:border-primary font-mono"
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>Acessar Lista</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-border">
        <button
          type="button"
          onClick={onOpenAdmin}
          className="text-xs text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>É o dono da lista? Acessar painel admin</span>
        </button>
      </div>
    </div>
  );
};
