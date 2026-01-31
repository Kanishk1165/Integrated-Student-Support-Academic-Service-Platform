/**
 * User Model Schema
 * UniSupport Portal Backend
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'admin', 'department'],
            message: 'Role must be either student, admin, or department'
        },
        default: 'student'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: function() {
            return this.role === 'department';
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for performance (email index is created automatically by unique: true)
userSchema.index({ role: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function() {
    // Only hash password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
