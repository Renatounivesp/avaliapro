'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States para recuperação de senha simulada
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao fazer login.');
      }

      // Login bem sucedido! Envia para o dashboard
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setRecoveryError('Por favor, informe seu e-mail.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');
    setRecoverySuccess('');

    // Simula atraso da rede para realismo premium
    setTimeout(() => {
      setRecoveryLoading(false);
      setRecoverySuccess(
        `Sucesso! Um link de redefinição de senha seguro foi simulado e enviado para o e-mail: ${recoveryEmail}`
      );
      setRecoveryEmail('');
    }, 1500);
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-center items-center p-4">
      {/* Voltar para Home Link */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar ao início
      </Link>

      <div className="w-full max-w-md relative">
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
          <p className="text-sm text-muted-foreground font-medium">Acesse seu painel administrativo</p>
        </div>

        {/* FORM CARD */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/10 relative z-10">
          {!showRecovery ? (
            <>
              <h2 className="text-2xl font-extrabold mb-6 tracking-tight">Fazer Login</h2>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-2.5 mb-6 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@empresa.com"
                      className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Sua Senha</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecovery(true);
                        setError('');
                      }}
                      className="text-xs font-bold text-primary hover:underline outline-none"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full font-bold bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all disabled:opacity-50 mt-8"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Verificando...
                    </>
                  ) : (
                    <>
                      Acessar Painel <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-8 text-sm text-muted-foreground font-semibold border-t border-border/50 pt-6">
                Ainda não tem conta?{' '}
                <Link href="/register" className="text-primary hover:underline font-bold">
                  Cadastre-se aqui
                </Link>
              </div>
            </>
          ) : (
            // FORMULARIO DE RECUPERAÇÃO DE SENHA SIMULADO
            <>
              <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Recuperar Senha</h2>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Insira o e-mail de cadastro de sua conta. O sistema simulará o envio de um link seguro para você redefinir sua senha.
              </p>

              {recoveryError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-2.5 mb-6 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-start gap-2.5 mb-6 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              <form onSubmit={handleRecoverySubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="exemplo@empresa.com"
                      className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50"
                      disabled={recoveryLoading}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(false);
                      setRecoverySuccess('');
                      setRecoveryError('');
                    }}
                    className="w-1/2 font-bold border border-border hover:bg-foreground/5 py-3 rounded-xl transition-all"
                    disabled={recoveryLoading}
                  >
                    Voltar ao Login
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 font-bold bg-primary hover:bg-primary/95 text-white py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg glow-hover transition-all disabled:opacity-50"
                    disabled={recoveryLoading}
                  >
                    {recoveryLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Redefinir Senha'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mesh-bg min-h-screen flex flex-col justify-center items-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
