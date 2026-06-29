export interface OSMLocation {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export interface OSRMRoute {
  distance: number; // Distance in meters
  duration: number; // Duration in seconds
  geometry?: any;   // GeoJSON LineString coordinates
}

/**
 * Search for a location using OpenStreetMap's Nominatim API.
 * Rate limit: 1 request per second.
 */
export async function searchLocation(query: string): Promise<OSMLocation[]> {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
      {
        headers: {
          'User-Agent': 'GoRidezBookingSystem/1.0 (contact@goridez.com)'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Nominatim API error');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching location from OSM:', error);
    return [];
  }
}

/**
 * Calculate driving distance and duration between two coordinates using OSRM API.
 * @param lon1 Source longitude
 * @param lat1 Source latitude
 * @param lon2 Destination longitude
 * @param lat2 Destination latitude
 */
export async function calculateRoute(
  lon1: string, lat1: string, 
  lon2: string, lat2: string
): Promise<OSRMRoute | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('OSRM API error');
    }
    
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    return {
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      geometry: data.routes[0].geometry
    };
  } catch (error) {
    console.error('Error calculating route with OSRM:', error);
    return null;
  }
}
