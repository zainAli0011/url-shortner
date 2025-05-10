import { NextResponse } from 'next/server';
import { getUrlByShortId, recordUrlClick } from '@/lib/url-utils';
import { temporaryUrlCache } from '@/lib/temporary-url-cache';

// Function to get geographical data from IP address
async function getGeoInfoFromIP(ip) {
  try {
    // Skip localhost IPs and private network IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log('Local/Private IP detected in redirect handler:', ip);
      // For development/testing, return some default coordinates
      return {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194
      };
    }
    
    // Fallback locations when API fails or is rate limited
    const fallbackLocations = {
      'default': {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194
      }
    };
    
    try {
      // Use a free IP geolocation API with timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`IP geolocation API error in redirect: ${response.status}`);
        return fallbackLocations.default;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.warn('IP geolocation API error in redirect:', data.reason || data.error);
        return fallbackLocations.default;
      }
      
      // Check if coordinates are valid numbers
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates in redirect API response, using fallback');
        return fallbackLocations.default;
      }
      
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || null,
        city: data.city || null,
        region: data.region || null,
        latitude: lat,
        longitude: lng
      };
    } catch (error) {
      console.warn('IP geolocation fetch error in redirect:', error.message);
      return fallbackLocations.default;
    }
  } catch (error) {
    console.error('Error getting geo info from IP in redirect:', error);
    
    // Always return valid coordinates
    return {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    };
  }
}

// Handle redirects for shortened URLs
export async function GET(request, { params }) {
  try {
    const { shortId } = params;
    
    if (!shortId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Check if URL is in temporary cache
    const cachedUrl = temporaryUrlCache.get(shortId);
    
    // Get the URL from the database if not in cache
    const url = cachedUrl || await getUrlByShortId(shortId);
    
    if (!url) {
      return NextResponse.redirect(new URL('/?error=not-found', request.url));
    }
    
    // Get IP address from request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    // Get user agent from request
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Get geo info from IP
    const geoInfo = await getGeoInfoFromIP(ip);
    
    // For temporary URLs, just update the click count in memory
    if (cachedUrl) {
      cachedUrl.clicks.push({
        timestamp: new Date(),
        country: geoInfo.country,
        countryCode: geoInfo.countryCode,
        city: geoInfo.city,
        region: geoInfo.region,
        latitude: geoInfo.latitude,
        longitude: geoInfo.longitude,
        ip,
        userAgent,
      });
      cachedUrl.clickCount = cachedUrl.clicks.length;
    } else {
      // Record the click asynchronously for permanent URLs
      recordUrlClick(shortId, geoInfo, ip, userAgent).catch(error => {
        console.error('Error recording click:', error);
      });
    }
    
    // Redirect to the original URL
    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.redirect(new URL('/?error=server', request.url));
  }
}

// Export the cache for use in other parts of the application
export { temporaryUrlCache }; 