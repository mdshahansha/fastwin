import mongoose from 'mongoose';

// Define the schema for the admin settings
const AdminRevenueSchema = new mongoose.Schema({
    AdminProfit: { type: Number, default: 0 },
    gameType:String,
    createdAt: { type: Date, default: Date.now }
});

// Define the model for the admin settings
const AdminRevenue = mongoose.model('AdminRevenue', AdminRevenueSchema);

export default AdminRevenue;
