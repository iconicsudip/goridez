'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
}

interface RouteMapProps {
  sourceLocation: { lat: number, lon: number, name: string };
  destLocation: { lat: number, lon: number, name: string };
  routeGeometry?: any; // GeoJSON LineString
}

export default function RouteMap({ sourceLocation, destLocation, routeGeometry }: RouteMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">Loading Map...</div>;

  const positions: [number, number][] = routeGeometry?.coordinates
    ? routeGeometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
    : [
        [sourceLocation.lat, sourceLocation.lon],
        [destLocation.lat, destLocation.lon]
      ];

  const bounds = L.latLngBounds([
    [sourceLocation.lat, sourceLocation.lon],
    [destLocation.lat, destLocation.lon]
  ]);

  if (positions.length > 2) {
    positions.forEach(pos => bounds.extend(pos as L.LatLngTuple));
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-[0_5px_20px_rgba(0,0,0,0.05)] relative z-0">
      <MapContainer 
        bounds={bounds} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[sourceLocation.lat, sourceLocation.lon]} icon={customIcon} />
        <Marker position={[destLocation.lat, destLocation.lon]} icon={customIcon} />
        {positions.length > 2 && (
          <Polyline positions={positions} pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.8 }} />
        )}
        <MapBounds bounds={bounds} />
      </MapContainer>
    </div>
  );
}
