import { NextResponse } from 'next/server';
import { getUrlAnalytics } from '@/lib/url-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Get analytics for a specific URL
export async function GET(request, { params }) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { shortId } = params;
    
    if (!shortId) {
      return NextResponse.json(
        { error: 'Short ID is required' },
        { status: 400 }
      );
    }
    
    const analytics = await getUrlAnalytics(shortId, session.user.id);
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'URL not found or you do not have permission to view analytics' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching URL analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URL analytics' },
      { status: 500 }
    );
  }
} 