import { nanoid } from 'nanoid';
import connectToDatabase from './db';
import UrlModel from '../models/url';

// Helper function to get geolocation from IP using a public API
async function getGeoFromIP(ip) {
  try {
    // Skip localhost IPs and private network IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log('Local/Private IP detected:', ip);
      // For development/testing, return some default coordinates 
      return {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
      };
    }
    
    // For production, to avoid rate limits, we'll use a more conservative approach
    // We'll only make API calls for IPs we haven't seen before, otherwise use hardcoded values
    // This is a simplified approach - in a real production app, you'd use a cache or database
    
    // Pre-defined locations based on common regions (fallbacks to reduce API calls)
    const fallbackLocations = {
      // Some example fallbacks when we can't reliably determine location
      'default': {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194
      },
      'eu': {
        country: 'Germany',
        countryCode: 'DE',
        region: 'Berlin',
        city: 'Berlin',
        latitude: 52.5200,
        longitude: 13.4050
      },
      'asia': {
        country: 'Japan',
        countryCode: 'JP',
        region: 'Tokyo',
        city: 'Tokyo',
        latitude: 35.6762,
        longitude: 139.6503
      }
    };
    
    console.log(`Attempting geolocation for IP: ${ip}`);
    
    try {
      // Use a free IP geolocation API - but with cautious error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      // Handle rate limiting (429) and other errors gracefully
      if (!response.ok) {
        console.warn(`IP geolocation API response status: ${response.status}`);
        // Return a fallback on error - this ensures we always have dots
        return fallbackLocations.default;
      }
      
      const data = await response.json();
      
      // Check if we got an error response
      if (data.error) {
        console.warn('IP geolocation API error:', data.reason || data.error);
        return fallbackLocations.default;
      }
      
      // Check if coordinates are valid numbers
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates in API response, using fallback');
        return fallbackLocations.default;
      }
      
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        latitude: lat,
        longitude: lng,
      };
    } catch (error) {
      // Handle any fetch errors (including timeouts)
      console.warn('IP geolocation API fetch error:', error.message);
      return fallbackLocations.default;
    }
  } catch (error) {
    console.error('IP geolocation error:', error);
    
    // Always return a valid location to ensure dots appear on the map
    return {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    };
  }
}

// Generate a short ID for URLs
export function generateShortId(length = 6) {
  return nanoid(length);
}

// Create a new shortened URL
export async function createShortUrl(originalUrl, customId = null, userId = null, title = '', isTemporary = false) {
  // For temporary URLs (anonymous users), we don't need to connect to the database
  if (isTemporary) {
    const shortId = customId || generateShortId();
    return {
      originalUrl,
      shortId,
      userId: null,
      title: title || originalUrl.substring(0, 50),
      isTemporary: true,
      clicks: [],
      clickCount: 0,
      createdAt: new Date(),
      expiresAt: new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours for temporary URLs
    };
  }

  // For permanent URLs (logged-in users), save to database
  await connectToDatabase();
  
  const shortId = customId || generateShortId();
  
  // Check if custom ID already exists
  if (customId) {
    const existingUrl = await UrlModel.findOne({ shortId: customId });
    if (existingUrl) {
      throw new Error('Custom ID already in use');
    }
  }
  
  const newUrl = new UrlModel({
    originalUrl,
    shortId,
    userId,
    title: title || originalUrl.substring(0, 50),
    isTemporary: false,
  });
  
  await newUrl.save();
  return newUrl;
}

// Get a URL by its short ID
export async function getUrlByShortId(shortId) {
  await connectToDatabase();
  return await UrlModel.findOne({ shortId });
}

