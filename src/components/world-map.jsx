'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker 
} from 'react-simple-maps';
import iso2to3 from 'country-iso-2-to-3';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';
import { FallbackMap } from '@/components/fallback-map';

// World map GeoJSON data - use a more reliable source
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

// Feature detection for browser compatibility
const isBrowser = typeof window !== 'undefined';
const hasTouch = isBrowser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Country name to ISO2 code mapping (for major countries)
const countryNameToCode = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Canada': 'CA',
  'Australia': 'AU',
  'India': 'IN',
  'China': 'CN',
  'Japan': 'JP',
  'Brazil': 'BR',
  'Russia': 'RU',
  'South Africa': 'ZA',
  'Mexico': 'MX',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Finland': 'FI',
  'Denmark': 'DK',
  'Poland': 'PL',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Turkey': 'TR',
  'Egypt': 'EG',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'South Korea': 'KR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Morocco': 'MA',
  'Israel': 'IL',
  'New Zealand': 'NZ',
  'Ireland': 'IE',
  'Unknown': 'UN'
};

// Approximate center coordinates for countries
const countryCoordinates = {
  'US': [-95.7129, 37.0902],
  'GB': [-0.1278, 51.5074],
  'DE': [10.4515, 51.1657],
  'FR': [2.2137, 46.2276],
  'CA': [-106.3468, 56.1304],
  'AU': [133.7751, -25.2744],
  'IN': [78.9629, 20.5937],
  'CN': [104.1954, 35.8617],
  'JP': [138.2529, 36.2048],
  'BR': [-51.9253, -14.2350],
  'RU': [105.3188, 61.5240],
  'ZA': [22.9375, -30.5595],
  'MX': [-102.5528, 23.6345],
  'IT': [12.5674, 41.8719],
  'ES': [-3.7492, 40.4637],
  'NL': [5.2913, 52.1326],
  'SE': [18.6435, 60.1282],
  'NO': [8.4689, 60.4720],
  'FI': [25.7482, 61.9241],
  'DK': [9.5018, 56.2639],
  'PL': [19.1451, 51.9194],
  'CH': [8.2275, 46.8182],
  'AT': [14.5501, 47.5162],
  'BE': [4.4699, 50.5039],
  'PT': [-8.2245, 39.3999],
  'GR': [21.8243, 39.0742],
  'TR': [35.2433, 38.9637],
  'EG': [30.8025, 26.8206],
  'SA': [45.0792, 23.8859],
  'AE': [53.8478, 23.4241],
  'SG': [103.8198, 1.3521],
  'MY': [101.9758, 4.2105],
  'ID': [113.9213, -0.7893],
  'TH': [100.9925, 15.8700],
  'VN': [108.2772, 14.0583],
  'PH': [121.7740, 12.8797],
  'KR': [127.7669, 35.9078],
  'AR': [-63.6167, -38.4161],
  'CL': [-71.5430, -35.6751],
  'CO': [-74.2973, 4.5709],
  'PE': [-75.0152, -9.1900],
  'NG': [8.6753, 9.0820],
  'KE': [37.9062, -0.0236],
  'MA': [-7.0926, 31.7917],
  'IL': [34.8516, 31.0461],
  'NZ': [174.8860, -40.9006],
  'IE': [-8.2439, 53.4129],
};

// Map component with error boundary
function MapChart({ countryStats, countryCodeStats, markers, exactLocations }) {
  const [mapError, setMapError] = useState(false);

  // Handle any errors in the map rendering
  if (mapError) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Unable to load map visualization</p>
          <button 
            className="text-sm text-primary hover:underline"
            onClick={() => setMapError(false)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30]
        }}
        className="w-full h-full"
        onError={() => setMapError(true)}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // The GeoJSON format from world-atlas uses ISO3 country codes in the properties
              const geoId = geo.properties.iso_a3 || geo.id;
              
              const isActive = Object.entries(countryStats).some(([country, clicks]) => {
                const iso2Code = countryCodeStats[country] || countryNameToCode[country];
                try {
                  if (!iso2Code) return false;
                  const iso3Code = iso2to3(iso2Code);
                  return iso3Code === geoId;
                } catch (e) {
                  return false;
                }
              });
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isActive ? "#ff5555" : "#D6D6DA"}
                  stroke="#FFFFFF"
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isActive ? "#ff3333" : "#F5F5F5" },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>
        
        {/* Use exact location data if available, otherwise use country markers */}
        {exactLocations.length > 0 ? (
          exactLocations.map(({ name, coordinates, clicks }) => (
            <Tooltip key={`${name}-${coordinates[0]}-${coordinates[1]}`}>
              <TooltipTrigger asChild>
                <Marker coordinates={coordinates}>
                  <circle 
                    r={Math.max(3, Math.min(8, 3 + clicks / 3))} 
                    fill="#FF0000" 
                    stroke="#FFFFFF" 
                    strokeWidth={1} 
                  />
                </Marker>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{name}</p>
                <p>{clicks} {clicks === 1 ? 'click' : 'clicks'}</p>
              </TooltipContent>
            </Tooltip>
          ))
        ) : (
          markers.map(({ name, coordinates, clicks }) => (
            <Tooltip key={name}>
              <TooltipTrigger asChild>
                <Marker coordinates={coordinates}>
                  <circle 
                    r={Math.max(4, Math.min(10, 4 + clicks / 2))} 
                    fill="#FF0000" 
                    stroke="#FFFFFF" 
                    strokeWidth={1} 
                  />
                </Marker>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{name}</p>
                <p>{clicks} {clicks === 1 ? 'click' : 'clicks'}</p>
              </TooltipContent>
            </Tooltip>
          ))
        )}
      </ComposableMap>
    </div>
  );
}

export function WorldMap({ countryStats = {}, countryCodeStats = {}, locationData = [] }) {
  const [markers, setMarkers] = useState([]);
  const [exactLocations, setExactLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Process country data for markers
      const newMarkers = [];
      
      Object.entries(countryStats).forEach(([country, clicks]) => {
        // Try to get ISO2 code from country name or from countryCodeStats
        const iso2Code = countryCodeStats[country] || countryNameToCode[country];
        
        if (iso2Code && countryCoordinates[iso2Code]) {
          newMarkers.push({
            name: country,
            coordinates: countryCoordinates[iso2Code],
            clicks: clicks,
            markerOffset: -15,
          });
        }
      });
      
      setMarkers(newMarkers);
      
      // Process exact location data if available
      if (locationData && locationData.length > 0) {
        // Group locations by coordinates to avoid duplicate markers
        const locationMap = {};
        
        locationData.forEach(location => {
          const key = `${location.coordinates[0]},${location.coordinates[1]}`;
          
          if (!locationMap[key]) {
            locationMap[key] = {
              name: location.city ? `${location.city}, ${location.country}` : location.country,
              coordinates: location.coordinates,
              clicks: 1
            };
          } else {
            locationMap[key].clicks += 1;
          }
        });
        
        setExactLocations(Object.values(locationMap));
      }
    } catch (error) {
      console.error("Error processing map data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [countryStats, countryCodeStats, locationData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If there was an error or no map data, show the fallback
  if (hasError || Object.keys(countryStats).length === 0) {
    return <FallbackMap countryStats={countryStats} />;
  }

  return (
    <TooltipProvider>
      <Suspense fallback={
        <div className="w-full h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <MapChart 
          countryStats={countryStats}
          countryCodeStats={countryCodeStats}
          markers={markers}
          exactLocations={exactLocations}
        />
      </Suspense>
    </TooltipProvider>
  );
} 