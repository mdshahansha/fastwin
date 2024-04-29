 
import Game from "../../models/game.js";
import BettingDetail from "../../models/adminModel/bettingDetail.js";
import cron from 'node-cron';

const calculateAndStoreBettingDetail = async () => {
    try {
        const gameTiming = 5; // Example: Set the game timing to 5 minutes

        // Calculate total bets based on game timing (assuming 60 seconds per minute)
        const totalBets = (60 / gameTiming) * 60 * 24;

        // Retrieve games from the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const games = await Game.find({ createdAt: { $gte: twentyFourHoursAgo } });

        // Calculate betting amount, user profit, and admin profit
        let bettingAmount = 0;
        let userProfit = 0;
        let adminProfit = 0;
        for (const game of games) {
            bettingAmount += game.money - (game.money * 0.02);
            if (game.message === 'win') {
                userProfit += game.delivery;
            } else {
                adminProfit += game.money;
            }
        }

        // Create a new BettingDetail document with the calculated values
        const bettingDetail = new BettingDetail({
            totalBets,
            bettingAmount,
            userProfit,
            adminProfit
        });

        // Save the new BettingDetail document to the database
        await bettingDetail.save();

        console.log('Betting detail calculated and stored successfully.');
    } catch (error) {
        console.error('Error calculating and storing betting detail:', error);
    }
};


// Define the cron job to execute the function every 24 hours
const job = cron.schedule('0 0 * * *', () => {
    calculateAndStoreBettingDetail();
});

// Start the cron job
job.start();

export const getBettingDetails = async (req, res) => {
    try {
        // Query the database to fetch all betting details
        const bettingDetails = await BettingDetail.find().sort({ createdAt: -1 });

        // Map the betting details to include the date along with other values
        const formattedBettingDetails = bettingDetails.map(detail => ({
            date: detail.createdAt,
            totalbets: detail.totalbets,
            bettingamount: detail.bettingamount,
            userProfit: detail.userProfit,
            adminProfit: detail.adminProfit
        }));

        // Return the formatted betting details in JSON format
        res.json(formattedBettingDetails);
    } catch (error) {
        console.error('Error fetching betting details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



