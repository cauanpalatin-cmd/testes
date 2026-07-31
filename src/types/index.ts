export type EventCategory =
  | 'Música'
  | 'Dança'
  | 'Teatro'
  | 'Literatura'
  | 'Gastronomia'
  | 'Artesanato'
  | 'Tecnologia'
  | 'Cultura Geek'
  | 'Cinema'
  | 'Artes Visuais';

export const CATEGORIES: EventCategory[] = [
  'Música',
  'Dança',
  'Teatro',
  'Literatura',
  'Gastronomia',
  'Artesanato',
  'Tecnologia',
  'Cultura Geek',
  'Cinema',
  'Artes Visuais',
];

export const CATEGORY_ICONS: Record<EventCategory, string> = {
  Música: 'Music',
  Dança: 'Footprints',
  Teatro: 'Drama',
  Literatura: 'BookOpen',
  Gastronomia: 'UtensilsCrossed',
  Artesanato: 'Hammer',
  Tecnologia: 'Cpu',
  'Cultura Geek': 'Gamepad2',
  Cinema: 'Clapperboard',
  'Artes Visuais': 'Palette',
};

export interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  start_time: string;
  end_time: string | null;
  is_free: boolean;
  is_virtual: boolean;
  virtual_link: string | null;
  participation_info: string | null;
  organizer_name: string;
  is_ai_generated: boolean;
  source_url: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface Participation {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  event_id: string;
  minutes_before: number;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type ViewName = 'map' | 'favorites' | 'calendar' | 'create' | 'quiz' | 'data' | 'accessibility';

export interface UserLocation {
  latitude: number;
  longitude: number;
}
