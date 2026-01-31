/**
 * Ticket Model Schema
 * UniSupport Portal Backend
 */

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a ticket title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a ticket description'],
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Please provide a ticket category'],
        enum: {
            values: ['Exam', 'Attendance', 'Internship', 'Scholarship', 'Other'],
            message: 'Category must be one of: Exam, Attendance, Internship, Scholarship, Other'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['open', 'in_progress', 'resolved', 'closed'],
            message: 'Status must be one of: open, in_progress, resolved, closed'
        },
        default: 'open'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID is required']
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // References department user, not department record
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Additional useful fields
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    
    // For tracking status changes
    statusHistory: [{
        status: {
            type: String,
            enum: ['open', 'in_progress', 'resolved', 'closed']
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        comment: String
    }]
    
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
ticketSchema.index({ studentId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ departmentId: 1 });
ticketSchema.index({ createdAt: -1 });

// Virtual to populate student information
ticketSchema.virtual('student', {
    ref: 'User',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true
});

// Virtual to populate department information
ticketSchema.virtual('department', {
    ref: 'User',
    localField: 'departmentId',
    foreignField: '_id',
    justOne: true
});

// Virtual to populate assigned by information
ticketSchema.virtual('assignedByUser', {
    ref: 'User',
    localField: 'assignedBy',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware to add status history
ticketSchema.pre('save', function() {
    // If status is being modified and it's not a new document
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date()
        });
    }
});

// Static method to get ticket statistics
ticketSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    return stats;
};

// Static method to get category statistics
ticketSchema.statics.getCategoryStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);
    return stats;
};

module.exports = mongoose.model('Ticket', ticketSchema);
