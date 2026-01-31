/**
 * Database Seeder
 * UniSupport Portal Backend - Seeds initial data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample departments data
const departments = [
    {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Engineering'
    },
    {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Department of Mathematics'
    },
    {
        name: 'Physics',
        code: 'PHY',
        description: 'Department of Physics'
    },
    {
        name: 'Chemistry',
        code: 'CHEM',
        description: 'Department of Chemistry'
    },
    {
        name: 'Biology',
        code: 'BIO',
        description: 'Department of Biology'
    },
    {
        name: 'English',
        code: 'ENG',
        description: 'Department of English Literature'
    },
    {
        name: 'Business Administration',
        code: 'BA',
        description: 'Department of Business Administration'
    },
    {
        name: 'Registrar Office',
        code: 'REG',
        description: 'Student Registration and Academic Records'
    },
    {
        name: 'Student Affairs',
        code: 'SA',
        description: 'Student Affairs and Support Services'
    },
    {
        name: 'IT Support',
        code: 'IT',
        description: 'Information Technology Support Department'
    }
];

// Seed departments
const seedDepartments = async () => {
    try {
        // Clear existing departments
        await Department.deleteMany();
        console.log('🗑️  Cleared existing departments');

        // Insert sample departments
        const createdDepartments = await Department.insertMany(departments);
        console.log(`✅ Seeded ${createdDepartments.length} departments`);
        
        // Display created departments
        console.log('\n📋 Created Departments:');
        createdDepartments.forEach(dept => {
            console.log(`  • ${dept.code}: ${dept.name} (ID: ${dept._id})`);
        });

        return createdDepartments;
    } catch (error) {
        console.error('❌ Error seeding departments:', error);
        throw error;
    }
};

// Main seeder function
const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('\n🌱 Starting database seeding...\n');

        await seedDepartments();

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\nYou can now register department users with any of the above department IDs.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = {
    seedDatabase,
    seedDepartments,
    departments
};
