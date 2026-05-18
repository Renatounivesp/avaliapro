'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  MessageSquareCode,
  CreditCard,
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Star,
  Lock,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    company: {
      name: string;
      slug: string;
    } | null;
    subscription: {
      status: string;
      expiresAt: string;
    } | null;
  };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subStatus = user.subscription?.status || 'PENDING';
  const isSubscriptionActive = subStatus === 'ACTIVE';

  // Páginas protegidas pelo paywall
  const isPaywalledPath = 
    pathname === '/dashboard' || 
    pathname === '/dashboard/page-builder' || 
    pathname === '/dashboard/feedbacks';

  const menuItems = [
    { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Página de Avaliação', path: '/dashboard/page-builder', icon: Smartphone },
    { name: 'Feedbacks Privados', path: '/dashboard/feedbacks', icon: MessageSquareCode },
    { name: 'Faturamento', path: '/dashboard/billing', icon: CreditCard },
    { name: 'Meu Perfil', path: '/dashboard/profile', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-theme">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar shrink-0 p-5 justify-between">
        <div className="space-y-6">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group px-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Avalia<span className="text-primary font-bold">Pro</span>
            </span>
          </Link>

          {/* USER INFO PANEL */}
          <div className="p-3 bg-foreground/5 rounded-2xl border border-border/50">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Empresa</div>
            <div className="font-bold text-sm truncate">{user.company?.name || 'Minha Empresa'}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            
            {/* Status da Assinatura */}
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSubscriptionActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSubscriptionActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isSubscriptionActive ? 'Assinatura Ativa' : 'Aguardando Pagamento'}
              </span>
            </div>
          </div>

          {/* MENU ITEMS */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-sidebar-text hover:bg-sidebar-active'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ADMIN SHORTCUT & LOGOUT */}
        <div className="space-y-2">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5" /> Painel Admin Geral
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/5 transition-all text-left outline-none"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-72 bg-sidebar p-6 flex flex-col justify-between h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                  <span className="font-extrabold text-lg text-foreground">Avalia<span className="text-primary">Pro</span></span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-foreground/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-foreground/5 rounded-2xl border border-border/50">
                <div className="font-bold text-sm truncate">{user.company?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSubscriptionActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSubscriptionActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isSubscriptionActive ? 'Ativa' : 'Inadimplente/Pendente'}
                  </span>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'text-sidebar-text hover:bg-sidebar-active'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2">
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4.5 h-4.5" /> Painel Admin
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/5 transition-all text-left outline-none"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
          {/* Clica fora fecha */}
          <div className="flex-grow" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* HEADER MOBILE */}
        <header className="flex lg:hidden items-center justify-between p-4 border-b border-border bg-sidebar sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-foreground/5">
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-md tracking-tight text-foreground">Avalia<span className="text-primary font-bold">Pro</span></span>
          </Link>
          
          <div className="w-10"></div> {/* Espaçador */}
        </header>

        {/* MAIN INNER CONTENT */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isPaywalledPath && !isSubscriptionActive ? (
            // TELA DE BLOQUEIO DE ASSINATURA (PAYWALL PREMIUM)
            <div className="max-w-xl mx-auto mt-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Sua Assinatura está Suspensa</h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Para reativar seu link de avaliação pública, acessar seu painel de estatísticas detalhadas em tempo real e visualizar os feedbacks privados recebidos de clientes, regularize sua mensalidade Pro de **R$ 9,90/mês**.
              </p>
              
              <div className="glass-card p-6 rounded-2xl w-full text-left mb-8 border border-primary/20">
                <h4 className="font-bold text-sm mb-3">Benefícios Bloqueados Temporariamente:</h4>
                <ul className="space-y-2 text-xs text-foreground/80">
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-primary shrink-0" /> Monitoramento de cliques e conversão</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-primary shrink-0" /> Construtor de identidade visual de páginas</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-primary shrink-0" /> Filtro ativo anti-críticas negativas públicas</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-primary shrink-0" /> Download do QR Code em alta resolução</li>
                </ul>
              </div>

              <Link
                href="/dashboard/billing"
                className="font-bold bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-xl shadow-lg glow-hover transition-all flex items-center gap-2"
              >
                Ativar Minha Assinatura (R$ 9,90) <CreditCard className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

    </div>
  );
}
