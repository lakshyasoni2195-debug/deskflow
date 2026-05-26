import React from 'react';
import { Filter, RotateCcw, AlertOctagon, ShieldCheck, Layers } from 'lucide-react';

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  searchTerm,
  onSearchChange
}) => {
  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent ⚠️' }
  ];

  const slaOptions = [
    { value: '', label: 'All SLA Statuses', icon: <Layers className="w-4 h-4" /> },
    { value: 'true', label: 'Breached Only', icon: <AlertOctagon className="w-4 h-4 text-rose-400" /> },
    { value: 'false', label: 'Within SLA', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }
  ];

  const handlePrioritySelect = (priority) => {
    onFilterChange('priority', priority);
  };

  const handleSlaSelect = (breachedValue) => {
    onFilterChange('breached', breachedValue);
  };

  return (
    <div className="glass border border-brand-border p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 max-w-md w-full relative">
        <input 
          type="text" 
          placeholder="Search tickets by subject, details or email..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#0b0f19] border border-brand-border text-slate-200 text-sm pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Priority Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Priority Filter
          </label>
          <div className="flex rounded-xl bg-[#0b0f19] border border-brand-border p-1 gap-1">
            {priorities.map(p => (
              <button
                key={p.value}
                onClick={() => handlePrioritySelect(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  filters.priority === p.value 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* SLA Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            SLA Breach Filter
          </label>
          <div className="flex rounded-xl bg-[#0b0f19] border border-brand-border p-1 gap-1">
            {slaOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSlaSelect(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                  filters.breached === opt.value 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Filter Button */}
        {(filters.priority || filters.breached || searchTerm) && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 mt-5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-[#0b0f19] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
