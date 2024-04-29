import mongoose from 'mongoose';

// Define the schema for the admin settings
const userStatSchema = new mongoose.Schema({
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    inactiveUsers: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

// Define the model for the admin settings
const UserStats = mongoose.model('UserStats', userStatSchema);

export default UserStats;
