'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FallbackMap } from '@/components/fallback-map';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { geoMercator, geoPath, geoGraticule } from 'd3-geo';
import { feature } from 'topojson-client';
import { select } from 'd3-selection';

// Country position mapping (approximate x,y coordinates on a 1000x500 world map image)
const countryPositions = {
  'United States': { x: 200, y: 150 },
  'United Kingdom': { x: 430, y: 120 },
  'Germany': { x: 480, y: 130 },
  'France': { x: 460, y: 140 },
  'Canada': { x: 180, y: 100 },
  'Australia': { x: 800, y: 350 },
  'India': { x: 630, y: 210 },
  'China': { x: 700, y: 180 },
  'Japan': { x: 800, y: 170 },
  'Brazil': { x: 280, y: 340 },
  'Russia': { x: 600, y: 100 },
  'South Africa': { x: 510, y: 320 },
  'Mexico': { x: 180, y: 220 },
  'Italy': { x: 490, y: 160 },
  'Spain': { x: 440, y: 170 },
  'Netherlands': { x: 470, y: 130 },
  'Sweden': { x: 490, y: 100 },
  'Norway': { x: 480, y: 90 },
  'Finland': { x: 510, y: 90 },
  'Denmark': { x: 480, y: 110 },
  'Poland': { x: 510, y: 130 },
  'Switzerland': { x: 475, y: 150 },
  'Austria': { x: 495, y: 150 },
  'Belgium': { x: 465, y: 135 },
  'Portugal': { x: 430, y: 170 },
  'Greece': { x: 520, y: 170 },
  'Turkey': { x: 550, y: 180 },
  'Egypt': { x: 530, y: 210 },
  'Saudi Arabia': { x: 560, y: 210 },
  'United Arab Emirates': { x: 580, y: 210 },
  'Singapore': { x: 710, y: 270 },
  'Malaysia': { x: 700, y: 260 },
  'Indonesia': { x: 730, y: 290 },
  'Thailand': { x: 690, y: 230 },
  'Vietnam': { x: 710, y: 230 },
  'Philippines': { x: 760, y: 240 },
  'South Korea': { x: 780, y: 180 },
  'Argentina': { x: 270, y: 380 },
  'Chile': { x: 250, y: 380 },
  'Colombia': { x: 240, y: 280 },
  'Peru': { x: 230, y: 310 },
  'Nigeria': { x: 470, y: 250 },
  'Kenya': { x: 530, y: 260 },
  'Morocco': { x: 440, y: 200 },
  'Israel': { x: 540, y: 190 },
  'New Zealand': { x: 870, y: 390 },
  'Ireland': { x: 420, y: 130 },
  'Unknown': { x: 500, y: 250 }
};

// Country name mapping to match GeoJSON country names
const countryNameMapping = {
  'United States': 'United States of America',
  'UK': 'United Kingdom',
  'United Kingdom': 'United Kingdom',
  'Russia': 'Russia',
  'China': 'China',
  'India': 'India',
  'Brazil': 'Brazil',
  'Canada': 'Canada',
  'Australia': 'Australia',
  'Germany': 'Germany',
  'France': 'France',
  'Japan': 'Japan',
  'South Korea': 'South Korea',
  'Mexico': 'Mexico',
  'Spain': 'Spain',
  'Italy': 'Italy',
  'Turkey': 'Turkey',
  'Indonesia': 'Indonesia',
  'Netherlands': 'Netherlands',
  'Saudi Arabia': 'Saudi Arabia',
  'Switzerland': 'Switzerland',
  'Poland': 'Poland',
  'Thailand': 'Thailand',
  'Sweden': 'Sweden',
  'Belgium': 'Belgium',
  'Argentina': 'Argentina',
  'Norway': 'Norway',
  'Austria': 'Austria',
  'United Arab Emirates': 'United Arab Emirates',
  'Nigeria': 'Nigeria',
  'Israel': 'Israel',
  'South Africa': 'South Africa',
  'Egypt': 'Egypt',
  'Denmark': 'Denmark',
  'Singapore': 'Singapore',
  'Philippines': 'Philippines',
  'Malaysia': 'Malaysia',
  'Ireland': 'Ireland',
  'Pakistan': 'Pakistan',
  'Chile': 'Chile',
  'Finland': 'Finland',
  'Portugal': 'Portugal',
  'Colombia': 'Colombia',
  'Vietnam': 'Vietnam',
  'Greece': 'Greece',
  'Peru': 'Peru',
  'New Zealand': 'New Zealand',
  'Czech Republic': 'Czechia',
  'Romania': 'Romania',
  'Hungary': 'Hungary',
  'Morocco': 'Morocco',
  'Kenya': 'Kenya',
};

