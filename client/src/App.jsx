import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2,
  Lock,
  Mail,
  User,
  Zap,
  Loader2,
  RefreshCw,
  RotateCcw,
  Plus,
  LogOut,
  CheckCircle,
  Wrench,
  UserPlus,
  DollarSign,
  Printer,
  XCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

// Components
import BookingModal from './components/BookingModal';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('grandview_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loginEmail, setLoginEmail] = useState('priya@grandview.co.in');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginError, setLoginError] = useState('');

  // App Navigation & Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState(null);
  const [roomFilter, setRoomFilter] = useState('All');
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // kept for future use

  // Data States
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // Loading & Action States
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch all database records
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [roomsRes, bookingsRes, guestsRes, staffRes, statsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/rooms`),
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/guests`),
        fetch(`${API_BASE}/staff`),
        fetch(`${API_BASE}/dashboard/stats`),
        fetch(`${API_BASE}/dashboard/revenue-analytics`)
      ]);

      const [roomsData, bookingsData, guestsData, staffData, statsData, analyticsData] = await Promise.all([
        roomsRes.json(),
        bookingsRes.json(),
        guestsRes.json(),
        staffRes.json(),
        statsRes.json(),
        analyticsRes.json()
      ]);

      setRooms(roomsData);
      setBookings(bookingsData);
      setGuests(guestsData);
      setStaff(staffData);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data on mount when logged in
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Auth Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data);
      localStorage.setItem('grandview_user', JSON.stringify(data));

      // Trigger login success confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#d4af37', '#f59e0b']
      });
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('grandview_user');
  };

  // WhatsApp Share (Mock)
  const handleWhatsAppShare = (booking) => {
    setToastMessage(`Mock WhatsApp alert sent to ${booking.first_name} ${booking.last_name} at +91 ${booking.guest_phone || '98765 43210'} with reservation confirmation!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Create Booking
  const handleCreateBooking = async (bookingData) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      // Success confetti if checked in immediately
      if (bookingData.status === 'CheckedIn') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setIsBookingModalOpen(false);
      setPreselectedRoomId(null);
      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Check In
  const handleCheckIn = async (bookingId) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Check Out
  const handleCheckOut = async (bookingId) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-out failed');

      // Small success blast
      confetti({
        particleCount: 60,
        spread: 50,
        colors: ['#14b8a6', '#d4af37'],
        origin: { y: 0.6 }
      });

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update Room Status
  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Staff Status (Active vs Off-Duty)
  const handleToggleStaffStatus = async (staffId) => {
    const member = staff.find(s => s.id === staffId);
    if (!member) return;
    const nextStatus = member.status === 'Active' ? 'Off-Duty' : 'Active';

    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: member.name,
          role: member.role,
          email: member.email,
          phone: member.phone,
          status: nextStatus 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update staff status');

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Add Guest
  const handleAddGuest = async (guestData) => {
    const res = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register guest');
    await fetchAllData();
    return data;
  };

  // Add Staff
  const handleAddStaff = async (staffData) => {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register staff');
    await fetchAllData();
    return data;
  };

  // Reset System
  const handleResetSystem = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/system/reset`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset system');
      
      confetti({
        particleCount: 150,
        spread: 100,
        colors: ['#d4af37', '#fff']
      });

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Live Simulator: Simulate New Guest Arrival
  const handleSimulateArrival = async () => {
    const availableRooms = rooms.filter(r => r.status === 'Available');
    if (availableRooms.length === 0) {
      return alert('All rooms are full! Cannot simulate new arrival.');
    }
    if (guests.length === 0) {
      return alert('No guests in registry to simulate with.');
    }

    // Choose random room and random guest
    const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    const randomGuest = guests[Math.floor(Math.random() * guests.length)];

    const today = new Date();
    const checkout = new Date(today);
    checkout.setDate(today.getDate() + Math.floor(Math.random() * 4) + 2); // Stay 2 to 5 nights

    const nights = Math.ceil((checkout.getTime() - today.getTime()) / (1000 * 3600 * 24));
    const totalPrice = nights * randomRoom.price;

    const randomPayment = ['Credit Card', 'Cash', 'UPI'][Math.floor(Math.random() * 3)];

    const bookingData = {
      room_id: randomRoom.id,
      guest_id: randomGuest.id,
      check_in_date: today.toISOString().split('T')[0],
      check_out_date: checkout.toISOString().split('T')[0],
      status: 'CheckedIn',
      total_price: totalPrice,
      payment_method: randomPayment
    };

    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simulation failed');

      // Double blast confetti!
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Live Simulator: Simulate Check Out
  const handleSimulateCheckout = async () => {
    const checkedInBookings = bookings.filter(b => b.status === 'CheckedIn');
    if (checkedInBookings.length === 0) {
      return alert('No checked-in guests available to checkout!');
    }

    // Choose random checked-in booking
    const randomBooking = checkedInBookings[Math.floor(Math.random() * checkedInBookings.length)];

    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${randomBooking.id}/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simulation checkout failed');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      await fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- RENDERING ROUTINES ---

  if (!user) {
    /* LOGIN VIEW - Receptionist Portal */
    return (
      <div className="min-h-screen bg-bg-darkest flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-indigo/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-hotel-gold/5 blur-[120px] pointer-events-none"></div>

         <div className="w-full max-w-md bg-bg-dark border border-border-subtle rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex bg-gradient-to-tr from-hotel-gold to-yellow-300 p-3 rounded-2xl text-bg-darkest shadow-lg shadow-hotel-gold/15 mb-2">
              <Building2 size={26} className="stroke-[2.5]" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-hotel-gold bg-clip-text text-transparent">
              Grandview Receptionist Portal
            </h1>
            <p className="text-xs text-slate-400">Log in to manage guest bookings and hotel transactions</p>
          </div>

          {/* Quick-Select Receptionist Profile */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
              Active Receptionist Profile
            </label>
            <div
              onClick={() => {
                setLoginEmail('priya@grandview.co.in');
                setLoginPassword('password');
              }}
              className="glass-panel p-4 border border-border-subtle hover:border-hotel-gold/60 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 bg-bg-panel/40 hover:bg-bg-panel/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-hotel-gold to-amber-300 flex items-center justify-center text-bg-darkest font-extrabold text-sm shadow-md">
                  PS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Priya Sharma</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">priya@grandview.co.in</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-hotel-gold/10 border border-hotel-gold/20 text-hotel-gold text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                Receptionist
              </span>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-bg-panel border border-border-subtle rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-bg-panel border border-border-subtle rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-hotel-gold to-yellow-500 hover:from-yellow-400 hover:to-hotel-gold text-bg-darkest font-bold rounded-xl transition-all shadow-lg shadow-hotel-gold/10 hover:shadow-hotel-gold/15 active:scale-[0.99]"
            >
              Sign In to Terminal
            </button>
          </form>

          <div className="pt-4 border-t border-border-subtle/50 text-center">
            <p className="text-[10px] text-slate-500">
              Any staff member email works with the password "password".
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* LOADING SCREEN (Fetching DB) */
  if (isLoading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-bg-darker flex flex-col items-center justify-center text-slate-300 gap-4">
        <Loader2 size={38} className="animate-spin text-accent-indigo" />
        <span className="text-sm font-semibold tracking-wider uppercase animate-pulse-subtle">Connecting to hotel database...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-darker flex flex-col animate-slide-up">
      {/* Top Header Navbar */}
      <header className="h-20 bg-bg-dark border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-hotel-gold to-yellow-300 p-2.5 rounded-xl text-bg-darkest shadow-lg shadow-hotel-gold/15">
            <Building2 size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-hotel-gold bg-clip-text text-transparent leading-none">
              Grandview Local Terminal
            </h1>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Shimla, HP • Reception Desk</span>
          </div>
        </div>

        {/* User Persona & Quick Data Reset */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="bg-bg-panel/40 border border-border-subtle/50 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-indigo flex items-center justify-center font-bold text-white text-xs shadow-inner">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left hidden sm:block">
                <h4 className="text-xs font-bold text-slate-100 leading-none">{user.name}</h4>
                <span className="text-[9px] text-hotel-gold font-bold uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleResetSystem}
            disabled={isActionLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-subtle text-slate-400 hover:text-white hover:bg-bg-panel transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
            title="Reset to default seeded demo records"
          >
            <RotateCcw size={13} className={isActionLoading ? 'animate-spin' : ''} />
            Reset Demo
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>

      {/* Global Actions Loading indicator */}
      {isActionLoading && (
        <div className="fixed top-24 right-8 z-50 bg-bg-panel border border-border-subtle px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-hotel-gold animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          Synchronizing Neon Database...
        </div>
      )}

      {/* Main Consolidated Reception Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section (Rooms Console) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel/20 p-5 rounded-2xl border border-border-subtle/40">
            <div>
              <h2 className="text-xl font-extrabold text-white">Reception Room Console</h2>
              <p className="text-xs text-slate-400">Visual display of rooms. Check-in arrivals, check-out residents, and put rooms to cleaning.</p>
            </div>
            
            {/* Status counts pills */}
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                Available: {rooms.filter(r => r.status === 'Available').length}
              </span>
              <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md">
                Occupied: {rooms.filter(r => r.status === 'Occupied').length}
              </span>
              <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
                Cleaning: {rooms.filter(r => r.status === 'Maintenance').length}
              </span>
            </div>
          </div>

          {/* Simple status filter */}
          <div className="flex gap-2">
            {['All', 'Available', 'Occupied', 'Maintenance'].map((f) => {
              const count = f === 'All' ? rooms.length : rooms.filter(r => r.status === f).length;
              const isActive = roomFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setRoomFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent-indigo border-accent-indigo text-white shadow-sm'
                      : 'bg-bg-panel/40 border-border-subtle/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f === 'Maintenance' ? 'Cleaning' : f} ({count})
                </button>
              );
            })}
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.filter(r => roomFilter === 'All' || r.status === roomFilter).map((room) => {
              const activeBooking = bookings.find(b => b.room_id === room.id && b.status === 'CheckedIn');
              
              let cardBorder = 'border-border-subtle/50';
              let statusBadge = '';
              let statusText = 'Free';
              let actionBtn = null;

              if (room.status === 'Available') {
                cardBorder = 'hover:border-emerald-500/40 border-emerald-500/10 bg-emerald-950/5';
                statusBadge = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                statusText = 'Available';
                actionBtn = (
                  <div className="flex gap-2 w-full mt-3">
                    <button
                      onClick={() => {
                        setPreselectedRoomId(room.id);
                        setIsBookingModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-bg-darkest text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      <Plus size={12} /> Check In
                    </button>
                    <button
                      onClick={() => handleUpdateRoomStatus(room.id, 'Maintenance')}
                      className="p-1.5 border border-border-subtle hover:border-amber-500/30 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                      title="Mark as Dirty/Cleaning"
                    >
                      <Wrench size={13} />
                    </button>
                  </div>
                );
              } else if (room.status === 'Occupied') {
                cardBorder = 'border-rose-500/20 bg-rose-950/5';
                statusBadge = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                statusText = 'Occupied';
                actionBtn = (
                  <button
                    onClick={() => {
                      if (activeBooking) {
                        handleCheckOut(activeBooking.id);
                      } else {
                        handleUpdateRoomStatus(room.id, 'Available');
                      }
                    }}
                    className="w-full mt-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                  >
                    Check Out & Free
                  </button>
                );
              } else {
                cardBorder = 'border-amber-500/20 bg-amber-950/5';
                statusBadge = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                statusText = 'Cleaning';
                actionBtn = (
                  <button
                    onClick={() => handleUpdateRoomStatus(room.id, 'Available')}
                    className="w-full mt-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-bg-darkest text-xs font-bold rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    Mark Available
                  </button>
                );
              }

              return (
                <div key={room.id} className={`glass-panel border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ${cardBorder}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{room.type}</span>
                        <h4 className="text-base font-bold text-white">Room {room.room_number}</h4>
                      </div>
                      <span className={`px-2 py-0.5 border rounded-md text-[8px] font-extrabold uppercase ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Occupancy Detail */}
                    {room.status === 'Occupied' && activeBooking && (
                      <div className="mt-3 bg-bg-panel/30 border border-border-subtle/30 rounded-lg p-2 text-[10px] text-slate-300 space-y-1">
                        <p className="font-bold text-slate-100 truncate">{activeBooking.first_name} {activeBooking.last_name}</p>
                        <p className="text-slate-400 truncate">Phone: {activeBooking.guest_phone}</p>
                        <p className="text-slate-400">Out: {activeBooking.check_out_date}</p>
                      </div>
                    )}

                    {room.status === 'Occupied' && !activeBooking && (
                      <div className="mt-3 bg-bg-panel/30 border border-border-subtle/30 rounded-lg p-2 text-[10px] text-slate-400 italic">
                        No active guest data found.
                      </div>
                    )}

                    {room.status === 'Available' && (
                      <p className="mt-2 text-[10px] text-slate-400 truncate font-medium">
                        {room.amenities}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-3 pt-3 border-t border-border-subtle/40 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-slate-500 uppercase">Tariff/Night</span>
                      <span className="text-sm font-bold text-hotel-gold">₹{room.price.toLocaleString('en-IN')}</span>
                    </div>
                    {actionBtn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section (Money Panel & Ledger) */}
        <div className="space-y-6">
          
          {/* Money Display Card */}
          <div className="glass-panel rounded-2xl border border-border-subtle p-5 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-border-subtle/50 pb-2">
              Money Ledger
            </h3>
            
            {/* Total Collected */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Money Collected</span>
              <h2 className="text-3xl font-extrabold text-hotel-gold leading-none">
                ₹{Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}
              </h2>
            </div>

            {/* Today's Collection */}
            <div className="bg-bg-panel/40 border border-border-subtle/50 rounded-xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today's Collections</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  + ₹{Number(stats?.revenue?.today || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp size={16} />
              </div>
            </div>

            {/* Payments breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Breakdown by Payment Mode</span>
              {analytics?.paymentMethods && analytics.paymentMethods.length > 0 ? (
                analytics.paymentMethods.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300 font-medium bg-bg-panel/10 px-2.5 py-1.5 rounded-lg border border-border-subtle/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo inline-block" />
                      {m.name}
                    </span>
                    <span className="font-bold text-white">₹{Number(m.value).toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic">No payments logged yet.</p>
              )}
            </div>
          </div>

          {/* Cash Ledger / Recent Transactions */}
          <div className="glass-panel rounded-2xl border border-border-subtle p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-border-subtle/50 pb-2">
              Recent Receipts
            </h3>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {bookings.filter(b => b.status === 'CheckedIn' || b.status === 'CheckedOut').slice(0, 7).map((b) => {
                const isCheckedIn = b.status === 'CheckedIn';
                return (
                  <div key={b.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl border border-border-subtle/40 bg-bg-panel/20 hover:bg-bg-panel/40 transition-all">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{b.first_name} {b.last_name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Room {b.room_number} • {b.payment_method || 'UPI'}</p>
                    </div>
                    <div className="text-right flex items-center gap-2 flex-shrink-0">
                      <div>
                        <p className="font-bold text-hotel-gold font-sans">₹{Number(b.total_price).toFixed(0)}</p>
                        <span className={`text-[8px] font-extrabold uppercase tracking-wider block mt-0.5 ${isCheckedIn ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {isCheckedIn ? 'In (Paid)' : 'Out'}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleWhatsAppShare(b)}
                          className="p-1 hover:bg-emerald-500/10 hover:text-emerald-400 rounded border border-border-subtle/50 text-slate-400 transition-colors cursor-pointer"
                          title="Share via WhatsApp"
                        >
                          <MessageSquare size={11} />
                        </button>
                        <button
                          onClick={() => setSelectedBookingForInvoice(b)}
                          className="p-1 hover:bg-bg-panel hover:text-white rounded border border-border-subtle/50 text-slate-400 transition-colors cursor-pointer"
                          title="Print GST Invoice"
                        >
                          <Printer size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {bookings.filter(b => b.status === 'CheckedIn' || b.status === 'CheckedOut').length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No receipts generated yet.</p>
              )}
            </div>
          </div>

          {/* Quick Demo Simulator */}
          <div className="glass-panel rounded-2xl border border-border-subtle p-5 space-y-4 bg-gradient-to-br from-bg-panel/30 to-bg-dark/30">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-border-subtle/50 pb-2 flex items-center gap-1.5">
              <Zap size={12} className="text-hotel-gold fill-hotel-gold/10" />
              Demo Simulator
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Use these buttons to instantly trigger random guest check-ins and check-outs for demo purposes.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSimulateArrival}
                disabled={isActionLoading}
                className="py-2 bg-accent-indigo/10 border border-accent-indigo/20 hover:bg-accent-indigo hover:text-white text-accent-indigo text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer animate-pulse"
              >
                Simulate Check-in
              </button>
              <button
                onClick={handleSimulateCheckout}
                disabled={isActionLoading}
                className="py-2 bg-slate-800 border border-border-subtle hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                Simulate Check-out
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setPreselectedRoomId(null);
        }}
        rooms={rooms}
        guests={guests}
        preselectedRoomId={preselectedRoomId}
        onSubmit={handleCreateBooking}
      />

      {/* WhatsApp Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-bg-panel border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Indian Tax Invoice Modal */}
      {selectedBookingForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-bg-dark border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-panel/40">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-hotel-gold font-sans">Tax Invoice / Receipt</h3>
                <p className="text-xs text-slate-400 font-medium">GSTIN: 02AAAAA1111A1Z1 (Himachal Pradesh)</p>
              </div>
              <button 
                onClick={() => setSelectedBookingForInvoice(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-bg-panel hover:text-white transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Invoice Body */}
            <div id="tax-invoice-content" className="flex-1 overflow-y-auto p-6 space-y-6 bg-white text-slate-800 font-sans">
              {/* Header Row */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">GRANDVIEW LUXURY RESORT</h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">12, Mall Road, Shimla, HP - 171001, India</p>
                  <p className="text-xs text-slate-500 font-medium">Contact: +91 177 265 8899 | info@grandview.co.in</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    Original Copy
                  </span>
                  <p className="text-xs text-slate-500 mt-2">Invoice No: <span className="font-semibold text-slate-900">#GV-{1000 + selectedBookingForInvoice.id}</span></p>
                  <p className="text-xs text-slate-500">Date: <span className="font-semibold text-slate-900">{selectedBookingForInvoice.check_in_date}</span></p>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-4">
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To (Guest)</h5>
                  <p className="font-bold text-slate-900 text-sm">{selectedBookingForInvoice.first_name} {selectedBookingForInvoice.last_name}</p>
                  <p className="text-slate-600 mt-0.5">{selectedBookingForInvoice.guest_email}</p>
                  <p className="text-slate-600">Phone: {selectedBookingForInvoice.guest_phone}</p>
                  <p className="text-slate-600">Identity: <span className="font-semibold text-slate-900">{selectedBookingForInvoice.document_id || 'Aadhaar Card - Submitted'}</span></p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Stay Details</h5>
                  <p className="font-semibold text-slate-800">Room Renting Services (SAC: 996311)</p>
                  <p className="text-slate-600 mt-0.5">Room Number: <span className="font-semibold text-slate-900">{selectedBookingForInvoice.room_number} ({selectedBookingForInvoice.room_type})</span></p>
                  <p className="text-slate-600">Period: {selectedBookingForInvoice.check_in_date} to {selectedBookingForInvoice.check_out_date}</p>
                  <p className="text-slate-600">Nights: {(() => {
                    const start = new Date(selectedBookingForInvoice.check_in_date);
                    const end = new Date(selectedBookingForInvoice.check_out_date);
                    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
                  })()}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Nights</th>
                      <th className="py-2 text-right">Tariff/Night</th>
                      <th className="py-2 text-right">Base Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const roomPrice = Number(selectedBookingForInvoice.room_price) || 2500;
                      const start = new Date(selectedBookingForInvoice.check_in_date);
                      const end = new Date(selectedBookingForInvoice.check_out_date);
                      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
                      const basePrice = roomPrice * nights;
                      
                      return (
                        <tr>
                          <td className="py-3 font-medium text-slate-900">
                            Room Rent Charge (Room {selectedBookingForInvoice.room_number})
                          </td>
                          <td className="py-3 text-center">{nights}</td>
                          <td className="py-3 text-right">₹{roomPrice.toFixed(2)}</td>
                          <td className="py-3 text-right font-medium">₹{basePrice.toFixed(2)}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>

                {/* Calculations Breakdown */}
                <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-2 text-xs text-slate-700">
                    {(() => {
                      const roomPrice = Number(selectedBookingForInvoice.room_price) || 2500;
                      const start = new Date(selectedBookingForInvoice.check_in_date);
                      const end = new Date(selectedBookingForInvoice.check_out_date);
                      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
                      const base = roomPrice * nights;
                      
                      const gstRate = roomPrice <= 7500 ? 12 : 18;
                      const cgst = base * (gstRate / 2) / 100;
                      const sgst = base * (gstRate / 2) / 100;
                      const totalGst = cgst + sgst;
                      const total = base + totalGst;

                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Subtotal (Room Rent):</span>
                            <span className="font-medium">₹{base.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>CGST ({gstRate / 2}%):</span>
                            <span>₹{cgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>SGST ({gstRate / 2}%):</span>
                            <span>₹{sgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-slate-100 pt-2 text-slate-900">
                            <span>Total GST ({gstRate}%):</span>
                            <span>₹{totalGst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-extrabold border-t border-slate-300 pt-2 text-slate-900">
                            <span>Grand Total (GST Incl.):</span>
                            <span>₹{total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Payment Status & Terms */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-end text-[10px] text-slate-500 font-medium">
                <div>
                  <p className="font-bold text-slate-700 uppercase">Payment Info</p>
                  <p className="mt-0.5">Method: {selectedBookingForInvoice.payment_method || 'UPI (Paid)'}</p>
                  <p>Status: Transaction Settled & Confirmed</p>
                </div>
                <div className="text-right">
                  <p className="italic">Thank you for your patronage!</p>
                  <p className="font-bold text-slate-800 mt-1">Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-bg-panel/20">
              <button
                type="button"
                onClick={() => setSelectedBookingForInvoice(null)}
                className="px-4 py-2 bg-bg-panel border border-border-subtle hover:bg-slate-700/30 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-hotel-gold hover:bg-yellow-500 text-bg-darkest font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
