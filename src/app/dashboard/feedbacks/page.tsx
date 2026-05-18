import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import FeedbackList from '@/components/feedback-list';

export const dynamic = 'force-dynamic';

export default async function FeedbacksPage() {
  const user = await getSessionUser();

  if (!user || !user.company) {
    redirect('/login');
  }

  // Busca todos os feedbacks negativos
  const feedbacks = await db.feedback.findMany({
    where: { companyId: user.company.id },
    orderBy: { createdAt: 'desc' },
  });

  // Sanitiza dados para o cliente
  const sanitizedFeedbacks = feedbacks.map((fb) => ({
    id: fb.id,
    customerName: fb.customerName,
    customerEmail: fb.customerEmail,
    customerPhone: fb.customerPhone,
    rating: fb.rating,
    comments: fb.comments,
    status: fb.status,
    createdAt: fb.createdAt.toISOString(),
  }));

  return (
    <FeedbackList initialFeedbacks={sanitizedFeedbacks} />
  );
}
