import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { companyId, rating, device } = await request.json();

    if (!companyId || !rating) {
      return NextResponse.json(
        { error: 'Parâmetros insuficientes.' },
        { status: 400 }
      );
    }

    // Registra o clique no analítico
    const click = await db.analytics.create({
      data: {
        companyId,
        type: 'CLICK',
        rating,
        device: device || 'DESKTOP',
      },
    });

    return NextResponse.json({ success: true, click });
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
