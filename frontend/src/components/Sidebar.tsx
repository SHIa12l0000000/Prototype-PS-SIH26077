import React from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../types';
import {
  LayoutDashboard, Map, CloudRain, Bell, Cpu,
  Radio, BarChart3, Database, Activity, ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',    label: 'Command Center',       icon: LayoutDashboard, section: 'MAIN' },
  { id: 'map',         label: 'Live Risk Map',         icon: Map },
  { id: 'weather',     label: 'Weather Intelligence',  icon: CloudRain,  section: 'ANALYSIS' },
  { id: 'alerts',      label: 'Alerts & Dispatch',     icon: Bell },
  { id: 'xai',         label: 'AI Analysis',           icon: Cpu },
  { id: 'satellite',   label: 'Satellite & Radar',     icon: Radio,      section: 'RESOURCES' },
  { id: 'analytics',   label: 'Analytics',             icon: BarChart3 },
  { id: 'datasources', label: 'Data Sources',          icon: Database,   section: 'SYSTEM' },
  { id: 'status',      label: 'System Status',         icon: Activity },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, alerts, lastUpdated } = useApp();
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <aside className="w-[220px] bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0 min-h-[calc(100vh-110px)]">
      {/* ── Section Groups ── */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const badge = item.id === 'alerts' && activeAlerts > 0 ? String(activeAlerts) : undefined;

          return (
            <React.Fragment key={item.id}>
              {/* Section label */}
              {item.section && (
                <div className={`px-4 pt-${idx === 0 ? '2' : '4'} pb-1 text-[10px] font-bold text-[#878787] uppercase tracking-widest`}>
                  {item.section}
                </div>
              )}

              <button
                onClick={() => setCurrentPage(item.id)}
                className={`side-nav-link w-full ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2874f0]' : 'text-[#878787]'}`} />
                <span className="truncate">{item.label}</span>
                {badge && (
                  <span className="ml-auto bg-[#ff6161] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── Bottom Status Panel (Amazon-style info box) ── */}
      <div className="border-t border-gray-100 p-3 bg-[#f7f7f7] text-xs space-y-2">
        <div className="font-bold text-[10px] text-[#878787] uppercase tracking-widest">System Health</div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#388e3c] shrink-0"></span>
          <span className="font-semibold text-[#212121]">All Systems Operational</span>
        </div>

        <div className="text-[#878787]">
          Last sync: <span className="font-mono text-[#212121] font-semibold">{lastUpdated} IST</span>
        </div>

        <div className="text-[10px] text-[#878787] border-t border-gray-200 pt-2">
          SIH 26077 · MoES/NCMRWF<br />
          <span className="text-[#2874f0] font-semibold">PROTOTYPE v1.0</span>
        </div>
      </div>
    </aside>
  );
};
