import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado.');
      return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    const paymentClient = new Payment(client);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Cria o pagamento no Mercado Pago
    const response = await paymentClient.create({
      body: {
        transaction_amount: 9.90,
        description: 'Plano Pro Mensal - AvaliaPro',
        payment_method_id: 'pix',
        payer: {
          email: user.email,
          first_name: user.name.split(' ')[0] || 'Cliente',
          last_name: user.name.split(' ').slice(1).join(' ') || 'AvaliaPro',
        },
        external_reference: user.subscription.id,
        notification_url: `${appUrl}/api/billing/webhook`,
      }
    });

    // Retorna os dados necessários para o Pix
    return NextResponse.json({
      success: true,
      paymentId: response.id,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento Pix no Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar o Pix. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
