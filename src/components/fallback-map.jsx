'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FallbackMap({ countryStats = {} }) {
  // Sort countries by click count
  const sortedCountries = Object.entries(countryStats)
    .sort(([, clicksA], [, clicksB]) => clicksB - clicksA);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedCountries.length > 0 ? (
              sortedCountries.map(([country, clicks]) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span>{country}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-muted rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ 
                          width: `${Math.min(100, (clicks / sortedCountries[0][1]) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="font-medium">{clicks} clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No geographical data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 