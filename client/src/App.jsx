import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import OverviewView from './components/dashboard/OverviewView';
import SessionsView from './components/sessions/SessionsView';
import HeatmapView from './components/heatmap/HeatmapView';
import SandboxView from './components/sandbox/SandboxView';
import SubmissionView from './components/submission/SubmissionView';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('overview'); // 'overview' | 'sessions' | 'heatmap' | 'sandbox' | 'submission'

  // Backend Health
  const [backendHealth, setBackendHealth] = useState(null);

  // Overview Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);

  // Selected Session Timeline
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionEvents, setSessionEvents] = useState([]);
  const [sessionEventsLoading, setSessionEventsLoading] = useState(false);
  const [sessionEventsError, setSessionEventsError] = useState(null);

  // Heatmap & Pages
  const [pages, setPages] = useState([]);
  const [selectedPageUrl, setSelectedPageUrl] = useState('');
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);

  // General Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setBackendHealth(data);
    } catch {
      setBackendHealth({ status: 'offline', database: { connected: false } });
    }
  }, []);

  // Fetch Stats & Tracked Pages
  const fetchGlobalData = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const [statsRes, pagesRes] = await Promise.all([
        api.getStats().catch(() => ({ data: null })),
        api.getTrackedPages().catch(() => ({ data: [] }))
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (pagesRes.data) {
        setPages(pagesRes.data);
        // Default selected page if not already chosen
        setSelectedPageUrl((prev) => {
          if (prev) return prev;
          return pagesRes.data.length > 0 ? pagesRes.data[0].page_url : '';
        });
      }
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Sessions
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      setSessionsError(null);
      const res = await api.getSessions();
      setSessions(res.data || []);
    } catch (err) {
      setSessionsError(err.message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Fetch Session Events when a session is selected
  const fetchSelectedSessionEvents = useCallback(async (sessionId) => {
    if (!sessionId) {
      setSessionEvents([]);
      return;
    }
    try {
      setSessionEventsLoading(true);
      setSessionEventsError(null);
      const res = await api.getSessionEvents(sessionId);
      setSessionEvents(res.data || []);
    } catch (err) {
      setSessionEventsError(err.message);
    } finally {
      setSessionEventsLoading(false);
    }
  }, []);

  // Fetch Heatmap Data when selectedPageUrl changes
  const fetchHeatmap = useCallback(async (url) => {
    if (!url) {
      setHeatmapData(null);
      return;
    }
    try {
      setHeatmapLoading(true);
      setHeatmapError(null);
      const res = await api.getHeatmap(url);
      setHeatmapData(res.data || null);
    } catch (err) {
      setHeatmapError(err.message);
    } finally {
      setHeatmapLoading(false);
    }
  }, []);

  // Unified Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      checkHealth(),
      fetchGlobalData(),
      fetchSessions(),
      selectedSessionId ? fetchSelectedSessionEvents(selectedSessionId) : Promise.resolve(),
      selectedPageUrl ? fetchHeatmap(selectedPageUrl) : Promise.resolve()
    ]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [checkHealth, fetchGlobalData, fetchSessions, selectedSessionId, fetchSelectedSessionEvents, selectedPageUrl, fetchHeatmap]);

  // Initial Load
  useEffect(() => {
    handleRefresh();
    // Auto-ping health every 30s
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  // React to selected session change
  useEffect(() => {
    if (selectedSessionId) {
      fetchSelectedSessionEvents(selectedSessionId);
    }
  }, [selectedSessionId, fetchSelectedSessionEvents]);

  // React to selected page URL change for heatmap
  useEffect(() => {
    if (selectedPageUrl) {
      fetchHeatmap(selectedPageUrl);
    }
  }, [selectedPageUrl, fetchHeatmap]);

  // Handle Session Click from anywhere
  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    if (currentTab !== 'sessions') {
      setCurrentTab('sessions');
    }
  };

  // Trigger manual simulated event for immediate reviewer testing
  const handleTriggerTestEvent = async () => {
    const randomSession = `test_sess_${Math.floor(1000 + Math.random() * 9000)}`;
    const randomX = Math.floor(150 + Math.random() * 850);
    const randomY = Math.floor(120 + Math.random() * 500);
    const testUrl = 'http://localhost:8080/index.html';

    try {
      // 1. Emit page_view
      await api.createEvent({
        session_id: randomSession,
        event_type: 'page_view',
        page_url: testUrl,
        timestamp: new Date().toISOString()
      });

      // 2. Emit click
      await api.createEvent({
        session_id: randomSession,
        event_type: 'click',
        page_url: testUrl,
        timestamp: new Date().toISOString(),
        coordinates: { x: randomX, y: randomY },
        viewport: { width: 1200, height: 800 }
      });

      // Refresh data
      await handleRefresh();
    } catch (e) {
      console.error('Failed to trigger test event:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        backendHealth={backendHealth}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && (
          <OverviewView
            stats={stats}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onNavigateTab={setCurrentTab}
            onTriggerTestEvent={handleTriggerTestEvent}
          />
        )}

        {currentTab === 'sessions' && (
          <SessionsView
            sessions={sessions}
            loading={sessionsLoading}
            error={sessionsError}
            onRefresh={fetchSessions}
            selectedSessionId={selectedSessionId}
            selectedSessionEvents={sessionEvents}
            sessionEventsLoading={sessionEventsLoading}
            sessionEventsError={sessionEventsError}
            onSelectSession={setSelectedSessionId}
            onCloseTimeline={() => setSelectedSessionId(null)}
            onRetrySessionEvents={fetchSelectedSessionEvents}
          />
        )}

        {currentTab === 'heatmap' && (
          <HeatmapView
            pages={pages}
            selectedPageUrl={selectedPageUrl}
            setSelectedPageUrl={setSelectedPageUrl}
            heatmapData={heatmapData}
            loading={heatmapLoading}
            error={heatmapError}
            onRefresh={() => fetchHeatmap(selectedPageUrl)}
          />
        )}

        {currentTab === 'sandbox' && (
          <SandboxView
            onNavigateTab={setCurrentTab}
            onSelectPageForHeatmap={(url) => {
              setSelectedPageUrl(url);
              setCurrentTab('heatmap');
            }}
          />
        )}

        {currentTab === 'submission' && (
          <SubmissionView
            onNavigateTab={setCurrentTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 CausalFunnel Full Stack Engineer Assignment.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client: React + Vite + Tailwind CSS</span>
            <span>&bull;</span>
            <span>Server: Node.js + Express + MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
