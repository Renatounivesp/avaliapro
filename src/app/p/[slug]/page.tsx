import { headers } from 'next/headers';
import Link from 'next/link';
import { db } from '@/lib/db';
import PublicReviewPage from '@/components/public-review-page';
import { AlertCircle, ChevronLeft, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Busca a empresa associada ao slug, incluindo dados de assinatura do usuário proprietário
  const company = await db.company.findUnique({
    where: { slug },
    include: {
      user: {
        include: {
          subscription: true,
        },
      },
    },
  });

  // --- SE EMPRESA NÃO EXISTE: RETORNA 404 PERSONALIZADO PREMIUM ---
  if (!company) {
    return (
      <div className="mesh-bg min-h-screen flex flex-col justify-center items-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center space-y-6 border border-white/10 relative z-10 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Página Não Encontrada</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              O link de avaliação acessado não corresponde a nenhum estabelecimento cadastrado no AvaliaPro. Verifique o endereço digitado.
            </p>
          </div>
          <Link
            href="/"
            className="w-full font-bold text-xs bg-primary hover:bg-primary/95 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Ir Para a Home
          </Link>
        </div>
      </div>
    );
  }

  // --- SE ASSINATURA NÃO ESTÁ ATIVA: BLOQUEIA AVALIAÇÃO COM AVISO DE ASSINATURA PENDENTE ---
  const isSubscriptionActive = company.user.subscription?.status === 'ACTIVE';

  if (!isSubscriptionActive) {
    return (
      <div className="mesh-bg min-h-screen flex flex-col justify-center items-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center space-y-6 border border-white/10 relative z-10 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Estabelecimento Indisponível</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              A página de avaliações do estabelecimento **{company.name}** está temporariamente suspensa por questões de faturamento da assinatura Pro.
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground bg-foreground/2 border border-border p-3 rounded-xl font-medium">
            Se você é o administrador do estabelecimento, acesse sua conta no painel e regularize seu faturamento para reativar seu canal instantaneamente.
          </div>
          <Link
            href="/login"
            className="w-full font-bold text-xs bg-primary hover:bg-primary/95 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            Acessar Minha Conta <Star className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // --- SE ESTÁ EM DIA: DETECTA DISPOSITIVO E REGISTRA VISITA ---
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  let device = 'DESKTOP';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    if (/ipad|tablet/i.test(ua)) {
      device = 'TABLET';
    } else {
      device = 'MOBILE';
    }
  }

  // Grava estatística de visita
  await db.analytics.create({
    data: {
      companyId: company.id,
      type: 'VISIT',
      device,
    },
  });

  const sanitizedCompany = {
    id: company.id,
    name: company.name,
    logoUrl: company.logoUrl,
    googleReviewUrl: company.googleReviewUrl,
    customPhrase: company.customPhrase,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    textColor: company.textColor,
    bgColor: company.bgColor,
    satisfactionFilter: company.satisfactionFilter,
  };

  return (
    <PublicReviewPage
      company={sanitizedCompany}
      device={device}
    />
  );
}
