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

  // Simulação states
  const [simulating, setSimulating] = useState<string | null>(null);

  const subStatus = subscription.status;
  const isSubActive = subStatus === 'ACTIVE';

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      setSuccessMsg(true);
      // Remove o param da URL para não ficar aparecendo toda vez que recarregar
      window.history.replaceState(null, '', '/dashboard/billing');
    }
  }, [searchParams]);

  // Redireciona para o Checkout Pro do Mercado Pago
  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/mercado-pago/create', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (response.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Erro ao gerar pagamento: ' + (data.error || 'Erro desconhecido.'));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor.');
      setLoading(false);
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

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {!isSubActive ? (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="font-bold bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-xl shadow-lg glow-hover transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecionando...</>
                ) : (
                  <>Pagar via Mercado Pago <Lock className="w-4 h-4" /></>
                )}
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
