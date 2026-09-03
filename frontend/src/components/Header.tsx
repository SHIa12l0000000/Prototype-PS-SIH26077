import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchLocations } from '../services/api';
import { LocationResult } from '../types';
import {
  Search, ShieldAlert, Bell, MapPin, ChevronDown,
  Play, RotateCcw, Wifi, Info
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    selectedLocation, setSelectedLocation,
    isDemoMode, setIsDemoMode,
    refreshData, isLoading, lastUpdated, alerts,
    currentPage, setCurrentPage
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const res = await fetchLocations(val);
      setSearchResults(res);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const selectLocation = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ── Top Primary Bar (Flipkart Blue) ── */}
      <div className="bg-[#2874f0] px-4 py-0" style={{ minHeight: 56 }}>
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4 h-14">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded p-1">
              <ShieldAlert className="w-5 h-5 text-[#2874f0]" />
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-lg tracking-tight leading-none">SKYSHIELD</div>
              <div className="text-[#a8c8ff] text-[10px] font-medium italic leading-none">Severe Weather Nowcast</div>
            </div>
          </div>

          {/* Location Chip */}
          <div className="hidden lg:flex items-center gap-1 text-white cursor-pointer shrink-0">
            <MapPin className="w-4 h-4 text-[#a8c8ff]" />
            <div className="text-xs leading-tight">
              <div className="text-[#a8c8ff] text-[10px]">Monitoring</div>
              <div className="font-semibold text-sm truncate max-w-[120px]">{selectedLocation.name}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#a8c8ff]" />
          </div>

          {/* ── Search Bar (Amazon-style, centre dominant) ── */}
          <div className="flex-1 max-w-2xl" ref={dropdownRef}>
            <div className="relative flex">
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                placeholder="Search location for weather nowcast..."
                className="w-full bg-white text-[#212121] text-sm px-4 py-2.5 rounded-l focus:outline-none placeholder:text-[#878787]"
              />
              <button className="bg-[#ff9f00] hover:bg-[#e68f00] px-5 rounded-r flex items-center transition-colors">
                {isSearching
                  ? <RotateCcw className="w-4 h-4 text-white animate-spin" />
                  : <Search className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded shadow-xl border border-gray-100 z-50 max-h-72 overflow-y-auto">
                {searchResults.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(loc)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f0f5ff] border-b border-gray-50 last:border-0 flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-semibold text-[#212121]">{loc.name}</span>
                      <span className="text-[#878787] text-xs ml-2">{loc.district}, {loc.state}</span>
                    </div>
                    <span className="font-mono text-xs text-[#878787]">{loc.latitude.toFixed(2)}°N</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            {/* Live / Demo Badge */}
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                isDemoMode
                  ? 'bg-[#ff9f00] text-white'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              {isDemoMode ? 'DEMO' : 'LIVE'}
            </button>

            {/* Alerts Bell */}
            <button onClick={() => setCurrentPage('alerts')} className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-white" />
              {activeAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ff6161] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeAlerts}
                </span>
              )}
            </button>

            {/* Run Nowcast */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="bg-white text-[#2874f0] font-bold text-sm px-4 py-2 rounded flex items-center gap-1.5 hover:bg-[#f0f5ff] transition-colors"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isLoading ? 'animate-spin' : ''}`} />
              Run Nowcast
            </button>
          </div>
        </div>
      </div>

        {/* ── Secondary Nav Bar (Flipkart/Amazon category strip) ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-10">
          <div className="flex items-center gap-1 text-xs font-semibold text-[#212121] overflow-x-auto scrollbar-hide">
            {([
              { label: 'COMMAND CENTER',   page: 'overview'    },
              { label: 'RISK MAP',         page: 'map'         },
              { label: 'WEATHER DATA',     page: 'weather'     },
              { label: 'ALERTS',           page: 'alerts'      },
              { label: 'AI ANALYSIS',      page: 'xai'         },
              { label: 'SATELLITE & RADAR',page: 'satellite'   },
              { label: 'ANALYTICS',        page: 'analytics'   },
              { label: 'DATA SOURCES',     page: 'datasources' },
              { label: 'SYSTEM STATUS',    page: 'status'      },
            ] as { label: string; page: import('../types').PageId }[]).map(({ label, page }) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 whitespace-nowrap transition-colors border-b-2 ${
                  currentPage === page
                    ? 'text-[#2874f0] border-[#2874f0] font-bold'
                    : 'border-transparent hover:text-[#2874f0] hover:border-[#2874f0]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Updated timestamp */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#878787] shrink-0 ml-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c]"></span>
            Updated: <span className="font-semibold text-[#212121]">{lastUpdated} IST</span>
            <span className="ml-2 text-[10px] bg-[#f7f7f7] border border-gray-200 px-2 py-0.5 rounded font-bold text-[#878787]">PROTOTYPE</span>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-[#fff3cd] border-b border-[#ffc107] px-4 py-1.5 text-xs text-[#856404] flex items-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span><strong>DEMO MODE:</strong> All values shown are simulated prototype data for testing. Not for operational use.</span>
        </div>
      )}
    </header>
  );
};
