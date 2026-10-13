import React from 'react';
import { MousePointerClick, ExternalLink } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = MousePointerClick, 
  title = 'No Data Collected Yet', 
  description = 'User interactions from the tracking script will appear here once recorded.',
  actionLabel,
  onAction 
}) {
  const demoUrl = import.meta.env.VITE_DEMO_URL || 'http://localhost:8080';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center my-6 shadow-xs max-w-lg mx-auto">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {actionLabel}
          </button>
        )}
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
        >
          <span>Open Demo Website</span>
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </a>
      </div>
    </div>
  );
}
