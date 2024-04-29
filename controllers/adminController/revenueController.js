import Game from "../../models/game.js";
import AdminRevenue from "../../models/adminModel/revenue.js";
 
// import Game from './gameModel.js';
// import AdminRevenue from './adminRevenueModel.js';

export const calculateAndStoreAdminProfit = async (req, res) => {
    try {
        // Calculate admin profit by game type for each date
        const adminProfitByGameType = await Game.aggregate([
            {
                $match: { message: 'lost' } // Filter documents where message is 'lost'
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Group by date
                        gameType: '$gameType' // Group by game type
                    },
                    adminProfit: { $sum: { $multiply: ['$money', 0.02] } } // Calculate admin profit
                }
            }
        ]);

        // Save admin profit to AdminRevenue schema
        const adminRevenueData = await Promise.all(adminProfitByGameType.map(async (result) => {
            const { date, gameType, adminProfit } = result._id;
            const adminRevenue = new AdminRevenue({
                AdminProfit: adminProfit,
                gameType: gameType,
                createdAt: new Date(date)
            });
            await adminRevenue.save();
            return {
                date: date,
                gameType: gameType,
                adminProfit: adminProfit
            };
        }));

        res.json(adminRevenueData);
    } catch (error) {
        console.error('Error calculating and storing admin profit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

