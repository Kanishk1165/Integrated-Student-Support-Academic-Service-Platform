/**
 * Ticket Controller
 * UniSupport Portal Backend
 */

const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create new ticket
 * @route POST /api/tickets
 * @access Private (Student only)
 */
const createTicket = asyncHandler(async (req, res) => {
    const { title, description, category, priority } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
        return res.status(400).json({
            success: false,
            message: 'Please provide title, description, and category'
        });
    }

    // Create ticket object
    const ticketData = {
        title,
        description,
        category,
        studentId: req.user.id, // From auth middleware
        status: 'open' // Default status
    };

    // Add priority if provided
    if (priority) {
        ticketData.priority = priority;
    }

    // Create and save ticket
    const ticket = await Ticket.create(ticketData);

    // Populate student information for response (exclude sensitive data)
    await ticket.populate('studentId', 'name email role');

    res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket
    });
});

/**
 * Get current user's tickets
 * @route GET /api/tickets/my
 * @access Private (Student only)
 */
const getMyTickets = asyncHandler(async (req, res) => {
        const { status, category, page = 1, limit = 10 } = req.query;

        // Build filter object
        const filter = { studentId: req.user.id };

        // Add optional filters
        if (status) filter.status = status;
        if (category) filter.category = category;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get tickets with pagination
        const tickets = await Ticket.find(filter)
            .populate('departmentId', 'name email')
            .populate('assignedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Ticket.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'Tickets retrieved successfully',
        data: {
            tickets,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTickets: total,
                hasNext: skip + tickets.length < total,
                hasPrev: page > 1
            }
        }
    });
});

/**
 * Get all tickets
 * @route GET /api/tickets
 * @access Private (Admin only)
 */
const getAllTickets = asyncHandler(async (req, res) => {
        const { status, category, studentId, page = 1, limit = 10 } = req.query;

        // Build filter object
        const filter = {};

        // Add optional filters
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (studentId) filter.studentId = studentId;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get tickets with pagination and populate related data
        const tickets = await Ticket.find(filter)
            .populate('studentId', 'name email role studentId')
            .populate('departmentId', 'name email role')
            .populate('assignedBy', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Ticket.countDocuments(filter);

        // Get statistics
        const statusStats = await Ticket.getStats();
        const categoryStats = await Ticket.getCategoryStats();

        res.status(200).json({
            success: true,
            message: 'All tickets retrieved successfully',
            data: {
                tickets,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalTickets: total,
                    hasNext: skip + tickets.length < total,
                    hasPrev: page > 1
                },
                statistics: {
                    status: statusStats,
                    category: categoryStats
                }
            }
        });
    });

/**
 * Update ticket status
 * @route PUT /api/tickets/:id/status
 * @access Private (Department only)
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, comment } = req.body;

        // Validate status
        const validStatuses = ['in_progress', 'resolved', 'closed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status (in_progress, resolved, closed)'
            });
        }

        // Find ticket
        const ticket = await Ticket.findById(id)
            .populate('studentId', 'name email')
            .populate('departmentId', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Validate status transitions
        const validTransitions = {
            'open': ['in_progress', 'closed'],
            'in_progress': ['resolved', 'closed'],
            'resolved': ['closed', 'in_progress'], // Can reopen if needed
            'closed': [] // Cannot transition from closed
        };

        if (!validTransitions[ticket.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${ticket.status}' to '${status}'. Valid transitions: ${validTransitions[ticket.status].join(', ')}`
            });
        }

        // Additional authorization: Department users can only update tickets they are assigned to or unassigned tickets
        if (req.user.role === 'department') {
            // If ticket is already assigned to a department and it's not this user, deny access
            if (ticket.departmentId && ticket.departmentId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. This ticket is assigned to another department.'
                });
            }
        }

        // Update ticket status and assign department if not already assigned
        ticket.status = status;
        if (!ticket.departmentId) {
            ticket.departmentId = req.user.id;
        }
        ticket.assignedBy = req.user.id;

        // Add to status history with comment
        ticket.statusHistory.push({
            status: status,
            changedBy: req.user.id,
            changedAt: new Date(),
            comment: comment || `Status updated to ${status}`
        });

        await ticket.save();

        // Populate the updated ticket
        await ticket.populate([
            { path: 'studentId', select: 'name email' },
            { path: 'departmentId', select: 'name email' },
            { path: 'assignedBy', select: 'name email' },
            { path: 'statusHistory.changedBy', select: 'name email' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Ticket status updated successfully',
            data: ticket
        });
    });

/**
 * Get single ticket by ID
 * @route GET /api/tickets/:id
 * @access Private (Student: own tickets, Admin: all tickets, Department: assigned tickets)
 */
const getTicketById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const ticket = await Ticket.findById(id)
            .populate('studentId', 'name email role studentId')
            .populate('departmentId', 'name email role')
            .populate('assignedBy', 'name email role')
            .populate('statusHistory.changedBy', 'name email role');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Authorization check
        if (req.user.role === 'student' && ticket.studentId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own tickets'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ticket retrieved successfully',
            data: ticket
        });
    });

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets,
    updateTicketStatus,
    getTicketById
};
