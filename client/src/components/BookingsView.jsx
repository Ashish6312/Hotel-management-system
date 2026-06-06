import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight,
  LogIn,
  LogOut,
  XCircle,
  CalendarRange,
  MessageSquare,
  Printer
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
  const [toastMessage, setToastMessage] = useState('');
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  const handleWhatsAppShare = (booking) => {
    setToastMessage(`Mock WhatsApp alert sent to ${booking.first_name} ${booking.last_name} at +91 ${booking.guest_phone || '98765 43210'} with reservation confirmation!`);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

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
                        ₹{Number(b.total_price).toFixed(2)}
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold inline-block ${badgeStyle}`}>
                          {b.status === 'CheckedIn' ? 'Checked In' : b.status === 'CheckedOut' ? 'Checked Out' : b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {actionButtons}
                          
                          <button
                            onClick={() => handleWhatsAppShare(b)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg border border-border-subtle/30 hover:border-emerald-500/20 transition-all"
                            title="Share details via WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </button>
                          
                          <button
                            onClick={() => setSelectedBookingForInvoice(b)}
                            className="p-1.5 text-hotel-gold hover:text-yellow-400 hover:bg-hotel-gold/10 rounded-lg border border-border-subtle/30 hover:border-hotel-gold/20 transition-all"
                            title="Print GST Invoice"
                          >
                            <Printer size={13} />
                          </button>
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-hotel-gold">Tax Invoice / Receipt</h3>
                <p className="text-xs text-slate-400 font-medium">GSTIN: 02AAAAA1111A1Z1 (Himachal Pradesh)</p>
              </div>
              <button 
                onClick={() => setSelectedBookingForInvoice(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-bg-panel hover:text-white transition-colors"
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
                  <p className="text-xs text-slate-500 mt-1">12, Mall Road, Shimla, HP - 171001, India</p>
                  <p className="text-xs text-slate-500">Contact: +91 177 265 8899 | info@grandview.co.in</p>
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
              <div className="border-t border-slate-200 pt-4 flex justify-between items-end text-[10px] text-slate-500">
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
                className="px-4 py-2 bg-bg-panel border border-border-subtle hover:bg-slate-700/30 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-hotel-gold hover:bg-yellow-500 text-bg-darkest font-bold text-xs rounded-xl shadow-lg transition-all"
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
