import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle, 
  Calendar, 
  Filter, 
  Info,
  Grid,
  Lock,
  Plus
} from 'lucide-react';

export default function RoomsView({ 
  rooms = [], 
  bookings = [], 
  onBookRoom, 
  onUpdateRoomStatus 
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter logic
  const filteredRooms = rooms.filter(room => {
    const typeMatch = filterType === 'All' || room.type === filterType;
    const statusMatch = filterStatus === 'All' || room.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Calculate 10 days from today for the Timeline view
  const today = new Date();
  const timelineDays = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const formatDateString = (date) => date.toISOString().split('T')[0];
  const formatDayLabel = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  // Find booking for a specific room on a specific day
  const getBookingForCell = (roomId, dateStr) => {
    return bookings.find(b => {
      if (b.room_id !== roomId) return false;
      if (b.status === 'Cancelled' || b.status === 'CheckedOut') return false;
      
      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      const target = new Date(dateStr);
      
      // Normalize to midnight
      checkIn.setHours(0,0,0,0);
      checkOut.setHours(0,0,0,0);
      target.setHours(0,0,0,0);
      
      return target >= checkIn && target < checkOut;
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* View Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel/20 p-6 rounded-2xl border border-border-subtle/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Room Operations</h2>
          <p className="text-sm text-slate-400">Monitor availability, update maintenance requests, and check the booking timeline.</p>
        </div>
        
        {/* Toggle Grid vs Timeline */}
        <div className="flex gap-2 bg-bg-panel/60 p-0.5 rounded-xl border border-border-subtle">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-accent-indigo text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid size={16} />
            Room Grid
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'timeline' 
                ? 'bg-accent-indigo text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar size={16} />
            Booking Timeline
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <>
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-4 items-center bg-bg-panel/10 p-4 rounded-xl border border-border-subtle/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mr-2">
              <Filter size={16} />
              Filter by:
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase">Room Type</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-bg-panel border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-bg-panel border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Stats Summary */}
            <div className="ml-auto text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-200 font-bold">{filteredRooms.length}</span> of {rooms.length} Rooms
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              // Status Styling
              let statusText = '';
              let statusColor = '';
              if (room.status === 'Available') {
                statusText = 'Available';
                statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              } else if (room.status === 'Occupied') {
                statusText = 'Occupied';
                statusColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
              } else {
                statusText = 'Maintenance';
                statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              }

              return (
                <div 
                  key={room.id}
                  className="glass-panel rounded-2xl flex flex-col justify-between overflow-hidden border border-border-subtle/50 transition-all hover:border-accent-indigo/40 group"
                >
                  {/* Top Header Card */}
                  <div className="p-5 flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{room.type}</span>
                        <h4 className="text-xl font-bold text-white mt-0.5">Room {room.room_number}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Amenities list */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amenities</span>
                      <p className="text-xs text-slate-300 leading-relaxed truncate group-hover:text-clip group-hover:whitespace-normal transition-all duration-300">
                        {room.amenities}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Actions Footer */}
                  <div className="px-5 py-4 border-t border-border-subtle bg-bg-panel/30 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Price/Night</span>
                      <span className="text-lg font-bold text-hotel-gold">${room.price}</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Maintenance Toggle */}
                      {room.status === 'Available' && (
                        <button
                          onClick={() => onUpdateRoomStatus(room.id, 'Maintenance')}
                          title="Put to maintenance"
                          className="p-2 rounded-xl border border-border-subtle text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all"
                        >
                          <Wrench size={16} />
                        </button>
                      )}
                      {room.status === 'Maintenance' && (
                        <button
                          onClick={() => onUpdateRoomStatus(room.id, 'Available')}
                          title="Finish maintenance"
                          className="p-2 rounded-xl border border-border-subtle text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {/* Book Action */}
                      {room.status === 'Available' ? (
                        <button
                          onClick={() => onBookRoom(room.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-accent-indigo hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200"
                        >
                          <Plus size={14} />
                          Book
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex items-center gap-1 px-3 py-2 bg-slate-800 border border-border-subtle text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed"
                        >
                          <Lock size={12} />
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* TIMELINE VIEW (Booking Calendar chart) */
        <div className="glass-panel rounded-2xl overflow-hidden border border-border-subtle/50 flex flex-col">
          {/* Timeline Header */}
          <div className="p-5 border-b border-border-subtle bg-bg-panel/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="text-hotel-gold" size={18} />
              <span className="text-sm font-bold text-white">Interactive Booking Grid (Next 10 Days)</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-bg-panel border border-border-subtle"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/50"></span> Checked In
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/50"></span> Reservation
              </span>
            </div>
          </div>

          {/* Timeline Board */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] divide-y divide-border-subtle/30">
              
              {/* Header dates row */}
              <div className="flex bg-bg-panel/20 font-bold text-xs text-slate-400">
                <div className="w-28 p-4 border-r border-border-subtle/50 flex-shrink-0 flex items-center">
                  Room
                </div>
                <div className="flex-1 grid grid-cols-10">
                  {timelineDays.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 text-center border-r border-border-subtle/30 flex flex-col justify-center items-center ${
                        idx === 0 ? 'bg-accent-indigo/10 text-white' : ''
                      }`}
                    >
                      <span>{formatDayLabel(day)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room timeline rows */}
              {rooms.map((room) => (
                <div key={room.id} className="flex hover:bg-bg-panel/15 transition-colors">
                  {/* Room label cell */}
                  <div className="w-28 p-4 border-r border-border-subtle/50 flex-shrink-0 flex flex-col justify-center bg-bg-dark/40">
                    <span className="text-sm font-bold text-slate-100">Room {room.room_number}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{room.type}</span>
                  </div>

                  {/* Day cells */}
                  <div className="flex-1 grid grid-cols-10">
                    {timelineDays.map((day, idx) => {
                      const dateStr = formatDateString(day);
                      const booking = getBookingForCell(room.id, dateStr);

                      let cellBg = 'bg-transparent';
                      let cellBorder = 'border-r border-border-subtle/20';
                      let cellContent = null;

                      if (room.status === 'Maintenance') {
                        cellBg = 'bg-red-500/10';
                        cellContent = (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-red-400 font-bold tracking-wider uppercase select-none">
                            Maint
                          </div>
                        );
                      } else if (booking) {
                        const isCheckedIn = booking.status === 'CheckedIn';
                        cellBg = isCheckedIn 
                          ? 'bg-emerald-500/25 hover:bg-emerald-500/35 border-y border-emerald-500/30' 
                          : 'bg-amber-500/25 hover:bg-amber-500/35 border-y border-amber-500/30';
                        
                        // Only show guest name in the "first" cell or when there is space
                        cellContent = (
                          <div 
                            title={`${booking.first_name} ${booking.last_name} (${booking.status})`} 
                            className="w-full h-full px-1 flex flex-col justify-center items-center overflow-hidden cursor-pointer"
                          >
                            <span className="text-[9px] font-bold text-white truncate max-w-full">
                              {booking.last_name}
                            </span>
                            <span className="text-[8px] text-slate-300 scale-[0.9] font-medium leading-none">
                              {isCheckedIn ? 'In' : 'Rsv'}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={idx} 
                          className={`h-14 ${cellBg} ${cellBorder} flex items-center justify-center relative transition-all duration-200`}
                        >
                          {cellContent}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Info Banner */}
          <div className="p-4 border-t border-border-subtle bg-bg-panel/20 flex items-center gap-2 text-xs text-slate-400">
            <Info size={14} className="text-hotel-gold" />
            <span>Click on "Room Grid" to book a room. Dark highlighted bars indicate active check-ins or upcoming reservations.</span>
          </div>
        </div>
      )}
    </div>
  );
}
