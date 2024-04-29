import AdminTransaction from "../../models/adminModel/adminTransaction.js";
import User from "../../models/userModel.js";

export const withdrawTransaction = async (req, res) => {
    try {
        const userId = req.userID;
        // Find the user by userID
        const user = await User.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Extract amount from the request body
        const { amount } = req.body;
        
        // Set status to 'pending' for withdrawal transactions
        const status = 'pending';
        // Set transaction type to 'account' for withdrawal transactions
        const transactionType = 'account';
        // Set account type to 'withdraw' for withdrawal transactions
        const account = 'withdraw';

        // Create a new withdrawal transaction with current date and the received amount
        const newWithdrawalTransaction = new AdminTransaction({
            amount,
            status,
            transactionType,
            account,
        });

        // Save the new withdrawal transaction to the database
        const savedTransaction = await newWithdrawalTransaction.save();

        // Respond with success message and the saved transaction data
        res.status(201).json({ success: true, message: 'Withdrawal transaction created successfully', transaction: savedTransaction });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error creating withdrawal transaction:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


export const getAllTransactionsByUserId = async (req, res) => {
    try {
        const { sort, id, date } = req.query;

        let sortCriteria = {}; // Default empty sort criteria
        const userId = req.userID;
        // Find the user by userID
        const user = await User.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check each sorting criterion and set the sort criteria accordingly
        if (sort) {
            switch (sort.toLowerCase()) {
                case 'desc':
                    sortCriteria.amount = -1; // Sort by amount in descending order
                    break;
                default:
                    sortCriteria.amount = 1; // Sort by amount in ascending order by default
                    break;
            }
        }

        if (id) {
            sortCriteria._id = id.toLowerCase() === 'desc' ? -1 : 1; // Sort by ID based on the provided parameter
        }

        if (date) {
            sortCriteria.timestamps = date.toLowerCase() === 'desc' ? -1 : 1; // Sort by date based on the provided parameter
        }

        // Find all transactions for the given user ID and sort based on sort criteria
        const transactions = await AdminTransaction.find({}).sort(sortCriteria);

        // Respond with success and the list of transactions
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error fetching transactions:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

