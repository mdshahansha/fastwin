import Game from "../../models/game.js";
import AdminRevenue from "../../models/adminModel/revenue.js";
import cron from 'node-cron'

  const calculateAndStoreAdminProfit = async (req, res) => {
    try {
        // Aggregate to calculate total lost money for each game type and date
        const lostMoneyByGameTypeAndDate = await Game.aggregate([
            { $match: { message: 'lost' } }, // Filter where message is 'lost'
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Group by date
                        gameType: '$gameType' // Group by game type
                    },
                    totalLostMoney: { $sum: '$money' } // Calculate total lost money
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id field
                    date: '$_id.date', // Project date from _id
                    gameType: '$_id.gameType', // Project gameType from _id
                    totalLostMoney: 1 // Include totalLostMoney field
                }
            }
        ]);

        // Create and save AdminRevenue documents
        const adminRevenueData = await Promise.all(lostMoneyByGameTypeAndDate.map(async (result) => {
            const { date, gameType, totalLostMoney } = result;
            const adminRevenue = new AdminRevenue({
                AdminProfit: totalLostMoney,
                gameType: gameType,
                createdAt: new Date(date)
            });
            await adminRevenue.save();
            return adminRevenue;
        }));
console.log("reveneue update of admin from games")
        // res.json(adminRevenueData);
    } catch (error) {
        console.error('Error calculating and storing admin profit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 


cron.schedule('0 0 */24 * * *', async () => {
    await calculateAndStoreAdminProfit();
    console.log('Admin profit calculation and storage completed.');
});



// Run the function immediately when the server starts
// calculateAndStoreAdminProfit();
 


export const fetchAdminRevenueData = async (req, res) => {
    try {
        // Fetch all admin revenue data
        const adminRevenueData = await AdminRevenue.find();

        res.json(adminRevenueData);
    } catch (error) {
        console.error('Error fetching admin revenue data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
