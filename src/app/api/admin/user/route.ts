import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// --- ATUALIZAR STATUS DE USUÁRIO (BLOQUEAR / DESBLOQUEAR) ---
export async function PUT(request: NextRequest) {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { userId, status, toggleLifetime } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório.' },
        { status: 400 }
      );
    }

    // --- TRATA ALTERAÇÃO PARA ACESSO VITALÍCIO ---
    if (toggleLifetime) {
      const subscription = await db.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: 'Assinatura não encontrada para este usuário.' },
          { status: 404 }
        );
      }

      const isCurrentlyLifetime = subscription.expiresAt.getFullYear() >= 2099;
      
      let nextStatus = 'ACTIVE';
      let nextExpiresAt = new Date('2099-12-31T23:59:59.000Z');

      if (isCurrentlyLifetime) {
        // Remove vitalício: define como pendente expirando agora
        nextStatus = 'PENDING';
        nextExpiresAt = new Date();
      }

      const updatedSub = await db.subscription.update({
        where: { userId },
        data: {
          status: nextStatus,
          expiresAt: nextExpiresAt,
        },
      });

      return NextResponse.json({ success: true, subscription: updatedSub });
    }

    // --- TRATA ALTERAÇÃO DE BLOQUEIO (ATIVO / BLOQUEADO) ---
    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório para esta ação.' },
        { status: 400 }
      );
    }

    // Impede o administrador de se auto-bloquear
    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'Você não pode alterar seu próprio status administrativo.' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { status },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Erro na API administrativa (PUT):', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

// --- DELETAR USUÁRIO DA PLATAFORMA ---
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório.' },
        { status: 400 }
      );
    }

    // Impede o administrador de se auto-excluir
    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'Você não pode auto-excluir sua própria conta de administrador.' },
        { status: 400 }
      );
    }

    // Remove o usuário. A relação com cascade configurada no Prisma removerá 
    // automaticamente todas as tabelas vinculadas (Company, Subscription, Feedbacks, etc.)
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro na API administrativa (DELETE):', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
