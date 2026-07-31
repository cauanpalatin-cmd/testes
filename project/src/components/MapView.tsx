import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CulturalEvent, UserLocation } from '@/types';
import { CATEGORY_ICONS } from '@/types';
import { formatDistance, eventDistance } from '@/lib/utils';

interface MapViewProps {
  events: CulturalEvent[];
  userLocation: UserLocation | null;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Música: '#ec4899',
  Dança: '#f97316',
  Teatro: '#8b5cf6',
  Literatura: '#0ea5e9',
  Gastronomia: '#f59e0b',
  Artesanato: '#84cc16',
  Tecnologia: '#06b6d4',
  'Cultura Geek': '#a855f7',
  Cinema: '#ef4444',
  'Artes Visuais': '#14b8a6',
};

function createMarkerIcon(category: string, isHappening: boolean, isAi: boolean): L.DivIcon {
  const color = categoryColors[category] ?? '#0ea5e9';
  const happeningClass = isHappening ? 'marker-happening' : '';
  const aiBadge = isAi
    ? '<div style="position:absolute;top:-6px;right:-6px;width:14px;height:14px;border-radius:50%;background:#0f172a;color:#fff;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:1.5px solid #fff">AI</div>'
    : '';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;">
        <div class="${happeningClass}" style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
          <span style="font-size:12px;">${CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]?.[0] ?? '●'}</span>
        </div>
        ${aiBadge}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'user-marker',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#0ea5e9;border:3px solid #fff;box-shadow:0 0 0 4px rgba(14,165,233,0.3)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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
      : [-23.55, -46.63];
    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
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
        icon: createMarkerIcon(event.category, isHappening, event.is_ai_generated),
      });
      const dist = userLocation ? eventDistance(event, userLocation) : null;
      marker.bindPopup(`
        <div style="min-width:180px;padding:4px">
          <div style="font-weight:600;font-size:14px;margin-bottom:2px">${event.title}</div>
          <div style="font-size:12px;color:#64748b">${event.category}${dist ? ` • ${formatDistance(dist)}` : ''}</div>
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
