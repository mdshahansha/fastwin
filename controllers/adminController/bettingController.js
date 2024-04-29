 
import Game from "../../models/game.js";
import BettingDetail from "../../models/adminModel/bettingDetail.js";
import cron from 'node-cron';
import moment from 'moment';

export const calculateAndStoreBettingDetail = async (req,res) => {
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
        res.json(bettingDetail)

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
// job.start();
export const calculateStatsByGameType = async (req, res) => {
    try {
        const gameTypes = await Game.distinct("gameType");
        const statsByGameType = []; 
        const currentDate = moment().startOf('day'); // Get the start of today's date


        for (const type of gameTypes) {
            const totalBets = await Game.countDocuments({ gameType: type });
            const bettingAmount = await Game.aggregate([
                { $match: { gameType: type } },
                { $group: { _id: null, total: { $sum: "$money" } } }
            ]);
            const userProfit = await Game.aggregate([
                { $match: { gameType: type, message: "win" } },
                { $group: { _id: null, total: { $sum: "$delivery" } } }
            ]);
            const adminProfit = await Game.aggregate([
                { $match: { gameType: type, message: "lost" } },
                { $group: { _id: null, total: { $sum: "$updatedMoney" } } }
            ]);

            statsByGameType.push({
                date: currentDate,
                gameType: type,
                totalBets: totalBets,
                bettingAmount: bettingAmount.length > 0 ? bettingAmount[0].total : 0,
                userProfit: userProfit.length > 0 ? userProfit[0].total : 0,
                adminProfit: adminProfit.length > 0 ? adminProfit[0].total : 0
            });
        }

        res.json(statsByGameType);
    } catch (error) {
        console.error('Error calculating stats by game type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

