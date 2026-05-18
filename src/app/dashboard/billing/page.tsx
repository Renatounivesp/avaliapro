import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import BillingControl from '@/components/billing-control';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getSessionUser();

  if (!user || !user.subscription) {
    redirect('/login');
  }

  // Busca histórico de pagamentos ordenado por data descendente
  const dbPayments = await db.payment.findMany({
    where: { subscriptionId: user.subscription.id },
    orderBy: { createdAt: 'desc' },
  });

  const sanitizedPayments = dbPayments.map((p) => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    gateway: p.gateway,
    createdAt: p.createdAt.toISOString(),
  }));

  const sanitizedSub = {
    status: user.subscription.status,
    expiresAt: user.subscription.expiresAt.toISOString(),
    payments: sanitizedPayments,
  };

  return (
    <BillingControl subscription={sanitizedSub} />
  );
}
