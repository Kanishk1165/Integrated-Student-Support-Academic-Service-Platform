/**
 * Role-based Access Control Middleware
 * UniSupport Portal Backend
 */

/**
 * Role middleware factory - Accept roles as parameter and allow access only if req.user.role matches
 * @param {...string} roles - Allowed roles (student, admin, department)
 * @returns {Function} Middleware function
 */
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        try {
            // Check if user exists (should be set by authMiddleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. Please login first.'
                });
            }

            // Check if user's role is in allowed roles
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Role '${req.user.role}' is not authorized for this resource. Required roles: ${roles.join(', ')}`
                });
            }

            // User has required role, proceed
            next();
            
        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error during role verification'
            });
        }
    };
};

module.exports = roleMiddleware;
