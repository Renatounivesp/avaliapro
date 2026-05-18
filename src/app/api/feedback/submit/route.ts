import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const {
      companyId,
      customerName,
      customerEmail,
      customerPhone,
      rating,
      comments,
    } = await request.json();

    if (!companyId || !customerName || !rating || !comments) {
      return NextResponse.json(
        { error: 'Nome, nota e comentários são obrigatórios.' },
        { status: 400 }
      );
    }

    // Cria o feedback negativo no banco de dados
    const feedback = await db.feedback.create({
      data: {
        companyId,
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        rating, // "RUIM" | "PESSIMA"
        comments,
        status: 'PENDENTE',
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Erro ao submeter feedback de ouvidoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
