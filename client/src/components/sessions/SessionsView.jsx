import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  Clock, 
  ArrowRight, 
  Eye, 
  MousePointerClick, 
  Copy, 
  Check, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import SessionTimeline from './SessionTimeline';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

export default function SessionsView({ 
  sessions, 
  loading, 
  error, 
  onRefresh,
  selectedSessionId,
  selectedSessionEvents,
  sessionEventsLoading,
  sessionEventsError,
  onSelectSession,
  onCloseTimeline,
  onRetrySessionEvents
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const copyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSessions = (sessions || []).filter((s) => {
    if (!searchTerm.trim()) return true;
    return s.session_id.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sessions & User Journeys
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse aggregated browsing sessions and inspect chronological interaction journeys.
          </p>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Sessions List + Detail Timeline */}
      <div className={`grid grid-cols-1 ${selectedSessionId ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
        
        {/* Sessions Table / List */}
        <div className={`${selectedSessionId ? 'lg:col-span-6 xl:col-span-5' : 'w-full'}`}>
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            
            {/* List Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recorded Sessions ({filteredSessions.length})
                </span>
              </div>
              <button
                onClick={onRefresh}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Refresh sessions"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading && <LoadingSpinner message="Fetching user sessions..." />}

            {error && <ErrorMessage message={error} onRetry={onRefresh} />}

            {!loading && !error && filteredSessions.length === 0 && (
              <EmptyState 
                title="No Matching Sessions Found" 
                description={searchTerm ? "Try adjusting your search query." : "No visitor interactions have been captured yet."}
              />
            )}

            {!loading && !error && filteredSessions.length > 0 && (
              <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
                {filteredSessions.map((s) => {
                  const isSelected = selectedSessionId === s.session_id;

                  return (
                    <div
                      key={s.session_id}
                      onClick={() => onSelectSession(s.session_id)}
                      className={`p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected 
                          ? 'bg-indigo-50/70 border-l-4 border-indigo-600 pl-3' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-900 truncate max-w-xs">
                            {s.session_id}
                          </span>
                          <button
                            onClick={(e) => copyId(s.session_id, e)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title="Copy ID"
                          >
                            {copiedId === s.session_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 text-indigo-800 shrink-0">
                          {s.total_events} events
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
                            <Eye className="w-3 h-3" /> {s.page_views || 0}
                          </span>
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
                            <MousePointerClick className="w-3 h-3" /> {s.clicks || 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(s.last_activity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane: Selected Session Timeline */}
        {selectedSessionId && (
          <div className="lg:col-span-6 xl:col-span-7">
            <SessionTimeline
              sessionId={selectedSessionId}
              events={selectedSessionEvents}
              loading={sessionEventsLoading}
              error={sessionEventsError}
              onClose={onCloseTimeline}
              onRetry={() => onRetrySessionEvents(selectedSessionId)}
            />
          </div>
        )}

      </div>
    </div>
  );
}
