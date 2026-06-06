import React from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarDays, 
  Users, 
  ShieldCheck, 
  LogOut,
  Hotel
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms & Calendar', icon: BedDouble },
    { id: 'bookings', label: 'Reservations', icon: CalendarDays },
    { id: 'guests', label: 'Guests Directory', icon: Users },
    { id: 'staff', label: 'Staff Roster', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-bg-dark border-r border-border-subtle flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-border-subtle">
        <div className="bg-gradient-to-tr from-hotel-gold to-yellow-300 p-2.5 rounded-xl text-bg-darkest shadow-lg shadow-hotel-gold/10">
          <Hotel size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-hotel-gold bg-clip-text text-transparent leading-none">
            Grandview
          </h1>
          <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Luxury Resort</span>
        </div>
      </div>

      {/* User Info / Persona */}
      {user && (
        <div className="p-4 mx-4 my-6 bg-bg-panel/40 border border-border-subtle/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-indigo flex items-center justify-center font-bold text-white shadow-inner">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 truncate">{user.name}</h4>
            <p className="text-xs text-hotel-gold font-medium truncate">{user.role}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20 font-semibold' 
                  : 'text-slate-400 hover:bg-bg-panel/60 hover:text-slate-100 hover:translate-x-1'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border-subtle">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
