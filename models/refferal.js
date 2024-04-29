import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const referralSchema = new Schema({
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referee: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    // refereeReferralDate: { type: Date }, // Track when a referrer referred someone
    dailyEarnings: [
        {
            day: { type: Number },
            month: { type: Number },
            year: { type: Number },
            earnings: [{ type: Number }],
            _id:false
        }
    ],  
    agentAmount: { type: Number, required: true, default: 100 },
    
});

// Mongoose middleware to update day, month, and year before saving
// referralSchema.pre('save', function (next) {
//     const currentDate = new Date();
//     const currentDay = currentDate.getDate();
//     const currentMonth = currentDate.getMonth() + 1; // Month is zero-based, so add 1
//     const currentYear = currentDate.getFullYear();

//     // Check if there is a dailyEarnings object for the current day
//     const existingDailyEarnings = this.dailyEarnings.find((dailyEarning) => {
//         return dailyEarning.day === currentDay && dailyEarning.month === currentMonth && dailyEarning.year === currentYear;
//     });

//     // If no existing dailyEarnings object for the current day, create one
//     if (!existingDailyEarnings) {
//         this.dailyEarnings.push({
//             day: currentDay,
//             month: currentMonth,
//             year: currentYear,
//             earnings: []
//         });
//     }

//     next();
// });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;









// import mongoose from 'mongoose';

// const Schema = mongoose.Schema;

// const referralSchema = new Schema({
//     referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     referee: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
//     amount: { type: Number, required: true,default:100 },
//     agentAmount: { type: Number, required: true,default:100 },
    
//     level: { type: Number, required: true ,default:1}, // Added to track the referral level
//     createdAt: { type: Date, default: Date.now },

// });

// const Referral = mongoose.model('Referral', referralSchema);

// export default Referral;


// import mongoose from 'mongoose';
