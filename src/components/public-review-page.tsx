'use client';

import React, { useState } from 'react';
import {
  Star,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  MessageSquareWarning,
  User,
  Mail,
  Phone
} from 'lucide-react';

interface PublicReviewPageProps {
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    googleReviewUrl: string;
    customPhrase: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    bgColor: string;
    satisfactionFilter: boolean;
  };
  device: string;
}

type Step = 'RATING' | 'FORM' | 'SUCCESS' | 'REDIRECTING';

export default function PublicReviewPage({ company, device }: PublicReviewPageProps) {
  const [step, setStep] = useState<Step>('RATING');
  const [selectedRating, setSelectedRating] = useState<'EXCELENTE' | 'BOA' | 'RUIM' | 'PESSIMA' | null>(null);
  
  // Estados para seleção de estrelas
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(0);

  const handleStarClick = (starCount: number) => {
    setSelectedStar(starCount);
    
    // Mapeamento dinâmico de 1-5 estrelas compatível com banco SQLite
    let rating: 'EXCELENTE' | 'BOA' | 'RUIM' | 'PESSIMA';
    if (starCount === 5) {
      rating = 'EXCELENTE';
    } else if (starCount === 4) {
      rating = 'BOA';
    } else if (starCount === 3 || starCount === 2) {
      rating = 'RUIM';
    } else {
      rating = 'PESSIMA';
    }

    handleRatingClick(rating);
  };

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Trata clique nos Emojis
  const handleRatingClick = (rating: 'EXCELENTE' | 'BOA' | 'RUIM' | 'PESSIMA') => {
    setSelectedRating(rating);
    const isPositive = rating === 'EXCELENTE' || rating === 'BOA';

    // Registra clique no analítico de forma silenciosa no background (sem bloquear a UI)
    fetch('/api/feedback/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: company.id,
        rating,
        device,
      }),
    }).catch((err) => {
      console.error('Erro ao registrar clique de analítico:', err);
    });

    if (isPositive) {
      // Redireciona direto para o Google Reviews
      setStep('REDIRECTING');
      setTimeout(() => {
        window.location.href = company.googleReviewUrl;
      }, 800);
    } else {
      // Negativo
      if (company.satisfactionFilter) {
        // Filtro ativo: exibe formulário da ouvidoria interna
        setStep('FORM');
      } else {
        // Filtro inativo: redireciona direto para o Google mesmo sendo negativo
        setStep('REDIRECTING');
        setTimeout(() => {
          window.location.href = company.googleReviewUrl;
        }, 800);
      }
    }
  };

  // 2. Trata envio do formulário de ouvidoria
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comments) {
      setError('Por favor, informe seu nome e comentários.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          customerName,
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
          rating: selectedRating,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar feedback.');
      }

      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between items-center p-4 py-12 transition-all"
      style={{ backgroundColor: company.bgColor, color: company.textColor }}
    >
      {/* ESPAÇADOR SUPERIOR */}
      <div></div>

      {/* CORE FRAME CARD */}
      <div className="w-full max-w-md relative flex flex-col items-center">
        {/* LOGO REDONDA */}
        <div
          className="w-24 h-24 rounded-3xl shadow-xl flex items-center justify-center overflow-hidden mb-6 border relative z-10 transition-transform duration-300 hover:scale-105 bg-white/20"
          style={{ borderColor: `${company.primaryColor}20` }}
        >
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <div
              className="font-extrabold text-3xl opacity-80"
              style={{ color: company.textColor }}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* NOME DA EMPRESA */}
        <h2 className="text-2xl font-extrabold text-center mb-1.5 tracking-tight px-4 leading-tight">
          {company.name}
        </h2>
        <div className="flex items-center justify-center gap-1 text-xs mb-10 opacity-70">
          <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/20" /> Canal de Avaliação Seguro
        </div>

        {/* --- STEP 1: SURVEY GOOGLE 5-STARS & G LOGO --- */}
        {step === 'RATING' && (
          <div className="w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
            
            {/* Google G Logo */}
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-white/20 p-3 hover:scale-105 active:scale-95 transition-all duration-300">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>

            <p className="text-md font-bold max-w-xs mx-auto leading-relaxed opacity-95 px-4">
              {company.customPhrase}
            </p>

            {/* Interactive Stars Row */}
            <div className="flex justify-center items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoveredStar || selectedStar);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => handleStarClick(star)}
                    className="p-1 transition-all duration-150 hover:scale-125 focus:outline-none cursor-pointer"
                    aria-label={`Avaliar com ${star} estrelas`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-11 h-11 transition-all duration-150 ${
                        isActive
                          ? 'fill-amber-500 text-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                          : 'fill-transparent text-current opacity-30 hover:opacity-50'
                      }`}
                    >
                      <path
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
            
            <span className="text-xs opacity-65 font-bold animate-pulse">
              Toque nas estrelas para avaliar sua experiência
            </span>
          </div>
        )}

        {/* --- STEP 2: INLINE FORM (OUVIDORIA) --- */}
        {step === 'FORM' && (
          <div className="w-full bg-white/10 border border-white/15 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-1.5 leading-tight">
              <MessageSquareWarning className="w-5 h-5 text-amber-500 shrink-0" /> Conte-nos o que houve
            </h3>
            <p className="text-xs opacity-75 mb-6 leading-relaxed">
              Lamentamos por não atender às suas expectativas. Sua reclamação será enviada diretamente à gerência administrativa de forma sigilosa.
            </p>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center gap-2 mb-4 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80">Seu Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-black/15 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-white/30 transition-all placeholder:opacity-40"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80">Seu E-mail (Opcional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="nome@exemplo.com"
                      className="w-full bg-black/15 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-white/30 transition-all placeholder:opacity-40"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80">Telefone (Opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-black/15 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-white/30 transition-all placeholder:opacity-40"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80">O que podemos melhorar?</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escreva aqui sua reclamação ou sugestão..."
                  rows={3}
                  className="w-full bg-black/15 border border-white/10 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-white/30 transition-all resize-none placeholder:opacity-40"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all"
                style={{ backgroundColor: company.primaryColor, color: '#FFFFFF' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" /> Enviando Ouvidoria...
                  </>
                ) : (
                  <>
                    Enviar Depoimento Privado <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 3: SUCCESS BLOCK SCREEN --- */}
        {step === 'SUCCESS' && (
          <div className="w-full bg-white/10 border border-white/15 rounded-3xl p-8 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Obrigado Pelo Feedback!</h3>
              <p className="text-xs opacity-75 mt-2 leading-relaxed">
                Suas considerações foram enviadas privadamente para nossa diretoria administrativa. Tomaremos todas as medidas corretivas necessárias.
              </p>
            </div>
          </div>
        )}

        {/* --- STEP 4: REDIRECTING SCREEN --- */}
        {step === 'REDIRECTING' && (
          <div className="text-center py-12 space-y-4 animate-in fade-in duration-200">
            <Loader2
              className="w-10 h-10 animate-spin mx-auto"
              style={{ color: company.primaryColor }}
            />
            <div>
              <h4 className="font-extrabold text-md">Abraçando sua Avaliação!</h4>
              <p className="text-xs opacity-75 mt-1 leading-relaxed">
                Você será redirecionado para a página oficial de avaliações no Google...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER CERTIFICATION */}
      <div className="text-center text-[10px] opacity-65 flex items-center justify-center gap-1">
        <Star className="w-3.5 h-3.5 fill-current" /> Página de Satisfação Verificada
      </div>
    </div>
  );
}
