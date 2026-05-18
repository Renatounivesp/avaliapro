import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard-shell';

export const metadata = {
  title: 'Painel do Cliente | AvaliaPro',
  description: 'Gerencie sua página de avaliação do Google, QR Code e feedbacks de clientes.',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  // Sanitiza os dados para serem serializados com segurança no cliente
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company
      ? {
          name: user.company.name,
          slug: user.company.slug,
        }
      : null,
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          expiresAt: user.subscription.expiresAt.toISOString(),
        }
      : null,
  };

  return (
    <DashboardShell user={sanitizedUser}>
      {children}
    </DashboardShell>
  );
}
