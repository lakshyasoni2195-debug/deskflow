import React from 'react';
import { Ticket, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

const StatsStrip = ({ stats, loading }) => {
  const statusCounts = stats?.statusCounts || { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  const priorityCounts = stats?.priorityCounts || { low: 0, medium: 0, high: 0, urgent: 0 };
  const breachedCount = stats?.breachedCount || 0;

  const totalTickets = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const activeTickets = statusCounts.open + statusCounts.in_progress;
  const resolvedClosed = statusCounts.resolved + statusCounts.closed;

  // SLA Compliance Rate
  const complianceRate = totalTickets > 0 
    ? Math.round(((totalTickets - breachedCount) / totalTickets) * 100) 
    : 100;

  const cards = [
    {
      title: 'Total Tickets Managed',
      value: loading ? '...' : totalTickets,
      subtitle: `${activeTickets} Active, ${resolvedClosed} Closed`,
      icon: <Ticket className="w-5 h-5 text-blue-400" />,
      borderClass: 'border-blue-500/10 hover:border-blue-500/30',
      bgGlow: 'bg-blue-500/5',
      indicator: null
    },
    {
      title: 'SLA Breached Tickets',
      value: loading ? '...' : breachedCount,
      subtitle: breachedCount > 0 ? `${breachedCount} tickets require action` : 'All tickets within SLA targets',
      icon: <AlertOctagon className={`w-5 h-5 ${breachedCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />,
      borderClass: breachedCount > 0 ? 'border-rose-500/25 hover:border-rose-500/40 glow-urgent' : 'border-slate-500/10 hover:border-slate-500/30',
      bgGlow: breachedCount > 0 ? 'bg-rose-500/5' : 'bg-slate-500/5',
      indicator: breachedCount > 0 && <span className="absolute top-3 right-3 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>
    },
    {
      title: 'SLA Compliance Rate',
      value: loading ? '...' : `${complianceRate}%`,
      subtitle: totalTickets > 0 ? `${totalTickets - breachedCount} within targets` : 'No active tickets',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      borderClass: complianceRate < 80 ? 'border-amber-500/20 hover:border-amber-500/40' : 'border-emerald-500/10 hover:border-emerald-500/30',
      bgGlow: complianceRate < 80 ? 'bg-amber-500/5' : 'bg-emerald-500/5',
      indicator: (
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${complianceRate < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${loading ? 0 : complianceRate}%` }}
          />
        </div>
      )
    },
    {
      title: 'Urgent Priority Backlog',
      value: loading ? '...' : priorityCounts.urgent,
      subtitle: `${priorityCounts.high} High, ${priorityCounts.medium} Med, ${priorityCounts.low} Low`,
      icon: <ShieldAlert className={`w-5 h-5 ${priorityCounts.urgent > 0 ? 'text-amber-500' : 'text-slate-400'}`} />,
      borderClass: priorityCounts.urgent > 0 ? 'border-amber-500/20 hover:border-amber-500/40' : 'border-brand-border hover:border-brand-border-glow',
      bgGlow: priorityCounts.urgent > 0 ? 'bg-amber-500/5' : 'bg-slate-500/5',
      indicator: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`relative p-5 rounded-2xl border ${card.borderClass} ${card.bgGlow} glass transition-all duration-300 flex flex-col justify-between overflow-hidden group`}
        >
          {card.indicator}
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {card.title}
            </span>
            <div className="p-2 rounded-xl bg-[#0b0f19] border border-brand-border group-hover:scale-105 transition-transform duration-300">
              {card.icon}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight text-white mb-1">
              {card.value}
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {card.subtitle}
            </p>
            {card.indicator && typeof card.indicator !== 'boolean' && card.indicator}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsStrip;
