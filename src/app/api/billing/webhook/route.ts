import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type') || url.searchParams.get('topic');

    // Se vier no body
    let body;
    try {
      body = await request.json();
    } catch {
      // Body não é JSON ou vazio
    }

    const paymentId = id || body?.data?.id;
    const notificationType = type || body?.type;

    if (notificationType !== 'payment' || !paymentId) {
      return new NextResponse('Ignorado - Não é uma notificação de pagamento', { status: 200 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado.');
      return new NextResponse('Erro no servidor', { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    const paymentClient = new Payment(client);

    const paymentData = await paymentClient.get({ id: paymentId });

    if (!paymentData || !paymentData.external_reference) {
      return new NextResponse('Referência externa não encontrada', { status: 400 });
    }

    const subscriptionId = paymentData.external_reference;
    const status = paymentData.status;

    if (status === 'approved') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Adiciona 30 dias

      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          expiresAt,
          gatewaySubscriptionId: `mp_${paymentId}`,
        },
      });

      // Registra o pagamento
      await db.payment.create({
        data: {
          subscriptionId,
          amount: paymentData.transaction_amount || 9.90,
          status: 'APPROVED',
          gateway: 'MERCADOPAGO',
        },
      });
    }

    return new NextResponse('Webhook processado com sucesso', { status: 200 });
  } catch (error: any) {
    console.error('Erro no webhook do Mercado Pago:', error);
    return new NextResponse('Erro interno ao processar webhook', { status: 500 });
  }
}
