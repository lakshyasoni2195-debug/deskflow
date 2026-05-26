const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  getStats
} = require('../controllers/ticketController');

// Aggregate Stats endpoint (Must be loaded BEFORE parameter-based /:id route)
router.route('/stats').get(getStats);

// General tickets collection routes
router.route('/')
  .post(createTicket)
  .get(getTickets);

// Specific ticket resource routes
router.route('/:id')
  .patch(updateTicket)
  .delete(deleteTicket);

module.exports = router;
