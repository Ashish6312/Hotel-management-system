import React from 'react';
import { 
  TrendingUp, 
  CalendarDays, 
  DoorOpen, 
  Percent, 
  DollarSign, 
  Plus, 
  RotateCcw,
  ArrowUpRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function DashboardView({ 
  stats, 
  analytics, 
  onBookRoom, 
  onResetSystem, 
  isResetting,
  onNavigateToReservations 
}) {
  const { rooms = {}, revenue = {}, recentActivity = [] } = stats || {};
  const { revenueHistory = [], paymentMethods = [] } = analytics || {};

  // Formatter for Currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // KPI card configs
  const cards = [
    {
      title: 'Occupancy Rate',
      value: `${rooms.occupancyRate || 0}%`,
      subText: `${rooms.occupied || 0} of ${rooms.total || 0} Rooms occupied`,
      icon: Percent,
      color: 'from-indigo-500 to-purple-600',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Available Rooms',
      value: rooms.available || 0,
      subText: `${rooms.maintenance || 0} in maintenance`,
      icon: DoorOpen,
      color: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-400'
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(revenue.today || 0),
      subText: 'Realtime transaction logging',
      icon: TrendingUp,
      color: 'from-amber-500 to-yellow-600',
      iconColor: 'text-amber-400'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(revenue.total || 0),
      subText: 'All-time historical sales',
      icon: DollarSign,
      color: 'from-pink-500 to-rose-600',
      iconColor: 'text-pink-400'
    }
  ];

  // Colors for Recharts Pie Chart
  const COLORS = ['#6366f1', '#a855f7', '#14b8a6', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel/20 p-6 rounded-2xl border border-border-subtle/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Hotel Overview</h2>
          <p className="text-sm text-slate-400">Welcome back! Here is a summary of today's occupancy and revenue performance.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onResetSystem}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-slate-300 font-semibold text-sm hover:bg-bg-panel hover:text-white transition-all disabled:opacity-50"
          >
            <RotateCcw size={16} className={isResetting ? 'animate-spin' : ''} />
            {isResetting ? 'Resetting...' : 'Reset Demo Data'}
          </button>
          <button
            onClick={onBookRoom}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-indigo hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-accent-indigo/25 transition-all active:scale-[0.98]"
          >
            <Plus size={18} className="stroke-[2.5]" />
            New Booking
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{c.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl bg-bg-panel border border-border-subtle ${c.iconColor}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
                {c.subText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-bold text-white">Revenue Trend</h4>
              <p className="text-xs text-slate-400">Daily earnings tracking over the past weeks</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-400 text-xs font-bold">
              <ArrowUpRight size={14} />
              Realtime
            </div>
          </div>

          <div className="h-[280px] w-full">
            {revenueHistory && revenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3859" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1b233d', borderColor: '#2d3859', borderRadius: '12px', color: '#fff' }}
                    formatter={(val) => [`₹${val}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                No revenue transaction data available.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-base font-bold text-white">Payment Distribution</h4>
            <p className="text-xs text-slate-400">Transactions grouped by payment type</p>
          </div>

          <div className="h-[200px] flex items-center justify-center relative">
            {paymentMethods && paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1b233d', borderColor: '#2d3859', borderRadius: '8px', color: '#fff' }}
                    formatter={(val) => [`₹${val}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-500">No payment records</div>
            )}
            {/* Center label */}
            {paymentMethods && paymentMethods.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Sales</span>
                <span className="text-lg font-bold text-white">{formatCurrency(revenue.total || 0)}</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 mt-4">
            {paymentMethods.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{item.name}</span>
                </div>
                <span className="text-slate-400">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Activities */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5 border-b border-border-subtle pb-3">
          <div>
            <h4 className="text-base font-bold text-white">Recent Activities</h4>
            <p className="text-xs text-slate-400">Live timeline of checked-in guests and reservations</p>
          </div>
          <button 
            onClick={onNavigateToReservations}
            className="text-xs font-semibold text-accent-indigo hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            View All Bookings
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-border-subtle/40">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity, idx) => {
              // Status Styling
              let statusBadge = '';
              if (activity.status === 'CheckedIn') {
                statusBadge = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
              } else if (activity.status === 'CheckedOut') {
                statusBadge = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
              } else if (activity.status === 'Booked') {
                statusBadge = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
              } else {
                statusBadge = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
              }

              return (
                <div key={activity.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-bg-panel border border-border-subtle/50 text-slate-300`}>
                      <UserCheck size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200">
                        {activity.first_name} {activity.last_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Room {activity.room_number} • {activity.type} • {activity.check_in_date} to {activity.check_out_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${statusBadge}`}>
                      {activity.status === 'CheckedIn' ? 'Checked In' : activity.status === 'CheckedOut' ? 'Checked Out' : activity.status}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              No recent bookings or activities found. Try booking a room!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
