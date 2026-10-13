import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Globe, 
  MousePointerClick, 
  Layers, 
  Crosshair, 
  Sliders, 
  Info, 
  Eye, 
  Download,
  Maximize2
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

export default function HeatmapView({ 
  pages, 
  selectedPageUrl, 
  setSelectedPageUrl, 
  heatmapData, 
  loading, 
  error, 
  onRefresh 
}) {
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' | 'dots' | 'table'
  const [pointRadius, setPointRadius] = useState(25);
  const [hoveredClick, setHoveredClick] = useState(null);
  const canvasRef = useRef(null);

  // Standard viewport canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Render HTML5 Canvas for real density heatmap blending
  useEffect(() => {
    if (viewMode === 'table' || !heatmapData?.clicks || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const clicks = heatmapData.clicks;

    if (viewMode === 'heatmap') {
      // 1. Draw radial gradient intensity alpha map
      const alphaCanvas = document.createElement('canvas');
      alphaCanvas.width = CANVAS_WIDTH;
      alphaCanvas.height = CANVAS_HEIGHT;
      const alphaCtx = alphaCanvas.getContext('2d');

      clicks.forEach((click) => {
        // Clamp coordinates within canvas boundaries
        const cx = Math.min(CANVAS_WIDTH, Math.max(0, click.x));
        const cy = Math.min(CANVAS_HEIGHT, Math.max(0, click.y));

        const radGrad = alphaCtx.createRadialGradient(cx, cy, 0, cx, cy, pointRadius);
        radGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
        radGrad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');

        alphaCtx.fillStyle = radGrad;
        alphaCtx.beginPath();
        alphaCtx.arc(cx, cy, pointRadius, 0, Math.PI * 2);
        alphaCtx.fill();
      });

      // 2. Colorize alpha map with heat palette
      const imgData = alphaCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          // Normalize alpha to 0..1
          const norm = alpha / 255;
          let r = 0, g = 0, b = 0;

          if (norm < 0.25) {
            // Cold blue -> cyan
            r = 0;
            g = Math.floor(norm * 4 * 255);
            b = 255;
          } else if (norm < 0.5) {
            // Cyan -> Green
            r = 0;
            g = 255;
            b = Math.floor((1 - (norm - 0.25) * 4) * 255);
          } else if (norm < 0.75) {
            // Green -> Yellow
            r = Math.floor((norm - 0.5) * 4 * 255);
            g = 255;
            b = 0;
          } else {
            // Yellow -> Red/Hot
            r = 255;
            g = Math.floor((1 - (norm - 0.75) * 4) * 255);
            b = 0;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = Math.min(240, Math.floor(alpha * 1.5));
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Draw faint dot center for precision
      clicks.forEach((click) => {
        const cx = Math.min(CANVAS_WIDTH, Math.max(0, click.x));
        const cy = Math.min(CANVAS_HEIGHT, Math.max(0, click.y));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (viewMode === 'dots') {
      // Discrete point dots mode
      clicks.forEach((click, idx) => {
        const cx = Math.min(CANVAS_WIDTH, Math.max(0, click.x));
        const cy = Math.min(CANVAS_HEIGHT, Math.max(0, click.y));

        // Outer glow
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        // White center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [heatmapData, viewMode, pointRadius]);

  const handleCanvasMouseMove = (e) => {
    if (!heatmapData?.clicks || heatmapData.clicks.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Find nearest click within detection radius
    let nearest = null;
    let minDistance = 25;

    heatmapData.clicks.forEach((click) => {
      const dist = Math.hypot(click.x - mouseX, click.y - mouseY);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...click, screenX: e.clientX, screenY: e.clientY };
      }
    });

    setHoveredClick(nearest);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredClick(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Page Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            Click Heatmap Visualization
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze spatial density of real user clicks across recorded viewport coordinates.
          </p>
        </div>

        {/* Page selector dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedPageUrl || ''}
              onChange={(e) => setSelectedPageUrl(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-hidden min-w-[280px] max-w-[420px] truncate"
            >
              {pages?.length === 0 && <option value="">No tracked pages available</option>}
              {pages?.map((p) => (
                <option key={p.page_url} value={p.page_url}>
                  {p.page_url} ({p.clicks || 0} clicks)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics & Visualization Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Page Stats */}
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Clicks</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {heatmapData?.total_clicks ?? 0}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Active URL</div>
            <div className="text-xs font-mono text-indigo-600 truncate max-w-xs sm:max-w-md">
              {selectedPageUrl || 'None selected'}
            </div>
          </div>
        </div>

        {/* Controls: View Mode & Radius Slider */}
        <div className="flex items-center gap-4">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'heatmap' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setViewMode('dots')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'dots' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Click Points
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Table
            </button>
          </div>

          {/* Radius Slider for heatmap mode */}
          {viewMode === 'heatmap' && (
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span>Heat Radius:</span>
              <input
                type="range"
                min="15"
                max="50"
                value={pointRadius}
                onChange={(e) => setPointRadius(Number(e.target.value))}
                className="w-20 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono text-slate-700">{pointRadius}px</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Heatmap Canvas Area */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden relative">
        
        {loading && <LoadingSpinner message="Calculating coordinate heatmap..." />}
        {error && <ErrorMessage message={error} onRetry={onRefresh} />}

        {!loading && !error && (!heatmapData?.clicks || heatmapData.clicks.length === 0) && (
          <EmptyState
            icon={Flame}
            title="No Click Coordinates Recorded for this URL"
            description="Users have visited this URL but no click interactions have been captured yet. Open the demo site and click interactive buttons to generate heat data."
          />
        )}

        {!loading && !error && heatmapData?.clicks?.length > 0 && (
          <>
            {viewMode === 'table' ? (
              /* Coordinates Data Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Session ID</th>
                      <th className="px-6 py-3">Coordinates (X, Y)</th>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Viewport Dimensions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {heatmapData.clicks.map((click, idx) => (
                      <tr key={click.event_id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3 text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-3 text-indigo-600 font-semibold">{click.session_id}</td>
                        <td className="px-6 py-3 font-bold text-amber-800">
                          X: {click.x}, Y: {click.y}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {new Date(click.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-3 text-slate-400">
                          {click.viewport ? `${click.viewport.width} x ${click.viewport.height}px` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Visual Interactive Canvas */
              <div className="relative bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
                
                {/* Viewport canvas container with mock browser chrome */}
                <div className="w-full max-w-[1200px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900/90 relative">
                  
                  {/* Mock browser header */}
                  <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                      <span className="ml-2 text-slate-300 truncate max-w-sm sm:max-w-md">{selectedPageUrl}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Canvas: {CANVAS_WIDTH} &times; {CANVAS_HEIGHT}px</span>
                    </div>
                  </div>

                  {/* Canvas surface with subtle grid lines */}
                  <div className="relative w-full aspect-[3/2] max-h-[700px] bg-slate-950/60 overflow-hidden">
                    {/* Background Grid Pattern */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                      }}
                    ></div>

                    {/* Canvas Element */}
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleCanvasMouseLeave}
                      className="w-full h-full object-contain cursor-crosshair relative z-10"
                    />

                    {/* Hover tooltip for click details */}
                    {hoveredClick && (
                      <div 
                        className="fixed z-50 pointer-events-none bg-slate-900/95 text-white border border-slate-700 px-3 py-2 rounded-lg text-xs font-mono shadow-xl -translate-x-1/2 -translate-y-12"
                        style={{ left: hoveredClick.screenX, top: hoveredClick.screenY }}
                      >
                        <div className="text-amber-400 font-bold">
                          Click at ({hoveredClick.x}, {hoveredClick.y})
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                          Session: {hoveredClick.session_id}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(hoveredClick.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 w-full max-w-[1200px] text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Intensity Legend:</span>
                    <div className="h-3 w-32 rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500 shadow-inner"></div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span>Low (1)</span>
                      <span>High Density</span>
                    </div>
                  </div>
                  
                  <div className="text-slate-500 text-[11px]">
                    * Viewport-relative coordinates (<code>clientX</code>, <code>clientY</code>) rendered at canvas origin (0,0).
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>

      {/* Engineering Documentation Alert regarding coordinate normalization */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Coordinate System Note: </span>
          The tracking script records browser viewport coordinates (<code>clientX</code>, <code>clientY</code>). The visualization maps these stored coordinates onto a standardized 1200 &times; 800px viewport canvas. Points represent real recorded user interactions rather than interpolated or hardcoded simulation points.
        </div>
      </div>
    </div>
  );
}
