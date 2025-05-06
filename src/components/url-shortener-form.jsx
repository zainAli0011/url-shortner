'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { temporaryUrlCache } from '@/lib/temporary-url-cache';

export function UrlShortenerForm() {
  const { data: session } = useSession();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customId, setCustomId] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl,
          customId: customId || undefined,
          title: title || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shortened URL');
      }
      
      // If this is a temporary URL (user is not logged in), store it in the cache
      if (data.isTemporary) {
        temporaryUrlCache.set(data.shortId, data);
        
        // Show warning about temporary URL
        toast.warning('This URL is temporary and will not be saved. Sign in to create permanent URLs.');
      }
      
      // Create the full shortened URL
      const shortUrl = `${window.location.origin}/${data.shortId}`;
      setShortenedUrl(shortUrl);
      toast.success('URL shortened successfully!');
      
      // Reset form if successful
      if (!data.isTemporary) {
        setOriginalUrl('');
        setCustomId('');
        setTitle('');
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setIsCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Shorten Your URL</CardTitle>
        <CardDescription>
          Create a shortened URL that's easy to share and track.
          {!session && (
            <span className="block mt-2 text-amber-500">
              Note: URLs created without logging in are temporary and will expire after 24 hours.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originalUrl">URL to shorten</Label>
            <Input
              id="originalUrl"
              type="url"
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customId">Custom ID (optional)</Label>
              <Input
                id="customId"
                placeholder="my-custom-url"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="My awesome link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || !originalUrl}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Shortening...
                </>
              ) : (
                'Shorten URL'
              )}
            </Button>
            
            {!session && (
              <Button 
                type="button" 
                variant="outline"
                className="sm:w-auto"
                asChild
              >
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in for permanent URLs
                </Link>
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      
      {shortenedUrl && (
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm font-medium">Your shortened URL:</div>
          <div className="flex w-full items-center space-x-2">
            <Input
              value={shortenedUrl}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 