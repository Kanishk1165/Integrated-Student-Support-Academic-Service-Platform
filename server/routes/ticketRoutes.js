/**
 * Ticket Routes
 * UniSupport Portal Backend
 */

const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
    validateCreateTicket, 
    validateUpdateTicketStatus, 
    validateTicketId 
} = require('../middleware/ticketValidation');
const { 
    ticketCreationLimiter, 
    ticketUpdateLimiter,
    sanitizeInput 
} = require('../middleware/security');

// Import ticket controller
const {
    createTicket,
    getMyTickets,
    getAllTickets,
    updateTicketStatus,
    getTicketById
} = require('../controllers/ticketController');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// @route   POST /api/tickets
// @desc    Create new ticket
// @access  Private (Student only)
router.post(
    '/',
    ticketCreationLimiter,
    authMiddleware,
    roleMiddleware('student'),
    validateCreateTicket,
    createTicket
);

// @route   GET /api/tickets/my
// @desc    Get current student's tickets
// @access  Private (Student only)
router.get(
    '/my',
    authMiddleware,
    roleMiddleware('student'),
    getMyTickets
);

// @route   GET /api/tickets
// @desc    Get all tickets (with admin statistics)
// @access  Private (Admin only)
router.get(
    '/',
    authMiddleware,
    roleMiddleware('admin'),
    getAllTickets
);

// @route   GET /api/tickets/:id
// @desc    Get ticket by ID
// @access  Private (Student can see own tickets, Admin can see all)
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('student', 'admin', 'department'),
    validateTicketId,
    getTicketById
);

// @route   PUT /api/tickets/:id/status
// @desc    Update ticket status
// @access  Private (Department only)
router.put(
    '/:id/status',
    ticketUpdateLimiter,
    authMiddleware,
    roleMiddleware('department'),
    validateUpdateTicketStatus,
    updateTicketStatus
);

module.exports = router;
