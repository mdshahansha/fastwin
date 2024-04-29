import jwt from 'jsonwebtoken';
import {blacklistedTokens} from '../server.js'
import User from '../models/userModel.js'
import {CronJob} from 'cron';

// Define the update interval (1 week in milliseconds)
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

// Scheduled job for updating user status periodically (1 week)
const job=new CronJob('0 0 * * 0', () => {
    updateStatus();
});
// Start the cron job
job.start();

const jwtAuth = (req, res, next) => {
  // 1. Read the token.
  const token = req.headers['authorization'];

  // console.log(token);
  // 2. if no token, return the error.
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
    // Check if token is blacklisted
    if (blacklistedTokens.has(token)) {
      return res.status(401).send('Unauthorized ! Please login again');
    }
  
  // 3. check if token is valid.
  try {
    const payload = jwt.verify(
      token,
      // process.env.SECRET_KEY
      'AIb6d35fvJM4O9pXqXQNla2jBCH9kuLz'
    );
    req.userID = payload.userID;
  } catch (err) {
    // 4. return error.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token expired! Please login again');
  }
    console.log(err);
    return res.status(401).send('Unauthorized');
  }
  // 5. call next middleware
  next();
};

export default jwtAuth;



// // Middleware for tracking login activity
// export const trackLoginActivity = async (req, res, next) => {
//   try {
//     const userId=req.userID;
//     const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//       // Update user's last login timestamp
//       user.lastLogin = new Date();
//       // Set user's status to active
//       user.status = 'active';
//       await user.save();
//       next();
//   } catch (error) {
//       console.error('Error tracking login activity:', error);
//       // Handle error
//       next(error);
//   }
// };

// Middleware for updating status based on last login timestamp


export const updateStatus = async () => {
  try {
      // Find inactive users who haven't logged in for a certain period
      const inactiveUsers = await User.find({
          lastLogin: { $lt: new Date(Date.now() - ONE_WEEK_IN_MS) },
          status: 'active'
      });
      // Update status of inactive users to 'inactive'
      inactiveUsers.forEach(async (user) => {
          user.status = 'inactive';
          await user.save();
      });
  } catch (error) {
      console.error('Error updating user status:', error);
  }
};

 