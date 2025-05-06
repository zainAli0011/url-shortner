'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, BarChart3, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function UrlList() {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/url');
      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast.error('Failed to load URLs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (shortId) => {
    const shortUrl = `${window.location.origin}/${shortId}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(shortId);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (shortId) => {
    try {
      const response = await fetch(`/api/url/${shortId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }
      
      setUrls(urls.filter(url => url.shortId !== shortId));
      toast.success('URL deleted successfully');
    } catch (error) {
      console.error('Error deleting URL:', error);
      toast.error('Failed to delete URL');
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <Card className="text-center p-6">
        <p className="text-muted-foreground mb-4">You haven't created any shortened URLs yet.</p>
        <Button asChild>
          <Link href="/">Create your first short URL</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {urls.map((url) => (
        <Card key={url._id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium truncate">
              {url.title || url.originalUrl.substring(0, 50)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-primary">
                  {`${window.location.origin}/${url.shortId}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={() => handleCopy(url.shortId)}
                >
                  {copiedId === url.shortId ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(url.createdAt)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {url.clickCount} {url.clickCount === 1 ? 'click' : 'clicks'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/analytics/${url.shortId}`}>
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Analytics
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(url.shortId)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 