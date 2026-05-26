const Ticket = require('../models/Ticket');

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
const SLA_LIMITS = { urgent: 60, high: 240, medium: 1440, low: 4320 };

// Helper to construct SLA breach MongoDB query conditions
const getBreachQuery = (isBreached) => {
  const now = new Date();
  const priorities = ['urgent', 'high', 'medium', 'low'];

  const conditions = priorities.map(p => {
    const limitMs = SLA_LIMITS[p] * 60 * 1000;
    const cutOffDate = new Date(now.getTime() - limitMs);

    if (isBreached) {
      return {
        priority: p,
        $or: [
          { resolvedAt: { $exists: true }, $expr: { $gt: [{ $subtract: ["$resolvedAt", "$createdAt"] }, limitMs] } },
          { resolvedAt: { $exists: false }, createdAt: { $lt: cutOffDate } }
        ]
      };
    } else {
      return {
        priority: p,
        $or: [
          { resolvedAt: { $exists: true }, $expr: { $lte: [{ $subtract: ["$resolvedAt", "$createdAt"] }, limitMs] } },
          { resolvedAt: { $exists: false }, createdAt: { $gte: cutOffDate } }
        ]
      };
    }
  });

  return { $or: conditions };
};

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Public
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, customerEmail, priority, status } = req.value || req.body;

    // Check for missing required fields explicitly (additional 400 check)
    if (!subject || !description || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: subject, description, customerEmail'
      });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      customerEmail,
      priority,
      status
    });

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets with filters
// @route   GET /api/tickets
// @access  Public
exports.getTickets = async (req, res, next) => {
  try {
    const queryObj = {};

    // 1. Status Filter
    if (req.query.status) {
      queryObj.status = req.query.status;
    }

    // 2. Priority Filter
    if (req.query.priority) {
      queryObj.priority = req.query.priority;
    }

    // 3. SLA Breached Filter (true/false)
    if (req.query.breached) {
      const isBreached = req.query.breached === 'true';
      const breachFilter = getBreachQuery(isBreached);
      
      // Combine with existing queries using $and
      Object.assign(queryObj, breachFilter);
    }

    const tickets = await Ticket.find(queryObj).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a ticket (supports transition rule checks)
// @route   PATCH /api/tickets/:id
// @access  Public
exports.updateTicket = async (req, res, next) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id of ${req.params.id}`
      });
    }

    const newStatus = req.body.status;

    // Transition rule validation
    if (newStatus && newStatus !== ticket.status) {
      const currentIdx = STATUS_ORDER.indexOf(ticket.status);
      const newIdx = STATUS_ORDER.indexOf(newStatus);

      if (newIdx === -1) {
        return res.status(400).json({
          success: false,
          error: `Invalid status: ${newStatus}. Allowed values are: open, in_progress, resolved, closed.`
        });
      }

      // Check transition step difference (must be exactly +1 or -1)
      const diff = newIdx - currentIdx;
      if (Math.abs(diff) !== 1) {
        const fromStatus = ticket.status.replace('_', ' ');
        const toStatus = newStatus.replace('_', ' ');
        return res.status(400).json({
          success: false,
          error: `Invalid status transition: cannot move directly from '${fromStatus}' to '${toStatus}'. Status transitions must go in order: open ↔ in progress ↔ resolved ↔ closed.`
        });
      }

      // Handle resolvedAt timestamp assignment
      if (newStatus === 'resolved') {
        req.body.resolvedAt = new Date();
      } else if (ticket.status === 'resolved' && newStatus === 'in_progress') {
        // Clear resolvedAt if moving backward from resolved
        req.body.resolvedAt = null;
      }
    }

    // Perform standard updates
    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Public
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket aggregated stats
// @route   GET /api/tickets/stats
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    // 1. Calculate status counts
    const statusAgg = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    statusAgg.forEach(item => {
      if (statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    // 2. Calculate priority counts
    const priorityAgg = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityAgg.forEach(item => {
      if (priorityCounts.hasOwnProperty(item._id)) {
        priorityCounts[item._id] = item.count;
      }
    });

    // 3. Calculate breached count
    const breachFilter = getBreachQuery(true);
    const breachedCount = await Ticket.countDocuments(breachFilter);

    res.status(200).json({
      success: true,
      data: {
        statusCounts,
        priorityCounts,
        breachedCount
      }
    });
  } catch (error) {
    next(error);
  }
};
