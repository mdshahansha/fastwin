import Game from '../../models/game.js';
import AdminAmount from '../../models/adminModel/adminAmount.js';
import cron from 'node-cron';


// Define the cron job to calculate and store daily statistics
const dailyStatsJob = cron.schedule('0 0 * * *', async () => {
    try {
        const date = new Date(); // Get current date
        date.setHours(0, 0, 0, 0); // Set time to midnight to get the start of the day

        const startDate = date; // Start of the current day
        const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000); // End of the current day (24 hours later)

        const dailyGames = await Game.find({
            createdAt: { $gte: startDate, $lt: endDate } // Find games created within the current day
        });

        let totalAmount = 0;
        let commission = 0;

        // Calculate total amount and commission from daily games
        dailyGames.forEach(game => {
            totalAmount += game.money; // Accumulate money from each game
            commission += game.money * 0.02; // Calculate commission (2% of money) for each game
        });

        // Calculate betting amount (total amount minus commission)
        const bettingAmount = totalAmount - commission;

        // Store the daily statistics in the adminAmount schema
        await AdminAmount.create({
            totalAmount,
            bettingAmount,
            commission,
            createdAt: startDate // Store the date when the statistics were calculated
        });

        console.log('Daily statistics stored successfully.');
    } catch (error) {
        console.error('Error storing daily statistics:', error);
    }
});

// Start the cron job
dailyStatsJob.start();

export const getAdminAmountData = async (req, res) => {
    try {
        // Extract sorting parameters from the request query
        const { sortByDate, sortByTotalAmount } = req.query;

        // Create a sorting object based on the parameters
        let sortCriteria = {};
        if (sortByDate) {
            sortCriteria.createdAt = sortByDate === 'asc' ? 1 : -1;
        }
        if (sortByTotalAmount) {
            sortCriteria.totalAmount = sortByTotalAmount === 'asc' ? 1 : -1;
        }

        // Retrieve admin amount data from the database with sorting applied
        const adminAmountData = await AdminAmount.find({}, { _id: 0, __v: 0 }).sort(sortCriteria);

        // Return the sorted data in JSON format
        res.json(adminAmountData);
    } catch (error) {
        console.error('Error retrieving admin amount data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
