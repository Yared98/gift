import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { User, WhitelistEntry } from '../types';

interface SuperAdminUsersTabProps {
  authToken: string;
}

export const SuperAdminUsersTab: React.FC<SuperAdminUsersTabProps> = ({ authToken }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, [authToken]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, whiteRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/admin/whitelist', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.users || []);
      }
      if (whiteRes.ok) {
        const w = await whiteRes.json();
        setWhitelist(w.whitelist || []);
      }
    } catch {
      showMessage('Erro ao carregar dados de usuários e whitelist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleApprove = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        showMessage('Usuário aprovado com sucesso!', 'success');
        loadData();
      }
    } catch {
      showMessage('Erro ao aprovar usuário.', 'error');
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm('Deseja recusar a solicitação deste usuário?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        showMessage('Solicitação recusada.', 'success');
        loadData();
      }
    } catch {
      showMessage('Erro ao recusar usuário.', 'error');
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showMessage('Insira um e-mail válido.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase() }),
      });

      if (res.ok) {
        setNewEmail('');
        showMessage('E-mail adicionado à lista pré-aprovada!', 'success');
        loadData();
      }
    } catch {
      showMessage('Erro ao adicionar e-mail à whitelist.', 'error');
    }
  };

  const handleRemoveWhitelist = async (email: string) => {
    if (!confirm(`Remover ${email} da lista pré-aprovada?`)) return;
    try {
      const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        showMessage('E-mail removido da whitelist.', 'success');
        loadData();
      }
    } catch {
      showMessage('Erro ao remover e-mail da whitelist.', 'error');
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'PENDING');
  const activeUsers = users.filter((u) => u.status === 'APPROVED');

  return (
    <div className="space-y-8">
      {/* Toast message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Pending Approval Requests */}
      <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-paper space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-on-surface flex items-center gap-2">
                <span>Solicitações de Acesso Pendentes</span>
                {pendingUsers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                    {pendingUsers.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Amigos que fizeram login com Google e aguardam sua aprovação para criar listas.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-on-surface-variant">Carregando...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="py-8 text-center bg-surface-low rounded-xl border border-dashed border-border text-xs text-on-surface-variant">
            Nenhuma solicitação pendente no momento. Todas as solicitações foram avaliadas!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-surface-low border border-border flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-on-surface truncate">{u.name}</h4>
                    <p className="text-xs text-on-surface-variant font-mono truncate">{u.email}</p>
                    <span className="text-[10px] text-on-surface-variant/70">
                      Solicitado em: {u.created_at.split('T')[0]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <button
                    onClick={() => handleApprove(u.id)}
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Aprovar Acesso</span>
                  </button>

                  <button
                    onClick={() => handleReject(u.id)}
                    className="px-3 h-9 bg-surface hover:bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Recusar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Whitelist of Pre-approved Emails */}
      <section className="bg-surface rounded-2xl p-4 sm:p-6 lg:p-8 border border-border shadow-paper space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-on-surface">
              Whitelist de Convidados Pré-aprovados
            </h3>
            <p className="text-xs text-on-surface-variant">
              E-mails nesta lista são liberados automaticamente ao fazerem login com Google (sem fila de aprovação).
            </p>
          </div>
        </div>

        {/* Add Email to Whitelist Form */}
        <form onSubmit={handleAddWhitelist} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="amigo@gmail.com..."
            className="flex-1 h-10 px-3 bg-surface-low border border-border rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-4 h-10 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover transition-all flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar E-mail</span>
          </button>
        </form>

        {/* Whitelist Items */}
        <div className="flex flex-wrap gap-2 pt-2">
          {whitelist.length === 0 ? (
            <span className="text-xs text-on-surface-variant italic">
              Nenhum e-mail pré-aprovado ainda. Adicione os e-mails dos amigos que você deseja autorizar com antecedência.
            </span>
          ) : (
            whitelist.map((w) => (
              <span
                key={w.email}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-low border border-border text-xs text-on-surface font-mono"
              >
                <span>{w.email}</span>
                <button
                  onClick={() => handleRemoveWhitelist(w.email)}
                  className="text-on-surface-variant hover:text-red-500"
                  title="Remover da whitelist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      {/* 3. Active Users Table */}
      <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-paper space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="p-2 rounded-xl bg-secondary-container text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-on-surface">
              Usuários Aprovados & Ativos ({activeUsers.length})
            </h3>
            <p className="text-xs text-on-surface-variant">
              Todos os amigos que possuem listas ativas na plataforma.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border overflow-x-auto">
          {activeUsers.map((u) => (
            <div
              key={u.id}
              className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-low/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif text-xs shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-on-surface truncate">{u.name}</h4>
                    {u.role === 'SUPER_ADMIN' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary text-white">
                        <Shield className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <a
                  href={`/u/${u.slug}?token=${u.share_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-container text-xs text-primary transition-colors"
                >
                  <span className="font-mono">/u/{u.slug}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {u.role !== 'SUPER_ADMIN' && (
                  <button
                    onClick={() => handleReject(u.id)}
                    className="p-1.5 text-on-surface-variant hover:text-red-500 rounded-lg hover:bg-red-500/10"
                    title="Suspender acesso deste usuário"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
