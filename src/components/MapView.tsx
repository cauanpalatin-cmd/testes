import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CulturalEvent, UserLocation } from '@/types';
import { formatDistance, eventDistance } from '@/lib/utils';

interface MapViewProps {
  events: CulturalEvent[];
  userLocation: UserLocation | null;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Música: '#f97316',
  Dança: '#fb923c',
  Teatro: '#fbbf24',
  Literatura: '#facc15',
  Gastronomia: '#f87171',
  Artesanato: '#fde047',
  Tecnologia: '#fca5a5',
  'Cultura Geek': '#fb7185',
  Cinema: '#f59e0b',
  'Artes Visuais': '#fcd34d',
};

function createMarkerIcon(category: string, isHappening: boolean): L.DivIcon {
  const color = categoryColors[category] ?? '#f97316';
  const happeningClass = isHappening ? 'marker-happening' : '';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="${happeningClass}" style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'user-marker',
    html: `<div style="position:relative;width:16px;height:16px;"><div style="position:absolute;inset:0;border-radius:50%;background:#f97316;border:2px solid #fff;box-shadow:0 0 0 6px rgba(249,115,22,0.25);"></div></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function MapView({
  events,
  userLocation,
  selectedEventId,
  onSelectEvent,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center: L.LatLngExpression = userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : [-22.9056, -47.0608];
    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    events.forEach((event) => {
      if (event.latitude == null || event.longitude == null) return;
      const isHappening = new Date(event.start_time) <= new Date() &&
        (!event.end_time || new Date(event.end_time) >= new Date());
      const marker = L.marker([event.latitude, event.longitude], {
        icon: createMarkerIcon(event.category, isHappening),
      });
      const dist = userLocation ? eventDistance(event, userLocation) : null;
      marker.bindPopup(`
        <div style="min-width:160px;padding:4px 2px">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${event.title}</div>
          <div style="font-size:11px;color:#9a9bb8">${event.category}${dist ? ` • ${formatDistance(dist)}` : ''}</div>
        </div>
      `);
      marker.on('click', () => onSelectEvent(event.id));
      marker.addTo(map);
      markersRef.current[event.id] = marker;
    });
  }, [events, userLocation, onSelectEvent]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: createUserIcon(),
    }).addTo(map);
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedEventId) return;
    const marker = markersRef.current[selectedEventId];
    if (marker) {
      const latlng = marker.getLatLng();
      map.flyTo(latlng, 15, { duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedEventId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
