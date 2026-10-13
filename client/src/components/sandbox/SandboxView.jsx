import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Compass, 
  CreditCard, 
  Tag, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  MousePointer2, 
  ExternalLink,
  Laptop,
  Smartphone,
  Flame,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';

export default function SandboxView({ onNavigateTab, onSelectPageForHeatmap }) {
  const [currentPage, setCurrentPage] = useState('/');
  const [cartCount, setCartCount] = useState(2);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastEvent, setLastEvent] = useState(null);
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [sessionInfo, setSessionInfo] = useState({ id: '', eventCount: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const sandboxRef = useRef(null);

  // Initialize or get session_id from localStorage
  useEffect(() => {
    let sid = localStorage.getItem('causal_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('causal_session_id', sid);
    }
    setSessionInfo({ id: sid, eventCount: 0 });

    // Track initial page_view for the sandbox
    trackPageView(currentPage, sid);
  }, []);

  // Track page view helper
  const trackPageView = async (url, sid = sessionInfo.id) => {
    if (!sid) return;
    try {
      await api.trackEvent({
        session_id: sid,
        event_type: 'page_view',
        page_url: url,
        timestamp: new Date().toISOString()
      });
      setSessionInfo(prev => ({ ...prev, eventCount: prev.eventCount + 1 }));
      setLastEvent({
        type: 'page_view',
        url,
        time: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.warn('Sandbox page_view track failed:', err.message);
    }
  };

  // Switch page in sandbox
  const handleNavigatePage = (page) => {
    setCurrentPage(page);
    trackPageView(page);
  };

  // Start fresh session
  const handleNewSession = () => {
    const newSid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('causal_session_id', newSid);
    setSessionInfo({ id: newSid, eventCount: 0 });
    trackPageView(currentPage, newSid);
  };

  // Handle click inside sandbox
  const handleSandboxClick = async (e) => {
    if (!sandboxRef.current) return;
    const rect = sandboxRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Identify clicked element text/role
    const targetTag = e.target.tagName.toLowerCase();
    const targetText = (e.target.innerText || e.target.getAttribute('aria-label') || targetTag).slice(0, 25);

    try {
      await api.trackEvent({
        session_id: sessionInfo.id,
        event_type: 'click',
        page_url: currentPage,
        timestamp: new Date().toISOString(),
        coordinates: { x: Math.max(0, x), y: Math.max(0, y) },
        viewport: { width: Math.round(rect.width), height: Math.round(rect.height) }
      });

      setSessionInfo(prev => ({ ...prev, eventCount: prev.eventCount + 1 }));
      setLastEvent({
        type: 'click',
        url: currentPage,
        coords: { x, y },
        target: targetText,
        time: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.warn('Sandbox click track failed:', err.message);
    }
  };

  // Mouse move tracker for HUD
  const handleMouseMove = (e) => {
    if (!sandboxRef.current) return;
    const rect = sandboxRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    });
  };

  // Generate realistic traffic
  const handleSimulateTraffic = async () => {
    setIsSimulating(true);
    const pagesList = ['/', '/products', '/pricing', '/cart'];
    const products = ['Aura Wireless Pro', 'Vortex Mechanical Deck', 'Prism Ultra 4K'];

    for (let i = 0; i < 4; i++) {
      const mockSession = 'sim_' + Math.random().toString(36).substring(2, 8);
      // 1. Page view on home
      await api.trackEvent({
        session_id: mockSession,
        event_type: 'page_view',
        page_url: '/',
        timestamp: new Date(Date.now() - 3600000 + i * 600000).toISOString()
      });
      // 2. Click on hero or nav
      await api.trackEvent({
        session_id: mockSession,
        event_type: 'click',
        page_url: '/',
        timestamp: new Date(Date.now() - 3550000 + i * 600000).toISOString(),
        coordinates: { x: 250 + Math.floor(Math.random() * 200), y: 220 + Math.floor(Math.random() * 60) },
        viewport: { width: 1200, height: 800 }
      });
      // 3. Page view on products
      await api.trackEvent({
        session_id: mockSession,
        event_type: 'page_view',
        page_url: '/products',
        timestamp: new Date(Date.now() - 3400000 + i * 600000).toISOString()
      });
      // 4. Click product
      await api.trackEvent({
        session_id: mockSession,
        event_type: 'click',
        page_url: '/products',
        timestamp: new Date(Date.now() - 3350000 + i * 600000).toISOString(),
        coordinates: { x: 180 + Math.floor(Math.random() * 300), y: 380 + Math.floor(Math.random() * 100) },
        viewport: { width: 1200, height: 800 }
      });
      // 5. Some go to pricing
      if (i % 2 === 0) {
        await api.trackEvent({
          session_id: mockSession,
          event_type: 'page_view',
          page_url: '/pricing',
          timestamp: new Date(Date.now() - 3200000 + i * 600000).toISOString()
        });
        await api.trackEvent({
          session_id: mockSession,
          event_type: 'click',
          page_url: '/pricing',
          timestamp: new Date(Date.now() - 3150000 + i * 600000).toISOString(),
          coordinates: { x: 500 + Math.floor(Math.random() * 150), y: 440 + Math.floor(Math.random() * 50) },
          viewport: { width: 1200, height: 800 }
        });
      }
    }

    setIsSimulating(false);
    setLastEvent({
      type: 'simulated_batch',
      message: 'Generated 4 rich multi-user sessions with click telemetry!',
      time: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Controller Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left: Info & Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Live Storefront & Telemetry Sandbox
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Active Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Click buttons, navigate pages, and add items to cart. Every interaction triggers live <code className="text-indigo-600 font-mono">page_view</code> and <code className="text-indigo-600 font-mono">click</code> events to MongoDB!
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Viewport switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                  viewportMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                  viewportMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* New Session Button */}
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Reset session ID to simulate a fresh user"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>

            {/* Simulate Traffic */}
            <button
              onClick={handleSimulateTraffic}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Simulating...' : 'Simulate Traffic'}</span>
            </button>
          </div>
        </div>

        {/* Live HUD Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Session: <strong className="text-slate-800">{sessionInfo.id.slice(0, 16)}...</strong>
            </span>
            <span>&bull;</span>
            <span>Events Fired: <strong className="text-indigo-600">{sessionInfo.eventCount}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-mono">
              <MousePointer2 className="w-3 h-3 text-slate-400" />
              Cursor: <strong className="text-slate-800">X:{mousePos.x}, Y:{mousePos.y}</strong>
            </span>
          </div>

          {/* Last Event Feedback Badge */}
          {lastEvent && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {lastEvent.type === 'click' ? (
                <span>Recorded Click at ({lastEvent.coords.x}, {lastEvent.coords.y}) on "{lastEvent.target}"</span>
              ) : lastEvent.type === 'page_view' ? (
                <span>Recorded Page View on {lastEvent.url}</span>
              ) : (
                <span>{lastEvent.message}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Storefront Frame */}
      <div className="flex justify-center">
        <div
          ref={sandboxRef}
          onClick={handleSandboxClick}
          onMouseMove={handleMouseMove}
          style={{ width: viewportMode === 'mobile' ? '400px' : '100%', minHeight: '620px' }}
          className="bg-white border-2 border-slate-200 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 relative select-none"
        >
          {/* Simulated Browser Top Bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>

            {/* Address Bar */}
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-1 text-xs font-mono text-slate-600 flex items-center gap-2 w-3/5 justify-between">
              <span className="truncate">https://store.demo.causalfunnel.io{currentPage}</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-sans">Tracked</span>
            </div>

            {/* Link to Heatmap for this URL */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectPageForHeatmap) onSelectPageForHeatmap(currentPage);
                if (onNavigateTab) onNavigateTab('heatmap');
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-colors"
              title="Inspect heatmap for this page"
            >
              <Flame className="w-3 h-3" />
              <span className="hidden sm:inline">View Heatmap</span>
            </button>
          </div>

          {/* Storefront Nav Header */}
          <nav className="border-b border-slate-100 px-6 py-3.5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigatePage('/')}>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                P
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">PulseStore</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <button
                onClick={() => handleNavigatePage('/')}
                className={`transition-colors ${currentPage === '/' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigatePage('/products')}
                className={`transition-colors ${currentPage === '/products' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'}`}
              >
                Products
              </button>
              <button
                onClick={() => handleNavigatePage('/pricing')}
                className={`transition-colors ${currentPage === '/pricing' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'}`}
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavigatePage('/cart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                  currentPage === '/cart' ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Cart ({cartCount})</span>
              </button>
            </div>
          </nav>

          {/* Page Contents */}
          <div className="p-6">
            
            {/* PAGE 1: HOME (/) */}
            {currentPage === '/' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Hero Banner */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
                  <div className="max-w-xl space-y-4 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Autumn Collection 2026
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Engineered Precision for Modern Workspaces
                    </h1>
                    <p className="text-sm text-indigo-200">
                      Minimalist hardware & productivity gear designed for creators, developers, and visionaries.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => handleNavigatePage('/products')}
                        className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-all shadow-md flex items-center gap-1.5"
                      >
                        Explore Gear <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setCartCount(c => c + 1);
                          setLastEvent({ type: 'click', coords: mousePos, target: 'Add to Cart Quick', time: new Date().toLocaleTimeString() });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/40 transition-colors"
                      >
                        Buy Featured Bundle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Products Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">Trending Artifacts</h3>
                    <button
                      onClick={() => handleNavigatePage('/products')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View All &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: 'Apex Studio Monitor 5K', price: '$899', tag: 'Bestseller', bg: 'from-amber-50 to-orange-50' },
                      { name: 'Aura Wireless Headset Pro', price: '$249', tag: 'New', bg: 'from-blue-50 to-indigo-50' },
                      { name: 'Titan Mechanical Keydeck', price: '$179', tag: 'Limited', bg: 'from-emerald-50 to-teal-50' },
                    ].map((item, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all bg-white shadow-2xs group">
                        <div className={`h-28 rounded-lg bg-gradient-to-br ${item.bg} flex items-center justify-center font-bold text-slate-400 text-xs mb-3`}>
                          [Product Preview]
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{item.tag}</span>
                        <h4 className="font-bold text-slate-900 text-xs mt-0.5">{item.name}</h4>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-extrabold text-slate-900 text-sm">{item.price}</span>
                          <button
                            onClick={() => setCartCount(c => c + 1)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2: PRODUCTS (/products) */}
            {currentPage === '/products' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Product Catalog</h2>
                    <p className="text-xs text-slate-500">Filter and browse through ergonomic tech accessories.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {['all', 'hardware', 'audio', 'desk'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                          activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 1, title: 'Prism 4K Ultra Canvas', price: '$649', desc: '144Hz color-calibrated display' },
                    { id: 2, title: 'ErgoWave Desk Arm', price: '$129', desc: 'Gas-spring heavy duty mount' },
                    { id: 3, title: 'Aura Studio Wireless', price: '$299', desc: 'Spatial ANC audio' },
                    { id: 4, title: 'Nomad Leather Deskmat', price: '$59', desc: 'Vegetable tanned Italian hide' },
                    { id: 5, title: 'Vortex Carbon Deck', price: '$199', desc: 'Hot-swap custom switches' },
                    { id: 6, title: 'Halo Ambient Backlight', price: '$89', desc: 'Adaptive screen sync LED' },
                  ].map(p => (
                    <div key={p.id} className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="h-24 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-medium mb-3">
                          [High-Res Asset]
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="font-extrabold text-slate-900 text-sm">{p.price}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCartCount(c => c + 1)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 3: PRICING (/pricing) */}
            {currentPage === '/pricing' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center max-w-md mx-auto space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">Simple, Transparent Plans</h2>
                  <p className="text-xs text-slate-500">Pick a workspace membership that fits your team scale.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { name: 'Starter', price: '$19', desc: 'For independent creators', btn: 'Select Starter', popular: false },
                    { name: 'Pro Studio', price: '$49', desc: 'For fast-growing design studios', btn: 'Start Pro Trial', popular: true },
                    { name: 'Enterprise', price: '$149', desc: 'Dedicated gear & 24/7 care', btn: 'Contact Sales', popular: false },
                  ].map((tier, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-2xl p-5 flex flex-col justify-between relative ${
                        tier.popular ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-600' : 'border-slate-200 bg-white'
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{tier.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{tier.desc}</p>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">{tier.price}</span>
                          <span className="text-xs text-slate-500">/month</span>
                        </div>
                        <ul className="mt-4 space-y-2 text-xs text-slate-600">
                          <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Full Catalog Access</li>
                          <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Free Global Express Ship</li>
                          <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 30-Day Return Guarantee</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleNavigatePage('/cart')}
                        className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                          tier.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        }`}
                      >
                        {tier.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 4: CART (/cart) */}
            {currentPage === '/cart' && (
              <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold text-slate-900">Your Shopping Cart</h2>
                  <p className="text-xs text-slate-500">Review selected gear before dispatch.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Aura Studio Wireless Pro', qty: 1, price: '$249' },
                    { title: 'Titan Mechanical Keydeck', qty: 1, price: '$179' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                        <span className="text-[11px] text-slate-500">Qty: {item.qty}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal</span>
                    <span>$428.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Shipping</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-indigo-200/60">
                    <span>Total Due</span>
                    <span>$428.00</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCartCount(0);
                    handleNavigatePage('/');
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Secure Checkout</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
