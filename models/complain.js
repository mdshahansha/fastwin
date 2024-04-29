import mongoose from 'mongoose';
const { Schema } = mongoose;

const complainSchema=new mongoose.Schema({
    user: { 
        type:Schema.Types.ObjectId,
        ref: 'User'
     },
     email:String,
     name:String,
     complainBody:String,
     ticketNumber:Number,
     status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending' // Default status is set to 'pending'
    }
})
 
const Complain = mongoose.model('Complain', complainSchema);
export default Complain;