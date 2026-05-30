import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Search, 
  Sparkles, 
  Plane, 
  Loader2, 
  ChevronRight,
  Compass,
  ArrowRight
} from 'lucide-react';

const App = () => {
  // Global App States
  const [mode, setMode] = useState('local'); // 'local' or 'travel'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local Mode States
  const [vibeText, setVibeText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [location, setLocation] = useState(null);
  const [localResults, setLocalResults] = useState(null);

  // Travel Mode States
  const [targetCity, setTargetCity] = useState('');
  const [timeframeDays, setTimeframeDays] = useState(3);
  const [itinerary, setItinerary] = useState(null);

  const vibeTags = ['Quiet', 'Social', 'Cozy', 'Lively', 'Modern', 'Nature'];

  // Get Geolocation for Local Mode
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  // API Call: Local Vibe Routing
  const handleVibeRoute = async () => {
    if (!location) {
      setError("Please enable location permissions to use Local Mode.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/route-my-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe_text: vibeText,
          selected_tag: selectedTag,
          lat: location.lat,
          lng: location.lng
        }),
      });
      const data = await response.json();
      setLocalResults(data);
    } catch (err) {
      setError("Failed to reach the Vibe Engine. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Travel Leader Itinerary
  const handleRouteTravel = async () => {
    if (!targetCity) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/route-my-travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_city: targetCity,
          timeframe_days: parseInt(timeframeDays) // Matches new backend key
        }),
      });
      const data = await response.json();
      setItinerary(data);
    } catch (err) {
      setError("The Travel Leader could not assemble the itinerary. Check your API keys.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Background Decorative Element */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Compass className="w-6 h-6 text-black stroke-[2.5px]" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Vibe Router</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Neural mapping for your next destination.</p>
        </header>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-8">
          <button 
            onClick={() => { setMode('local'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 text-sm font-bold ${mode === 'local' ? 'bg-zinc-800 text-white shadow-lg shadow-black/50' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Navigation className="w-4 h-4" /> Local Vibe
          </button>
          <button 
            onClick={() => { setMode('travel'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 text-sm font-bold ${mode === 'travel' ? 'bg-zinc-800 text-white shadow-lg shadow-black/50' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Plane className="w-4 h-4" /> Travel Leader
          </button>
        </div>

        {/* Main Interface Card */}
        <main className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-xl mb-8">
          {mode === 'local' ? (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Describe your current vibe</label>
                <textarea 
                  value={vibeText}
                  onChange={(e) => setVibeText(e.target.value)}
                  placeholder="Example: I want a high-energy spot with great lighting to do some work..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 transition-colors resize-none h-28 text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Quick Filters</label>
                <div className="flex flex-wrap gap-2">
                  {vibeTags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTag === tag ? 'bg-orange-500 text-black border-orange-500' : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-600'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleVibeRoute}
                disabled={loading || !location}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Route My Vibe</>}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Destination City</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    placeholder="Enter city (e.g. New York, Tokyo, London)"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Updated Slider Component to Days */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Trip Duration</label>
                  <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeframeDays} {timeframeDays === "1" || timeframeDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={timeframeDays}
                  onChange={(e) => setTimeframeDays(e.target.value)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                  <span>1 Day</span>
                  <span>3 Days</span>
                  <span>5 Days</span>
                  <span>7 Days</span>
                </div>
              </div>

              <button 
                onClick={handleRouteTravel}
                disabled={loading || !targetCity}
                className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plane className="w-5 h-5" /> Assemble Itinerary</>}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}
        </main>

        {/* Results Section */}
        {(localResults || itinerary) && !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] px-2 mb-4">
              {mode === 'local' ? 'Neural Match Found' : `Must-See Milestones: ${itinerary?.city}`}
            </h3>
            
            <div className="grid gap-3">
              {(mode === 'local' ? localResults?.matches : itinerary?.milestones)?.map((item, idx) => (
                <div 
                  key={idx}
                  className="group bg-zinc-900/30 border border-zinc-800/50 hover:border-orange-500/30 p-5 rounded-2xl transition-all hover:bg-zinc-900/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center text-orange-500 font-black group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">
                        {item.name || item}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                        {item.address || "Curated landmark for your route."}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-orange-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
