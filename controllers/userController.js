import twilio from 'twilio'
import User from '../models/userModel.js'
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import Game from '../models/game.js';
import Referral from '../models/refferal.js';
import {blacklistedTokens} from '../server.js'

dotenv.config();


const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
console.log("   -----   ",twilioClient)
export const sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        // Generate random OTP
        const generatedOTP = Math.floor(100000 + Math.random() * 900000);

        // Save OTP to user document if user exists
        let user = await User.findOneAndUpdate( 
            { phoneNumber },
            { $set: { otp: { code: generatedOTP.toString(), createdAt: new Date() } } },
            { new: true }
        );

        // If user doesn't exist, create a new user
        if (!user) {
            user = await User.create({ phoneNumber }); // Create a new user with phone number
        }

        // Send OTP via Twilio
        await twilioClient.messages.create({
            body: `Your OTP is: ${generatedOTP}`,
            from: "+16592082991",
            to: phoneNumber
        });

        return res.json({ user, message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send OTP');
    }
};


export const verifyOtpAndRegisterUser = async (req, res) => {
    const { phoneNumber, otp, password, referenceCode, confirm_password } = req.body;
    try {
        // Find user by phone number and OTP
        const user = await User.findOne({ phoneNumber, 'otp.code': otp });

        if (!user) {
            throw new Error('Invalid OTP');
        }

        // Check if the reference code is provided and valid
        if (referenceCode) {
            const referrer = await User.findOne({ referralCode: referenceCode });
            user.referenceCode=referenceCode;//saving the referecode used by User
                
            if (!referrer) {
                throw new Error('Invalid reference code');
            }

            // Update the referral schema
            await updateReferralSchema(referrer._id, user._id);
        }

        // Check if password matches confirm_password
        if (confirm_password !== password) {
            throw new Error('confirm_password does not match with password');
        }

        // Update user's password
        user.password = password; 
           // Update the lastLogin field to the current date
           user.lastLogin = new Date();
        await user.save();

        return res.json({ user, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};

const updateReferralSchema = async (referrerId, refereeId) => {
    try {
        // Find the referral document associated with the referrer
        const referral = await Referral.findOne({ referrer: referrerId });
        // const referralUser = await User.findOne(referrerId);

        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentMonth = currentDate.getMonth() + 1; // Month is zero-based, so add 1
        const currentYear = currentDate.getFullYear();

        if (!referral) {
            // If no referral document found, create a new one
            const newReferral = new Referral({
                referrer: referrerId,
                referee: [refereeId], // Add the referee to the referee array
                dailyEarnings: [{
                    day: currentDay,
                    month: currentMonth, 
                    year: currentYear,
                    earnings: [100] // Assuming the default earnings for the current day is 100
                }],        
                agentAmount: 100, // Assuming a default amount of 100
                createdAt: new Date()
            });
            await newReferral.save(); // Save the new referral document
        } else {
            // If referral document found, update the referee array
            referral.referee.push(refereeId);

            // 1. Update dailyEarnings.earnings
           

            const dailyEarnings = referral.dailyEarnings.find((dailyEarning) => {
                return dailyEarning.day === currentDay && dailyEarning.month === currentMonth && dailyEarning.year === currentYear;
            });
  // 3. Update the createdAt date of refereeId (assuming you want to update the createdAt field of the referee user)
         const refereeUser = await User.findByIdAndUpdate(refereeId, { createdAt: new Date() });
        //  referral.dailyEarnings.ear/
                // console.log(' date  ',referral.dailyEarnings)             
  // 2. Update the agentAmount based on the referrer's level (Assuming the level is stored in User schema)
                 const referrer = await User.findById(referrerId);
            if (dailyEarnings) {
                if (referrer) {
                    switch (referrer.level) {
                        case 1:
                            dailyEarnings.earnings.push(100); // Update with appropriate amount based on level
                            referral.agentAmount += 100; // Update with appropriate amount based on level
                            refereeUser.level=2
                            break;
                        case 2:
                            dailyEarnings.earnings.push(100*(0.40)); // Update with appropriate amount based on level
                            referral.agentAmount += 100*(0.40);
                            refereeUser.level=3
                            break;
                        case 3:
                            dailyEarnings.earnings.push(100*(0.30)); // Update with appropriate amount based on level
                            referral.agentAmount += 100*(0.30);
                            refereeUser.level=4
                            break;
                        case 4:
                            dailyEarnings.earnings.push(100*(0.20)); // Update with appropriate amount based on level
                            referral.agentAmount += 100*(0.20);
                            refereeUser.level=4
                            break; 
                        default:
                            referral.agentAmount = 100; // Default amount
                    }
                    console.log("level  ",refereeUser.level)
                }

                // Assuming you have earnings data available, update the earnings array
               // dailyEarnings.earnings = amount; // Update earnings array with actual data
            }


           await refereeUser.save();
            await referral.save(); // Save the updated referral document
        }

        console.log("Referral schema updated successfully");
    } catch (error) {
        console.error("Error updating referral schema:", error);
        throw new Error('Failed to update referral schema');
    }
};
   
 

export const resendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        // Find user by phone number
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate new OTP
        const generatedOTP = Math.floor(100000 + Math.random() * 900000);

        // Update OTP in user document
        user.otp.code = generatedOTP.toString();
        user.otp.createdAt = new Date();
        await user.save();

        // Resend OTP via Twilio
        await twilioClient.messages.create({
            body: `Your new OTP is: ${generatedOTP}`,
            from: "+15642343143",
            to: phoneNumber
        });

        return res.json({ user, message: 'OTP resent successfully' });
    } catch (error) {
        console.error(error);
        throw new Error('Failed to resend OTP');
    }
};


export const signIn = async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(400).send('Incorrect Credentials');
        } else {
            // Compare password directly (not recommended)
            if (password === user.password) {
                // Call trackLoginActivity middleware to update user's login activity
                await trackLoginActivity(user);
                const updatedUser = await updateDailyLoginStreak(user);
                
                // Create token
                const token = jwt.sign(
                    {
                        userID: user._id
                    },
                    'AIb6d35fvJM4O9pXqXQNla2jBCH9kuLz',
                    {
                        expiresIn: '12h',
                    }
                );
                // Send token
                return res.status(200).send(token);
            } else {
                return res.status(400).send('Incorrect Credentials');
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(200).send("Something went wrong");
    }
}

