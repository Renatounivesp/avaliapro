'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  MousePointer,
  Search,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Award
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  companyName: string | null;
  companySlug: string | null;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
}

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalCompanies: number;
    totalVisits: number;
    totalRevenue: number;
  };
  users: UserItem[];
}

export default function AdminDashboard({ stats, users: initialUsers }: AdminDashboardProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  
  // Ações administrativas loading states
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // 1. Alterna acesso vitalício
  const handleToggleLifetime = async (userId: string, currentExpiresAt: string | null) => {
    const isCurrentlyLifetime = currentExpiresAt ? new Date(currentExpiresAt).getFullYear() >= 2099 : false;
    const actionText = isCurrentlyLifetime ? 'remover o acesso vitalício de' : 'dar acesso vitalício para';

    if (!confirm(`Deseja realmente ${actionText} este usuário?`)) return;

    setActionId(userId);
    setError('');

    try {
      const response = await fetch('/api/admin/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, toggleLifetime: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar status vitalício.');
      }

      // Atualiza estado local
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const nextExpiresAt = isCurrentlyLifetime ? new Date().toISOString() : new Date('2099-12-31T23:59:59.000Z').toISOString();
            const nextStatus = isCurrentlyLifetime ? 'PENDING' : 'ACTIVE';
            return {
              ...u,
              subscriptionStatus: nextStatus,
              subscriptionExpiresAt: nextExpiresAt,
            };
          }
          return u;
        })
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  // 2. Alterna bloqueio do usuário
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionText = nextStatus === 'BLOCKED' ? 'bloquear' : 'desbloquear';
    
    if (!confirm(`Deseja realmente ${actionText} este usuário?`)) return;

    setActionId(userId);
    setError('');

    try {
      const response = await fetch('/api/admin/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar status do usuário.');
      }

      // Atualiza estado local
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  // 2. Exclui o usuário da plataforma
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('ATENÇÃO: Isso excluirá PERMANENTEMENTE o usuário, o estabelecimento, o QR code e TODOS os logs de feedbacks e acessos associados! Esta ação não pode ser desfeita. Confirmar exclusão?')) return;

    setActionId(userId);
    setError('');

    try {
      const response = await fetch(`/api/admin/user?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar usuário.');
      }

      // Remove do estado local
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  // Filtra lista de usuários
  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="mesh-bg min-h-screen p-4 sm:p-6 lg:p-8">
      
      {/* HEADER GERAL */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Geral</h1>
              <p className="text-muted-foreground text-sm font-medium">Controle e estatísticas globais do AvaliaPro SaaS.</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-bold text-xs border border-border bg-background hover:bg-foreground/5 py-3 px-5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel do Cliente
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-2.5 text-sm max-w-3xl">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* METRICAS SAAS GLOBAIS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Receita</div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-500">R$ {stats.totalRevenue.toFixed(2)}</div>
            <div className="absolute right-4 bottom-4 text-emerald-500/10"><DollarSign className="w-10 h-10" /></div>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Empresas / Contas</div>
            <div className="text-3xl font-extrabold tracking-tight">{stats.totalCompanies}</div>
            <div className="absolute right-4 bottom-4 text-primary/10"><Building2 className="w-10 h-10" /></div>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden font-sans">
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Acessos Globais</div>
            <div className="text-3xl font-extrabold tracking-tight">{stats.totalVisits}</div>
            <div className="absolute right-4 bottom-4 text-secondary/10"><MousePointer className="w-10 h-10" /></div>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Administradores</div>
            <div className="text-3xl font-extrabold tracking-tight">{stats.totalUsers}</div>
            <div className="absolute right-4 bottom-4 text-amber-500/10"><Users className="w-10 h-10" /></div>
          </div>

        </div>

        {/* Tabela de Usuários */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg">Usuários Cadastrados</h3>
            
            {/* Busca */}
            <div className="relative w-64 sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-muted-foreground/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou empresa..."
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-10 pr-4 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center text-xs text-muted-foreground font-semibold">
              Nenhum usuário correspondente à pesquisa foi encontrado.
            </div>
          ) : (
            <div className="glass-card rounded-3xl overflow-hidden border border-border shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-foreground/5 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Administrador / E-mail</th>
                      <th className="p-4">Empresa / Slug</th>
                      <th className="p-4">Status Cobrança</th>
                      <th className="p-4">Status Painel</th>
                      <th className="p-4">Data Cadastro</th>
                      <th className="p-4 text-center">Controles Administrativos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-muted-foreground font-semibold">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-foreground/2 transition-colors">
                        
                        {/* USER INFO */}
                        <td className="p-4 pl-6">
                          <div className="font-extrabold text-foreground text-sm">{u.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{u.email}</div>
                        </td>

                        {/* COMPANY */}
                        <td className="p-4">
                          {u.companyName ? (
                            <>
                              <div className="text-foreground">{u.companyName}</div>
                              <div className="text-[10px] text-primary mt-0.5 font-mono">/p/{u.companySlug}</div>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Sem empresa</span>
                          )}
                        </td>

                        {/* BILLING */}
                        <td className="p-4">
                          {u.subscriptionStatus ? (
                            u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getFullYear() >= 2099 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                                ⭐ Vitalício
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                u.subscriptionStatus === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : u.subscriptionStatus === 'OVERDUE'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                {u.subscriptionStatus === 'ACTIVE' ? 'Ativa Pro' : u.subscriptionStatus === 'OVERDUE' ? 'Atrasada' : 'Aguardando'}
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* BLOCK STATUS */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {u.status === 'ACTIVE' ? 'Liberado' : 'Bloqueado'}
                          </span>
                        </td>

                        {/* CADASTRO */}
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                            {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </td>

                        {/* ACTIONS CONTROLS */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Toggle Acesso Vitalício */}
                            <button
                              onClick={() => handleToggleLifetime(u.id, u.subscriptionExpiresAt)}
                              disabled={actionId === u.id}
                              className={`p-2 rounded-lg transition-all outline-none border ${
                                u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getFullYear() >= 2099
                                  ? 'border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                                  : 'border-border/80 text-muted-foreground hover:text-amber-500 hover:border-amber-500/20 hover:bg-amber-500/5'
                              }`}
                              title={u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getFullYear() >= 2099 ? 'Remover Acesso Vitalício' : 'Tornar Acesso Vitalício'}
                            >
                              {actionId === u.id ? (
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              ) : (
                                <Award className="w-4.5 h-4.5" />
                              )}
                            </button>

                            {/* Toggle Bloqueio */}
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              disabled={actionId === u.id}
                              className={`p-2 rounded-lg transition-all outline-none border ${
                                u.status === 'ACTIVE'
                                  ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500/5'
                                  : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5'
                              }`}
                              title={u.status === 'ACTIVE' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                            >
                              {actionId === u.id ? (
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              ) : u.status === 'ACTIVE' ? (
                                <UserX className="w-4.5 h-4.5" />
                              ) : (
                                <UserCheck className="w-4.5 h-4.5" />
                              )}
                            </button>

                            {/* Excluir Cascata */}
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={actionId === u.id}
                              className="p-2 rounded-lg border border-border/80 text-rose-500 hover:bg-rose-500/5 transition-all outline-none"
                              title="Excluir Conta Permanentemente"
                            >
                              {actionId === u.id ? (
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
