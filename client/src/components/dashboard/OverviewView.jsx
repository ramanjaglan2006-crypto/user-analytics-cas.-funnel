import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  Eye, 
  MousePointerClick, 
  Globe, 
  Code2, 
  Check, 
  Copy, 
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function OverviewView({ 
  stats, 
  sessions, 
  onSelectSession, 
  onNavigateTab,
  onTriggerTestEvent 
}) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [testFiring, setTestFiring] = useState(false);

  const trackerSnippet = `<script
  src="http://localhost:5173/tracker.js"
  data-api-url="http://localhost:5001/api/events"
  defer
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackerSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleFireTestClick = async () => {
    setTestFiring(true);
    await onTriggerTestEvent();
    setTestFiring(false);
  };

  const cards = [
    {
      title: 'Total Sessions',
      value: stats?.total_sessions ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      description: 'Distinct user browsing sessions'
    },
    {
      title: 'Total Events',
      value: stats?.total_events ?? 0,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      description: 'All captured interactions'
    },
    {
      title: 'Page Views',
      value: stats?.total_page_views ?? 0,
      icon: Eye,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      description: 'Tracked page view events'
    },
    {
      title: 'Click Events',
      value: stats?.total_clicks ?? 0,
      icon: MousePointerClick,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      description: 'Coordinates captured'
    },
    {
      title: 'Tracked Pages',
      value: stats?.total_pages ?? 0,
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      description: 'Unique URLs visited'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Analytics Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry gathered from the JavaScript tracking script and persisted in MongoDB.
          </p>
        </div>

        {/* Quick Test Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFireTestClick}
            disabled={testFiring}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs disabled:opacity-50"
            title="Dispatch a simulated click event directly to the backend"
          >
            <Zap className={`w-4 h-4 ${testFiring ? 'animate-bounce' : ''}`} />
            <span>{testFiring ? 'Emitting Event...' : 'Emit Sample Event'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Sessions & Tracker Script */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Sessions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Sessions</h2>
              <p className="text-xs text-slate-500">Latest active visitor sessions with event tallies</p>
            </div>
            <button
              onClick={() => onNavigateTab('sessions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All Sessions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {sessions.slice(0, 5).map((s) => (
                <div 
                  key={s.session_id} 
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => onSelectSession(s.session_id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-xs font-semibold">
                      ID
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-medium text-slate-900 truncate max-w-xs group-hover:text-indigo-600 transition-colors">
                        {s.session_id}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Last Active: {new Date(s.last_activity).toLocaleTimeString()} &bull; {s.page_count || 1} page(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {s.total_events} events
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {s.clicks || 0} clicks / {s.page_views || 0} views
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No sessions recorded yet. Start browsing the demo store to see sessions appear in real time.
            </div>
          )}
        </div>

        {/* Right Column: Tracker Embed Snippet */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Install Tracking Script</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add this lightweight tracking tag to any webpage to immediately capture page views and clicks.
            </p>

            <div className="relative bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto border border-slate-800">
              <button
                onClick={copyToClipboard}
                className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                title="Copy snippet"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="pr-8">{trackerSnippet}</pre>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Automatic <code>page_view</code> on load and SPA navigation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Captures viewport-relative coordinates <code>(x, y)</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Persistent browser session in <code>localStorage</code></span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href={import.meta.env.VITE_DEMO_URL || 'http://localhost:8080'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
            >
              <span>Open Tracked Demo Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
