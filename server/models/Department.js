/**
 * Department Model Schema
 * UniSupport Portal Backend
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a department name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Department name cannot be more than 100 characters']
    },
    code: {
        type: String,
        required: [true, 'Please provide a department code'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [10, 'Department code cannot be more than 10 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient searching
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);
