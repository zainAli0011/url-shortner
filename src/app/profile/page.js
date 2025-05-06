import { ProfileForm } from '@/components/profile-form';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Profile - shorly.uk',
  description: 'Manage your shorly.uk profile and account settings.',
};

export default async function ProfilePage() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }
  
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>
      
      <ProfileForm />
    </div>
  );
} 