// D3 World Map Component
function D3WorldMap({ countryStats, maxClicks }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [worldData, setWorldData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 20]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fetch world map data
  useEffect(() => {
    async function fetchWorldData() {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        if (!response.ok) throw new Error('Failed to load map data');
        const data = await response.json();
        setWorldData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading map data:', err);
        setError(true);
        setLoading(false);
      }
    }
    
    fetchWorldData();
  }, []);

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 4));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 1));
  };

  // Handle mouse down for panning
  const handleMouseDown = (event) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (event) => {
    if (isDragging) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      
      // Adjust the center based on drag distance and current zoom
      const scaleFactor = 0.25 / zoom;
      setCenter([
        center[0] - dx * scaleFactor,
        center[1] + dy * scaleFactor
      ]);
      
      setDragStart({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  // Handle mouse up to end panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse leave to end panning
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Handle touch start for mobile panning
  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      });
    }
  };

  // Handle touch move for mobile panning
  const handleTouchMove = (event) => {
    if (isDragging && event.touches.length === 1) {
      event.preventDefault(); // Prevent scrolling
      const dx = event.touches[0].clientX - dragStart.x;
      const dy = event.touches[0].clientY - dragStart.y;
      
      // Adjust the center based on drag distance and current zoom
      const scaleFactor = 0.25 / zoom;
      setCenter([
        center[0] - dx * scaleFactor,
        center[1] + dy * scaleFactor
      ]);
      
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      });
    }
  };

  // Handle touch end to stop panning
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset the map view
  const handleResetView = () => {
    setZoom(1);
    setCenter([0, 20]);
  };

  // Draw the map when data is available
  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    try {
      const svg = select(svgRef.current);
      const width = 1000;
      const height = 500;
      
      // Create projection with current zoom and center
      const projection = geoMercator()
        .scale(150 * zoom)
        .center(center)
        .translate([width / 2, height / 2]);
      
      // Create path generator
      const pathGenerator = geoPath().projection(projection);
      
      // Convert TopoJSON to GeoJSON
      const countries = feature(worldData, worldData.objects.countries);
      
      // Clear any existing paths
      svg.selectAll('path').remove();
      svg.selectAll('circle').remove();
      
      // Draw countries
      svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .attr('fill', '#e2e8f0')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 0.5)
        .attr('class', 'country')
        .attr('data-name', d => d.properties.name)
        .on('mouseenter', (event, d) => {
          setHoveredCountry(d.properties.name);
          select(event.target)
            .attr('fill', '#cbd5e1');
        })
        .on('mouseleave', (event) => {
          setHoveredCountry(null);
          select(event.target)
            .attr('fill', '#e2e8f0');
        });
      
      // Add graticule (grid lines)
      const graticule = geoGraticule()
        .step([20, 20]);
        
      svg.append('path')
        .datum(graticule)
        .attr('d', pathGenerator)
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 0.3)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '2,2');
      
      // Add equator
      svg.append('path')
        .datum({type: 'LineString', coordinates: [[-180, 0], [180, 0]]})
        .attr('d', pathGenerator)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '5,5');
      
      // Add markers for each country with click data
      Object.entries(countryStats).forEach(([country, clicks]) => {
        // Try to map country name to GeoJSON name
        const geoJsonCountryName = countryNameMapping[country] || country;
        
        // Find the corresponding country in our GeoJSON
        const countryFeature = countries.features.find(
          f => f.properties.name === geoJsonCountryName
        );
        
        if (countryFeature) {
          // Calculate centroid of the country
          const centroid = pathGenerator.centroid(countryFeature);
          
          if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            // Calculate size based on clicks (min 5px, max 20px)
            const size = Math.max(5, Math.min(20, 5 + Math.log(clicks) * 3));
            
            // Calculate opacity based on clicks (min 0.7, max 1)
            const opacity = 0.7 + (0.3 * clicks / maxClicks);
            
            // Add marker
            svg.append('circle')
              .attr('cx', centroid[0])
              .attr('cy', centroid[1])
              .attr('r', size)
              .attr('fill', '#ef4444')
              .attr('stroke', 'white')
              .attr('stroke-width', 1.5)
              .attr('opacity', opacity)
              .attr('class', 'marker')
              .attr('data-country', country)
              .attr('data-clicks', clicks)
              .on('mouseenter', (event) => {
                const rect = event.target.getBoundingClientRect();
                const svgRect = svgRef.current.getBoundingClientRect();
                setTooltipData({ country, clicks });
                setTooltipPosition({
                  x: rect.left - svgRect.left + rect.width / 2,
                  y: rect.top - svgRect.top
                });
              })
              .on('mouseleave', () => {
                setTooltipData(null);
              });
          }
        } else {
          console.log(`Could not find country: ${country} (mapped to ${geoJsonCountryName})`);
        }
      });
      
    } catch (err) {
      console.error('Error rendering map:', err);
      setError(true);
    }
  }, [worldData, countryStats, maxClicks, zoom, center]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return null; // Parent component will show fallback
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox="0 0 1000 500" 
        style={{ backgroundColor: '#f8fafc' }}
        className="overflow-visible"
      >
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1000" height="500" fill="url(#grid)" />
        <rect width="1000" height="500" fill="#f1f5f9" fillOpacity="0.3" />
      </svg>
      
      {/* Map controls */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <button 
          className="p-1 bg-white/80 rounded-md shadow-sm border border-muted hover:bg-white"
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button 
          className="p-1 bg-white/80 rounded-md shadow-sm border border-muted hover:bg-white"
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button 
          className="p-1 mt-2 bg-white/80 rounded-md shadow-sm border border-muted hover:bg-white text-xs"
          onClick={handleResetView}
          aria-label="Reset view"
        >
          Reset
        </button>
      </div>
      
      {hoveredCountry && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm border border-muted text-sm">
          {hoveredCountry}
        </div>
      )}
      
      {tooltipData && (
        <div 
          className="absolute bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md border border-muted text-sm pointer-events-none z-10"
          style={{ 
            left: tooltipPosition.x, 
            top: tooltipPosition.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="font-medium">{tooltipData.country}</p>
          <p>{tooltipData.clicks} {tooltipData.clicks === 1 ? 'click' : 'clicks'}</p>
        </div>
      )}
    </div>
  );
}

export function SimpleMap({ countryStats = {} }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Sort countries by click count
  const sortedCountries = Object.entries(countryStats)
    .sort(([, clicksA], [, clicksB]) => clicksB - clicksA);
  
  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (hasError || Object.keys(countryStats).length === 0) {
    return <FallbackMap countryStats={countryStats} />;
  }
  
  // Find the maximum click count for scaling
  const maxClicks = Math.max(...Object.values(countryStats));
  
  return (
    <div className="w-full">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>World Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[400px] rounded-md overflow-hidden border border-muted">
            <D3WorldMap countryStats={countryStats} maxClicks={maxClicks} />
            
            {/* Add a legend */}
            <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-md shadow-sm border border-muted text-xs">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Click locations</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1 opacity-60"></div>
                <div className="w-3 h-3 rounded-full bg-red-500 mx-1"></div>
                <div className="w-4 h-4 rounded-full bg-red-500 ml-1"></div>
                <span className="ml-2">Relative volume</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <FallbackMap countryStats={countryStats} />
    </div>
  );
} 