import mongoose from 'mongoose';

const bettingDetailSchema=new mongoose.Schema({
totalbets:Number,
bettingamount:Number,
userProfit:Number,
adminProfit:Number,
createdAt: { type: Date, default: Date.now }

})

// Define the model for the admin settings
const BettingDetail = mongoose.model('BettingDetail', bettingDetailSchema);

export default BettingDetail;
