import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword, verifyPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Verifica se o e-mail já está em uso por outro usuário
    const existingUser = await db.user.findFirst({
      where: {
        email: email.toLowerCase(),
        NOT: { id: user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está sendo utilizado.' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      email: email.toLowerCase(),
    };

    // 2. Trata alteração de senha se solicitada
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Você deve informar sua senha atual para definir uma nova.' },
          { status: 400 }
        );
      }

      const isValidPassword = verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Sua senha atual informada está incorreta.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve conter no mínimo 6 caracteres.' },
          { status: 400 }
        );
      }

      updateData.password = hashPassword(newPassword);
    }

    // 3. Atualiza o usuário
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
