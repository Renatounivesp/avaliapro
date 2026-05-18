import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.company) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios.' },
        { status: 400 }
      );
    }

    // Valida se o status é aceito
    const validStatuses = ['PENDENTE', 'EM_CONTATO', 'RESOLVIDO'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status de feedback inválido.' },
        { status: 400 }
      );
    }

    // Busca o feedback e garante que pertence à empresa do usuário logado
    const feedback = await db.feedback.findUnique({
      where: { id },
    });

    if (!feedback || feedback.companyId !== user.company.id) {
      return NextResponse.json(
        { error: 'Feedback não encontrado ou não pertence à sua empresa.' },
        { status: 404 }
      );
    }

    // Atualiza o status do feedback
    const updatedFeedback = await db.feedback.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, feedback: updatedFeedback });
  } catch (error: any) {
    console.error('Erro ao atualizar status de feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
