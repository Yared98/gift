import React, { useState } from 'react';
import { Clock, RefreshCw, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';
import type { User } from '../types';

interface PendingApprovalViewProps {
  user: User;
  onRefresh: () => void;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onRefresh,
  onLogout,
}) => {
  const [checking, setChecking] = useState(false);

  const handleCheckAgain = async () => {
    setChecking(true);
    await onRefresh();
    setTimeout(() => setChecking(false), 800);
  };

  const isRejected = user.status === 'REJECTED';

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-surface rounded-2xl border border-border shadow-paper text-center space-y-6">
      {/* Icon */}
      <div
        className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${
          isRejected
            ? 'bg-red-500/10 text-red-500'
            : 'bg-amber-500/10 text-amber-500 animate-pulse'
        }`}
      >
        {isRejected ? <ShieldAlert className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
      </div>

      {/* User Info Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-low border border-border text-xs text-on-surface">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="font-medium">{user.name}</span>
        <span className="text-on-surface-variant font-mono">({user.email})</span>
      </div>

      {/* Title & Description */}
      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-semibold text-on-surface">
          {isRejected ? 'Solicitação não aprovada' : 'Solicitação em Análise'}
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {isRejected
            ? 'Sua solicitação de acesso para criar listas não pôde ser aprovada no momento pelo administrador.'
            : 'Sua solicitação de cadastro com o Gmail foi recebida com sucesso! O administrador do sistema precisa aprovar seu acesso antes que você possa criar sua lista.'}
        </p>
      </div>

      {/* Steps indicator */}
      {!isRejected && (
        <div className="p-4 rounded-xl bg-surface-low border border-border text-left space-y-2 text-xs text-on-surface">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>1. Login com Google realizado</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
            <Clock className="w-4 h-4 shrink-0" />
            <span>2. Aguardando aprovação do administrador</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant/50">
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
              3
            </span>
            <span>Criação e compartilhamento da sua lista liberados</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {!isRejected && (
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className="w-full h-11 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificando...' : 'Verificar aprovação agora'}</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full h-10 rounded-xl border border-border text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-all flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair desta conta</span>
        </button>
      </div>
    </div>
  );
};
