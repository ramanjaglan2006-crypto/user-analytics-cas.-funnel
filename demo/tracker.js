/**
 * CausalFunnel Analytics Tracking Script
 * Reusable client-side telemetry tracker for capturing page views and click interactions.
 * 
 * Usage:
 * <script 
 *   src="http://localhost:5173/tracker.js" 
 *   data-api-url="http://localhost:5000/api/events" 
 *   defer
 * ></script>
 */
(function (window, document) {
  'use strict';

  // Prevent multiple initializations on the same page
  if (window.__CAUSAL_TRACKER_INITIALIZED__) {
    return;
  }
  window.__CAUSAL_TRACKER_INITIALIZED__ = true;

  const STORAGE_KEY = 'causal_analytics_session_id';
  const LAST_ACTIVITY_KEY = 'causal_last_activity_time';
  const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

  /**
   * Determine API Endpoint configuration
   * Priority:
   * 1. <script data-api-url="..."> attribute
   * 2. window.CausalTrackerConfig.apiUrl
   * 3. Fallback default: http://localhost:5000/api/events
   */
  function getApiEndpoint() {
    try {
      const currentScript = document.currentScript || (function () {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
          if (scripts[i].src && scripts[i].src.indexOf('tracker.js') !== -1) {
            return scripts[i];
          }
        }
        return null;
      })();

      if (currentScript && currentScript.getAttribute('data-api-url')) {
        return currentScript.getAttribute('data-api-url');
      }

      if (window.CausalTrackerConfig && window.CausalTrackerConfig.apiUrl) {
        return window.CausalTrackerConfig.apiUrl;
      }
    } catch (e) {
      // Ignore DOM access errors
    }

    return 'http://localhost:5001/api/events';
  }

  const API_URL = getApiEndpoint();

  /**
   * Cookie Helpers (fallback if localStorage is disabled or unavailable)
   */
  function getCookie(name) {
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return match ? decodeURIComponent(match[3]) : null;
    } catch (e) {
      return null;
    }
  }

  function setCookie(name, value, days) {
    try {
      let expires = '';
      if (days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + d.toUTCString();
      }
      document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
    } catch (e) {
      // Ignore cookie errors
    }
  }

  /**
   * Generate UUID v4 or random alphanumeric session token
   */
  function generateSessionId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return 'sess_' + crypto.randomUUID();
    }
    const rand = Math.random().toString(36).substring(2, 10);
    const time = Date.now().toString(36);
    return 'sess_' + time + '_' + rand;
  }

  /**
   * Session Management:
   * Checks for an existing session ID in localStorage (with cookie fallback).
   * Also verifies inactivity window: if last user action occurred more than
   * SESSION_INACTIVITY_TIMEOUT_MS ago, a new session is generated to model
   * standard Web Analytics session boundaries.
   */
  function getOrCreateSessionId() {
    let sessionId = null;
    const now = Date.now();

    try {
      sessionId = localStorage.getItem(STORAGE_KEY);
      const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);

      // Inactivity expiration check: if inactive for > 30 mins, start a new session
      if (sessionId && lastActivity && (now - lastActivity > SESSION_INACTIVITY_TIMEOUT_MS)) {
        sessionId = null;
      }
    } catch (e) {
      // LocalStorage access restricted (e.g. private mode)
    }

    // Fallback to cookie check if localStorage is empty
    if (!sessionId) {
      sessionId = getCookie(STORAGE_KEY);
    }

    // Generate new session ID if none found or expired
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Persist session ID and update last activity
    try {
      localStorage.setItem(STORAGE_KEY, sessionId);
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    } catch (e) {
      // Ignore localStorage write failures
    }
    setCookie(STORAGE_KEY, sessionId, 1);

    return sessionId;
  }

  function updateActivity() {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch (e) {}
  }

  /**
   * Dispatch event to Backend API safely.
   * Guarantees host webpage is never broken on failure.
   */
  function sendEvent(payload) {
    try {
      updateActivity();

      const body = JSON.stringify(payload);

      // Use fetch with keepalive to allow events to complete during page unloading
      if (typeof fetch === 'function') {
        fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body,
          keepalive: true
        }).catch(function (err) {
          // Silent failure - do not disrupt host site
          if (window.CausalTrackerConfig && window.CausalTrackerConfig.debug) {
            console.warn('[CausalTracker] Failed to send event:', err);
          }
        });
      } else if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(API_URL, blob);
      }
    } catch (err) {
      // Fail safely
    }
  }

  /**
   * Track Page View Event
   */
  function trackPageView(customUrl) {
    try {
      const sessionId = getOrCreateSessionId();
      const pageUrl = customUrl || window.location.href;

      const eventPayload = {
        session_id: sessionId,
        event_type: 'page_view',
        page_url: pageUrl,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth || document.documentElement.clientWidth || 0,
          height: window.innerHeight || document.documentElement.clientHeight || 0
        }
      };

      sendEvent(eventPayload);

      if (window.CausalTrackerConfig && window.CausalTrackerConfig.debug) {
        console.log('[CausalTracker] Tracked page_view:', eventPayload);
      }
    } catch (e) {
      // Defensive catch
    }
  }

  /**
   * Track Click Event
   */
  function trackClick(e) {
    try {
      // Ignore non-primary clicks (e.g. right clicks)
      if (e.button !== 0 && e.which !== 1 && e.button !== undefined) {
        return;
      }

      // Privacy check: avoid capturing clicks inside password inputs or explicitly marked private elements
      const target = e.target;
      if (target) {
        if (target.type === 'password' || (target.getAttribute && target.getAttribute('data-causal-ignore') === 'true')) {
          return;
        }
      }

      const sessionId = getOrCreateSessionId();
      const pageUrl = window.location.href;

      // Capture viewport-relative click coordinates
      const x = Math.max(0, Math.round(e.clientX));
      const y = Math.max(0, Math.round(e.clientY));

      const eventPayload = {
        session_id: sessionId,
        event_type: 'click',
        page_url: pageUrl,
        timestamp: new Date().toISOString(),
        coordinates: {
          x: x,
          y: y
        },
        viewport: {
          width: window.innerWidth || document.documentElement.clientWidth || 0,
          height: window.innerHeight || document.documentElement.clientHeight || 0
        }
      };

      sendEvent(eventPayload);

      if (window.CausalTrackerConfig && window.CausalTrackerConfig.debug) {
        console.log('[CausalTracker] Tracked click at (' + x + ', ' + y + '):', eventPayload);
      }
    } catch (err) {
      // Defensive catch
    }
  }

  /**
   * Initialize Listeners
   */
  function init() {
    // 1. Send page_view on load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      trackPageView();
    } else {
      document.addEventListener('DOMContentLoaded', function onDOMLoad() {
        trackPageView();
        document.removeEventListener('DOMContentLoaded', onDOMLoad);
      });
    }

    // 2. Global click tracking listener
    document.addEventListener('click', trackClick, true);

    // 3. SPA Navigation Tracking (History API monkeypatching & popstate)
    const handleUrlChange = function () {
      setTimeout(function () {
        trackPageView();
      }, 50);
    };

    window.addEventListener('popstate', handleUrlChange);

    try {
      const originalPushState = history.pushState;
      if (originalPushState) {
        history.pushState = function () {
          originalPushState.apply(this, arguments);
          handleUrlChange();
        };
      }

      const originalReplaceState = history.replaceState;
      if (originalReplaceState) {
        history.replaceState = function () {
          originalReplaceState.apply(this, arguments);
          handleUrlChange();
        };
      }
    } catch (e) {
      // Ignore security errors in restricted environments
    }
  }

  // Start tracking
  init();

  // Expose public API for manual testing and debugging
  window.CausalTracker = {
    getSessionId: getOrCreateSessionId,
    trackPageView: trackPageView,
    trackCustomClick: function (x, y) {
      const sessionId = getOrCreateSessionId();
      sendEvent({
        session_id: sessionId,
        event_type: 'click',
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        coordinates: { x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    },
    version: '1.0.0',
    endpoint: API_URL
  };
})(window, document);
