'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Sparkles,
  Loader2,
  Lock,
  DollarSign,
  Info,
  ChevronRight,
  QrCode,
  Copy,
  Check,
  X
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'PIX' | 'CARD'>('PIX');
  
  // Checkout states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  
  // Cartão states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Simulação states
  const [simulating, setSimulating] = useState<string | null>(null);

  const subStatus = subscription.status;
  const isSubActive = subStatus === 'ACTIVE';

  // Copiar chave PIX
  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136avaliaprosimuladopixkey999555666');
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  // Tratar pagamento simulado
  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: paymentTab }),
      });

      if (response.ok) {
        setSuccess(true);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Faturamento e Assinatura</h1>
        <p className="text-muted-foreground text-sm">Gerencie seu plano mensal de R$ 9,90, histórico de faturas e simule cobranças.</p>
      </div>

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

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {!isSubActive ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="font-bold bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-xl shadow-lg glow-hover transition-all flex items-center justify-center gap-2"
              >
                Pagar Fatura Pendente <CreditCard className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={simulating !== null}
                className="font-bold border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 outline-none"
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
              <Sparkles className="w-4.5 h-4.5" /> Simulador de Cobrança
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Use estes controles rápidos para testar a robustez do sistema frente a pagamentos atrasados ou cancelados de forma realista.
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
              <span>Ao simular atraso, o painel e o link público serão bloqueados imediatamente com um paywall elegante.</span>
            </div>
          </div>
        </div>

      </div>

      {/* HISTÓRICO DE PAGAMENTOS */}
      <div>
        <h3 className="font-extrabold text-lg mb-4">Histórico de Transações</h3>
        
        {subscription.payments.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center text-xs text-muted-foreground font-semibold">
            Nenhuma fatura registrada. A fatura mensal é gerada assim que o pagamento simulado for efetuado.
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        <CheckCircle className="w-3 h-3" /> Aprovado
                      </span>
                    </td>
                    <td className="p-4">{new Date(p.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL SIMULADO */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full flex flex-col bg-background p-8 rounded-3xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {/* Fechar modal */}
            {!success && (
              <button
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-foreground/5"
                onClick={() => setShowCheckout(false)}
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {!success ? (
              <>
                <h3 className="text-2xl font-extrabold mb-1 tracking-tight flex items-center gap-2 border-b border-border pb-3">
                  <CreditCard className="w-5 h-5 text-primary" /> Gateway de Pagamento
                </h3>
                <p className="text-xs text-muted-foreground mb-6">Assine o Plano Pro por apenas R$ 9,90/mês.</p>

                {/* TABS PIX E CARD */}
                <div className="grid grid-cols-2 p-1 bg-foreground/5 rounded-xl border border-border mb-6 text-xs font-bold">
                  <button
                    onClick={() => setPaymentTab('PIX')}
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      paymentTab === 'PIX' ? 'bg-primary text-white shadow' : 'text-muted-foreground'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> Pagar com PIX
                  </button>
                  <button
                    onClick={() => setPaymentTab('CARD')}
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      paymentTab === 'CARD' ? 'bg-primary text-white shadow' : 'text-muted-foreground'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Cartão de Crédito
                  </button>
                </div>

                {/* ABA PIX */}
                {paymentTab === 'PIX' ? (
                  <div className="space-y-6 flex flex-col items-center">
                    {/* QR Code Simulado */}
                    <div className="w-40 h-40 rounded-2xl bg-white border border-border p-2 flex items-center justify-center shadow-md">
                      <QrCode className="w-36 h-36 text-slate-800" />
                    </div>

                    <div className="w-full space-y-3">
                      <button
                        onClick={handleCopyPix}
                        className="w-full font-bold text-xs bg-foreground/5 hover:bg-foreground/10 border border-border py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none"
                      >
                        {pixCopied ? (
                          <>
                            <Check className="w-4.5 h-4.5 text-emerald-500" /> Código PIX Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4.5 h-4.5" /> Copiar Código Pix Copia-e-Cola
                          </>
                        )}
                      </button>

                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Processando Pix...
                          </>
                        ) : (
                          <>
                            Simular Pagamento Aprovado (Pix) <CheckCircle className="w-4.5 h-4.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // ABA CARD
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePayment();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Número do Cartão</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                        placeholder="4556 7889 0123 4567"
                        className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Nome no Cartão</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="NOME COMPLETO DO TITULAR"
                        className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all uppercase"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Vencimento</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                          placeholder="MM/AA"
                          className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">CVC / CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          placeholder="•••"
                          className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full font-bold bg-primary hover:bg-primary/95 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all mt-6"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Autorizando Cartão...
                        </>
                      ) : (
                        <>
                          Simular Assinatura (Cartão) <Lock className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center mt-6 text-[10px] text-muted-foreground flex items-center justify-center gap-1 border-t border-border pt-4">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Ambiente de sandbox seguro de testes.
                </div>
              </>
            ) : (
              // SUCESSO DO CHECKOUT
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">Assinatura Ativada!</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Seu pagamento de **R$ 9,90** foi simulado com sucesso e aprovado. Todas as restrições da sua conta foram removidas e seu link público está online!
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setSuccess(false);
                  }}
                  className="font-bold bg-primary hover:bg-primary/90 text-white w-full py-3.5 rounded-xl transition-all"
                >
                  Ir para o Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
