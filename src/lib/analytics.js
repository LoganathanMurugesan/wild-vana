import { supabase } from './supabase';

// ── Session ID ────────────────────────────────────────────────
// Anonymous UUID per browser tab — cleared when tab closes.
// No personal data is stored.
function getSessionId() {
  let sid = sessionStorage.getItem('wv_sid');
  if (!sid) {
    sid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('wv_sid', sid);
  }
  return sid;
}

// ── GA4 helper ────────────────────────────────────────────────
function gtag(...args) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

// ── Core tracker ─────────────────────────────────────────────
export async function trackEvent(eventType, extra = {}) {
  // Fire GA4 event
  gtag('event', eventType, extra);

  // Fire Supabase custom event (fire-and-forget, never throws)
  try {
    await supabase.from('analytics_events').insert([{
      event_type:    eventType,
      page:          window.location.pathname,
      referrer:      document.referrer || null,
      user_agent:    navigator.userAgent,
      session_id:    getSessionId(),
      ...extra,
    }]);
  } catch { /* silent — analytics must never break the app */ }
}

// ── Convenience helpers ───────────────────────────────────────
export const trackPageView = (path) =>
  trackEvent('page_view', { page: path || window.location.pathname });

export const trackTourView = (tourId, tourLocation) =>
  trackEvent('tour_view', { tour_id: tourId, tour_location: tourLocation });

export const trackBookingClick = (tourLocation) =>
  trackEvent('booking_click', { tour_location: tourLocation });

export const trackSectionView = (section) =>
  trackEvent('section_view', { page: section });

export const trackCompetitionRegister = () =>
  trackEvent('competition_register');
