import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.company) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const {
      name,
      googleReviewUrl,
      customPhrase,
      primaryColor,
      secondaryColor,
      textColor,
      bgColor,
      satisfactionFilter,
      logoUrl,
    } = await request.json();

    if (!name || !googleReviewUrl) {
      return NextResponse.json(
        { error: 'Nome da empresa e Link do Google são obrigatórios.' },
        { status: 400 }
      );
    }

    // Atualiza a empresa vinculada ao usuário
    const updatedCompany = await db.company.update({
      where: { id: user.company.id },
      data: {
        name,
        googleReviewUrl,
        customPhrase: customPhrase || 'Como foi sua experiência conosco?',
        primaryColor: primaryColor || '#4F46E5',
        secondaryColor: secondaryColor || '#06B6D4',
        textColor: textColor || '#1F2937',
        bgColor: bgColor || '#F9FAFB',
        satisfactionFilter: satisfactionFilter !== undefined ? satisfactionFilter : true,
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json({ success: true, company: updatedCompany });
  } catch (error: any) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
