import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'URL Analytics - shorly.uk',
  description: 'Detailed analytics for your shortened URL.',
};

export default async function AnalyticsPage({ params }) {
  // Server-side authentication check
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/login?callbackUrl=/analytics/${params.shortId}`);
  }
  
  const { shortId } = params;
  
  return (
    <div className="container py-8 md:py-12">
      <AnalyticsDashboard shortId={shortId} />
    </div>
  );
} 