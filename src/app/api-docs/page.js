import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'API Documentation - shorly.uk',
  description: 'Learn how to use the shorly.uk API to create and manage shortened URLs.',
};

export default function ApiDocsPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground">
          Learn how to use the shorly.uk API to create and manage shortened URLs.
        </p>
      </div>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a Shortened URL</CardTitle>
            <CardDescription>
              POST /api/url
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Request Body</h3>
                <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto">
                  {JSON.stringify({
                    originalUrl: 'https://example.com/very-long-url',
                    customId: 'my-custom-id', // Optional
                    title: 'My Link Title', // Optional
                  }, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Response</h3>
                <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto">
                  {JSON.stringify({
                    _id: '60f7b0b3e6b3a50015b3b3b3',
                    originalUrl: 'https://example.com/very-long-url',
                    shortId: 'my-custom-id',
                    userId: 'anonymous',
                    title: 'My Link Title',
                    clicks: [],
                    clickCount: 0,
                    createdAt: '2023-07-21T12:00:00.000Z',
                    expiresAt: '2024-07-21T12:00:00.000Z',
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Get All URLs</CardTitle>
            <CardDescription>
              GET /api/url
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-sm font-medium">Response</h3>
              <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto">
                {JSON.stringify([
                  {
                    _id: '60f7b0b3e6b3a50015b3b3b3',
                    originalUrl: 'https://example.com/very-long-url',
                    shortId: 'my-custom-id',
                    userId: 'anonymous',
                    title: 'My Link Title',
                    clickCount: 5,
                    createdAt: '2023-07-21T12:00:00.000Z',
                    expiresAt: '2024-07-21T12:00:00.000Z',
                  }
                ], null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Get Analytics for a URL</CardTitle>
            <CardDescription>
              GET /api/url/:shortId/analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-sm font-medium">Response</h3>
              <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto">
                {JSON.stringify({
                  url: {
                    _id: '60f7b0b3e6b3a50015b3b3b3',
                    originalUrl: 'https://example.com/very-long-url',
                    shortId: 'my-custom-id',
                    title: 'My Link Title',
                  },
                  countryStats: {
                    'United States': 3,
                    'United Kingdom': 2,
                    'Germany': 1,
                  },
                  dailyClicks: [
                    { date: '2023-07-21', clicks: 2 },
                    { date: '2023-07-22', clicks: 4 },
                  ],
                  totalClicks: 6,
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Delete a URL</CardTitle>
            <CardDescription>
              DELETE /api/url/:shortId
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-sm font-medium">Response</h3>
              <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto">
                {JSON.stringify({
                  success: true,
                  message: 'URL deleted successfully',
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 