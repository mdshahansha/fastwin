import mongoose from 'mongoose';

const supportSchema=new mongoose.Schema({
    
     email:String,
     name:String,
     support:String,
  
})
 
const Support = mongoose.model('Support', supportSchema);
export default Support;