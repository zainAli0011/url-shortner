import { NextResponse } from 'next/server';
import { createShortUrl, getUserUrls } from '@/lib/url-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// Create a new shortened URL
export async function POST(request) {
  try {
    const { originalUrl, customId, title } = await request.json();
    
    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const isTemporary = !userId;
    
    // Create the shortened URL
    const url = await createShortUrl(originalUrl, customId, userId, title, isTemporary);
    
    return NextResponse.json(url);
  } catch (error) {
    console.error('Error creating short URL:', error);
    
    if (error.message === 'Custom ID already in use') {
      return NextResponse.json(
        { error: 'Custom ID already in use' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create shortened URL' },
      { status: 500 }
    );
  }
}

// Get all URLs for the current user
export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const urls = await getUserUrls(session.user.id);
    return NextResponse.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URLs' },
      { status: 500 }
    );
  }
} 