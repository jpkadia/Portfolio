import { useEffect, useRef } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/api';

/**
 * Custom hook to accurately track visitor sessions and viewed sections.
 * Automatically dedupes section pings within the session to prevent server spam.
 */
export default function useVisitorTracker(isAdminRoute = false) {
  const trackedSections = useRef(new Set());
  const lastTrackTime = useRef(0);

  const sendTrack = async (sectionName, pathName) => {
    // Basic throttle: at least 1.5 seconds between any tracking calls
    const now = Date.now();
    if (now - lastTrackTime.current < 1500) return;
    lastTrackTime.current = now;

    const payload = {
      section: sectionName || 'home',
      path: pathName || window.location.pathname || '/',
      referrer: document.referrer || 'Direct'
    };

    try {
      // Use modern sendBeacon if available for zero-latency background dispatch
      const url = `${getApiBaseUrl()}/analytics/track`;
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        await axios.post(url, payload, { timeout: 3000 });
      }
    } catch (e) {
      // Silent error: never affect user experience or page performance
    }
  };

  useEffect(() => {
    if (isAdminRoute) return;

    // 1. Track initial landing
    const initialSection = window.location.hash ? window.location.hash.replace('#', '') : 'home';
    trackedSections.current.add(initialSection);
    sendTrack(initialSection, window.location.pathname);

    // 2. Observe major portfolio sections
    const sectionIds = ['parth', 'about', 'skills', 'experience', 'projects', 'education', 'contact'];
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return;

    let observer = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
              const id = entry.target.id;
              if (id && !trackedSections.current.has(id)) {
                trackedSections.current.add(id);
                sendTrack(id, window.location.pathname);
              }
            }
          });
        },
        {
          threshold: [0.35]
        }
      );

      elements.forEach(el => observer.observe(el));
    } catch (e) {
      // IntersectionObserver fallback
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [isAdminRoute]);
}
