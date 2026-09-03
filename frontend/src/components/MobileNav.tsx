import React from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../types';
import { Home, Radio, Satellite, Bell, Cpu, BarChart3, Map } from 'lucide-react';

const ITEMS = [
  { id: 'overview' as PageId,    label: 'Home',     icon: Home },
  { id: 'map' as PageId,         label: 'Map',      icon: Map },
  { id: 'alerts' as PageId,      label: 'Alerts',   icon: Bell },
  { id: 'satellite' as PageId,   label: 'Radar',    icon: Radio },
  { id: 'analytics' as PageId,   label: 'Analytics',icon: BarChart3 },
];

export const MobileNav: React.FC = () => {
  const { currentPage, setCurrentPage, alerts } = useApp();
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around h-14 shadow-lg">
      {ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 relative ${
              isActive ? 'text-[#2874f0]' : 'text-[#878787]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
            {item.id === 'alerts' && activeAlerts > 0 && (
              <span className="absolute top-0 right-1 bg-[#ff6161] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {activeAlerts}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
