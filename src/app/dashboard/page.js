import { UrlList } from '@/components/url-list';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard - shorly.uk',
  description: 'Manage your shortened URLs and view their performance.',
};

export default async function DashboardPage() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }
  
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Your URLs</h1>
        <p className="text-muted-foreground">
          Manage your shortened URLs and track their performance.
        </p>
      </div>
      
      <UrlList />
    </div>
  );
} 