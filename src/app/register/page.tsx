'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Mail, Lock, User, Building2, ArrowRight, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength states
  const [strength, setStrength] = useState(0); // 0 a 3
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('bg-muted');

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel('');
      setStrengthColor('bg-muted');
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    setStrength(score);

    if (score === 1) {
      setStrengthLabel('Fraca 😕');
      setStrengthColor('bg-rose-500');
    } else if (score === 2) {
      setStrengthLabel('Média 🙂');
      setStrengthColor('bg-amber-500');
    } else if (score === 3) {
      setStrengthLabel('Forte! 🚀');
      setStrengthColor('bg-emerald-500');
    }
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !companyName || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, companyName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao cadastrar.');
      }

      // Cadastro concluído com sucesso e sessão iniciada!
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-center items-center p-4 py-12">
      {/* Voltar para Home Link */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar ao início
      </Link>

      <div className="w-full max-w-md relative mt-4">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>

        {/* LOGO */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5 text-primary fill-primary" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              Avalia<span className="text-primary font-bold">Pro</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground font-medium">Inicie suas avaliações 5 estrelas em minutos</p>
        </div>

        {/* FORM CARD */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/10 relative z-10">
          <h2 className="text-2xl font-extrabold mb-6 tracking-tight">Criar Sua Conta</h2>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-2.5 mb-6 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Nome da Sua Empresa</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Café Central Gourmet"
                  className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">E-mail de Trabalho</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Crie uma Senha Forte</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                  disabled={loading}
                  required
                />
              </div>
              
              {/* PASSWORD STRENGTH BAR */}
              {password && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1 text-xs font-bold">
                    <span className="text-muted-foreground">Força da Senha:</span>
                    <span className={
                      strength === 1 ? 'text-rose-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-500'
                    }>{strengthLabel}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full transition-all duration-300 ${strength >= 1 ? strengthColor : 'bg-transparent'} ${strength === 1 ? 'w-1/3' : strength === 2 ? 'w-2/3' : 'w-full'}`}></div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full font-bold bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all disabled:opacity-50 mt-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Criando Conta...
                </>
              ) : (
                <>
                  Cadastrar Estabelecimento <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8 text-sm text-muted-foreground font-semibold border-t border-border/50 pt-6">
            Já possui uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
