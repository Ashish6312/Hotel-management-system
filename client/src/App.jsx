import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2,
  Lock,
  Mail,
  User,
  Zap,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import RoomsView from './components/RoomsView';
import BookingsView from './components/BookingsView';
import GuestsView from './components/GuestsView';
import StaffView from './components/StaffView';
import BookingModal from './components/BookingModal';
import DemoControlPanel from './components/DemoControlPanel';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function App() {
  // Authentication State
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('sarah@grandview.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginError, setLoginError] = useState('');

  // App Navigation & Modal State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState(null);

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
    setActiveTab('dashboard');
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

    const randomPayment = ['Credit Card', 'Cash', 'Digital Wallet'][Math.floor(Math.random() * 3)];

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

          {/* Quick-Select Demo Personas */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
              Quick Sign-In (Demo Personas)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Sarah Jenkins', role: 'Receptionist', email: 'sarah@grandview.com' },
                { name: 'Marcus Vance', role: 'Manager', email: 'marcus@grandview.com' },
                { name: 'Thomas Miller', role: 'Housekeeper', email: 'thomas@grandview.com' }
              ].map((profile) => (
                <button
                  key={profile.email}
                  type="button"
                  onClick={() => {
                    setLoginEmail(profile.email);
                    setLoginPassword('password');
                  }}
                  className={`p-2 border rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    loginEmail === profile.email
                      ? 'border-hotel-gold bg-hotel-gold/10 text-hotel-gold'
                      : 'border-border-subtle bg-bg-panel hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold truncate w-full">{profile.name.split(' ')[0]}</span>
                  <span className="text-[8px] text-slate-400 uppercase font-semibold mt-0.5">{profile.role}</span>
                </button>
              ))}
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
    <div className="min-h-screen bg-bg-darker flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        {/* Global Loading Indicator (for actions) */}
        {isActionLoading && (
          <div className="absolute top-4 right-6 z-50 bg-bg-panel border border-border-subtle px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-hotel-gold">
            <RefreshCw size={12} className="animate-spin" />
            Updating database...
          </div>
        )}

        {/* Dynamic Inner Tab View */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView 
              stats={stats} 
              analytics={analytics} 
              onBookRoom={() => {
                setPreselectedRoomId(null);
                setIsBookingModalOpen(true);
              }}
              onResetSystem={handleResetSystem}
              isResetting={isActionLoading}
              onNavigateToReservations={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsView 
              rooms={rooms}
              bookings={bookings}
              onBookRoom={(roomId) => {
                setPreselectedRoomId(roomId);
                setIsBookingModalOpen(true);
              }}
              onUpdateRoomStatus={handleUpdateRoomStatus}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView 
              bookings={bookings}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCancel={handleCancelBooking}
              onBookRoom={() => {
                setPreselectedRoomId(null);
                setIsBookingModalOpen(true);
              }}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsView 
              guests={guests} 
              onAddGuest={handleAddGuest} 
            />
          )}

          {activeTab === 'staff' && (
            <StaffView 
              staff={staff} 
              onAddStaff={handleAddStaff}
              onToggleStaffStatus={handleToggleStaffStatus}
            />
          )}
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

      {/* Floating Simulator Panel */}
      <DemoControlPanel 
        onReset={handleResetSystem}
        onSimulateCheckIn={handleSimulateArrival}
        onSimulateCheckOut={handleSimulateCheckout}
        isLoading={isActionLoading}
      />
    </div>
  );
}

export default App;
