import React from 'react';
import { 
  Activity, 
  BarChart3, 
  Flame, 
  Layers, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  FileCheck2
} from 'lucide-react';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  backendHealth, 
  onRefresh, 
  isRefreshing,
  lastUpdated 
}) {
  const demoUrl = import.meta.env.VITE_DEMO_URL || 'http://localhost:8080';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sessions', label: 'Sessions', icon: Layers },
    { id: 'heatmap', label: 'Heatmap', icon: Flame },
    { id: 'sandbox', label: 'Store Sandbox', icon: ShoppingBag },
    { id: 'submission', label: 'Submission Hub', icon: FileCheck2 },
    { id: 'demo', label: 'External Demo', icon: ExternalLink, isExternal: true },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  CausalFunnel
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200/60">
                  Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                User Telemetry & Click Heatmap Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              if (item.isExternal) {
                return (
                  <a
                    key={item.id}
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200/80"
                    title="Open the tracked demo website in a new tab"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Health Status */}
          <div className="flex items-center gap-3">
            {/* Backend health status badge */}
            <div 
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                backendHealth?.status === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendHealth?.status === 'demo-mode'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                backendHealth?.status === 'healthy' 
                  ? 'Backend & MongoDB Connected' 
                  : backendHealth?.status === 'demo-mode' 
                  ? 'Interactive Edge Preview Mode' 
                  : 'Backend Disconnected'
              }
            >
              {backendHealth?.status === 'healthy' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>API Live</span>
                </>
              ) : backendHealth?.status === 'demo-mode' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <span>Interactive Preview</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>API Connecting</span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
