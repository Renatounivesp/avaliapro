import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'avaliapro_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

  // Rotas protegidas que exigem login
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  
  // Rotas de autenticação (não podem ser acessadas se já logado)
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  if (isProtectedRoute) {
    if (!sessionToken) {
      // Redireciona para o login se não estiver logado
      const loginUrl = new URL('/login', request.url);
      // Salva a URL original para redirecionamento pós-login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthRoute) {
    if (sessionToken) {
      // Se já estiver logado, manda direto para o dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configura quais rotas ativam o middleware
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
