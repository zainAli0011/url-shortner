'use client';

// This file is a compatibility layer that redirects to SimpleMap
// We're keeping this file to avoid breaking changes
import { SimpleMap } from './simple-map';

export function WorldMap(props) {
  return <SimpleMap {...props} />;
} 