import Transaction from "../../models/transaction.js";
import User from "../../models/userModel.js";


export const getAllWithdrawTransactions = async (req, res) => {
    try {
        let withdrawTransactions;
        const { sort, sortBy } = req.query;

        // Determine the sort criteria based on the sortBy parameter
        const sortCriteria = {};
        if (sortBy && sortBy.toLowerCase() === 'date') {
            sortCriteria.timestamps = 1; // Sort by date in ascending order
        } else if (sortBy && sortBy.toLowerCase() === 'id') {
            sortCriteria._id = 1; // Sort by ID in ascending order
        }

        // Fetch all transactions with product name set to "withdraw" from the database
        if (sort && sort.toLowerCase() === 'true') {
            withdrawTransactions = await Transaction.find({ 'product.name': 'withdraw' })
                .select('_id user amount transactionType status')
                .sort(sortCriteria);
        } else {
            withdrawTransactions = await Transaction.find({ 'product.name': 'withdraw' })
                .select('_id user amount transactionType status');
        }

        // Send the withdrawal transactions as a JSON response
        res.status(200).json({ success: true, withdrawTransactions: withdrawTransactions });
    } catch (error) {
        console.error("Error fetching withdrawal transactions:", error);
        // Send an error response to the client
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// export const getAllWithdrawTransactions = async (req, res) => {
//     try {
//         // Fetch all transactions with product name set to "withdraw" from the database
//         const withdrawTransactions = await Transaction.find({ 'product.name': 'withdraw' })
//         .select('_id user amount transactionType status')


//         // Send the withdrawal transactions as a JSON response
//         res.status(200).json({ success: true, withdrawTransactions: withdrawTransactions });
//     } catch (error) {
//         console.error("Error fetching withdrawal transactions:", error);
//         // Send an error response to the client
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// };

export const getTransactionById = async (req, res) => {
    try {
        // Extract the transaction ID from the request parameters
        const { transactionId } = req.params;

        // Fetch the transaction from the database using the provided ID
        const transaction = await Transaction.findById(transactionId)
        .populate('user', 'name'); // Populate the 'user' field with 'name' attribute


        // Check if the transaction exists
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Send the transaction as a JSON response
        res.status(200).json({ success: true, transaction: transaction });
    } catch (error) {
        console.error("Error fetching transaction:", error);
        // Send an error response to the client
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateTransactionById = async (req, res) => {
    try {
        // Extract the transaction ID from the request parameters
        const { transactionId } = req.params;

        // Extract the fields to update from the request body
        const { amount, status } = req.body;

        // Create an object with the fields to update
        const updateFields = {};
        if (amount) {
            updateFields.amount = amount;
        }
        if (status) {
            updateFields.status = status;
        }

        // Find the transaction by ID and update it with the specified fields
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            updateFields,
            { new: true } // Return the updated transaction after the update operation
        );

        // Check if the transaction exists
        if (!updatedTransaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Send the updated transaction as a JSON response
        res.status(200).json({ success: true, transaction: updatedTransaction });
    } catch (error) {
        console.error("Error updating transaction:", error);
        // Send an error response to the client
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteTransactionById = async (req, res) => {
    try {
        // Extract the transaction ID from the request parameters
        const { transactionId } = req.params;

        // Find the transaction by ID and delete it
        const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

        // Check if the transaction exists
        if (!deletedTransaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Send a success response indicating that the transaction was deleted
        res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        // Send an error response to the client
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};










