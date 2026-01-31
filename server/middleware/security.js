/**
 * Security Middleware
 * UniSupport Portal Backend
 */

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Rate limiting for ticket creation to prevent spam
 */
const ticketCreationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 ticket creations per windowMs
    message: {
        success: false,
        message: 'Too many tickets created from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiting for ticket status updates
 */
const ticketUpdateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 updates per minute
    message: {
        success: false,
        message: 'Too many ticket updates from this IP. Please try again in a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Sanitize user input to prevent NoSQL injection attacks
 */
const sanitizeInput = (req, res, next) => {
    // Remove any keys that start with '$' or contain '.'
    req.body = mongoSanitize.sanitize(req.body);
    req.query = mongoSanitize.sanitize(req.query);
    req.params = mongoSanitize.sanitize(req.params);
    next();
};

module.exports = {
    ticketCreationLimiter,
    ticketUpdateLimiter,
    apiLimiter,
    sanitizeInput
};
