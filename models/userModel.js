import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const adminDataSchema = new Schema({
    accountNumber: String,
    ifscCode: String,
     
});


const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    otp: {
        code: {
            type: String
        },
        createdAt: {
            type: Date
        }
    },
    referralUrl: {
        type: String,
        // immutable: true // Referral URL cannot be updated after creation
    },
    referenceCode: String,
    referralCode: {
        type: String,//this code is sharing to another ones
    },
    wallet: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    games: [{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }],
    createdAt: {
        type: Date
    },
    lastLogin: Date,
    profilePhoto:{
        type:String,
    },
    dailyStreaks: [{
        date: Date,
        streak: { type: Number, default: 0 },
        _id:false
    }],

    //admin
    isAdmin: {
        type: Boolean,
        default: false // Set default value to false for regular users
    },
    adminData: {
        type: adminDataSchema, // Reference the admin data schema
    }

});

userSchema.pre('save', function (next) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${currentDate.getMonth() + 1} ${currentDate.getFullYear()}`;
    this.createdAt = formattedDate;
    next();
});

userSchema.pre('save', function (next) {
    if (this.isModified('referralUrl') || this.isModified('referralCode')) {
        return next(new Error('Referral URL and Referral Code cannot be updated after creation'));
    }
    next();
});

const User = mongoose.model('User', userSchema);
// Pre-save hook to ensure referralUrl and referralCode are only updated once

export default User;