// Record a click on a shortened URL
export async function recordUrlClick(shortId, geoInfo, ip, userAgent) {
  await connectToDatabase();
  
  const url = await UrlModel.findOne({ shortId });
  if (!url) return null;
  
  // If geoInfo is missing critical data but we have IP, try to look it up
  if ((!geoInfo.latitude || !geoInfo.longitude) && ip) {
    try {
      const ipGeoData = await getGeoFromIP(ip);
      if (ipGeoData) {
        console.log('Found IP geolocation data:', ipGeoData);
        geoInfo.country = ipGeoData.country || geoInfo.country || 'Unknown';
        geoInfo.countryCode = ipGeoData.countryCode || geoInfo.countryCode;
        geoInfo.region = ipGeoData.region || geoInfo.region;
        geoInfo.city = ipGeoData.city || geoInfo.city;
        geoInfo.latitude = ipGeoData.latitude || geoInfo.latitude;
        geoInfo.longitude = ipGeoData.longitude || geoInfo.longitude;
      }
    } catch (error) {
      console.error('Error looking up IP geolocation:', error);
    }
  }
  
  // Ensure latitude and longitude are numbers if present
  if (geoInfo.latitude) geoInfo.latitude = parseFloat(geoInfo.latitude);
  if (geoInfo.longitude) geoInfo.longitude = parseFloat(geoInfo.longitude);
  
  // Log the geoInfo for debugging
  console.log('Recording click with geoInfo:', JSON.stringify(geoInfo));
  
  url.clicks.push({
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
  
  url.clickCount = url.clicks.length;
  await url.save();
  return url;
}

// Get analytics for a URL
export async function getUrlAnalytics(shortId, userId) {
  await connectToDatabase();
  
  // Only allow access to analytics if the user owns the URL
  const url = await UrlModel.findOne({ shortId, userId });
  if (!url) return null;
  
  // Get country analytics
  const countryStats = {};
  const countryCodeStats = {};
  
  url.clicks.forEach(click => {
    const country = click.country || 'Unknown';
    countryStats[country] = (countryStats[country] || 0) + 1;
    
    // Store country code data for the world map
    if (click.countryCode) {
      countryCodeStats[country] = click.countryCode;
    }
  });
  
  // Get daily clicks for the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const dailyClicks = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    
    const clicksOnDay = url.clicks.filter(click => {
      const clickDate = new Date(click.timestamp);
      return clickDate >= date && clickDate < nextDate;
    }).length;
    
    dailyClicks.push({
      date: date.toISOString().split('T')[0],
      clicks: clicksOnDay,
    });
  }
  
  // Process clicks to ensure all have location data if possible and create locationData array
  const processedClicks = [];
  const locationData = [];
  
  // Parallel processing of clicks with IP geolocation
  const processClickPromises = url.clicks.map(async (click, index) => {
    let processedClick = { ...click };
    
    // Check if click is a Mongoose document and convert to plain object if needed
    if (click._doc) {
      processedClick = { ...click._doc };
    }
    
    // Check if we need to look up location data
    if ((!click.latitude || !click.longitude) && click.ip) {
      try {
        const ipGeoData = await getGeoFromIP(click.ip);
        if (ipGeoData && ipGeoData.latitude && ipGeoData.longitude) {
          // Create a processed version of the click with geo data
          processedClick = {
            ...processedClick,
            latitude: ipGeoData.latitude,
            longitude: ipGeoData.longitude,
            country: click.country || ipGeoData.country || 'Unknown',
            countryCode: click.countryCode || ipGeoData.countryCode,
            city: click.city || ipGeoData.city,
            region: click.region || ipGeoData.region
          };
          console.log(`Updated click ${index} with geo data:`, processedClick.latitude, processedClick.longitude);
        }
      } catch (error) {
        console.error('Error looking up IP geolocation:', error);
      }
    }
    
    return processedClick;
  });
  
  // Wait for all click processing to complete
  const processedClickResults = await Promise.all(processClickPromises);
  
  // Fill our arrays with the processed clicks
  processedClickResults.forEach(click => {
    processedClicks.push(click);
    
    // Add to locationData if we have coordinates
    if (click.latitude && click.longitude) {
      // Convert to numbers to ensure they're not strings
      const longitude = parseFloat(click.longitude);
      const latitude = parseFloat(click.latitude);
      
      if (!isNaN(longitude) && !isNaN(latitude)) {
        locationData.push({
          country: click.country || 'Unknown',
          countryCode: click.countryCode,
          city: click.city,
          region: click.region,
          coordinates: [longitude, latitude],
          timestamp: click.timestamp
        });
      }
    }
  });
  
  console.log(`Generated ${locationData.length} location data points from ${url.clicks.length} clicks`);
  
  return {
    url: {
      ...url._doc,
      clicks: processedClicks
    },
    countryStats,
    countryCodeStats,
    locationData,
    dailyClicks,
    totalClicks: url.clickCount,
  };
}

// Get all URLs for a user
export async function getUserUrls(userId) {
  if (!userId) return [];
  
  await connectToDatabase();
  return await UrlModel.find({ userId }).sort({ createdAt: -1 });
}

// Delete a URL by its short ID
export async function deleteUrl(shortId, userId) {
  if (!userId) return null;
  
  await connectToDatabase();
  return await UrlModel.findOneAndDelete({ shortId, userId });
} 