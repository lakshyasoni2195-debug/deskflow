import React, { useState, useEffect } from 'react';
import { X, Send, ClipboardList, Info } from 'lucide-react';

const TicketFormModal = ({ isOpen, onClose, onSubmit, ticket }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'medium',
    status: 'open'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket.subject || '',
        description: ticket.description || '',
        customerEmail: ticket.customerEmail || '',
        priority: ticket.priority || 'medium',
        status: ticket.status || 'open'
      });
    } else {
      setFormData({
        subject: '',
        description: '',
        customerEmail: '',
        priority: 'medium',
        status: 'open'
      });
    }
    setErrors({});
  }, [ticket, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#06080f]/80 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-[#151b2e] border-l border-brand-border shadow-2xl glass flex flex-col justify-between animate-slide-left z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border bg-[#111627]/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {ticket ? 'Edit Support Ticket' : 'Create New Ticket'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">
          {/* Customer Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Customer Email *
            </label>
            <input 
              type="text" 
              name="customerEmail"
              placeholder="e.g. customer@example.com"
              value={formData.customerEmail}
              onChange={handleChange}
              disabled={!!ticket} // Usually customer email is read-only on edit
              className={`w-full bg-[#0b0f19] border ${errors.customerEmail ? 'border-rose-500/50' : 'border-brand-border'} text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.customerEmail && (
              <span className="text-[11px] font-semibold text-rose-400 mt-0.5">{errors.customerEmail}</span>
            )}
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Subject *
            </label>
            <input 
              type="text" 
              name="subject"
              placeholder="Brief summary of the problem"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full bg-[#0b0f19] border ${errors.subject ? 'border-rose-500/50' : 'border-brand-border'} text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors`}
            />
            {errors.subject && (
              <span className="text-[11px] font-semibold text-rose-400 mt-0.5">{errors.subject}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Description *
            </label>
            <textarea 
              name="description"
              rows={4}
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={handleChange}
              className={`w-full bg-[#0b0f19] border ${errors.description ? 'border-rose-500/50' : 'border-brand-border'} text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors resize-none`}
            />
            {errors.description && (
              <span className="text-[11px] font-semibold text-rose-400 mt-0.5">{errors.description}</span>
            )}
          </div>

          {/* Grid for Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-[#0b0f19] border border-brand-border text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="low">Low (72 hr SLA)</option>
                <option value="medium">Medium (24 hr SLA)</option>
                <option value="high">High (4 hr SLA)</option>
                <option value="urgent">Urgent (1 hr SLA)</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#0b0f19] border border-brand-border text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Informational SLA Targets Box */}
          <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 flex items-start gap-3 mt-2">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-200/80 leading-relaxed font-medium">
              <span className="font-bold text-blue-300 block mb-0.5">SLA Time Targets:</span>
              Urgent: 1 Hour | High: 4 Hours | Medium: 24 Hours | Low: 72 Hours.<br />
              SLA starts counting immediately upon ticket submission.
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-brand-border bg-[#111627]/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{ticket ? 'Save Changes' : 'Create Ticket'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TicketFormModal;
