import mongoose from 'mongoose';

const adminAmountSchema=new mongoose.Schema({
totalAmount:Number,
bettingAmount:Number,
commission:Number,
createdAt: 
{ type: Date, default: Date.now }
 

})

// Define the model for the admin settings
const AdminAmount = mongoose.model('AdminAmount', adminAmountSchema);

export default AdminAmount;
