import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AdminDashboard from '@/components/admin-dashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Super Admin Geral | AvaliaPro',
  description: 'Gerenciamento global de usuários, estabelecimentos, assinaturas e receita.',
};

export default async function AdminPage() {
  const admin = await getSessionUser();

  // 1. Garante que é um administrador autenticado
  if (!admin || admin.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // 2. Coleta métricas de performance SaaS globais
  const totalUsers = await db.user.count();
  const totalCompanies = await db.company.count();
  
  const totalVisits = await db.analytics.count({
    where: { type: 'VISIT' },
  });

  const revenueSum = await db.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: 'APPROVED',
    },
  });

  const totalRevenue = revenueSum._sum.amount || 0;

  // 3. Busca lista completa de usuários com relações
  const dbUsers = await db.user.findMany({
    include: {
      company: true,
      subscription: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const sanitizedUsers = dbUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    companyName: u.company ? u.company.name : null,
    companySlug: u.company ? u.company.slug : null,
    subscriptionStatus: u.subscription ? u.subscription.status : null,
    subscriptionExpiresAt: u.subscription ? u.subscription.expiresAt.toISOString() : null,
  }));

  return (
    <AdminDashboard
      stats={{
        totalUsers,
        totalCompanies,
        totalVisits,
        totalRevenue,
      }}
      users={sanitizedUsers}
    />
  );
}
