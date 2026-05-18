'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ArrowRight,
  Shield,
  QrCode,
  Share2,
  Smile,
  Frown,
  TrendingUp,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  Lock,
  Building2,
  Sparkles,
  DollarSign,
  HelpCircle,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Como o AvaliaPro ajuda a evitar avaliações negativas no Google?',
      a: 'Nosso sistema possui um Filtro Inteligente de Satisfação. Quando o cliente escaneia o QR Code, perguntamos primeiro como foi a experiência. Se for Excelente ou Boa, ele é enviado diretamente para a página de avaliações do Google. Se for Ruim ou Péssima, o sistema exibe um formulário interno privado para ele desabafar e enviar o feedback direto para você. Assim, você resolve o problema do cliente no privado e protege a reputação pública da sua empresa.'
    },
    {
      q: 'O link e o QR Code são gerados na hora?',
      a: 'Sim! No exato momento em que você cria sua conta e insere o nome da sua empresa, um link único personalizado (ex: avaliapro.com.br/p/sua-empresa) e um QR Code de alta resolução são gerados automaticamente. Você já pode baixar o QR Code para imprimir e colar no seu estabelecimento ou compartilhar o link nas redes sociais e WhatsApp.'
    },
    {
      q: 'Como funciona a cobrança de R$ 9,90 por mês?',
      a: 'É uma assinatura mensal simples e recorrente de R$ 9,90. Não há taxas ocultas, fidelidade ou multas de cancelamento. Você pode cancelar sua assinatura com apenas um clique a qualquer momento a partir do seu painel.'
    },
    {
      q: 'Posso personalizar a página com as cores da minha marca?',
      a: 'Com certeza! No Construtor de Páginas integrado no seu painel, você pode fazer o upload do logotipo da sua empresa, escolher as cores exatas da sua identidade visual (cor primária e de fundo), além de personalizar a frase de chamada que aparece para os clientes.'
    },
    {
      q: 'Preciso ter conhecimentos técnicos para usar o AvaliaPro?',
      a: 'De forma alguma! O AvaliaPro foi projetado para ser o sistema mais simples do mercado. Em menos de 2 minutos você faz o cadastro, define sua identidade visual, baixa seu QR Code e já está pronto para receber avaliações. Qualquer pessoa consegue usar sem dificuldade.'
    }
  ];

  return (
    <div className="mesh-bg min-h-screen font-sans selection:bg-primary selection:text-white">
      
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              Avalia<span className="text-primary font-bold">Pro</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium hover:text-primary transition-colors text-foreground/80">Como Funciona</a>
            <a href="#recursos" className="text-sm font-medium hover:text-primary transition-colors text-foreground/80">Recursos</a>
            <a href="#precos" className="text-sm font-medium hover:text-primary transition-colors text-foreground/80">Preços</a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors text-foreground/80">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors px-4 py-2 text-foreground/80">
              Entrar
            </Link>
            <Link href="/register" className="text-sm font-bold bg-primary hover:bg-primary/95 hover:shadow-lg transition-all px-6 py-2.5 rounded-xl text-white flex items-center gap-1.5 glow-hover">
              Criar Conta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button className="md:hidden p-2 rounded-lg text-foreground/80 hover:bg-foreground/5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden pt-24 px-6 flex flex-col justify-between pb-10">
          <nav className="flex flex-col gap-6 text-lg font-semibold">
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-2 text-foreground/80 border-b border-border">Como Funciona</a>
            <a href="#recursos" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-2 text-foreground/80 border-b border-border">Recursos</a>
            <a href="#precos" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-2 text-foreground/80 border-b border-border">Preços</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-2 text-foreground/80 border-b border-border">FAQ</a>
          </nav>
          <div className="flex flex-col gap-4">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center font-semibold py-3 border border-border rounded-xl hover:bg-foreground/5 text-foreground/80">
              Entrar
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center font-bold bg-primary text-white py-3 rounded-xl hover:bg-primary/90 shadow-lg">
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-7 flex flex-col text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold self-center md:self-start mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Transforme Clientes em Promotores Digitais
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Aumente Suas Avaliações no <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Google em 5x</span> Sem Risco de Notas Ruins
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                Gere QR Codes e páginas personalizadas para incentivar avaliações 5 estrelas. Nosso filtro inteligente envia elogios direto para o Google e retém as reclamações em um formulário privado só para você ler.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register" className="font-bold bg-primary hover:bg-primary/95 text-white px-8 py-4 rounded-xl text-md flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all glow-hover">
                  Começar Agora por R$ 9,90 <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#como-funciona" className="font-semibold border border-border hover:bg-foreground/5 text-foreground px-8 py-4 rounded-xl text-md flex items-center justify-center gap-2 transition-all">
                  Ver Como Funciona
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem fidelidade</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ativação instantânea</span>
              </div>
            </div>

            {/* HERO VISUAL MOCKUP */}
            <div className="md:col-span-5 relative flex justify-center">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="glass-card p-6 rounded-3xl shadow-2xl border border-white/10 w-full max-w-sm relative z-10 animate-float">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-lg">
                    C
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Café Central Gourmet</h3>
                    <p className="text-xs text-muted-foreground">cafecentral.avaliapro.com.br</p>
                  </div>
                </div>
                
                <div className="py-6 text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Como foi sua experiência conosco?</p>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 flex flex-col items-center">
                      <span className="text-2xl mb-1">😀</span>
                      <span className="text-[10px] font-bold">Excelente</span>
                    </div>
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 flex flex-col items-center">
                      <span className="text-2xl mb-1">🙂</span>
                      <span className="text-[10px] font-bold">Boa</span>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 flex flex-col items-center">
                      <span className="text-2xl mb-1">😕</span>
                      <span className="text-[10px] font-bold">Ruim</span>
                    </div>
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 flex flex-col items-center">
                      <span className="text-2xl mb-1">😡</span>
                      <span className="text-[10px] font-bold">Péssima</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-2xl border border-border flex items-center justify-between text-left">
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold">Avaliação Recente</div>
                      <div className="flex gap-1 py-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-foreground">"Atendimento fantástico!"</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* DIFERENCIAL (O FILTRO INTELIGENTE) */}
      <section id="como-funciona" className="py-20 border-t border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Filtro Inteligente de Satisfação</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Uma Barreira Protetora contra Avaliações Ruins no Google
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              O segredo do nosso sucesso é a segmentação instantânea do humor do seu cliente. Proteja sua reputação 24 horas por dia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* FLUXO POSITIVO */}
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-emerald-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <Smile className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Experiência Excelente ou Boa <span className="text-emerald-500">😀/🙂</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quando o cliente relata que teve uma boa experiência, o sistema sabe que ele é um promotor em potencial.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" /> Redirecionamento instantâneo para o Google Reviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" /> O cliente preenche apenas as estrelas e o comentário público</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" /> Sua nota média sobe e sua empresa ganha destaque local</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 100% de Redirecionamento Automático
              </div>
            </div>

            {/* FLUXO NEGATIVO */}
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-rose-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                  <Frown className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Experiência Ruim ou Péssima <span className="text-rose-500">😕/😡</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Se o cliente teve um problema, o sistema atua como ouvidoria interna e dá um canal direto para ele desabafar.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-rose-500 shrink-0" /> Abre um formulário privado de insatisfação na hora</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-rose-500 shrink-0" /> O cliente escreve a reclamação sem publicá-la no Google</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-rose-500 shrink-0" /> O feedback chega no seu painel privado para sua tratativa imediata</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Mantido 100% sob Sigilo no Seu Painel
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Recursos do Sistema</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tudo que Você Precisa para Dominar o Mercado Local
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg mb-2">QR Code Inteligente</h4>
              <p className="text-sm text-muted-foreground">Gerado na hora e disponível para download em alta resolução para imprimir em cardápios, balcões ou panfletos.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg mb-2">Link Único</h4>
              <p className="text-sm text-muted-foreground">Link amigável e limpo com o nome da sua empresa para enviar aos clientes via WhatsApp pós-atendimento.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg mb-2 font-sans">Estatísticas Real-time</h4>
              <p className="text-sm text-muted-foreground">Monitore o volume de acessos, cliques no botão, taxas de conversão de avaliações e relatórios de aparelhos.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg mb-2">Canal de Ouvidoria</h4>
              <p className="text-sm text-muted-foreground">Retenha críticas internamente e receba nome, e-mail e telefone do cliente insatisfeito para reconquistá-lo.</p>
            </div>

          </div>
        </div>
      </section>

      {/* PLANOS / PRICING */}
      <section id="precos" className="py-20 border-t border-border bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 font-sans">Plano Justo e Único</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Investimento Mínimo, Retorno Gigante
            </p>
            <p className="mt-4 text-muted-foreground">
              Acreditamos em democratizar a tecnologia. Sem contratos complexos, sem preços absurdos.
            </p>
          </div>

          <div className="flex justify-center">
            
            <div className="glass-card p-8 rounded-3xl shadow-xl max-w-md w-full border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white font-bold text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl">
                Melhor Escolha
              </div>
              
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-2">Plano Pro Mensal</h4>
                <p className="text-sm text-muted-foreground">Acesso total a todas as funcionalidades de forma ilimitada.</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6 border-b border-border pb-6">
                <span className="text-sm font-semibold text-muted-foreground">R$</span>
                <span className="text-5xl font-extrabold tracking-tight">9,90</span>
                <span className="text-sm font-semibold text-muted-foreground">/ mês</span>
              </div>

              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Geração de QR Code automático</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Página de Avaliação 100% Personalizada</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Construtor Visual (Logo e Cores da sua Marca)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Filtro Inteligente Anti-Críticas Públicas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Painel de Estatísticas em Tempo Real</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Acesso ao Relatório de Ouvidoria Privada</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" /> Cancelamento simples com 1 clique</li>
              </ul>

              <Link href="/register" className="font-bold bg-primary hover:bg-primary/95 text-white w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all">
                Assinar Agora <ArrowRight className="w-4 h-4" />
              </Link>
              
              <p className="text-[10px] text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Transação e simulação 100% Seguras.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Tire Suas Dúvidas</h2>
            <p className="text-3xl font-extrabold tracking-tight">Perguntas Frequentes</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-card rounded-2xl overflow-hidden border border-border">
                <button
                  className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-foreground hover:bg-foreground/5 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === index ? 'max-h-60 border-t border-border/50' : 'max-h-0'}`}>
                  <div className="p-6 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/80 bg-background/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-lg text-foreground">Avalia<span className="text-primary font-bold">Pro</span></span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-semibold">
            <button onClick={() => setShowTerms(true)} className="hover:text-primary transition-colors">Termos de Uso</button>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-primary transition-colors">Política de Privacidade</button>
            <span>&copy; {new Date().getFullYear()} AvaliaPro. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>

      {/* LEGAL MODALS */}
      {/* PRIVACY POLICY */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] flex flex-col bg-background p-8 rounded-3xl border border-border shadow-2xl relative">
            <button className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-foreground/5" onClick={() => setShowPrivacy(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold mb-4 flex items-center gap-2 text-foreground">
              <Shield className="w-6 h-6 text-primary" /> Política de Privacidade
            </h3>
            <div className="overflow-y-auto pr-2 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
              <p>A privacidade dos nossos clientes é de extrema importância para o AvaliaPro. Esta Política de Privacidade descreve quais dados pessoais são coletados, como são utilizados e as medidas tomadas para garantir sua proteção.</p>
              
              <h4 className="font-bold text-foreground">1. Informações Coletadas</h4>
              <p>Ao criar uma conta, coletamos seu nome completo, e-mail da sua empresa, nome do estabelecimento empresarial, senha criptografada e dados de pagamento. Para os clientes da sua empresa que enviam feedbacks privados, coletamos nome, e-mail opcional, telefone opcional e a mensagem descritiva de feedback.</p>

              <h4 className="font-bold text-foreground">2. Uso das Informações</h4>
              <p>Os dados dos usuários do SaaS são utilizados estritamente para o gerenciamento das contas, cobrança da assinatura mensal, geração do link público da página de avaliação e autenticação segura do painel administrativo. Os feedbacks negativos enviados por seus clientes são armazenados sob total sigilo técnico e destinam-se exclusivamente para sua visualização e resposta no painel.</p>

              <h4 className="font-bold text-foreground">3. Armazenamento e Segurança</h4>
              <p>Utilizamos os mais rigorosos padrões de segurança, incluindo criptografia de senhas baseada no algoritmo PBKDF2 e comunicações seguras HTTPS. Os dados são armazenados localmente e na nuvem de forma protegida contra invasões ou modificações não autorizadas.</p>

              <h4 className="font-bold text-foreground">4. Contato</h4>
              <p>Para dúvidas sobre nossa política de dados, entre em contato pelo e-mail: suporte@avaliapro.com.br.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl transition-all" onClick={() => setShowPrivacy(false)}>
                Entendi e Aceito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMS OF USE */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] flex flex-col bg-background p-8 rounded-3xl border border-border shadow-2xl relative">
            <button className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-foreground/5" onClick={() => setShowTerms(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold mb-4 flex items-center gap-2 text-foreground">
              <Building2 className="w-6 h-6 text-primary" /> Termos de Uso
            </h3>
            <div className="overflow-y-auto pr-2 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
              <p>Bem-vindo ao AvaliaPro! Ao se cadastrar e utilizar nossos serviços, você concorda expressamente com os seguintes Termos de Uso.</p>
              
              <h4 className="font-bold text-foreground">1. Descrição do Serviço</h4>
              <p>O AvaliaPro é uma plataforma de software como serviço (SaaS) que fornece uma página de avaliação intermediária, com gerador de QR Code automático e link compartilhado, permitindo filtrar a intenção de satisfação dos clientes de estabelecimentos locais antes do envio formal ao Google Reviews.</p>

              <h4 className="font-bold text-foreground">2. Cobrança e Renovação</h4>
              <p>A utilização plena do sistema está condicionada ao pagamento da assinatura mensal de R$ 9,90 por estabelecimento cadastrado. A assinatura é recorrente mensalmente e pode ser cancelada sem custo ou penalidade a qualquer momento por meio do painel do cliente.</p>

              <h4 className="font-bold text-foreground">3. Responsabilidades do Usuário</h4>
              <p>Você é responsável por preencher o link correto de avaliações da sua empresa no Google Reviews. O uso indevido da plataforma para enganar intencionalmente os clientes ou infringir as diretrizes gerais de avaliações de terceiros é de sua exclusiva responsabilidade.</p>

              <h4 className="font-bold text-foreground">4. Cancelamento e Suspensão</h4>
              <p>Em caso de inadimplência superior a 5 dias após o vencimento mensal, o sistema suspenderá temporariamente o acesso do usuário ao painel e exibirá uma tela de alerta elegante na sua página pública de avaliação, até que o pagamento seja regularizado.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl transition-all" onClick={() => setShowTerms(false)}>
                Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
