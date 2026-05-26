import React, { useState } from 'react';
import TicketCard from './TicketCard';

const TicketColumn = ({ 
  title, 
  status, 
  tickets, 
  onEdit, 
  onDelete, 
  onDragStart,
  onTicketDrop 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Status mapping details
  const statusConfig = {
    open: {
      borderColor: 'border-t-blue-500',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      label: 'Open'
    },
    in_progress: {
      borderColor: 'border-t-amber-500',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      label: 'In Progress'
    },
    resolved: {
      borderColor: 'border-t-emerald-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      label: 'Resolved'
    },
    closed: {
      borderColor: 'border-t-purple-500',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      label: 'Closed'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.open;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onTicketDrop(e, status);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`glass rounded-2xl border border-brand-border flex flex-col flex-1 min-w-[260px] max-w-full pb-4 transition-all duration-300 border-t-4 ${currentStatus.borderColor} ${
        isDragOver ? 'drag-over' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-brand-border select-none bg-[#111627]/50 rounded-t-2xl">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          {currentStatus.label}
        </h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${currentStatus.badgeColor}`}>
          {tickets.length}
        </span>
      </div>

      {/* Ticket List Area */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 flex flex-col gap-3 max-h-[calc(100vh-320px)] custom-scrollbar">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              No Tickets
            </span>
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard 
              key={ticket._id} 
              ticket={ticket} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TicketColumn;
