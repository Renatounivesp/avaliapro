'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Calendar,
  Sparkles,
  Loader2,
  Info,
  Copy,
  Check,
  QrCode,
  CreditCard,
  ArrowLeft
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

  // Estados para Pix copiável e simulações
  const [pixCopied, setPixCopied] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);

  // Estados para Pix real e Checkout
  const [realPix, setRealPix] = useState<{ qrCode: string; qrCodeBase64: string; paymentId: string } | null>(null);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const subStatus = subscription.status;
  const isSubActive = subStatus === 'ACTIVE';

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      setSuccessMsg(true);
      window.history.replaceState(null, '', '/dashboard/billing');
    }
  }, [searchParams]);

  // Polling automático a cada 5 segundos enquanto o Pix real estiver ativo
  useEffect(() => {
    if (!realPix || isSubActive) return;

    const interval = setInterval(() => {
      handleVerifyPayment(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [realPix, isSubActive]);

  // Gera o Pix em tempo real usando o Mercado Pago
  const handleGeneratePix = async () => {
    setGeneratingPix(true);
    setVerificationError(null);
    try {
      const response = await fetch('/api/billing/pix/create', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRealPix({
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          paymentId: data.paymentId,
        });
      } else {
        alert(data.error || 'Erro ao gerar QR Code do Pix.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor para gerar o Pix.');
    } finally {
      setGeneratingPix(false);
    }
  };

  // Verifica o status do pagamento no banco de dados
  const handleVerifyPayment = async (silent = false) => {
    if (!silent) setVerifyingPayment(true);
    setVerificationError(null);
    try {
      const response = await fetch('/api/billing/status', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.status === 'ACTIVE') {
          setSuccessMsg(true);
          setRealPix(null);
          router.refresh();
        } else if (!silent) {
          setVerificationError('Pagamento ainda não detectado. Se você já pagou, aguarde alguns segundos e clique novamente.');
        }
      } else if (!silent) {
        setVerificationError('Erro ao verificar status da assinatura.');
      }
    } catch (err) {
      console.error(err);
      if (!silent) setVerificationError('Erro de conexão ao verificar o status.');
    } finally {
      if (!silent) setVerifyingPayment(false);
    }
  };

  // Inicia checkout do Mercado Pago (Checkout Pro)
  const handleCheckoutPro = async () => {
    setPreferenceLoading(true);
    try {
      const response = await fetch('/api/billing/mercado-pago/create', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Erro ao criar preferência de pagamento.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor para iniciar checkout.');
    } finally {
      setPreferenceLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!realPix) return;
    navigator.clipboard.writeText(realPix.qrCode);
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
                {!realPix ? (
                  // Opções de Pagamento (Pix ou Cartão)
                  <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <button
                      onClick={handleGeneratePix}
                      disabled={generatingPix || preferenceLoading}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-foreground/3 border border-border hover:bg-foreground/5 hover:border-emerald-500/40 rounded-2xl transition-all cursor-pointer group outline-none"
                    >
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-foreground">Pagar com Pix</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Liberação imediata 24h</div>
                      </div>
                      {generatingPix && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
                    </button>

                    <button
                      onClick={handleCheckoutPro}
                      disabled={generatingPix || preferenceLoading}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-foreground/3 border border-border hover:bg-foreground/5 hover:border-primary/40 rounded-2xl transition-all cursor-pointer group outline-none"
                    >
                      <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-foreground">Cartão ou Boleto</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Checkout Mercado Pago</div>
                      </div>
                      {preferenceLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </button>
                  </div>
                ) : (
                  // Pix Ativo para Pagamento
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-foreground/3 p-4 rounded-2xl border border-border/50">
                      
                      {/* Pix QR Code Real */}
                      <div className="w-28 h-28 bg-white rounded-xl p-2 border border-border flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden">
                        <img 
                          src={`data:image/png;base64,${realPix.qrCodeBase64}`} 
                          alt="Mercado Pago QR Code Pix" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="space-y-1.5 flex-grow w-full">
                        <h4 className="font-extrabold text-xs">Escaneie o QR Code Pix</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Abra o app do seu banco, escolha pagar via Pix e aponte a câmera para o QR Code. Ou copie o código abaixo para pagar via "Pix Copia e Cola".
                        </p>
                        
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            readOnly
                            value={realPix.qrCode}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            className="flex-grow bg-background/50 border border-border rounded-lg py-1 px-2.5 text-[9px] font-mono text-muted-foreground outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="bg-foreground/5 hover:bg-foreground/10 text-foreground py-1 px-3.5 rounded-lg border border-border text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all outline-none cursor-pointer"
                          >
                            {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                            {pixCopied ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {verificationError && (
                      <div className="text-[10px] text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-1.5">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{verificationError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleVerifyPayment(false)}
                        disabled={verifyingPayment}
                        className="flex-1 font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl shadow-lg glow-hover transition-all flex items-center justify-center gap-1.5 outline-none cursor-pointer disabled:opacity-50"
                      >
                        {verifyingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Check className="w-4.5 h-4.5" /> Já paguei, verificar agora</>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setRealPix(null)}
                        disabled={verifyingPayment}
                        className="font-bold border border-border hover:bg-foreground/5 text-muted-foreground py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                    </div>

                    <div className="text-[10px] text-muted-foreground leading-relaxed p-2.5 bg-foreground/2 rounded-xl border border-border/50 flex items-start gap-1.5 justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 shrink-0" />
                      <span>Verificando o pagamento automaticamente a cada 5 segundos...</span>
                    </div>
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
              <span>Após fazer o Pix, clique em "Confirmar Pagamento Pix" para ativar sua conta na hora.</span>
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
