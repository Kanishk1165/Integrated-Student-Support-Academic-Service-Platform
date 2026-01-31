/**
 * Ticket Validation Rules
 * UniSupport Portal Backend
 */

const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validation');

/**
 * Validate ticket creation
 */
const validateCreateTicket = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters')
        .escape(), // Prevent XSS

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters')
        .escape(), // Prevent XSS

    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Exam', 'Attendance', 'Internship', 'Scholarship', 'Other'])
        .withMessage('Category must be one of: Exam, Attendance, Internship, Scholarship, Other'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be one of: low, medium, high'),

    // Security: Prevent studentId from being sent in request body
    body('studentId')
        .not()
        .exists()
        .withMessage('Student ID cannot be provided in request body'),

    handleValidationErrors
];

/**
 * Validate ticket status update
 */
const validateUpdateTicketStatus = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ticket ID format'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['in_progress', 'resolved', 'closed'])
        .withMessage('Status must be one of: in_progress, resolved, closed'),

    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comment cannot be more than 500 characters')
        .escape(), // Prevent XSS

    handleValidationErrors
];

/**
 * Validate ticket ID parameter
 */
const validateTicketId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ticket ID format'),
    
    handleValidationErrors
];

module.exports = {
    validateCreateTicket,
    validateUpdateTicketStatus,
    validateTicketId
};
