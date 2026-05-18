import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const sanitizedUser = {
    name: user.name,
    email: user.email,
  };

  return (
    <ProfileForm initialUser={sanitizedUser} />
  );
}
