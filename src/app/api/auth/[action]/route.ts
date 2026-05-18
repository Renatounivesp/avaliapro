import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  signToken,
  setSessionCookie,
  deleteSessionCookie,
  verifyToken
} from '@/lib/auth';

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .replace(/\s+/g, '-') // substitui espaços por -
    .replace(/[^\w-]+/g, '') // remove caracteres não-alfanuméricos
    .replace(/--+/g, '-'); // remove múltiplos hifens
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    // --- CADASTRO ---
    if (action === 'register') {
      const { name, email, companyName, password } = await request.json();

      if (!name || !email || !companyName || !password) {
        return NextResponse.json(
          { error: 'Todos os campos são obrigatórios.' },
          { status: 400 }
        );
      }

      // Verifica se o usuário já existe
      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Este e-mail já está sendo utilizado.' },
          { status: 400 }
        );
      }

      // Cria slug único para a empresa
      let slug = generateSlug(companyName);
      const existingCompanySlug = await db.company.findUnique({
        where: { slug },
      });

      if (existingCompanySlug) {
        // Se já existe, adiciona caracteres aleatórios no slug
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Cria o usuário, empresa e assinatura
      const hashedPassword = hashPassword(password);
      
      const user = await db.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: email.toLowerCase() === 'admin@avaliapro.com.br' ? 'ADMIN' : 'USER',
          company: {
            create: {
              name: companyName,
              slug,
              googleReviewUrl: 'https://search.google.com/local/writereview?placeid=',
              customPhrase: 'Sua opinião é muito importante para nós! Como foi sua experiência?',
            },
          },
          subscription: {
            create: {
              status: 'PENDING', // PENDENTE até assinar
              expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias de trial gratuito simulado
            },
          },
        },
      });

      // Cria sessão segura
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      await setSessionCookie(token);

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }

    // --- LOGIN ---
    if (action === 'login') {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Por favor, informe e-mail e senha.' },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'E-mail ou senha incorretos.' },
          { status: 400 }
        );
      }

      if (user.status === 'BLOCKED') {
        return NextResponse.json(
          { error: 'Sua conta está bloqueada pelo administrador.' },
          { status: 403 }
        );
      }

      const isValidPassword = verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'E-mail ou senha incorretos.' },
          { status: 400 }
        );
      }

      // Cria sessão segura
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      await setSessionCookie(token);

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }

    // --- LOGOUT ---
    if (action === 'logout') {
      await deleteSessionCookie();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação não encontrada.' }, { status: 404 });
  } catch (error: any) {
    console.error('Erro na API de autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    if (action === 'session') {
      const sessionToken = request.cookies.get('avaliapro_session')?.value;
      if (!sessionToken) {
        return NextResponse.json({ user: null });
      }

      const decoded = verifyToken(sessionToken);
      if (!decoded) {
        return NextResponse.json({ user: null });
      }

      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          company: {
            select: {
              name: true,
              slug: true,
              logoUrl: true,
              primaryColor: true,
              secondaryColor: true,
              satisfactionFilter: true,
            },
          },
          subscription: {
            select: {
              status: true,
              expiresAt: true,
            },
          },
        },
      });

      if (!user || user.status === 'BLOCKED') {
        await deleteSessionCookie();
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({ user });
    }

    if (action === 'logout') {
      await deleteSessionCookie();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação não encontrada.' }, { status: 404 });
  } catch (error) {
    console.error('Erro de sessão GET:', error);
    return NextResponse.json({ user: null });
  }
}
