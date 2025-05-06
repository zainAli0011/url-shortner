import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind classes efficiently
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Formats a date to a readable string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  
  // Check if the date is today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if the date is yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise, return a formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Country name to ISO2 code mapping for common countries
 */
export const countryNameToCode = {
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
  // Add more as needed
};

/**
 * Attempts to convert a country name to its ISO2 code
 */
export function getCountryCode(countryName) {
  return countryNameToCode[countryName] || null;
}
