import React from 'react';
import TicketColumn from './TicketColumn';

const TicketBoard = ({ 
  tickets, 
  onEdit, 
  onDelete, 
  onDragStart,
  onTicketDrop,
  onStatusChange
}) => {
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];

  // Categorize tickets into columns based on status
  const getColumnTickets = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4 select-none">
      {statuses.map(status => (
        <TicketColumn
          key={status}
          status={status}
          tickets={getColumnTickets(status)}
          onEdit={onEdit}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onTicketDrop={onTicketDrop}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default TicketBoard;
