import mongoose from 'mongoose';
import cron from 'cron';
import User from './userModel.js'; // Import the User model
import UserStats from './userStatsModel.js'; // Import the UserStats model

// Define the cron job to update user statistics every 30 minutes
const job = cron.schedule('*/30 * * * *', async () => {
    try {
        // Get the current date and time
        const currentDate = new Date();

        // Calculate the start time for the last 30 minutes
        const last30Minutes = new Date(currentDate.getTime() - 30 * 60 * 1000);

        // Query the User model to get the count of total users created
        const totalUsers = await User.countDocuments();

        // Query the User model to get the count of active users (logged in within the last 30 minutes)
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: last30Minutes } });

        // Calculate the count of inactive users by subtracting active users from total users
        const inactiveUsers = totalUsers - activeUsers;

        // Create a new document in UserStats collection with the current statistics
        const newUserStats = new UserStats({
            totalUsers,
            activeUsers,
            inactiveUsers,
            createdAt: currentDate
        });

        // Save the new user statistics document
        await newUserStats.save();

        console.log('New user statistics created successfully.');
    } catch (error) {
        console.error('Error creating new user statistics:', error);
    }
});

// Start the cron job
job.start();
