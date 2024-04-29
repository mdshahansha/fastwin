import UserStats from "../../models/adminModel/userStat.js"
import User from "../../models/userModel.js";



export const userStatGraph = async (req, res) => {
    try {
        // Calculate the start time for the last 6 hours
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        // Fetch all UserStats documents within the last 6 hours
        const userStatsData = await UserStats.find({ lastUpdated: { $gte: sixHoursAgo } }).sort({ lastUpdated: 1 });

        // Calculate the number of intervals (30 minutes each) in the last 6 hours
        const intervals = 6 * 60 / 30;

        // Initialize an array to store the data for each interval
        const userDataByInterval = [];

        // Initialize variables for active users, inactive users, and the last updated time
        let activeUsers = 0;
        let inactiveUsers = 0; 
        let lastUpdatedTime = null;
  
        // Iterate over each UserStats document
        userStatsData.forEach((userData) => {
            // Update the active and inactive users count
            activeUsers += userData.activeUsers;
            inactiveUsers += userData.inactiveUsers;
            // Set the last updated time
            lastUpdatedTime = userData.lastUpdated;

            // If the last updated time is after the current interval, push the data for the interval
            if (userData.lastUpdated >= sixHoursAgo) {
                userDataByInterval.push({
                    time: userData.lastUpdated,
                    activeUsers,
                    inactiveUsers
                });
                // Reset active and inactive user counts for the next interval
                activeUsers = 0;
                inactiveUsers = 0;
            }
        });

        // Return the data in JSON format
        res.json({
            intervals,
            data: userDataByInterval
        });
    } catch (error) {
        console.error('Error fetching user statistics data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


export const userStatFilterGraph = async (req, res) => {
    try {
        const { type } = req.query; // Type can be 'week', 'month', '6months', or 'year'
        let fromDate, interval;

        // Calculate the start date based on the type
        switch (type) {
            case 'week':
                // Start from the beginning of the current week
                fromDate = new Date();
                fromDate.setHours(0, 0, 0, 0);
                fromDate.setDate(fromDate.getDate() - fromDate.getDay());
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
            case 'month':
                // Start from the beginning of the current month
                fromDate = new Date();
                fromDate.setDate(1);
                fromDate.setHours(0, 0, 0, 0);
                interval = 7 * 24 * 60 * 60 * 1000; // 1 week
                break;
            case '6months':
                // Start from 6 months ago
                fromDate = new Date();
                fromDate.setMonth(fromDate.getMonth() - 6);
                fromDate.setDate(1);
                fromDate.setHours(0, 0, 0, 0);
                interval = 30 * 24 * 60 * 60 * 1000; // 1 month
                break;
            case 'year':
                // Start from the beginning of the current year
                fromDate = new Date();
                fromDate.setMonth(0);
                fromDate.setDate(1);
                fromDate.setHours(0, 0, 0, 0);
                interval = 30 * 24 * 60 * 60 * 1000; // 1 month
                break;
            default:
                throw new Error('Invalid type parameter');
        }

        const toDate = new Date(); // End date is current date
        const userDataByInterval = [];

        // Fetch UserStats documents within the specified date range
        const userStatsData = await UserStats.find({ lastUpdated: { $gte: fromDate, $lte: toDate } }).sort({ lastUpdated: 1 });

        // Iterate over each interval and accumulate data
        let intervalStartDate = fromDate;
        let activeUsers = 0;
        let inactiveUsers = 0;

        while (intervalStartDate <= toDate) {
            const intervalEndDate = new Date(intervalStartDate.getTime() + interval);

            // Accumulate data for the interval
            userStatsData.forEach((userData) => {
                if (userData.lastUpdated >= intervalStartDate && userData.lastUpdated < intervalEndDate) {
                    activeUsers += userData.activeUsers;
                    inactiveUsers += userData.inactiveUsers;
                }
            });

            // Push accumulated data for the interval
            userDataByInterval.push({
                startDate: intervalStartDate,
                endDate: intervalEndDate,
                activeUsers,
                inactiveUsers
            });

            // Reset counts for the next interval
            activeUsers = 0;
            inactiveUsers = 0;

            // Move to the next interval
            intervalStartDate = intervalEndDate;
        }

        // Return the accumulated data
        res.json({
            intervalType: type,
            data: userDataByInterval
        });
    } catch (error) {
        console.error('Error fetching user statistics data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


export const Userlist = async (req, res) => {
    try {
        let query = {};

        // Check if a filter parameter is provided in the query
        if (req.query.filter) {
            // Example: filter by name
            query.name = { $regex: req.query.filter, $options: 'i' }; // Case-insensitive search
        }

        let sort = {};

        // Check if a sort parameter is provided in the query
        if (req.query.sort) {
            // Example: sort by date
            if (req.query.sort === 'date') {
                sort.createdAt = -1; // Sort by create date in descending order (latest first)
            }
            // Example: sort by ID
            else if (req.query.sort === 'id') {
                sort._id = 1; // Sort by ID in ascending order
            }
        }

        // Fetch users based on query and sort criteria
        const users = await User.find(query, 'name status phoneNumber wallet lastLogin').sort(sort);

        // Return the user data in JSON format
        res.json({
            success: true,
            users: users.map(user => ({
                userID: user._id,
                name: user.name,
                email: user.email,
                status: user.status,
                wallet: user.wallet,
                lastLogin: user.lastLogin || 'Never logged in'
            }))
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { userID } = req.params;
        const { userWallet, status } = req.body;

        // Find the user by ID
        let user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the user's wallet if provided
        if (userWallet !== undefined) {
            user.wallet = userWallet;
        }

        // Update the user's status if provided
        if (status !== undefined) {
            user.status = status;
        }

        // Save the updated user
        await user.save();

        // Return the updated user data
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user by ID and delete it
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return success response
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
