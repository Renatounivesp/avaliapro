import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import DashboardOverview from '@/components/dashboard-overview';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user || !user.company) {
    redirect('/login');
  }

  const companyId = user.company.id;

  // 1. Busca estatísticas totais
  const totalVisits = await db.analytics.count({
    where: { companyId, type: 'VISIT' },
  });

  const totalClicks = await db.analytics.count({
    where: { companyId, type: 'CLICK' },
  });

  const totalFeedbacks = await db.feedback.count({
    where: { companyId },
  });

  const conversionRate = totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;

  // 2. Busca estatísticas por dispositivos
  const mobileVisits = await db.analytics.count({
    where: { companyId, type: 'VISIT', device: 'MOBILE' },
  });

  const desktopVisits = await db.analytics.count({
    where: { companyId, type: 'VISIT', device: 'DESKTOP' },
  });

  const tabletVisits = await db.analytics.count({
    where: { companyId, type: 'VISIT', device: 'TABLET' },
  });

  // 3. Processa dados do gráfico nos últimos 7 dias (incluindo hoje)
  const chartData = [];
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Busca todos os registros analíticos da última semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  oneWeekAgo.setHours(0, 0, 0, 0);

  const weeklyAnalytics = await db.analytics.findMany({
    where: {
      companyId,
      createdAt: {
        gte: oneWeekAgo,
      },
    },
  });

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    const dayLabel = daysOfWeek[targetDate.getDay()];
    
    // Filtra registros do dia correspondente
    const dailyVisits = weeklyAnalytics.filter((a) => {
      const aDate = new Date(a.createdAt);
      return (
        a.type === 'VISIT' &&
        aDate.getDate() === targetDate.getDate() &&
        aDate.getMonth() === targetDate.getMonth() &&
        aDate.getFullYear() === targetDate.getFullYear()
      );
    }).length;

    const dailyClicks = weeklyAnalytics.filter((a) => {
      const aDate = new Date(a.createdAt);
      return (
        a.type === 'CLICK' &&
        aDate.getDate() === targetDate.getDate() &&
        aDate.getMonth() === targetDate.getMonth() &&
        aDate.getFullYear() === targetDate.getFullYear()
      );
    }).length;

    chartData.push({
      day: dayLabel,
      visits: dailyVisits,
      clicks: dailyClicks,
    });
  }

  // 4. Busca os 3 feedbacks negativos mais recentes
  const dbFeedbacks = await db.feedback.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const recentFeedbacks = dbFeedbacks.map((fb) => ({
    id: fb.id,
    customerName: fb.customerName,
    comments: fb.comments,
    rating: fb.rating,
    status: fb.status,
    createdAt: fb.createdAt.toISOString(),
  }));

  // Sanitiza os dados para serem serializados com segurança no cliente
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: {
      name: user.company.name,
      slug: user.company.slug,
    },
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          expiresAt: user.subscription.expiresAt.toISOString(),
        }
      : null,
  };

  return (
    <DashboardOverview
      user={sanitizedUser}
      stats={{
        visits: totalVisits,
        clicks: totalClicks,
        conversion: conversionRate,
        feedbacks: totalFeedbacks,
      }}
      deviceStats={{
        mobile: mobileVisits,
        desktop: desktopVisits,
        tablet: tabletVisits,
      }}
      chartData={chartData}
      recentFeedbacks={recentFeedbacks}
    />
  );
}
