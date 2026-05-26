import React from 'react';
import { Mail, Clock, ShieldAlert, Award, Calendar, ChevronRight, Edit3, Trash2, GripVertical } from 'lucide-react';

const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

const formatDuration = (totalMinutes) => {
  if (totalMinutes === 0) return '0m';
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;

  let str = '';
  if (days > 0) str += `${days}d `;
  if (hours > 0 || days > 0) str += `${hours}h `;
  str += `${mins}m`;
  return str.trim();
};

const TicketCard = ({ ticket, onEdit, onDelete, onDragStart }) => {
  const { _id, subject, description, customerEmail, priority, status, ageMinutes, slaBreached, createdAt, resolvedAt } = ticket;

  const limitMinutes = SLA_TARGETS[priority] || 1440;
  const remainingMinutes = limitMinutes - ageMinutes;
  const isResolvedOrClosed = status === 'resolved' || status === 'closed';

  // Priority styling details
  const priorityConfig = {
    urgent: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      glow: 'glow-urgent border-l-4 border-l-rose-500',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'Urgent'
    },
    high: {
      bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      glow: 'glow-high border-l-4 border-l-orange-500',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      label: 'High'
    },
    medium: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      glow: 'glow-medium border-l-4 border-l-amber-500',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'Medium'
    },
    low: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      glow: 'glow-low border-l-4 border-l-blue-500',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      label: 'Low'
    }
  };

  const currentPriority = priorityConfig[priority] || priorityConfig.medium;

  // Format creation time
  const createdDateStr = new Date(createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      className={`glass rounded-xl border border-brand-border p-4 hover:border-brand-border-glow transition-all duration-300 flex flex-col gap-3 group relative cursor-grab active:cursor-grabbing ${currentPriority.glow}`}
    >
      {/* Top Strip (Priority and Action buttons) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300 shrink-0 select-none opacity-40 group-hover:opacity-100 transition-opacity p-0.5">
            <GripVertical className="w-4 h-4" />
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${currentPriority.badge}`}>
            {currentPriority.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onEdit(ticket)}
            className="p-1.5 rounded-lg bg-[#0b0f19] border border-brand-border hover:border-blue-500/30 text-slate-400 hover:text-blue-400 transition-colors"
            title="Edit Ticket"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg bg-[#0b0f19] border border-brand-border hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket Subject and Description */}
      <div>
        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
          {subject}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Metadata (Email, Created At, Age) */}
      <div className="border-t border-brand-border pt-3 flex flex-col gap-1.5 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{customerEmail}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{createdDateStr}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Age: {formatDuration(ageMinutes)}</span>
          </div>
        </div>
      </div>

      {/* SLA Status Footer Banner */}
      <div className="mt-1 border-t border-dashed border-brand-border pt-2.5">
        {isResolvedOrClosed ? (
          // Resolved / Closed Ticket SLA Badge
          <div className={`flex items-center justify-between text-[11px] p-2 rounded-lg font-semibold ${
            slaBreached 
              ? 'bg-rose-500/5 text-rose-400 border border-rose-500/10' 
              : 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10'
          }`}>
            <div className="flex items-center gap-1.5">
              {slaBreached ? <ShieldAlert className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
              <span>{slaBreached ? 'Breached before Resolution' : 'Resolved within SLA'}</span>
            </div>
            <span>{formatDuration(ageMinutes)}</span>
          </div>
        ) : (
          // Active Ticket SLA Countdown / Breach Badge
          <div className={`flex items-center justify-between text-[11px] p-2 rounded-lg font-semibold ${
            slaBreached 
              ? 'bg-rose-500/5 text-rose-400 border border-rose-500/15' 
              : remainingMinutes < 60 
                ? 'bg-amber-500/5 text-amber-400 border border-amber-500/15' 
                : 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/15'
          }`}>
            <div className="flex items-center gap-1.5">
              {slaBreached ? (
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{slaBreached ? 'SLA Breached' : 'SLA Target'}</span>
            </div>
            <span>
              {slaBreached 
                ? `+ ${formatDuration(Math.abs(remainingMinutes))} Over` 
                : `${formatDuration(remainingMinutes)} left`
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
