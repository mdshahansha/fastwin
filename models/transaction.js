
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdOrderId:{type:String},
    razorpay_order_id: { type: String   },
    razorpay_payment_id: { type: String },
    razorpay_signature:{type: String  },
    withoutTaxAmount:{ type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['confirm','created','pending', 'successful', 'failed'], required: true },
    // paymentMethod: { type: String },
    product: {
        name: { type: String,default:"Recharge" },
        description: { type: String,default:"Game FastWin" }
        // Add more fields as needed
    },
    transactionType: { type: String, enum: ['account','upi','wallet']},

    receipt:{type:String},
    timestamps: { type: Date, default: Date.now },
});


const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
