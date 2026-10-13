import React from 'react';
import { 
  X, 
  Eye, 
  MousePointerClick, 
  Clock, 
  Globe, 
  Crosshair, 
  Copy, 
  Check, 
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

export default function SessionTimeline({ 
  sessionId, 
  events, 
  loading, 
  error, 
  onClose,
  onRetry 
}) {
  const [copiedId, setCopiedId] = React.useState(false);

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return {
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        date: date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        full: date.toISOString()
      };
    } catch {
      return { time: isoString, date: '', full: isoString };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">User Journey Timeline</h2>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                {events?.length ?? 0} Events
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-mono">
              <span className="truncate max-w-xs">{sessionId}</span>
              <button
                onClick={copySessionId}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Copy Session ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to Sessions List"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 overflow-y-auto max-h-[750px]">
        {loading && <LoadingSpinner message="Loading chronological journey..." />}
        
        {error && <ErrorMessage message={error} onRetry={onRetry} />}

        {!loading && !error && events?.length === 0 && (
          <EmptyState 
            title="No events recorded for this session" 
            description="Events should appear here once captured by the tracking script."
          />
        )}

        {!loading && !error && events?.length > 0 && (
          <div className="relative pl-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {events.map((event, index) => {
              const isClick = event.event_type === 'click';
              const isPageView = event.event_type === 'page_view';
              const ts = formatTimestamp(event.timestamp);

              return (
                <div key={event._id || index} className="relative pb-8 last:pb-2 group">
                  {/* Timeline node icon */}
                  <div 
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ring-4 ring-white ${
                      isClick 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {isClick ? <MousePointerClick className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </div>

                  {/* Event details card */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 hover:border-slate-300 hover:bg-white transition-all shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isClick
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {event.event_type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Step #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono" title={ts.full}>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ts.time}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span>{ts.date}</span>
                      </div>
                    </div>

                    {/* Page URL */}
                    <div className="flex items-start gap-2 text-xs text-slate-600 mb-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <a 
                        href={event.page_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-mono text-indigo-600 hover:underline break-all"
                      >
                        {event.page_url}
                      </a>
                    </div>

                    {/* Coordinates & Viewport for clicks */}
                    {isClick && event.coordinates && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-medium">
                          <Crosshair className="w-3.5 h-3.5 text-amber-600" />
                          <span>Coordinates: X={event.coordinates.x}, Y={event.coordinates.y}</span>
                        </div>

                        {event.viewport && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Viewport: {event.viewport.width} &times; {event.viewport.height}px
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
