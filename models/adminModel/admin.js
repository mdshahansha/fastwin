import mongoose from 'mongoose';

// Define the schema for the admin settings
const AdminSettingsSchema = new mongoose.Schema({
    totalAdminAmount: { type: Number, default: 0 },
    appAmount: { type: Number, default: 0 },
    adminAmount: { type: Number, default: 0 },
    registeredUsers: { type: Number, default: 0 },
    withdrawalRequests: { type: Number, default: 0 }
});

// Define the model for the admin settings
const AdminSettings = mongoose.model('AdminSettings', AdminSettingsSchema);

export default AdminSettings;
