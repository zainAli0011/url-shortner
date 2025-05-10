import { NextResponse } from 'next/server';
import { getUrlByShortId, recordUrlClick } from '@/lib/url-utils';
import { temporaryUrlCache } from '@/lib/temporary-url-cache';
import { getGeolocationFromIP } from '@/lib/ip-lookup';

// Function to get geographical data from IP address
async function getGeoInfoFromIP(ip) {
  try {
    // Leverage our dedicated IP lookup service
    return await getGeolocationFromIP(ip);
  } catch (error) {
    console.error('Error getting geo info from IP in redirect:', error);
    
    // Return unknown location in case of errors
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0
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