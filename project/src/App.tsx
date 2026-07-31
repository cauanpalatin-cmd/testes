import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { supabase } from '@/lib/supabase';
import type {
  CulturalEvent,
  ViewName,
  UserLocation,
  Favorite,
  Participation,
  Reminder,
  Rating,
} from '@/types';
import { openRoute } from '@/lib/utils';

import Header from '@/components/Header';
import LocationPrompt from '@/components/LocationPrompt';
import AuthModal from '@/components/AuthModal';
import FilterPanel, { applyFilters, DEFAULT_FILTERS, type FilterState } from '@/components/FilterPanel';
import EventDetailModal from '@/components/EventDetailModal';
import MapPage from '@/components/MapPage';
import QuizView from '@/components/QuizView';
import CreateView from '@/components/CreateView';
import FavoritesView from '@/components/FavoritesView';
import CalendarView from '@/components/CalendarView';
import DataView from '@/components/DataView';
import AccessibilityView from '@/components/AccessibilityView';

function AppContent() {
  const { user } = useAuth();

  const [view, setView] = useState<ViewName>('map');
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPromptOpen, setLocationPromptOpen] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Load events
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: false });
      if (data) setEvents(data as CulturalEvent[]);
    };
    load();
  }, []);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setParticipations([]);
      setReminders([]);
      setRatings([]);
      return;
    }
    const [favRes, partRes, remRes, ratRes] = await Promise.all([
      supabase.from('favorites').select('*').eq('user_id', user.id),
      supabase.from('participations').select('*').eq('user_id', user.id),
      supabase.from('reminders').select('*').eq('user_id', user.id),
      supabase.from('ratings').select('*').eq('user_id', user.id),
    ]);
    setFavorites((favRes.data as Favorite[]) ?? []);
    setParticipations((partRes.data as Participation[]) ?? []);
    setReminders((remRes.data as Reminder[]) ?? []);
    setRatings((ratRes.data as Rating[]) ?? []);
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationPromptOpen(false);
      },
      () => setLocationDenied(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Derived sets
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.event_id)), [favorites]);
  const participatedIds = useMemo(() => new Set(participations.map((p) => p.event_id)), [participations]);
  const reminderIds = useMemo(() => new Set(reminders.map((r) => r.event_id)), [reminders]);

  const ratingsAvg = useMemo(() => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    ratings.forEach((r) => {
      sums[r.event_id] = (sums[r.event_id] ?? 0) + r.rating;
      counts[r.event_id] = (counts[r.event_id] ?? 0) + 1;
    });
    const avg: Record<string, number> = {};
    Object.keys(sums).forEach((id) => (avg[id] = sums[id] / counts[id]));
    return avg;
  }, [ratings]);

  const userRatingMap = useMemo(() => {
    const m: Record<string, number> = {};
    ratings.forEach((r) => (m[r.event_id] = r.rating));
    return m;
  }, [ratings]);

  const reminderMinutesMap = useMemo(() => {
    const m: Record<string, number> = {};
    reminders.forEach((r) => (m[r.event_id] = r.minutes_before));
    return m;
  }, [reminders]);

  // Favorite/participated categories for quiz
  const favoriteCategories = useMemo(() => {
    const cats = new Set<string>();
    favorites.forEach((f) => {
      const ev = events.find((e) => e.id === f.event_id);
      if (ev) cats.add(ev.category);
    });
    return Array.from(cats) as CulturalEvent['category'][];
  }, [favorites, events]);

  const participatedCategories = useMemo(() => {
    const cats = new Set<string>();
    participations.forEach((p) => {
      const ev = events.find((e) => e.id === p.event_id);
      if (ev) cats.add(ev.category);
    });
    return Array.from(cats) as CulturalEvent['category'][];
  }, [participations, events]);

  // Filtered events
  const filteredEvents = useMemo(
    () => applyFilters(events, filters, userLocation, searchQuery),
    [events, filters, userLocation, searchQuery]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.categories.length > 0) n += filters.categories.length;
    if (filters.maxDistance != null) n++;
    if (filters.priceFilter !== 'all') n++;
    if (filters.modeFilter !== 'all') n++;
    if (filters.happeningNow) n++;
    return n;
  }, [filters]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  // Actions
  const requireAuth = (): boolean => {
    if (!user) {
      setAuthOpen(true);
      return false;
    }
    return true;
  };

  const toggleFavorite = async (eventId: string) => {
    if (!requireAuth()) return;
    if (favoriteIds.has(eventId)) {
      await supabase.from('favorites').delete().eq('user_id', user!.id).eq('event_id', eventId);
    } else {
      await supabase.from('favorites').insert({ user_id: user!.id, event_id: eventId });
    }
    loadUserData();
  };

  const toggleParticipated = async (eventId: string) => {
    if (!requireAuth()) return;
    if (participatedIds.has(eventId)) {
      await supabase.from('participations').delete().eq('user_id', user!.id).eq('event_id', eventId);
    } else {
      await supabase.from('participations').insert({ user_id: user!.id, event_id: eventId });
    }
    loadUserData();
  };

  const toggleReminder = async (eventId: string, minutes: number) => {
    if (!requireAuth()) return;
    if (reminderIds.has(eventId) || minutes === 0) {
      await supabase.from('reminders').delete().eq('user_id', user!.id).eq('event_id', eventId);
    } else {
      await supabase.from('reminders').insert({ user_id: user!.id, event_id: eventId, minutes_before: minutes });
    }
    loadUserData();
  };

  const submitRating = async (eventId: string, rating: number, comment: string) => {
    if (!requireAuth()) return;
    if (userRatingMap[eventId]) {
      await supabase
        .from('ratings')
        .update({ rating, comment })
        .eq('user_id', user!.id)
        .eq('event_id', eventId);
    } else {
      await supabase.from('ratings').insert({ user_id: user!.id, event_id: eventId, rating, comment });
    }
    loadUserData();
  };

  const handleRoute = (event: CulturalEvent) => {
    if (userLocation) {
      openRoute(event, userLocation);
    } else if (event.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
  };

  const handleCreated = () => {
    setView('map');
    supabase.from('events').select('*').order('start_time', { ascending: false }).then(({ data }) => {
      if (data) setEvents(data as CulturalEvent[]);
    });
  };

  const ratingCountForEvent = useMemo(() => {
    return ratings.filter((r) => r.event_id === selectedEventId).length;
  }, [ratings, selectedEventId]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header
        view={view}
        setView={setView}
        onOpenFilters={() => setFilterPanelOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        activeFilterCount={activeFilterCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main>
        {view === 'map' && (
          <MapPage
            events={filteredEvents}
            userLocation={userLocation}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            favoriteIds={favoriteIds}
            participatedIds={participatedIds}
            reminderIds={reminderIds}
            ratingsAvg={ratingsAvg}
            onToggleFavorite={toggleFavorite}
            onToggleParticipated={toggleParticipated}
            onToggleReminder={toggleReminder}
            onRoute={handleRoute}
            listOpen={listOpen}
            setListOpen={setListOpen}
          />
        )}
        {view === 'quiz' && (
          <QuizView
            events={events}
            favoriteCategories={favoriteCategories}
            participatedCategories={participatedCategories}
            onSelectEvent={(id) => {
              setView('map');
              handleSelectEvent(id);
            }}
          />
        )}
        {view === 'create' && user && <CreateView onCreated={handleCreated} />}
        {view === 'create' && !user && (
          <div className="py-20 text-center">
            <p className="text-[var(--text-secondary)]">Você precisa entrar para criar eventos.</p>
            <button onClick={() => setAuthOpen(true)} className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
              Entrar
            </button>
          </div>
        )}
        {view === 'favorites' && user && (
          <FavoritesView
            events={events}
            favorites={favorites}
            participations={participations}
            userLocation={userLocation}
            favoriteIds={favoriteIds}
            participatedIds={participatedIds}
            reminderIds={reminderIds}
            ratingsAvg={ratingsAvg}
            onSelectEvent={handleSelectEvent}
            onToggleFavorite={toggleFavorite}
            onToggleParticipated={toggleParticipated}
            onToggleReminder={toggleReminder}
            onRoute={handleRoute}
          />
        )}
        {view === 'favorites' && !user && (
          <div className="py-20 text-center">
            <p className="text-[var(--text-secondary)]">Entre para ver seus salvos e histórico.</p>
            <button onClick={() => setAuthOpen(true)} className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
              Entrar
            </button>
          </div>
        )}
        {view === 'calendar' && user && (
          <CalendarView
            events={events}
            reminders={reminders}
            favoriteIds={favoriteIds}
            participatedIds={participatedIds}
            userLocation={userLocation}
            onSelectEvent={handleSelectEvent}
          />
        )}
        {view === 'calendar' && !user && (
          <div className="py-20 text-center">
            <p className="text-[var(--text-secondary)]">Entre para acessar sua agenda.</p>
            <button onClick={() => setAuthOpen(true)} className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
              Entrar
            </button>
          </div>
        )}
        {view === 'data' && <DataView events={events} />}
        {view === 'accessibility' && <AccessibilityView />}
      </main>

      {/* Overlays */}
      {locationPromptOpen && !userLocation && (
        <LocationPrompt
          onAllow={requestLocation}
          onSkip={() => setLocationPromptOpen(false)}
          denied={locationDenied}
        />
      )}

      <FilterPanel
        open={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        setFilters={setFilters}
        eventCount={filteredEvents.length}
      />

      <EventDetailModal
        event={selectedEvent}
        userLocation={userLocation}
        isFavorite={selectedEvent ? favoriteIds.has(selectedEvent.id) : false}
        hasParticipated={selectedEvent ? participatedIds.has(selectedEvent.id) : false}
        hasReminder={selectedEvent ? reminderIds.has(selectedEvent.id) : false}
        reminderMinutes={selectedEvent ? reminderMinutesMap[selectedEvent.id] ?? null : null}
        avgRating={selectedEvent ? ratingsAvg[selectedEvent.id] ?? null : null}
        ratingCount={ratingCountForEvent}
        userRating={selectedEvent ? userRatingMap[selectedEvent.id] ?? null : null}
        onClose={() => setSelectedEventId(null)}
        onToggleFavorite={() => selectedEvent && toggleFavorite(selectedEvent.id)}
        onToggleParticipated={() => selectedEvent && toggleParticipated(selectedEvent.id)}
        onToggleReminder={(m) => selectedEvent && toggleReminder(selectedEvent.id, m)}
        onRoute={() => selectedEvent && handleRoute(selectedEvent)}
        onSubmitRating={(r, c) => selectedEvent && submitRating(selectedEvent.id, r, c)}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}
