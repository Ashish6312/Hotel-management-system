import React, { useState } from 'react';
import { Search, UserPlus, Mail, Phone, FileText, Check, AlertCircle } from 'lucide-react';

export default function GuestsView({ guests = [], onAddGuest }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Guest Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_type: 'Aadhaar Card',
    document_number: ''
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredGuests = guests.filter(g => {
    const fullName = `${g.first_name} ${g.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.document_number) {
      return setErrorMsg('All fields are required.');
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      document_id: `${formData.document_type || 'Aadhaar Card'}-${formData.document_number}`
    };

    try {
      await onAddGuest(payload);
      setSuccessMsg('Guest registered successfully!');
      setFormData({ first_name: '', last_name: '', email: '', phone: '', document_type: 'Aadhaar Card', document_number: '' });
      setTimeout(() => {
        setIsAdding(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Error registering guest.');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel/20 p-6 rounded-2xl border border-border-subtle/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Guests Registry</h2>
          <p className="text-sm text-slate-400">Manage hotel customer accounts, check contact details, and add new guest profiles.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-indigo hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            <UserPlus size={16} />
            Register Guest
          </button>
        )}
      </div>

      {isAdding ? (
        /* ADD GUEST FORM */
        <div className="glass-panel rounded-2xl border border-border-subtle/50 p-6 max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <h4 className="text-base font-bold text-white">Register a New Guest</h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <Check size={15} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Document Type</label>
                <select
                  value={formData.document_type || 'Aadhaar Card'}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Document Number</label>
                <input
                  type="text"
                  placeholder="Enter ID number"
                  value={formData.document_number || ''}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-hotel-gold to-yellow-500 hover:from-yellow-400 hover:to-hotel-gold text-bg-darkest font-bold rounded-xl transition-all shadow-md mt-2"
            >
              Save Profile
            </button>
          </form>
        </div>
      ) : (
        /* SEARCH & LIST VIEW */
        <>
          <div className="relative max-w-md bg-bg-panel/10 p-2 rounded-xl border border-border-subtle/30">
            <Search className="absolute left-5 top-5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-panel/70 border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGuests.length > 0 ? (
              filteredGuests.map(g => (
                <div key={g.id} className="glass-panel rounded-2xl p-5 border border-border-subtle/50 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                        {g.first_name[0]}{g.last_name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{g.first_name} {g.last_name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ID: {g.id}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-500" />
                        <span className="truncate">{g.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-500" />
                        <span>{g.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-500" />
                        <span className="font-medium text-slate-400">Doc ID: <span className="text-slate-300 font-semibold">{g.document_id}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                No guests in registry match search query.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
