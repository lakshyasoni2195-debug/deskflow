import React, { useState, useEffect, useRef } from 'react';
import api from './api/axios';
import StatsStrip from './components/StatsStrip';
import FilterBar from './components/FilterBar';
import TicketBoard from './components/TicketBoard';
import TicketFormModal from './components/TicketFormModal';
import { ToastContainer } from './components/Toast';
import { Plus, RefreshCw, BarChart2, Layers } from 'lucide-react';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    breachedCount: 0
  });

  // Filters State
  const [filters, setFilters] = useState({
    priority: '',
    breached: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Drag Reference
  const draggedTicketRef = useRef(null);

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Build query string based on filters
      const params = {};
      if (filters.priority) params.priority = filters.priority;
      if (filters.breached) params.breached = filters.breached;

      const response = await api.get('/tickets', { params });
      setTickets(response.data.data);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to fetch tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/tickets/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  // Load Initial Data
  useEffect(() => {
    fetchTickets();
    fetchStats();

    // Auto-update age and SLA timers every 60 seconds
    const interval = setInterval(() => {
      fetchTickets();
      fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [filters]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Create or Update Ticket Submit Handler
  const handleFormSubmit = async (formData) => {
    try {
      if (editingTicket) {
        // Edit Mode
        const response = await api.patch(`/tickets/${editingTicket._id}`, formData);
        showToast('Ticket updated successfully', 'success');
      } else {
        // Create Mode
        await api.post('/tickets', formData);
        showToast('Support ticket created successfully', 'success');
      }
      setIsFormOpen(false);
      setEditingTicket(null);
      fetchTickets();
      fetchStats();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to submit ticket request', 'error');
    }
  };

  // Handle Ticket Delete
  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      showToast('Ticket deleted successfully', 'success');
      fetchTickets();
      fetchStats();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to delete ticket', 'error');
    }
  };

  // Handle Drag & Drop Transitions
  const handleDragStart = (e, ticket) => {
    draggedTicketRef.current = ticket;
    e.dataTransfer.setData('text/plain', ticket._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTicketDrop = async (e, newStatus) => {
    e.preventDefault();
    const ticket = draggedTicketRef.current;
    if (!ticket) return;

    // If dropped in the same column, do nothing
    if (ticket.status === newStatus) return;

    try {
      // Optimitically update state for visual fluidity
      setTickets(prev => 
        prev.map(t => t._id === ticket._id ? { ...t, status: newStatus } : t)
      );

      const response = await api.patch(`/tickets/${ticket._id}`, { status: newStatus });
      showToast(`Status updated to '${newStatus.replace('_', ' ')}'`, 'success');
      
      // Update stats and re-fetch to sync times/derived states
      fetchStats();
      fetchTickets();
    } catch (err) {
      console.error(err);
      // Revert optimistic updates on error
      fetchTickets();
      showToast(err.response?.data?.error || 'Invalid state transition', 'error');
    } finally {
      draggedTicketRef.current = null;
    }
  };

  // Handle direct button click transitions
  const handleStatusChange = async (ticket, newStatus) => {
    if (ticket.status === newStatus) return;

    try {
      // Optimistically update state for visual fluidity
      setTickets(prev => 
        prev.map(t => t._id === ticket._id ? { ...t, status: newStatus } : t)
      );

      await api.patch(`/tickets/${ticket._id}`, { status: newStatus });
      showToast(`Status updated to '${newStatus.replace('_', ' ')}'`, 'success');
      
      // Update stats and re-fetch to sync times/derived states
      fetchStats();
      fetchTickets();
    } catch (err) {
      console.error(err);
      // Revert optimistic updates on error
      fetchTickets();
      showToast(err.response?.data?.error || 'Invalid state transition', 'error');
    }
  };

  // Set individual filters
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({ priority: '', breached: '' });
    setSearchTerm('');
  };

  // Client-Side Fuzzy Search Filter
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 p-6 md:p-8 flex flex-col gap-6">
      
      {/* Navbar Banner */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-brand-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/10">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              DeskFlow
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                SLA Triage Board
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Monitor support responses, priority queues, and SLA compliance metrics.
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { fetchTickets(); fetchStats(); showToast('Dashboard synced', 'info'); }}
            className="p-2.5 rounded-xl border border-brand-border hover:border-brand-border-glow bg-[#151b2e] hover:bg-white/5 transition-all text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => { setEditingTicket(null); setIsFormOpen(true); }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </header>

      {/* Metrics Strips */}
      <StatsStrip stats={stats} loading={loading} />

      {/* Control Panel Filter Bar */}
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Swimlane Kanban Board */}
      {loading && tickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 glass rounded-2xl border border-dashed border-slate-800">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fetching ticket board state...
          </span>
        </div>
      ) : (
        <TicketBoard 
          tickets={filteredTickets} 
          onEdit={(t) => { setEditingTicket(t); setIsFormOpen(true); }} 
          onDelete={handleDeleteTicket}
          onDragStart={handleDragStart}
          onTicketDrop={handleTicketDrop}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Slide-out Form Drawer */}
      <TicketFormModal 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTicket(null); }}
        onSubmit={handleFormSubmit}
        ticket={editingTicket}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onClose={handleDismissToast} />

    </div>
  );
};

export default App;
