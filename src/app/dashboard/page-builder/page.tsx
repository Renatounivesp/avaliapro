import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PageBuilderForm from '@/components/page-builder-form';

export const dynamic = 'force-dynamic';

export default async function PageBuilderPage() {
  const user = await getSessionUser();

  if (!user || !user.company) {
    redirect('/login');
  }

  // Sanitiza dados para o cliente
  const sanitizedCompany = {
    name: user.company.name,
    slug: user.company.slug,
    logoUrl: user.company.logoUrl,
    googleReviewUrl: user.company.googleReviewUrl,
    customPhrase: user.company.customPhrase,
    primaryColor: user.company.primaryColor,
    secondaryColor: user.company.secondaryColor,
    textColor: user.company.textColor,
    bgColor: user.company.bgColor,
    satisfactionFilter: user.company.satisfactionFilter,
  };

  return (
    <PageBuilderForm initialCompany={sanitizedCompany} />
  );
}
