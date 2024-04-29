import Transaction from "../../models/transaction.js";
import Deposit from "../../models/adminModel/depositedAmount.js";

export const getDeposited = async (req, res) => {
    try {
        // Get the total deposited amount for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalDepositedToday = await Transaction.aggregate([
            { $match: { 'product.name': 'Recharge', createdAt: { $gte: today } } },
            { $group: { _id: null, totalDeposited: { $sum: '$amount' } } }
        ]);

        const depositedAmountToday = totalDepositedToday.length > 0 ? totalDepositedToday[0].totalDeposited : 0;

        // Get the total deposited amount
        const totalDeposited = await Transaction.aggregate([
            { $match: { 'product.name': 'Recharge' } },
            { $group: { _id: null, totalDeposited: { $sum: '$amount' } } }
        ]);

        const totalDepositedAmount = totalDeposited.length > 0 ? totalDeposited[0].totalDeposited : 0;

        // Store the deposited amount for today in the Deposit collection
        await Deposit.create({ depositedAmount: depositedAmountToday, total: totalDepositedAmount });

        res.json({ depositedAmountToday, totalDepositedAmount });
    } catch (error) {
        console.error('Error fetching and storing deposited amount:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
