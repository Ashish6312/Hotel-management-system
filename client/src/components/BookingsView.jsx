import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight,
  LogIn,
  LogOut,
  XCircle,
  CalendarRange
} from 'lucide-react';

export default function BookingsView({ 
  bookings = [], 
  onCheckIn, 
  onCheckOut, 
  onCancel,
  onBookRoom 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBookings = bookings.filter(b => {
    const guestName = `${b.first_name} ${b.last_name}`.toLowerCase();
    const guestEmail = b.guest_email.toLowerCase();
    const roomNum = b.room_number.toLowerCase();
    
    const searchMatch = 
      guestName.includes(searchTerm.toLowerCase()) || 
      guestEmail.includes(searchTerm.toLowerCase()) ||
      roomNum.includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === 'All' || b.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel/20 p-6 rounded-2xl border border-border-subtle/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reservations & Bookings</h2>
          <p className="text-sm text-slate-400">Track current residents, upcoming stays, and perform guest registration check-ins/outs.</p>
        </div>
        <button
          onClick={() => onBookRoom()}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-indigo hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          <CalendarRange size={16} />
          New Reservation
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-bg-panel/10 p-4 rounded-xl border border-border-subtle/30">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by guest name, email, or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-bold uppercase mr-1">Status Filter</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-panel border border-border-subtle rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Reservations</option>
            <option value="Booked">Upcoming (Booked)</option>
            <option value="CheckedIn">Checked In</option>
            <option value="CheckedOut">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border-subtle/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-panel/30 border-b border-border-subtle text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Guest Info</th>
                <th className="p-4">Room & Type</th>
                <th className="p-4">Stay Dates</th>
                <th className="p-4">Total Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  // Badges
                  let badgeStyle = '';
                  let actionButtons = null;

                  if (b.status === 'Booked') {
                    badgeStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                    actionButtons = (
                      <>
                        <button
                          onClick={() => onCheckIn(b.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-bg-darkest font-extrabold text-xs rounded-lg shadow-sm transition-all"
                        >
                          <LogIn size={13} className="stroke-[2.5]" />
                          Check In
                        </button>
                        <button
                          onClick={() => onCancel(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                          title="Cancel Booking"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    );
                  } else if (b.status === 'CheckedIn') {
                    badgeStyle = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                    actionButtons = (
                      <>
                        <button
                          onClick={() => onCheckOut(b.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-indigo hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                        >
                          <LogOut size={13} />
                          Check Out
                        </button>
                        <button
                          onClick={() => onCancel(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                          title="Cancel Booking"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    );
                  } else if (b.status === 'CheckedOut') {
                    badgeStyle = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
                  } else {
                    badgeStyle = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                  }

                  return (
                    <tr key={b.id} className="hover:bg-bg-panel/15 text-sm text-slate-200 transition-colors">
                      {/* Guest details */}
                      <td className="p-4 pl-6">
                        <div className="font-semibold">{b.first_name} {b.last_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{b.guest_email}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{b.guest_phone}</div>
                      </td>
                      
                      {/* Room Details */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">Room {b.room_number}</div>
                        <div className="text-xs text-slate-400">{b.room_type}</div>
                      </td>

                      {/* Dates */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-300">
                          <span>{b.check_in_date}</span>
                          <ArrowRight size={12} className="text-slate-500" />
                          <span>{b.check_out_date}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-hotel-gold">
                        ${Number(b.total_price).toFixed(2)}
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold inline-block ${badgeStyle}`}>
                          {b.status === 'CheckedIn' ? 'Checked In' : b.status === 'CheckedOut' ? 'Checked Out' : b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2.5">
                          {actionButtons || (
                            <span className="text-xs text-slate-500 italic font-medium">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-slate-500 py-10 font-medium">
                    No reservations matching filter query found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
