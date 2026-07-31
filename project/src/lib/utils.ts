import type { CulturalEvent } from '@/types';

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function estimateTravelTime(km: number): string {
  const walkingMinKm = 12;
  const minutes = Math.round((km / walkingMinKm) * 60);
  if (minutes < 60) return `${minutes} min a pé`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}min a pé`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} às ${formatTime(dateStr)}`;
}

export function isHappeningNow(event: CulturalEvent): boolean {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : null;
  if (end) return now >= start && now <= end;
  const eventEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return now >= start && now <= eventEnd;
}

export function isUpcoming(event: CulturalEvent): boolean {
  return new Date(event.start_time) > new Date();
}

export function eventDistance(
  event: CulturalEvent,
  userLoc: { latitude: number; longitude: number }
): number | null {
  if (event.latitude == null || event.longitude == null) return null;
  return haversineDistance(
    userLoc.latitude,
    userLoc.longitude,
    event.latitude,
    event.longitude
  );
}

export function openRoute(
  event: CulturalEvent,
  userLoc: { latitude: number; longitude: number }
): void {
  if (event.latitude != null && event.longitude != null) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLoc.latitude},${userLoc.longitude}&destination=${event.latitude},${event.longitude}&travelmode=walking`;
    window.open(url, '_blank');
  } else if (event.address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;
    window.open(url, '_blank');
  }
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
