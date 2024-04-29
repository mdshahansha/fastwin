import mongoose from 'mongoose';

const depositSchema=new mongoose.Schema({
depositedAmount:Number,
total:Number,
createdAt: { type: Date, default: Date.now }
})

// Define the model for the admin settings
const Deposit = mongoose.model('DepositAmount', depositSchema);

export default Deposit;
