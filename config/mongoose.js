import mongoose from 'mongoose';
const url = "mongodb://localhost:27017";


export const connectUsingMongoose = async () => {
    try {
        // await mongoose.connect(url, {
        await mongoose.connect(process.env.DB_URL); 
        console.log("MongoDB connected using mongoose....");
        
    } catch (err) {
        console.log(err);
    }
}