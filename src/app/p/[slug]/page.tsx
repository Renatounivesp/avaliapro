import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { db } from '@/lib/db';
import PublicReviewPage from '@/components/public-review-page';
import { AlertCircle, ChevronLeft, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await db.company.findUnique({
    where: { slug },
  });

  if (!company) {
    return {
      title: 'AvaliaPro - Página de Avaliação',
      description: 'Deixe seu feedback de forma rápida e segura.',
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avaliaproo.vercel.app';
  const imageUrl = `${appUrl}/og-image.png`;
  const descriptionText = company.customPhrase || `Sua opinião é muito importante para nós! Deixe seu feedback sobre o ${company.name} de forma rápida e segura.`;

  return {
    title: `Avaliar ${company.name} - AvaliaPro`,
    description: descriptionText,
    openGraph: {
      title: `Avaliar ${company.name} - AvaliaPro`,
      description: descriptionText,
      url: `${appUrl}/p/${slug}`,
      siteName: 'AvaliaPro',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Avaliação do ${company.name}`,
        },
      ],
      locale: 'pt-BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Avaliar ${company.name} - AvaliaPro`,
      description: descriptionText,
      images: [imageUrl],
    },
  };
}

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

  // --- AUTOMATIC BILLING EXPIRATION CHECK FOR PUBLIC PAGE ---
  if (company.user.subscription && company.user.subscription.status === 'ACTIVE' && company.user.subscription.expiresAt < new Date()) {
    const updatedSub = await db.subscription.update({
      where: { id: company.user.subscription.id },
      data: { status: 'OVERDUE' },
    });
    company.user.subscription = updatedSub;
  }

  // --- SE ASSINATURA NÃO ESTÁ ATIVA: BLOQUEIA AVALIAÇÃO COM AVISO DE ASSINATURA PENDENTE ---
  const sub = company.user.subscription;
  const isSubscriptionActive = sub && (
    sub.status === 'ACTIVE' || 
    (sub.status === 'PENDING' && new Date(sub.expiresAt) > new Date())
  );

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
