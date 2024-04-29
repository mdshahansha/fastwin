import express from 'express';
import Referral from '../models/refferal.js';
import User from '../models/userModel.js';
import url from 'url';
import nodemailer from 'nodemailer'

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Endpoint to create a referral  router.post('/referrals',
export const privilege= async (req, res) => {
    try {
        const { referrerId, refereeId } = req.body;

        // Check if referrer and referee exist
        const referrer = await User.findById(referrerId);
        const referee = await User.findById(refereeId);

        const referrerLevel=await Referral.findById(referrerId)
        if (!referrer || !referee) {
            return res.status(404).json({ message: 'Referrer or referee not found' });
        }

        // Determine the referral level based on the referrer
        let level = 1; // Default level is 1 (direct referral)
        const referrerReferral = await Referral.findOne({ referee: referrerId });
        const refereeReferral=await Referral.findById();
        if (referrerReferral) {
            const referrerOfReferrer = await User.findById(referrerReferral.referrer);
            if (referrerOfReferrer) {
                level = 2; // Second-level referral
                const referrerOfReferrerReferral = await Referral.findOne({ referee: referrerOfReferrer._id });
                if (referrerOfReferrerReferral) {
                    level = 3; // Third-level referral
                }
            }
        }

        // Create the referral
        const referral = new Referral({
            referrer: referrerId,
            referee: refereeId,
            amount: amount,
            level: level
        });

        await referral.save();

        // Calculate referral amount based on the referral level
        let referralAmount = amount;
        if (level === 2) {
            referralAmount *= 0.3; // Second-level referral gets 30%
        } else if (level === 3) {
            referralAmount *= 0.2; // Third-level referral gets 20%
        }

        // Update user balances based on referral
        referrer.wallet += amount * 0.4; // Referrer gets 40%
        referee.wallet += referralAmount; // Referee gets referral amount
        await referrer.save();
        await referee.save();

        res.status(201).json({ message: 'Referral created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add more endpoints for retrieving referrals, etc.

 
export const referralRanking = async (req, res) => {
    try {
        const data = {
            ranking: [
                { rank: 1, name: "John Doe", referrals: 20 },
                { rank: 2, name: "Jane Smith", referrals: 15 },
                { rank: 3, name: "Alice Johnson", referrals: 12 }
            ]
        };

        res.status(200).json({ success: true, message:"comming soon ",data: data });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const agencyPrivilge = async (req, res) => {
    try {
        const data = {
            heading: "3 level invites each user generate Commission",
            levels: [
                { level: 1, commission: "40%" },
                { level: 2, commission: "30%" },
                { level: 3, commission: "20%" }
            ]
        };
 

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const createMyLinkAndCode = async (req, res) => {
    const userID  = req.userID;
    try {
        // Find the user document by userID
        const user = await User.findOne({ _id: userID });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const level = user.level; // Assuming 'level' is the property in the User schema

        // Construct referral URL
        const baseUrl = 'https://localhost:3000/verifyOtpAndRegisterUser';
        const queryParams = {
            userID: userID,
            level: level
        };
        const referralUrl = url.format({ pathname: baseUrl, query: queryParams });

        // Generate referral code
        let combinedString = userID.toString() + level.toString();
        if (combinedString.length > 6) {
            combinedString = combinedString.substring(0, 6);
        }
        combinedString = combinedString.padEnd(6, '0');
        const referralCode = combinedString;

        // Update user document with referral information
        const updatedUser = await User.findOneAndUpdate(
            { _id: userID }, 
            { referralUrl: referralUrl, referralCode: referralCode },
            { new: true } 
        );
// console.log(' _ ',updatedUser)
        if (!updatedUser) {
            return res.status(404).json({ message: 'Failed to update user' });
        }

        return res.json({ referralUrl, referralCode });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getMyReferralLinkAndCode = async (req, res) => {
    const userId = req.userID;
    try {
        // Find the user document by userID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract referral link and code from the user document
        const referralUrl = user.referralUrl;
        const referralCode = user.referralCode;

        // Return referral link and code in the response
        return res.json({ referralUrl, referralCode });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const inviteLinkByEmail = async (req, res) => {
    const userId = req.userID;
    const { recipientEmail } = req.body;

    try {
        console.log("user ",userId)
        // Find the user document by userID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract referral link from the user document
        const referralLink = user.referralUrl;
        const referralCode = user.referralCode;


        // Create a transporter with Gmail service
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NODE_EMAIL, 
                pass: "wjpdhgwpbtibgbas",
            },
        });

        // Define email options
        let mailOptions = { 
            from: process.env.NODE_EMAIL,
            to: recipientEmail,
            subject: 'Referral Link ',
            html: `<div><p>Here is your referral link: <a href="${referralLink}">${referralLink}</a></p> <br> <p><h1>Referral Code FAST win</h1> ${referralCode}</p>  </div>`,
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
        return res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

 
export const agentMillionariePlan = async (req, res) => {
    const userId = req.userId;

    try {
        // Check if the userId exists as a referrer in the referralSchema
        const referral = await Referral.findOne({ referrer: userId });

        if (!referral) {
            return res.status(404).json({ message: 'User is not a referrer' });
        }

        // Find the length of the referee array associated with the referrer
        const refereeCount = referral.referee.length;

        let amountToAdd = 0;

        // Determine the amount to add to the user's wallet based on refereeCount
        if (refereeCount >= 1 && refereeCount < 5) {
            amountToAdd = 80;
        } else if (refereeCount >= 5 && refereeCount < 10) {
            amountToAdd = 400;
        } else if (refereeCount >= 10 && refereeCount < 30) {
            amountToAdd = 1300;
        } else if (refereeCount >= 30 && refereeCount < 50) {
            amountToAdd = 10000;
        } else if (refereeCount >= 50 && refereeCount < 100) {
            amountToAdd = 35000;
        } else if (refereeCount >= 100 && refereeCount < 500) {
            amountToAdd = 480000;
        } else if (refereeCount >= 500) {
            amountToAdd = 1400000;
        }

        // Update the user's wallet with the calculated amount
        const user = await User.findOneAndUpdate(
            { _id: userId },  
            { $inc: { wallet: amountToAdd } }, // Increment wallet amount
            { new: true }  
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(refereeCount==0){
            return res.status(201).json({ message: 'Please referr to Friends and get a change to win' });

        }
        return res.json({ success:true,message:"Congratulation ",refereeCount, amountAdded: amountToAdd, walletAmount: user.wallet });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const updateReferralSchema = async (referrerId, refereeId) => {
    try {
        // Find the referral document associated with the referrer
        const referral = await Referral.findOne({ referrer: referrerId });

        if (!referral) {
            // If no referral document found, create a new one
            const newReferral = new Referral({
                referrer: referrerId,
                referee: [refereeId], // Add the referee to the referee array
                amount: 100, // Assuming a default amount of 100
                level: 1, // Assuming a default level of 1
                createdAt: new Date()
            });
            await newReferral.save(); // Save the new referral document
        } else {
            // If referral document found, update the referee array
            referral.referee.push(refereeId);
            await referral.save(); // Save the updated referral document
        }

        console.log("Referral schema updated successfully");
    } catch (error) {
        console.error("Error updating referral schema:", error);
    }
}



export const getReferAll = async (req, res) => {
    try {
        // Find all documents in the Referral collection
        const allReferrals = await Referral.find();

        // If no referrals found, return empty array
        if (!allReferrals || allReferrals.length === 0) {
            return res.json({ message: 'No referral data found' });
        }

        // Return the list of referral data
        return res.json({ referrals: allReferrals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAgentAmount = async (req, res) => {
    const userId = req.userID;

    try {
        // Find the referral by user ID
        const referral = await Referral.findOne({ referrer: userId });
        
        // If referral not found, return a 404 Not Found response
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        // Get the agent amount from the referral
        const agentAmount = referral.agentAmount;

        // Send the agent amount in the response
        res.json({ AgentAmount: agentAmount });
    } catch (error) {
        // Handle errors and return a 500 Internal Server Error response
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//export const getAgent Amount to withdraw money  =async










 

export const fetchReferralCounts = async (req, res) => {
    const userId = req.userID;
    try {
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ error: "No referral found for the user" });
        }

        let level1Count = 0;
        let level2Count = 0;
        let level3Count = 0;
        let level4Count = 0;

        for (const refereeId of referral.referee) {
            const user = await User.findById(refereeId);
            if (!user) {
                continue; // Skip if user not found
            }
            switch (user.level) {
                case 1:
                    level1Count++;
                    break;
                case 2:
                    level2Count++;
                    break;
                case 3:
                    level3Count++;
                    break;
                case 4:
                    level4Count++;
                    break;
                default:
                    break;
            }
        }

        const totalCount = level1Count + level2Count + level3Count + level4Count;

        return res.json({
            "totalInvites": totalCount,
            "level 1 Count": level1Count,
            "level 2 Count": level2Count,
            "level 3 Count": level3Count,
            "level 4 Count": level4Count,
           
        });
    } catch (error) {
        console.error("Error fetching referral counts:", error);
        return res.status(500).json({ error: "Failed to fetch referral counts" });
    }
};

export const invitedToday = async (req, res) => {
    const userId = req.userID;
    try {
        // Find the referral document associated with the user
        const referral = await Referral.findOne({ referrer: userId });

        if (!referral) {
            return res.status(404).json({ error: "No referral found for the user" });
        }

        // Fetch details for referees registered today
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0]; // Get today's date in string format (YYYY-MM-DD)

        const refereeDetailsToday = [];

        for (const refereeId of referral.referee) {
            const user = await User.findById(refereeId);
            if (!user) {
                continue; // Skip if user not found
            }

            // Check if the user's registration date is today
            const registrationDate = new Date(user.createdAt);
            const registrationDateString = registrationDate.toISOString().split('T')[0];
            if (registrationDateString === todayDateString) {
                refereeDetailsToday.push({
                    User: user._id,
                    level: user.level,
                    registrationDate: user.createdAt
                });
            }
        }

        return res.json(refereeDetailsToday);
    } catch (error) {
        console.error("Error fetching referral details for today:", error);
        return res.status(500).json({ error: "Failed to fetch referral details for today" });
    }
};


export const todayIncome = async (req, res) => {
    const userId = req.userID;

    try {
        // Find the referral document associated with the user
        const referral = await Referral.findOne({ referrer: userId });

        if (!referral) {
            return res.status(404).json({ error: "No referral found for the user" });
        }

        // Calculate daily earnings for the user
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentMonth = currentDate.getMonth() + 1; // Month is zero-based, so add 1
        const currentYear = currentDate.getFullYear();

        const dailyEarnings = {};

        for (const dailyEarn of referral.dailyEarnings) {
            if (
                dailyEarn.day === currentDay &&
                dailyEarn.month === currentMonth &&
                dailyEarn.year === currentYear
            ) {
                // Calculate total earnings for the day
                const totalEarnings = dailyEarn.earnings.reduce((acc, earnings) => acc + earnings, 0);
                dailyEarnings[currentDate.toISOString().split('T')[0]] = totalEarnings;
            }
        }

        return res.json(dailyEarnings);
    } catch (error) {
        console.error("Error fetching today's income:", error);
        return res.status(500).json({ error: "Failed to fetch today's income" });
    }
};

//retrieve the latest 5 entries from the dailyEarnings 
export const incomeDetails = async (req, res) => {
    const userId = req.userID;

    try {
        // Find the referral document associated with the user
        const referral = await Referral.findOne({ referrer: userId });

        if (!referral) {
            return res.status(404).json({ error: "No referral found for the user" });
        }

        // Aggregate earnings by date
        const earningsByDate = new Map();
        referral.dailyEarnings.forEach(earning => {
            const date = new Date(earning.year, earning.month - 1, earning.day).toDateString();
            if (earningsByDate.has(date)) {
                // Add earnings to existing date entry
                earningsByDate.get(date).earnings += earning.earnings.reduce((acc, curr) => acc + curr, 0);
            } else {
                // Create new date entry
                earningsByDate.set(date, {
                    day: earning.day,
                    month: earning.month,
                    year: earning.year,
                    earnings: earning.earnings.reduce((acc, curr) => acc + curr, 0)
                });
            }
        });

        // Convert map values to array
        const uniqueEarnings = Array.from(earningsByDate.values());

        // Sort the earnings by date in descending order
        uniqueEarnings.sort((a, b) => {
            const dateA = new Date(a.year, a.month - 1, a.day);
            const dateB = new Date(b.year, b.month - 1, b.day);
            return dateB - dateA;
        });

        // Get the latest 5 earnings
        const latestEarnings = uniqueEarnings.slice(0, 5);

        return res.json(latestEarnings);
    } catch (error) {
        console.error("Error fetching income details:", error);
        return res.status(500).json({ error: "Failed to fetch income details" });
    }
};
