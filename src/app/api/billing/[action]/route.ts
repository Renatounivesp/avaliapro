import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    const user = await getSessionUser();
    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const subscriptionId = user.subscription.id;

    // --- ASSINAR / PAGAR PLANO SIMULADO ---
    if (action === 'subscribe') {
      const { paymentMethod } = await request.json(); // "PIX" | "CREDIT_CARD"

      // Calcula novo vencimento: 30 dias a partir de hoje
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // 1. Atualiza assinatura para ATIVA
      const updatedSub = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          expiresAt,
          gatewaySubscriptionId: `sub_mock_${Math.random().toString(36).substring(7)}`,
        },
      });

      // 2. Registra o pagamento aprovado no histórico
      await db.payment.create({
        data: {
          subscriptionId,
          amount: 9.90,
          status: 'APPROVED',
          gateway: paymentMethod === 'PIX' ? 'MERCADOPAGO' : 'STRIPE',
        },
      });

      return NextResponse.json({ success: true, subscription: updatedSub });
    }

    // --- CANCELAR ASSINATURA ---
    if (action === 'cancel') {
      const updatedSub = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'INACTIVE', // Muda para INACTIVE para testar nova compra na hora
        },
      });

      return NextResponse.json({ success: true, subscription: updatedSub });
    }

    // --- SIMULAR INADIMPLÊNCIA / BLOQUEIO ---
    if (action === 'simulate-overdue') {
      const updatedSub = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'OVERDUE',
        },
      });

      return NextResponse.json({ success: true, subscription: updatedSub });
    }

    return NextResponse.json({ error: 'Ação faturamento não encontrada.' }, { status: 404 });
  } catch (error: any) {
    console.error('Erro na API de faturamento:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
