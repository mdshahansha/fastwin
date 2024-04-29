import Game from '../models/game.js';
import User from '../models/userModel.js';

let coinArray = [];
for (let i = 0; i < 2800; i++) {
    coinArray.push(i % 2 === 0 ? 'head' : 'tail');
}

export const flipCoin = async (req, res) => {
    try {
        // Get the user's ID from the request
        const userId = req.userID;

        // Find the user by userID
        const user = await User.findById(userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Get the user's guess and wallet from the request body
        const { guess, wallet } = req.body;
        // Validate wallet value
        if (isNaN(wallet)) {
            return res.status(400).json({ message: 'Invalid wallet value' });
        }
        // Check if user's wallet balance is sufficient
        if (user.wallet < 10 || user.wallet < wallet) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }
        // Generate a random index to pick a value from the coinArray
        const randomIndex = Math.floor(Math.random() * 2800);
        const result = coinArray[randomIndex];
        user.wallet -= wallet;

        // Calculate the result message
        let message;
        let updatedMoney = wallet+(wallet*0.02);
        let delivery=wallet;
        delivery = (wallet+wallet)- (wallet*2*0.02);

        if (guess === result) {
            // If match, update user's wallet
            const tax = 0.06 * updatedMoney;
            updatedMoney = updatedMoney + (updatedMoney) - 2 * tax;
            user.wallet += updatedMoney;
            message = 'win';
        } else {
            // If not match, user loses
            message = 'lost';
            // user.wallet -= updatedMoney;

        }

        // Construct the period number
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hour = String(currentDate.getHours()).padStart(2, '0');
        const minute = String(currentDate.getMinutes()).padStart(2, '0');
        const periodNumber = `${year}${month}${day}${hour}${minute}`;

        // Save the game record
        const game = new Game({
            user: userId,
            periodNumber: periodNumber,
            userGuess: guess,
            money: wallet,
            result: result,
            message: message,
            updatedMoney: updatedMoney,
            delivery:delivery,
            gameType: "headTail",
            message:message

        });
        await game.save();

        // Update user's wallet balance
        user.games.push(game._id);
        await user.save();

        // Construct the response object
        const response = {
            periodNumber: periodNumber,
            userGuess: guess,
            money: wallet,
            result: result,
            message: message,
            updatedMoney: updatedMoney,
            gameType: "headTail"
        };

        // Send the response
        // res.json(response);
        setTimeout(() => {
            res.json(response);
          }, 15000); // 15 seconds delay
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const headTailRule = async (req, res) => {
    try {
        const statement = {
            "statement": "15 seconds 1 issue, 12 seconds to order, 3 seconds to show the lottery result. It opens all day. The total number of trade is 2880 issues. If you spend 100 rupees to trade, after deducting 6 rupees service fee, your contract amount is 94 rupees:",
            "points": [
                {
                    "description": "JOIN HEAD: if the result shows Head, you will get (94*2) 188 rupees."
                },
                {
                    "description": "JOIN TAIL: if the result shows Tail, you will get (94*2) 188 rupees."
                }
            ],

            "options": [
                {
                    "Select": "Join Head",
                    "Result": "Head",
                    "Multiplier": 2
                },
                {
                    "Select": "Join Tail",
                    "Result": "Tail",
                    "Multiplier": 2
                }
            ]


        };

        res.json(statement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const myOrderHeadTail = async (req, res) => {
    const userId = req.userID;
    try {
        // Fetch game records for the specific user and game type 'spin'
        const gameRecords = await Game.find({ user: userId, gameType: 'headTail' });

        // Extract the required fields from each game record
        const formattedRecords = gameRecords.map((record) => ({
            PeriodNumber: record.periodNumber,
            Select: record.userGuess,
            money: record.money,
            result: record.result,
            Amount: record.updatedMoney,
        }));

        // Return the formatted records in JSON format
        return res.status(200).json(formattedRecords);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const everyoneOrderHeadTail = async (req, res) => {
    
    try {
        // Fetch game records for the specific user and game type 'spin'
        const gameRecords = await Game.find({ gameType: 'headTail' });

        // Extract the required fields from each game record
        const formattedRecords = gameRecords.map((record) => ({
            PeriodNumber: record.periodNumber,
            Select: record.userGuess,
            money: record.money,
            result: record.result,
            Amount: record.updatedMoney,
        }));

        // Return the formatted records in JSON format
        return res.status(200).json(formattedRecords);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
 
// HOME

// 5 home rewardwin
// 6 home checkin   
// 7 refresh wallet

 
