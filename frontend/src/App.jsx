import React, { useState } from 'react';
import { Sparkles, MapPin, Smile, RefreshCw, Compass, Clock, Building } from 'lucide-react';

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('local'); // 'local' or 'travel'
  const [loading, setLoading] = useState(false);
  
  // Local Vibe States
  const [moodText, setMoodText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [vibeData, setVibeData] = useState(null);

  // Travel Router States
  const [targetCity, setTargetCity] = useState('');
  const [timeframeHours, setTimeframeHours] = useState(24);
  const [travelData, setTravelData] = useState(null);

  const availableTags = [
    { id: 'calm', label: '🌿 Calm' },
    { id: 'energized', label: '⚡ Energized' },
    { id: 'cozy', label: '☕ Cozy' },
    { id: 'inspired', label: '🎨 Inspired' },
    { id: 'curious', label: '✨ Curious' }
  ];

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Handler for Local Vibe pipeline
  const handleRouteVibe = async () => {
    if (!moodText.trim() && selectedTags.length === 0) return;
    setLoading(true);

    let latitude = 36.3729; 
    let longitude = -94.2088; 

    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoError) {
        console.warn("⚠️ Geolocation fallback triggered.", geoError);
      }
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/route-my-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_text: moodText,
          vibe_tags: selectedTags,
          latitude,
          longitude
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVibeData(data);
      }
    } catch (error) {
      console.error("Failed to connect to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Travel Router pipeline
  const handleRouteTravel = async () => {
    if (!targetCity.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/route-my-travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_city: targetCity,
          timeframe_hours: parseInt(timeframeHours)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTravelData(data);
      }
    } catch (error) {
      console.error("Failed to connect to travel backend:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setVibeData(null);
    setTravelData(null);
    setMoodText('');
    setSelectedTags([]);
    setTargetCity('');
    setTimeframeHours(24);
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#121212] px-4 py-8">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md flex flex-col bg-[#1a1a1a] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[640px]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-orange-400 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Vibe Router
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs (Hidden when showing results to keep view clean) */}
        {!vibeData && !travelData && (
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 mb-6">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'local' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Local Vibe
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'travel' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Travel Leader
            </button>
          </div>
        )}

        {/* ----------------- MODE 1: LOCAL VIBE INPUT ----------------- */}
        {activeTab === 'local' && !vibeData && (
          <div className="flex flex-col flex-grow justify-center animate-fadeIn">
            <h1 className="text-xl font-bold text-center mb-4 text-zinc-100">Where is your vibe taking you today?</h1>
            <div className="relative mb-4">
              <textarea
                className="w-full h-28 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-2xl p-4 text-zinc-200 placeholder-zinc-500 outline-none resize-none transition-all text-sm"
                placeholder="Tell us how you feel... (e.g., 'Need a hidden gem cozy spot with a warm drink to unwind')"
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
              />
              <Smile className="absolute bottom-4 right-4 text-zinc-600 w-5 h-5" />
            </div>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleRouteVibe}
              disabled={loading || (!moodText.trim() && selectedTags.length === 0)}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-orange-400 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm mt-auto"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Route My Vibe →</>}
            </button>
          </div>
        )}

        {/* ----------------- MODE 2: TRAVEL ROUTER INPUT ----------------- */}
        {activeTab === 'travel' && !travelData && (
          <div className="flex flex-col flex-grow justify-center animate-fadeIn">
            <h1 className="text-xl font-bold text-center mb-2 text-zinc-100">The 80% Must-See Explorer</h1>
            <p className="text-xs text-zinc-500 text-center mb-6">Maximize your limited timeframe without backtracking.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-wide">Target Destination City</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-400 rounded-xl py-3 px-4 pl-10 text-zinc-200 placeholder-zinc-600 outline-none text-sm transition-all"
                    placeholder="e.g., Chicago, Tokyo, Paris"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                  />
                  <Building className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Available Timeframe</label>
                  <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeframeHours} Hours
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="12"
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                  value={timeframeHours}
                  onChange={(e) => setTimeframeHours(e.target.value)}
                />
                <div className="flex justify-between text-[10px] text-zinc-600 font-medium px-0.5 mt-1">
                  <span>12h</span>
                  <span>24h</span>
                  <span>36h</span>
                  <span>48h</span>
                  <span>60h</span>
                  <span>72h</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRouteTravel}
              disabled={loading || !targetCity.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm mt-auto"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Compass className="w-4 h-4" /> Assemble Itinerary →</>}
            </button>
          </div>
        )}

        {/* ----------------- RESULTS VIEW: LOCAL VIBE ----------------- */}
        {vibeData && (
          <div className="flex flex-col flex-grow animate-fadeIn">
            <div className="mb-4 p-3.5 bg-purple-950/20 border border-purple-900/40 rounded-xl">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">🔮 AI Vibe Interpretation</p>
              <p className="text-zinc-200 mt-1 italic text-xs">"{vibeData.vibe_summary}"</p>
            </div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">Routed Destinations</h2>
            <div className="space-y-2.5 flex-grow overflow-y-auto mb-4 max-h-[340px] pr-1">
              {vibeData.results.map((place, idx) => (
                <div key={idx} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-xs text-zinc-200">{place.name}</h3>
                    <span className="text-[10px] font-extrabold text-amber-400 px-1.5 py-0.5 bg-amber-400/10 rounded">★ {place.rating}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-2 truncate">{place.address}</p>
                  <p className="text-xs text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-900/40">{place.summary}</p>
                </div>
              ))}
            </div>
            <button onClick={resetAll} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-all text-xs cursor-pointer">Reset Router</button>
          </div>
        )}

        {/* ----------------- RESULTS VIEW: TRAVEL ROUTER ----------------- */}
        {travelData && (
          <div className="flex flex-col flex-grow animate-fadeIn">
            <div className="mb-4 p-3.5 bg-orange-950/20 border border-orange-900/40 rounded-xl">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">🗺️ 80% Must-See Milestones</p>
              <p className="text-zinc-200 mt-1 font-semibold text-xs">{travelData.message}</p>
            </div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">Optimized Stops Sequence</h2>
            <div className="space-y-2.5 flex-grow overflow-y-auto mb-4 max-h-[340px] pr-1">
              {travelData.milestones.map((milestone, idx) => (
                <div key={idx} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl relative pl-9">
                  {/* Sequence Number Bullet */}
                  <div className="absolute left-3 top-4 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                    {idx + 1}
                  </div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-xs text-zinc-200">{milestone.name}</h3>
                    {milestone.rating !== "N/A" && (
                      <span className="text-[10px] font-extrabold text-amber-400 px-1.5 py-0.5 bg-amber-400/10 rounded">★ {milestone.rating}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-2 truncate">{milestone.address}</p>
                  <p className="text-xs text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-900/40">{milestone.summary}</p>
                </div>
              ))}
            </div>
            <button onClick={resetAll} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-all text-xs cursor-pointer">Plan Another Trip</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;