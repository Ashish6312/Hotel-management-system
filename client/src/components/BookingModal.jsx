import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, UserPlus, CheckCircle, CreditCard } from 'lucide-react';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  rooms = [], 
  guests = [], 
  preselectedRoomId = null,
  onSubmit 
}) {
  if (!isOpen) return null;

  const availableRooms = rooms.filter(r => r.status === 'Available');
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || '');
  const [useExistingGuest, setUseExistingGuest] = useState(true);
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  
  // New Guest Form
  const [newGuest, setNewGuest] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_id: ''
  });

  // Booking details
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [instantCheckIn, setInstantCheckIn] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [nightsCount, setNightsCount] = useState(0);

  // Filter guests based on search
  const filteredGuests = guests.filter(g => 
    `${g.first_name} ${g.last_name}`.toLowerCase().includes(guestSearch.toLowerCase()) ||
    g.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  // Sync preselected room
  useEffect(() => {
    if (preselectedRoomId) {
      setSelectedRoomId(preselectedRoomId);
    } else if (availableRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(availableRooms[0].id);
    }
  }, [preselectedRoomId, rooms]);

  // Recalculate price
  useEffect(() => {
    const room = rooms.find(r => r.id === parseInt(selectedRoomId));
    if (room && checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const timeDiff = end.getTime() - start.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (nights > 0) {
        setNightsCount(nights);
        setTotalPrice(nights * room.price);
      } else {
        setNightsCount(0);
        setTotalPrice(0);
      }
    } else {
      setNightsCount(0);
      setTotalPrice(0);
    }
  }, [selectedRoomId, checkInDate, checkOutDate, rooms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoomId) return alert('Please select a room');
    if (useExistingGuest && !selectedGuestId) return alert('Please select a guest');
    if (!useExistingGuest && (!newGuest.first_name || !newGuest.last_name || !newGuest.email || !newGuest.phone || !newGuest.document_id)) {
      return alert('Please fill in all guest details');
    }
    if (nightsCount <= 0) return alert('Check-out date must be after check-in date');

    const bookingData = {
      room_id: parseInt(selectedRoomId),
      guest_id: useExistingGuest ? parseInt(selectedGuestId) : null,
      guest_data: useExistingGuest ? null : newGuest,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      status: instantCheckIn ? 'CheckedIn' : 'Booked',
      total_price: totalPrice,
      payment_method: instantCheckIn ? paymentMethod : null
    };

    onSubmit(bookingData);
  };

  const selectedRoom = rooms.find(r => r.id === parseInt(selectedRoomId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-bg-dark border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-panel/40">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="text-hotel-gold" size={20} />
              Book a New Stay
            </h3>
            <p className="text-xs text-slate-400">Reserve a room and register check-ins instantly</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:bg-bg-panel hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Room & Dates */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-border-subtle pb-1">
                Room & Dates
              </h4>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Select Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                >
                  <option value="" disabled>-- Select Room --</option>
                  {/* If preselected room is occupied/maintenance, show it anyway so we can view/override if needed, but standard is available */}
                  {rooms.map(room => {
                    const isAvailable = room.status === 'Available';
                    const isPreselected = room.id === preselectedRoomId;
                    if (isAvailable || isPreselected) {
                      return (
                        <option key={room.id} value={room.id}>
                          Room {room.room_number} - {room.type} (₹{room.price}/night)
                        </option>
                      );
                    }
                    return null;
                  })}
                </select>
                {selectedRoom && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    <strong className="text-slate-300">Amenities:</strong> {selectedRoom.amenities}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Check-in</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Check-out</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                    required
                  />
                </div>
              </div>

              {/* Pricing breakdown */}
              {selectedRoom && nightsCount > 0 && (
                <div className="bg-bg-panel/30 border border-border-subtle/50 rounded-xl p-4 mt-2">
                  <h5 className="text-xs font-bold text-slate-400 mb-2 uppercase">Price Details</h5>
                  <div className="flex justify-between text-sm text-slate-300 mb-1.5">
                    <span>₹{selectedRoom.price} × {nightsCount} nights</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border-subtle/50 pt-2 mt-2 flex justify-between text-base font-bold text-hotel-gold">
                    <span>Total Amount</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Guest Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border-subtle pb-1">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Guest Info
                </h4>
                <div className="flex gap-2 bg-bg-panel/60 p-0.5 rounded-lg border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setUseExistingGuest(true)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${useExistingGuest ? 'bg-accent-indigo text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Find
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseExistingGuest(false)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${!useExistingGuest ? 'bg-accent-indigo text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <UserPlus size={12} className="inline mr-1 -mt-0.5" />
                    New
                  </button>
                </div>
              </div>

              {useExistingGuest ? (
                /* Find Existing Guest */
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search email, name..."
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                    />
                  </div>

                  <div className="border border-border-subtle rounded-xl max-h-[160px] overflow-y-auto bg-bg-panel/20 divide-y divide-border-subtle/50">
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map(g => (
                        <label 
                          key={g.id} 
                          className={`flex items-center gap-3 px-3 py-2.5 hover:bg-bg-panel/60 cursor-pointer transition-colors ${selectedGuestId === g.id.toString() ? 'bg-accent-indigo/10' : ''}`}
                        >
                          <input
                            type="radio"
                            name="guest_selection"
                            value={g.id}
                            checked={selectedGuestId === g.id.toString()}
                            onChange={(e) => setSelectedGuestId(e.target.value)}
                            className="accent-accent-indigo"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{g.first_name} {g.last_name}</p>
                            <p className="text-xs text-slate-400 truncate">{g.email} • {g.phone}</p>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">No guests match search query</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Register New Guest */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">First Name</label>
                      <input
                        type="text"
                        value={newGuest.first_name}
                        onChange={(e) => setNewGuest({ ...newGuest, first_name: e.target.value })}
                        className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Last Name</label>
                      <input
                        type="text"
                        value={newGuest.last_name}
                        onChange={(e) => setNewGuest({ ...newGuest, last_name: e.target.value })}
                        className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                      className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                      className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Document ID (Passport/ID Card)</label>
                    <input
                      type="text"
                      placeholder="e.g. Passport, State ID"
                      value={newGuest.document_id}
                      onChange={(e) => setNewGuest({ ...newGuest, document_id: e.target.value })}
                      className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Instant Check-in Toggle */}
              <div className="bg-bg-panel/30 border border-border-subtle/50 rounded-xl p-4 space-y-3 mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantCheckIn}
                    onChange={(e) => setInstantCheckIn(e.target.checked)}
                    className="w-4 h-4 accent-accent-indigo cursor-pointer rounded"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Check in guest immediately</span>
                    <p className="text-[10px] text-slate-400">Directly shifts room status to Occupied and logs revenue transaction</p>
                  </div>
                </label>

                {instantCheckIn && (
                  <div className="pt-2 border-t border-border-subtle/40 animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Credit Card', 'Cash', 'Bank Transfer', 'Digital Wallet'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                            paymentMethod === method
                              ? 'bg-accent-indigo/20 border-accent-indigo text-white shadow-inner'
                              : 'bg-bg-panel/60 border-border-subtle text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <CreditCard size={12} />
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle bg-bg-panel/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-subtle text-slate-300 font-semibold text-sm hover:bg-bg-panel hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-hotel-gold to-yellow-500 hover:from-yellow-400 hover:to-hotel-gold text-bg-darkest font-bold text-sm flex items-center gap-2 shadow-lg shadow-hotel-gold/15 transition-all active:scale-[0.98]"
            >
              <CheckCircle size={16} />
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
