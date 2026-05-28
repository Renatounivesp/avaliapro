'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  Loader2,
  Lock,
  Info,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  gateway: string;
  createdAt: string;
}

interface BillingControlProps {
  subscription: {
    status: string;
    expiresAt: string;
    payments: Payment[];
  };
}

export default function BillingControl({ subscription }: BillingControlProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Estados para abas e inputs de pagamento
  const [activeTab, setActiveTab] = useState<'pix' | 'stripe'>('pix');
  const [pixCopied, setPixCopied] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Simulação states
  const [simulating, setSimulating] = useState<string | null>(null);

  const subStatus = subscription.status;
  const isSubActive = subStatus === 'ACTIVE';

  const PIX_KEY = 'pix@avaliapro.com.br';
  const PIX_CODE = '00020101021126580014br.gov.bcb.pix0136pix@avaliapro.com.br52040000530398654049.905802BR5915AvaliaPro SaaS6009Sao Paulo62070503***63041A2F';

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      setSuccessMsg(true);
      window.history.replaceState(null, '', '/dashboard/billing');
    }
  }, [searchParams]);

  // Executa o pagamento pelo método selecionado (PIX ou Stripe)
  const handlePayment = async (method: 'PIX' | 'CREDIT_CARD') => {
    setLoading(true);
    
    // Simula atraso premium de 1.5 segundos se for cartão (Stripe)
    if (method === 'CREDIT_CARD') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(true);
        // Limpa inputs
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
        router.refresh();
      } else {
        alert('Erro ao processar pagamento: ' + (data.error || 'Erro desconhecido.'));
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  // Tratar cancelamento
  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar sua assinatura? O acesso ao painel e a página pública serão suspensos.')) return;
    setSimulating('cancel');
    try {
      const response = await fetch('/api/billing/cancel', { method: 'POST' });
      if (response.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(null);
    }
  };

  // Tratar simulação de atraso / inadimplência
  const handleSimulateOverdue = async () => {
    setSimulating('overdue');
    try {
      const response = await fetch('/api/billing/simulate-overdue', { method: 'POST' });
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Faturamento e Assinatura</h1>
        <p className="text-muted-foreground text-sm">Gerencie seu plano mensal de R$ 9,90, histórico de faturas e pagamentos.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Pagamento Aprovado com Sucesso!</h4>
            <p className="text-xs">Sua assinatura foi ativada. Obrigado por escolher o AvaliaPro.</p>
          </div>
        </div>
      )}

      {/* CORE STATUS CARD */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        
        {/* CARD PLAN DETALHE */}
        <div className="md:col-span-8 glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-3 py-1 rounded-full">Plano Escolhido</span>
                <h3 className="text-2xl font-extrabold mt-2">Plano Pro Mensal</h3>
                <p className="text-xs text-muted-foreground">Acesso ilimitado à plataforma para 1 estabelecimento</p>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground">R$</span>
                <span className="text-3xl font-extrabold text-foreground">9,90</span>
                <span className="text-xs font-semibold text-muted-foreground">/mês</span>
              </div>
            </div>

            {/* STATUS INFO */}
            <div className="p-4 bg-foreground/5 rounded-2xl border border-border/50 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status da Assinatura</div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  {subStatus === 'ACTIVE' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-500">Ativa / Em dia</span>
                    </>
                  ) : subStatus === 'OVERDUE' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="text-rose-500">Bloqueado / Inadimplente</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-amber-500">Aguardando Ativação</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Próximo Vencimento</div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {!isSubActive ? (
              <div className="space-y-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pix')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all outline-none ${
                      activeTab === 'pix'
                        ? 'bg-background text-foreground shadow-sm border border-border/80'
                        : 'text-muted-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-500" /> Pix Instantâneo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stripe')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all outline-none ${
                      activeTab === 'stripe'
                        ? 'bg-background text-foreground shadow-sm border border-border/80'
                        : 'text-muted-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-primary" /> Cartão (Stripe)
                  </button>
                </div>

                {/* Pix Checkout */}
                {activeTab === 'pix' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-foreground/3 p-4 rounded-2xl border border-border/50">
                      {/* Pix QR Code Mockup */}
                      <div className="w-24 h-24 bg-white rounded-xl p-2 border border-border flex items-center justify-center shadow-inner shrink-0 relative">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                          <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                          <rect x="3.5" y="3.5" width="18" height="18" fill="white" />
                          <rect x="7" y="7" width="11" height="11" fill="currentColor" />
                          
                          <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                          <rect x="78.5" y="3.5" width="18" height="18" fill="white" />
                          <rect x="82" y="7" width="11" height="11" fill="currentColor" />
                          
                          <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                          <rect x="3.5" y="78.5" width="18" height="18" fill="white" />
                          <rect x="7" y="82" width="11" height="11" fill="currentColor" />
                          
                          <rect x="30" y="5" width="8" height="15" fill="currentColor" />
                          <rect x="45" y="20" width="10" height="8" fill="currentColor" />
                          <rect x="40" y="35" width="8" height="12" fill="currentColor" />
                          <rect x="65" y="30" width="8" height="15" fill="currentColor" />
                          <rect x="5" y="35" width="12" height="8" fill="currentColor" />
                          <rect x="30" y="55" width="15" height="8" fill="currentColor" />
                          <rect x="55" y="55" width="15" height="15" fill="currentColor" />
                          <rect x="60" y="60" width="5" height="5" fill="white" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white p-1 rounded-md border border-border/80 shadow-md">
                            <span className="text-[7px] font-extrabold text-emerald-600 tracking-tighter">PIX</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 flex-grow w-full">
                        <h4 className="font-extrabold text-xs">Pagar com Pix</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Escaneie o QR Code ou copie o código Pix abaixo. Após o pagamento de <strong>R$ 9,90</strong> no app do seu banco, confirme a ativação.
                        </p>
                        
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            readOnly
                            value={PIX_CODE}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            className="flex-grow bg-background/50 border border-border rounded-lg py-1 px-2.5 text-[9px] font-mono text-muted-foreground outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="bg-foreground/5 hover:bg-foreground/10 text-foreground py-1 px-3.5 rounded-lg border border-border text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all outline-none"
                          >
                            {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                            {pixCopied ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePayment('PIX')}
                      disabled={loading}
                      className="w-full font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl shadow-lg glow-hover transition-all flex items-center justify-center gap-1.5 outline-none"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Check className="w-4.5 h-4.5" /> Confirmar Pagamento Pix</>
                      )}
                    </button>
                  </div>
                )}

                {/* Stripe Checkout */}
                {activeTab === 'stripe' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-foreground/3 p-4 rounded-2xl border border-border/50 space-y-3">
                      <h4 className="font-extrabold text-xs flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Checkout Seguro (Stripe)
                      </h4>
                      
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12">
                          <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Número do Cartão</label>
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-xs outline-none transition-all placeholder:opacity-30"
                            required
                          />
                        </div>

                        <div className="col-span-6">
                          <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Validade</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/'))}
                            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-xs outline-none transition-all placeholder:opacity-30"
                            required
                          />
                        </div>

                        <div className="col-span-6">
                          <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">CVV</label>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-xs outline-none transition-all placeholder:opacity-30"
                            required
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Nome Impresso no Cartão</label>
                          <input
                            type="text"
                            placeholder="Ex: JOÃO A SILVA"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 text-xs outline-none transition-all placeholder:opacity-30"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePayment('CREDIT_CARD')}
                      disabled={loading || cardNumber.length < 15 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardName}
                      className="w-full font-bold bg-primary hover:bg-primary/95 text-white py-3 rounded-xl shadow-lg glow-hover transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 outline-none"
                    >
                      {loading ? (
                        <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Conectando ao Stripe...</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Pagar R$ 9,90 com Stripe</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleCancel}
                disabled={simulating !== null}
                className="font-bold border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 outline-none w-full sm:w-auto"
              >
                {simulating === 'cancel' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Cancelar Assinatura Pro'
                )}
              </button>
            )}
          </div>
        </div>

        {/* CARD CONTROLE SIMULADOR COBRANÇA */}
        <div className="md:col-span-4 glass-card p-6 rounded-3xl flex flex-col justify-between border border-amber-500/20">
          <div>
            <h4 className="font-extrabold text-sm mb-1.5 flex items-center gap-1.5 text-amber-500">
              <Sparkles className="w-4.5 h-4.5" /> Controle de Testes
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Use estes controles para testar o painel enquanto estiver desenvolvendo.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSimulateOverdue}
              disabled={simulating !== null || subStatus === 'OVERDUE'}
              className="w-full font-bold text-xs bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 outline-none"
            >
              {simulating === 'overdue' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Simular Inadimplência (Bloquear)'
              )}
            </button>

            <div className="text-[10px] text-muted-foreground leading-relaxed p-2.5 bg-foreground/2 rounded-xl border border-border/50 flex items-start gap-1.5">
              <Info className="w-4 h-4 shrink-0 text-amber-500" />
              <span>O webhook do Mercado Pago reativará sua conta automaticamente após o pagamento.</span>
            </div>
          </div>
        </div>

      </div>

      {/* HISTÓRICO DE PAGAMENTOS */}
      <div>
        <h3 className="font-extrabold text-lg mb-4">Histórico de Transações</h3>
        
        {subscription.payments.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center text-xs text-muted-foreground font-semibold">
            Nenhuma fatura registrada no sistema ainda.
          </div>
        ) : (
          <div className="glass-card rounded-3xl overflow-hidden border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-foreground/5 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">ID Pagamento</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Meio / Gateway</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data da Transação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-muted-foreground font-medium">
                {subscription.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-foreground/2 transition-colors">
                    <td className="p-4 pl-6 font-mono text-[10px] text-foreground">#{p.id.substring(0, 12)}...</td>
                    <td className="p-4 text-foreground font-bold">R$ {p.amount.toFixed(2)}</td>
                    <td className="p-4 uppercase text-[10px]">{p.gateway}</td>
                    <td className="p-4">
                      {p.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                          <CheckCircle className="w-3 h-3" /> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4">{new Date(p.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
