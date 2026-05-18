'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, KeyRound, Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileFormProps {
  initialUser: {
    name: string;
    email: string;
  };
}

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();

  // Profile data
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  
  // Password data
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao atualizar o perfil.');
      }

      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpa os campos de senha
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Configurações de Perfil</h1>
        <p className="text-muted-foreground text-sm">Gerencie suas credenciais de login e dados de contato administrativo.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-2.5 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-start gap-2.5 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: DADOS BÁSICOS */}
        <div className="md:col-span-6 glass-card p-6 rounded-3xl space-y-5">
          <h3 className="font-extrabold text-lg border-b border-border pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> 1. Dados Pessoais
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Seu Nome</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
                required
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
                required
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: SEGURANÇA / SENHA */}
        <div className="md:col-span-6 glass-card p-6 rounded-3xl space-y-5">
          <h3 className="font-extrabold text-lg border-b border-border pb-3 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> 2. Alterar Senha
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Senha Atual</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/50" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Preencha apenas se for alterar"
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/30"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/50" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/30"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Confirmar Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/50" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/30"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BAR */}
        <div className="md:col-span-12 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/95 text-white py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Salvar Alterações de Perfil
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