// Middleware for tracking login activity
 const trackLoginActivity = async (user) => {
    try {
      

        // Update user's last login timestamp
        user.lastLogin = new Date();
        // Set user's status to active
        user.status = 'active';
        await user.save();
    } catch (error) {
        console.error('Error tracking login activity:', error);
    }
};
 
const updateDailyLoginStreak = async (user) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get the last login date
        const lastLogin = user.lastLogin;

        // If the last login date is yesterday, update daily streaks
        if (lastLogin && lastLogin.getDate() === today.getDate() - 1) {
            // Increment streak if streak is continuous
            if (user.dailyStreaks.length > 0 && user.dailyStreaks[user.dailyStreaks.length - 1].date.getTime() === today.getTime() - 1) {
                user.dailyStreaks[user.dailyStreaks.length - 1].streak++;
            } else {
                // Otherwise, start a new streak
                user.dailyStreaks.push({ date: today, streak: 1 });
            }
        } else {
            // If last login is not yesterday, reset streak
            user.dailyStreaks = [{ date: today, streak: 1 }];
        }

        // Update last login
        user.lastLogin = today;

        // Save user changes
        await user.save();

        return user;
    } catch (error) {
        console.error('Error updating daily login streak:', error);
        throw error;
    }
};

export const logout = async (req, res) => {
    // 1. Read the token from the request headers
    const token = req.headers.authorization;
    const userId = req.userID;
    
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    user.lastLogin = new Date(); 
    // 2. If no token is provided or token is blacklisted, return an unauthorized response
    if (!token || blacklistedTokens.has(token)) {
      return res.status(401).send('Unauthorized,');
    }
  
    try {
      // 3. Add the token to the blacklist to invalidate it
      blacklistedTokens.add(token);
  // Clear the token from the client-side storage
  res.clearCookie('token'); // Example for cookies, adjust for your storage mechanism
  
      // 4. Return a success response indicating logout is successful
      return res.status(200).send('Logout successful');
    } catch (err) {
      // 5. If an error occurs, log it and return an internal server error response
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
  };
  

export const addWallet = async (req, res) => {
    const { wallet } = req.body;
    const userId = req.userID;
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.wallet += wallet;
        // Save the updated user
        await user.save();
        // Send a success response
        res.status(200).json({ message: 'Wallet balance updated successfully', user });
    } catch (error) {
        // Handle any errors
        console.error('Error adding wallet balance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



//USER_PROFILE 

export const updateName = async (req, res) => {
    const userID = req.userID;
    const newName = req.body.name; // Assuming the new name is sent in the request body

    try {
        const user = await User.findById(userID); // Find the user by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = newName; // Update the name
        await user.save(); // Save the updated user

        return res.status(200).json({ message: 'Name updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePassword = async (req, res) => {
    const userID = req.userID;
    const newPassword = req.body.password; // Assuming the new password is sent in the request body

    try {
        const user = await User.findById(userID); // Find the user by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword; // Update the password
        await user.save(); // Save the updated user

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const orderRecord = async (req, res) => {
    const userId = req.userID;
    const gametype = req.params.gametype;

    try {
        let games;
        if (gametype) {
            // If gametype is provided, fetch games based on userID and gametype
            games = await Game.find({ user: userId, gameType: gametype });
        } else {
            // If gametype is not provided, return a message indicating no games were played by the user
            games = [];
        }

        if (games.length === 0) {
            return res.status(404).json({ message: 'No this games played by the user' });
        }

        return res.status(200).json({ games });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};



export const followUs=async (req,res)=>{
    try {
        // Define the game instructions
        const TelegramLink = {
            telegram: 'Fast WIn ',
            description:"LINK>>>>>>>......",
            telegramCommunity:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.  ",
            
        };
        return res.status(200).json(TelegramLink);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const transactionWalletGame = async (req, res) => {
    const userId = req.userID;

    try {
        // Fetch games associated with the user ID
        const games = await Game.find({ user: userId });

        // If no games found for the user, return an empty array
        if (!games || games.length === 0) {
            return res.json([]);
        }

        // Map each game to extract required information
        const gameData = games.map(game => ({
            gameType: game.gameType,
            timing: new Date(parseInt(game._id.toString().substring(0, 8), 16) * 1000), // Extracting timestamp from _id
            money: game.money
        }));

        // Return the game data in JSON format
        res.json(gameData);
    } catch (error) {
        // Handle errors and return a 500 Internal Server Error response
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



























// export const getGamesByUserAndType = async (req, res) => {
//     try {
//         // Get the user's ID from the request
//         const userId = req.userID;

//         // Get the game type from the request
//         const gameType = req.body.gameType;

//         // Find the user by userID
//         const user = await User.findById(userId);

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Find games for the user and gameType
//         const games = await Game.find({
//             user: userId,
//             'gameType': gameType
//         });
//         console.log("   ", games)
//         // Extract necessary game data
//         const gamesData = games.map(game => {
//             let point = game.updatedMoney - game.money; // Assuming point is the difference between updatedMoney and initial money
//             // Adjust point to handle negative amounts
//             if (point < 0) {
//                 point = - (point); // Convert negative point to positive
//             }
//             return {
//                 periodNumber: game.periodNumber,
//                 guess: game.userGuess,
//                 point: point,
//                 result: game.result,
//                 amount: game.money
//             };
//         });

//         // Send the response with filtered games data
//         res.json(gamesData);
//     } catch (error) {
//         // Handle errors
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }


// export const getGamesByTypeHeadTail = async (req, res) => {
//     try {
 
         
//         const games = await Game.find({ gameType: 'headTail' });


//         console.log("  ", games)
//         // Extract necessary game data
//         const gamesData = games.map(game => {
//             return {
//                 periodNumber: game.periodNumber,
//                 select: game.userGuess,
//                 point: (game.updatedMoney - game.money), // Assuming point is the difference between updatedMoney and initial money
//                 result: game.result,
//                 amount: game.money
//             };
//         });

//         // Send the response with filtered games data
//         res.json(gamesData);
//     } catch (error) {
//         // Handle errors
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }





export const headProfile = async (req, res) => {
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
        console.log("--->",user.profilePhoto)
        res.json({ Name:user.name,PhoneNumber:  user.phoneNumber, UserID: last8Digits,profilePhoto:user.profilePhoto });
    } catch (error) {
        // Handle errors and return a 500 Internal Server Error response
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const userProfile = async (req, res) => {
    const userId = req.userID;

    try {
        // Find the user by their ID
        const user = await User.findById(userId);

        // If user not found, return a 404 Not Found response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's profile photo
        const profilePhoto = req.file.filename;
        user.profilePhoto = profilePhoto;

        // Save the updated user object
        await user.save();

        // Respond with success message and updated user details
        res.json({ message: 'Profile photo updated successfully', user });
    } catch (error) {
        // Handle any errors
        console.error('Error updating profile photo:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


