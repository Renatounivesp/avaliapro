import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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
    const preference = new Preference(client);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await preference.create({
      body: {
        items: [
          {
            id: 'plano-pro-mensal',
            title: 'Plano Pro Mensal - AvaliaPro',
            quantity: 1,
            unit_price: 9.90,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: user.email,
          name: user.name,
        },
        back_urls: {
          success: `${appUrl}/dashboard/billing?status=success`,
          failure: `${appUrl}/dashboard/billing?status=failure`,
          pending: `${appUrl}/dashboard/billing?status=pending`,
        },
        auto_return: 'approved',
        external_reference: user.subscription.id,
        notification_url: `${appUrl}/api/billing/webhook`,
      }
    });

    return NextResponse.json({ init_point: response.init_point });
  } catch (error: any) {
    console.error('Erro ao criar preferência do Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao contatar o Mercado Pago.' },
      { status: 500 }
    );
  }
}
