
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  
    createdOrderId:{type:String},
    razorpay_order_id: { type: String   },
    razorpay_payment_id: { type: String },
    razorpay_signature:{type: String  },
    amount: { type: Number, required: true },
    currency: { type: String },
    status: { type: String, enum: ['confirm','created','pending', 'successful', 'failed'], required: true },
    // paymentMethod: { type: String },
     transactionType: { type: String, enum: ['account','upi','wallet']},
    receipt:{type:String},
    timestamps: { type: Date, default: Date.now },
    account: { type: String, enum: ['withdraw','credited'], required: true },
    
});


const AdminTransaction = mongoose.model('AdminTransaction', transactionSchema);

export default AdminTransaction;
