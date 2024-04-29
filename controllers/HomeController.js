import User from "../models/userModel.js";
import Referral from "../models/refferal.js";



// Function to check if a user has logged in every day continuously ,if not i will return last few day when user login
export const checkDailyLoginStreak = async (req, res) => {
    const userID = req.userID;
    try {
        // Find the user by ID
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check the daily streaks
        const streaks = user.dailyStreaks;

        // Check if the streaks array is empty or if the last streak is not from yesterday
        if (!streaks.length || streaks[streaks.length - 1].date.getTime() < today.getTime()) {
            // User did not log in yesterday, streak broken
            return res.status(200).json({ success: false, message: 'User did not log in yesterday' });
        }

        // Check the length of the streaks array
        if (streaks.length < 7) {
            // User has not logged in for 7 consecutive days yet
            const last7Days = streaks.map(streak => streak.date);
            return res.status(200).json({ success: false, message: 'User has not logged in for 7 consecutive days yet', last7Days });
        }

        // Check if the streaks for the last 7 days are continuous
        const continuousDays = [];
        for (let i = streaks.length - 1; i >= streaks.length - 7; i--) {
            const currentDate = new Date(today);
            currentDate.setDate(currentDate.getDate() - (streaks.length - i - 1));
            if (streaks[i].date.getTime() !== currentDate.getTime()) {
                // Streak is not continuous
                const last7Days = streaks.slice(i, i + 7).map(streak => streak.date);
                return res.status(200).json({ success: false, message: 'User has not logged in continuously for 7 days', last7Days });
            }
            continuousDays.push(streaks[i].date);
        }
 
        // Streak is continuous for 7 days
        return res.status(200).json({ success: true, message: 'User has logged in continuously for 7 days', continuousDays });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const firstRechargeReward = async (req, res) => {
    const userId = req.userID;

    try {
        // Check if there are any successful transactions associated with the user
        const successfulTransactions = await Transaction.findOne({ user: userId, status: 'successful' });

        if (successfulTransactions) {
            // User has completed at least one successful recharge
            user.wallet += 20;
            // Implement your logic to reward the user for their first recharge
            return res.json({ success: true, message: "Congratulations! You have completed at least one successful recharge.", Reward:20 });
        } else {
            // User hasn't completed any successful recharge
            return res.json({ success: true, message: "You haven't completed any successful recharge yet." });
        }
    } catch (error) {
        console.error("Error:", error);
        // Send an error response to the client
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



//REWARDS
export const welcomeReward=async (req,res)=>{
    const userId=req.userID;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.wallet += 20;
        await user.save();
let wallet= user.wallet;
        // Return the number of referees and the wallet amount added
        return res.status(200).json({  wallet });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
export const firstInviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 
        // Update the user's wallet
        if(numberOfReferees)
        user.wallet += 20;
       let  walletAmount=user.wallet
        await user.save();

        // Return the number of referees and the wallet amount added
        return res.status(200).json({ numberOfReferees, walletAmount });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order20InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=20){
        user.wallet += 40;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order50InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=50){
        user.wallet += 100;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order100InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=100){
        user.wallet += 1000;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order500InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=500){
        user.wallet += 1000;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order1000InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=1000){
        user.wallet += 2000;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order2000InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=2000){
        user.wallet += 4000;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order3000InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=3000){
        user.wallet += 6000;
         walletAmount=user.wallet
          walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order5000InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=5000){
        user.wallet += 10000;
         walletAmount=user.wallet
         await user.save();
         return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });
 
         }else{
             res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
         }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const order10000InviteReward = async (req, res) => {
    const userId = req.userID;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the referrer exists in the referral schema
        const referral = await Referral.findOne({ referrer: userId });
        if (!referral) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Count the number of referees
        const numberOfReferees = referral.referee.length;
 let walletAmount=0;
        // Update the user's wallet
        if(numberOfReferees>=10000){
        user.wallet += 25000;
         walletAmount=user.wallet;
        await user.save();
        return res.status(200).json({ numberOfReferees, walletAmount,message:"Congratulation you claim this REward " });

        }else{
            res.status(200).json({  message:"you are not eligilble for this    claim   reward,! try some later   " });
        }

        // Return the number of referees and the wallet amount added
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



export const walletUserID = async (req, res) => {
    const userId = req.userID;

    try {
        // Fetch the user from the database
        const user = await User.findById(userId);

        // If user not found, return a 404 Not Found response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract the last 8 digits of the user ID
        const last8Digits = userId.slice(-8);

        // Send the wallet amount and last 8 digits of user ID in the response
        res.json({ Wallet: user.wallet, UserIDLast8Digits: last8Digits });
    } catch (error) {
        // Handle errors and return a 500 Internal Server Error response
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateWallet = async (req, res) => {
    const userId = req.userID;

    try {
        // Fetch the user from the database
        const user = await User.findById(userId);

        // If user not found, return a 404 Not Found response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Send the wallet amount and last 8 digits of user ID in the response
        res.json({ UpdateWallet: user.wallet  });
    } catch (error) {
        // Handle errors and return a 500 Internal Server Error response
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
