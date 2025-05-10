import { NextResponse } from 'next/server';
import { getUrlByShortId, deleteUrl } from '@/lib/url-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Get a specific URL by its short ID
export async function GET(request, { params }) {
  try {
    const { shortId } = await params;
    
    if (!shortId) {
      return NextResponse.json(
        { error: 'Short ID is required' },
        { status: 400 }
      );
    }
    
    const url = await getUrlByShortId(shortId);
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }
    
    // Don't expose sensitive information for URLs that don't belong to the user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (url.userId && url.userId !== userId) {
      // Return limited information for URLs that don't belong to the user
      return NextResponse.json({
        shortId: url.shortId,
        originalUrl: url.originalUrl,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
      });
    }
    
    return NextResponse.json(url);
  } catch (error) {
    console.error('Error fetching URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URL' },
      { status: 500 }
    );
  }
}

// Delete a URL by its short ID
export async function DELETE(request, { params }) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { shortId } = await params;
    
    if (!shortId) {
      return NextResponse.json(
        { error: 'Short ID is required' },
        { status: 400 }
      );
    }
    
    const result = await deleteUrl(shortId, session.user.id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'URL not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: 'Failed to delete URL' },
      { status: 500 }
    );
  }
} 