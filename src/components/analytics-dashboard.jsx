'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getCode } from 'country-flag-icons';
import { WorldMap } from '@/components/world-map';
import { SimpleMap } from '@/components/simple-map';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export function AnalyticsDashboard({ shortId }) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (shortId) {
      fetchAnalytics();
    }
  }, [shortId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/url/${shortId}/analytics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const shortUrl = `${window.location.origin}/${shortId}`;
    navigator.clipboard.writeText(shortUrl);
    setIsCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Prepare chart data for daily clicks
  const clicksChartData = {
    labels: analytics?.dailyClicks.map(item => item.date) || [],
    datasets: [
      {
        label: 'Clicks',
        data: analytics?.dailyClicks.map(item => item.clicks) || [],
        fill: false,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Prepare chart data for country distribution
  const countryChartData = {
    labels: analytics ? Object.keys(analytics.countryStats) : [],
    datasets: [
      {
        label: 'Clicks by Country',
        data: analytics ? Object.values(analytics.countryStats) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Analytics Error</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error || 'Failed to load analytics'}</p>
              <Button onClick={fetchAnalytics}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">URL Analytics</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{analytics.url.title || analytics.url.originalUrl.substring(0, 50)}</CardTitle>
          <CardDescription className="flex items-center">
            <span className="text-primary">
              {`${window.location.origin}/${shortId}`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-1"
              onClick={handleCopy}
            >
              {isCopied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Clicks</CardDescription>
                <CardTitle className="text-3xl">{analytics.totalClicks}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Countries</CardDescription>
                <CardTitle className="text-3xl">{Object.keys(analytics.countryStats).length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Created</CardDescription>
                <CardTitle className="text-base">
                  {new Date(analytics.url.createdAt).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Expires</CardDescription>
                <CardTitle className="text-base">
                  {new Date(analytics.url.expiresAt).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          <Tabs defaultValue="clicks" className="mt-6">
            <TabsList>
              <TabsTrigger value="clicks">Daily Clicks</TabsTrigger>
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="map">World Map</TabsTrigger>
            </TabsList>
            <TabsContent value="clicks" className="pt-4">
              <div className="h-[300px]">
                <Line 
                  data={clicksChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
            </TabsContent>
            <TabsContent value="countries" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[300px]">
                  <Pie 
                    data={countryChartData} 
                    options={{ maintainAspectRatio: false }} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Top Countries</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.countryStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([country, clicks]) => (
                        <div key={country} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span>{country}</span>
                          </div>
                          <span className="font-medium">{clicks} clicks</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="map" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Geographical Distribution</CardTitle>
                  <CardDescription>Visual representation of clicks by country</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.countryStats).length > 0 ? (
                    <SimpleMap countryStats={analytics.countryStats} />
                  ) : (
                    <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">No geographical data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 