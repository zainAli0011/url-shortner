/**
 * IP Geolocation Utility
 * 
 * This module provides IP geolocation services using multiple providers
 * with fallbacks, caching, and error handling to ensure reliable location data.
 */

// In-memory cache to reduce API calls
const geoCache = new Map();

/**
 * Get geolocation information from an IP address
 * @param {string} ip - The IP address to look up
 * @returns {Promise<object>} - Geolocation data
 */
export async function getGeolocationFromIP(ip) {
  try {
    // Skip localhost and private IPs
    if (!ip || ip === '127.0.0.1' || ip === 'localhost' || 
        ip.startsWith('192.168.') || ip.startsWith('10.') || 
        ip.startsWith('172.16.') || ip.startsWith('172.17.') || 
        ip.startsWith('172.18.') || ip.startsWith('172.19.') || 
        ip.startsWith('172.2') || ip.startsWith('172.3')) {
      console.log('Local/Private IP detected:', ip);
      return getDevelopmentFallback();
    }
    
    // Check cache first
    if (geoCache.has(ip)) {
      console.log(`Using cached geolocation for IP: ${ip}`);
      return geoCache.get(ip);
    }
    
    console.log(`Looking up geolocation for IP: ${ip}`);
    
    // Try primary IP lookup service with timeout
    try {
      const data = await lookupIP(ip);
      
      // Validate returned data
      if (isValidGeoData(data)) {
        // Cache the result
        geoCache.set(ip, data);
        return data;
      }
    } catch (error) {
      console.warn(`Primary IP lookup service error:`, error.message);
    }
    
    // Try backup service with timeout
    try {
      const data = await lookupIPBackup(ip);
      
      // Validate returned data
      if (isValidGeoData(data)) {
        // Cache the result
        geoCache.set(ip, data);
        return data;
      }
    } catch (error) {
      console.warn(`Backup IP lookup service error:`, error.message);
    }

    // If all services fail, return unknown
    return getUnknownLocation();
  } catch (error) {
    console.error('IP geolocation error:', error);
    return getUnknownLocation();
  }
}

/**
 * Primary IP lookup service
 */
async function lookupIP(ip) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    // ipinfo.io has a generous free tier and good accuracy
    const response = await fetch(`https://ipinfo.io/${ip}/json`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.bogon) {
      throw new Error('Bogon IP address (private/reserved range)');
    }
    
    // Parse location data (format: "lat,lng")
    let latitude = 0;
    let longitude = 0;
    
    if (data.loc && data.loc.includes(',')) {
      const [lat, lng] = data.loc.split(',');
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
    }
    
    return {
      country: data.country === 'US' ? 'United States' : 
               data.country === 'GB' ? 'United Kingdom' : 
               data.country_name || data.country,
      countryCode: data.country,
      region: data.region,
      city: data.city,
      latitude,
      longitude
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Backup IP lookup service
 */
async function lookupIPBackup(ip) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    // ip-api.com as backup service
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,lat,lon`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Backup API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      throw new Error(data.message || 'IP lookup failed');
    }
    
    return {
      country: data.countryCode === 'US' ? 'United States' : 
               data.countryCode === 'GB' ? 'United Kingdom' : 
               data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Validate if geolocation data is complete
 */
function isValidGeoData(data) {
  return (
    data &&
    data.country &&
    data.countryCode &&
    typeof data.latitude === 'number' && 
    typeof data.longitude === 'number' &&
    !isNaN(data.latitude) && 
    !isNaN(data.longitude)
  );
}

/**
 * Get a fallback location for local development
 */
function getDevelopmentFallback() {
  return {
    country: 'United States',
    countryCode: 'US',
    region: 'California',
    city: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194
  };
}

/**
 * Get a fallback for unknown locations
 */
function getUnknownLocation() {
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: '',
    city: '',
    latitude: 0,
    longitude: 0
  };
} 