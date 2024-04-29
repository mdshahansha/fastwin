import User from '../models/userModel.js';
import Game from '../models/game.js'; //add user Wallet update
import Razorpay from 'razorpay'
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env
import crypto from 'crypto';
import Transaction from '../models/transaction.js';

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

export const createOrder = async (req, res) => {
    const userId = req.userID;
    let amount = req.body.amount;
let withoutAmountTax=amount;
    try {
        const user = await User.findById(userId);
        // If user not found, return a 404 Not Found response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (amount < 35) {
            return res.status(404).json({ message: 'pleae enter the amount min 35 ' });
        }
        if (amount >= 35 && amount <= 200000) {
            if (amount >= 1000) {
                amount += 100;
            } else if (amount >= 2000) {
                amount += 200;
            } else if (amount >= 5000) {
                amount += 500;
            } else if (amount >= 10000) {
                amount += 1000;
            }
            let tax = amount * (0.03);
            amount = (amount - tax)
        }
        amount = amount * 100;

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: "TXN" + Date.now(),
        };

        // Create the order using Razorpay API
        razorpayInstance.orders.create(options, async (err, order) => {
            if (err) {
                // Handle error if order creation fails
                console.error("Error creating order:", err);
                return res.status(400).json({ success: false, msg: 'Something went wrong!' });
            }

            console.log("order#  ", order);
            // id: 'order_O1FBKThVXo2fk3',
            // entity: 'order',
            // amount: 29002,
            // amount_paid: 0,
            // amount_due: 29002,
            // currency: 'INR',
            // receipt: 'TXN1713696284538',
            // offer_id: null,
            // status: 'created',
            // attempts: 0,
            // notes: [],
            // created_at: 1713696285
            // Update payment with the online transaction order ID
            const newTransaction = new Transaction({
                createdOrderId: order.id,
                user: userId, // Associate the transaction with the user by providing the user ID
                amount: amount,//into multiply of 100
                withoutTaxAmount:withoutAmountTax,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,

            });

            // Save the new transaction to the database
            const savedTransaction = await newTransaction.save();

            // Send success response with order details
            res.status(200).json({
                success: true,
                _id: savedTransaction._id,
                msg: 'Order Created....',
                order_id: order.id,
                amount: amount,
                key_id: RAZORPAY_ID_KEY,
                name: user.name
            });
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


export const renderProductPage = async (req, res) => {
    try {
        const { transactionId } = req.params;
console.log("   ->")
        // Check if the transactionId is a special case
        // if (transactionId === "helpPhonePay") {
        //     // Handle the special case here
        //     return res.json({ success: false, message: "Help page for PhonePay" });
        // }

        // Attempt to find the transaction by its ObjectId
        const payment = await Transaction.findById(transactionId).populate('user');

        if (!payment) {
            return res.status(404).json({ success: false, error: "Transaction Id not found" });
        }

        // Render the 'product' EJS template with payment data
        res.render('product', { payments: payment }); // Assuming 'payment' is the variable used in the 'product' template

    } catch (error) {
        console.error("Error:", error);
        // Send an error response to the client
        res.status(500).send('Internal Server Error');
    }
}




export const paymentCallBack = async (req, res) => {
    const { razorpay_signature, razorpay_payment_id, razorpay_order_id } = req.body;
    const { transactionId } = req.params;
    console.log("     ->   ", req.body);
    try {
        const payment = await Transaction.findById(transactionId).populate('user'); // Populate the user field
        // console.log("@#@  ",payment);
        const string = razorpay_order_id + "|" + razorpay_payment_id; // Concatenate order_id and razorpay_payment_id with a "|"
        const generated_signature = crypto
            .createHmac('sha256', RAZORPAY_SECRET_KEY)
            .update(string)
            .digest("hex");

        console.log("Generated Signature:", generated_signature);
        console.log("Razorpay Signature:", razorpay_signature);

        if (generated_signature === razorpay_signature) {
            console.log('Payment successful');
            payment.user.wallet =payment.user.wallet+payment.amount//update user wallet
            const newGame = new Game({
                user: payment.user._id, // Assuming you want to associate the game with the user who made the payment
                result: payment.amount,
                gameType: "Transaction"
            });
            await newGame.save();
            payment.razorpay_order_id = razorpay_order_id;
            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.status = "successful";
            // Save the updated payment object
            await payment.save();
            await newGame.save();
        console.log("@#@  ",payment);
        console.log("**->  ",newGame);


            return res.json({ success: true, message: "Transaction successfully completed" });
        } else {
            payment.razorpay_order_id = razorpay_order_id;
            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.user.games
            payment.status = "failed";
            // Save the updated payment object
            await payment.save();
            console.log('Payment failed: Signature mismatch');
            return res.json({ success: false, message: "Transaction failed. Signature mismatch" });
        }
    } catch (error) {
        console.log("Error:", error.message);
        return res.json({ success: false, message: "Transaction failed. Internal server error" });
    }
};


export const paymentCancel = async (req, res) => {
    const id = req.params.paymentId;

    try {
        return res.json({ success: false, message: "FAILLLL" })
    } catch (error) {
        console.log(error.message);
    }
}

 export const RecordTransactionAll=async (req,res)=>{
    const userId = req.userID;
    console.log("sss->",userId)
    // return res.json({ success: true, transactions: "formattedTransactions" });

    try {
        // Find transactions associated with the user ID
        const transactions = await Transaction.find({ user: userId });
        // Check if any transactions were found
        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ success: false, message: 'No transactions found for the user' });
        }

        // Format timestamps
        const formattedTransactions = transactions.map(transaction => ({
            createdOrderId: transaction.createdOrderId,
            razorpay_order_id: transaction.razorpay_order_id,
            razorpay_payment_id: transaction.razorpay_payment_id,
            razorpay_signature: transaction.razorpay_signature,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            product: transaction.product,
            receipt: transaction.receipt,
            // Format timestamp to include hours, minutes, day, month, and year
            timestamp: transaction.timestamps.toLocaleString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: 'numeric',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        }));

        // Return the formatted transactions
        return res.json({ success: true, transactions: formattedTransactions });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
} 

export const withdrawRequest = async (req, res) => {
    const userId = req.userID;
    const { amount,transType } = req.body;

    try {
        // Create a new transaction record for withdrawal
        const newTransaction = new Transaction({
            user: userId,
            amount: amount,
            currency: 'INR', // Assuming the currency is Indian Rupees
            status: 'pending', // Assuming the status of withdrawal request is initially 'confirm'
            product: {
                name: 'withdraw',
                description: 'Withdrawal from Game FastWin'
            },
            receipt: "TXN" + Date.now(),
            transactionType:transType
        });
        // Save the new transaction record to the database
        const savedTransaction = await newTransaction.save();
        // console.log("user   ->",savedTransaction.user)

        // Send success response with the saved transaction details
        res.status(200).json({
            success: true,
            message: 'Withdrawal request created successfully',
            transaction: savedTransaction
        });
    } catch (error) {
        console.error("Error creating withdrawal request:", error);
        // Send an error response to the client
        res.status(500).json({ success: false, error: error.message });
    }
};





















// create video that how to procced
// 1

export const helpPhonePay = async (req, res) => {
    res.json({
        message: "Recharge Using Phone Pe",
        videoLink: "...youTube"
    })
}

// 2
export const helpGPay = async (req, res) => {
    res.json({
        message: "Recharge Using  GPay",
        videoLink: "...youTube"
    })
}

// 3
export const helpPaytm = async (req, res) => {
    res.json({
        message: "Recharge Using   PayTm",
        videoLink: "...youTube"
    })
}