import { nanoid } from 'nanoid';
import connectToDatabase from './db';
import UrlModel from '../models/url';

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
  
  // Get location data for map visualization
  const locationData = url.clicks
    .filter(click => click.latitude && click.longitude)
    .map(click => ({
      country: click.country,
      countryCode: click.countryCode,
      city: click.city,
      region: click.region,
      coordinates: [click.longitude, click.latitude],
      timestamp: click.timestamp
    }));
  
  return {
    url,
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