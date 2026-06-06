import React, { useState } from 'react';
import { Shield, Mail, Phone, ToggleLeft, ToggleRight, UserPlus, AlertCircle, Check } from 'lucide-react';

export default function StaffView({ staff = [], onAddStaff, onToggleStaffStatus }) {
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Receptionist',
    email: '',
    phone: '',
    status: 'Active'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name || !formData.email || !formData.phone) {
      return setErrorMsg('Name, email, and phone are required.');
    }

    try {
      await onAddStaff(formData);
      setSuccessMsg('Staff member added successfully!');
      setFormData({ name: '', role: 'Receptionist', email: '', phone: '', status: 'Active' });
      setTimeout(() => {
        setIsAdding(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Error adding staff member.');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel/20 p-6 rounded-2xl border border-border-subtle/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Staff Roster</h2>
          <p className="text-sm text-slate-400">View team members, adjust availability status, and add new receptionists or housekeepers.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-indigo hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            <UserPlus size={16} />
            Add Staff
          </button>
        )}
      </div>

      {isAdding ? (
        /* ADD STAFF FORM */
        <div className="glass-panel rounded-2xl border border-border-subtle/50 p-6 max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <h4 className="text-base font-bold text-white">Add a New Staff Member</h4>
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
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                >
                  <option value="Receptionist">Receptionist</option>
                  <option value="Manager">Manager</option>
                  <option value="Housekeeper">Housekeeper</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-bg-panel/75 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Off-Duty">Off-Duty</option>
                </select>
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

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-hotel-gold to-yellow-500 hover:from-yellow-400 hover:to-hotel-gold text-bg-darkest font-bold rounded-xl transition-all shadow-md mt-2"
            >
              Add Staff Profile
            </button>
          </form>
        </div>
      ) : (
        /* STAFF DIRECTORY GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map(member => {
            const isActive = member.status === 'Active';
            return (
              <div 
                key={member.id} 
                className={`glass-panel rounded-2xl p-5 border border-border-subtle/50 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isActive ? '' : 'opacity-60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400">
                        <Shield size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{member.name}</h4>
                        <span className="text-xs text-hotel-gold font-semibold uppercase">{member.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStaffStatus(member.id)}
                      title={isActive ? 'Mark Off-Duty' : 'Mark Active'}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      {isActive ? (
                        <ToggleRight size={26} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={26} className="text-slate-600" />
                      )}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-500" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-500" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border-subtle/40 text-xs">
                  <span className="text-slate-500 font-semibold uppercase">Schedule Availability</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-border-subtle/50'}`}>
                    {member.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
