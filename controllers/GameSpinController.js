import Game from '../models/game.js';
import User from '../models/userModel.js';
 
const grids = [];
for (let i = 0; i < 54; i++) {
    let color, animal;
    if (i % 2 === 0) {
        color = 'green';
        animal = 'lion';
    } else if (i % 3 === 0) {
        color = 'yellow';
        animal = 'camel';
    } else if (i % 5 === 0) {
        color = 'green';
        animal = 'elephant';
    } else {
        color = 'yellow';
        animal = 'camel';
    }
    grids.push({ color, animal, number: i + 1 });
}
grids[23].color = 'red';
grids[23].animal = 'crown';
 


export const playCircleGame = async (req, res) => {
    try {
      // Extract color and animal from the request body
      const { color, animal,amount } = req.body;
      const userId = req.userID;
      // Find the user by userID
      const user = await User.findById(userId);
      // Check if user exists
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      if (isNaN(amount)) {
        return res.status(400).json({ message: 'Invalid wallet value' });
    }
    // Check if user's wallet balance is sufficient
    if (user.wallet < 10 || user.wallet < amount) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }


    const selectedGrid = grids[Math.floor(Math.random() * grids.length)];
     
    let message;
    let amountWon = amount;
    user.wallet -= amountWon;//updated user wallet

    // Check if the selected grid matches the user's choice
    if (selectedGrid.color === color && selectedGrid.animal === animal) {
      amountWon -= amountWon * 0.06;
      // Double the amount if color is yellow or green
      if (color === 'yellow' || color === 'green') {
        amountWon *= 2;
      }
      // Check if the color is red and the animal is crown
      if (color === 'red' && animal === 'crown') {
        // Multiply the amount by 18 if the conditions are met
        amountWon *= 18;
      }
      user.wallet += amountWon;
      message='win'
      // Return the result with the updated amount
    //   return res.status(200).json({ result: 'win', amount:amountWon, Result: selectedGrid.color, Select:color});
    } else {
      amountWon -= amountWon * 0.06;
      amountWon=amountWon*(-1);
      message='lost'
  }


    //generate Period number
  const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hour = String(currentDate.getHours()).padStart(2, '0');
        const minute = String(currentDate.getMinutes()).padStart(2, '0');
        const periodNumber = `${year}${month}${day}${hour}${minute}`;

        let ResultSelectedGrid = "";
        ResultSelectedGrid += selectedGrid.color ;
        ResultSelectedGrid += " "
        ResultSelectedGrid += selectedGrid.animal;
        ResultSelectedGrid += " "
        ResultSelectedGrid += selectedGrid.number;
 
// console.log("ResultSelectedGrid",ResultSelectedGrid);
let delivery=wallet;
delivery = (amount*amount)- (2*0.06);
        // Save the game record
        const game = new Game({
            user: userId,
            periodNumber: periodNumber,
            userGuess: color +" "+animal,
            money: amount,
            result: ResultSelectedGrid,
            message: message,
            updatedMoney: amountWon,
            delivery:delivery,
            gameType: "Spin",
            message:message
        });
        await game.save();

        // Update user's wallet balance
        user.games.push(game._id);
        await user.save();
        let result = {};
result.color = selectedGrid.color;
result.animal = selectedGrid.animal;
        // result.selectedGrid({})


        const response = {
            periodNumber: periodNumber,
            select: color,
            Point: amount,
            result: result,
            message: message,
            Amount: amountWon,
            gameType: "Spin"
        };

        setTimeout(() => {
            res.json(response);
          }, 15000); // 15 seconds delay

    } catch (error) {
      // If an error occurs, return a 500 Internal Server Error response
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

export const myOrderSpin = async (req, res) => {
    const userId = req.userID;
    try {
        // Fetch game records for the specific user and game type 'spin'
        const gameRecords = await Game.find({ user: userId, gameType: 'Spin' });

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

export const everyoneOrderSpin = async (req, res) => {
    
    try {
        // Fetch game records for the specific user and game type 'spin'
        const gameRecords = await Game.find({ gameType: 'Spin' });

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


export const spinRule=async (req,res)=>{
    try {
        // Define the game instructions
        const gameInstructions = {
            gameName: 'The Circle Game',
            description: 'The Circle game is played every 15 seconds. One of the 54 grids is randomly selected in each draw. The 58 squares correspond to 3 colors (yellow, red, green), three animals (lion, elephant, camel), and one crown. If you choose the right one, you will win the prize.',
            odds: {
                yellowGreen: '2X',
                redCrown: '18X'
            },
            rule:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.  ",
            amountCalculation: 'If you spend Rs.100 to trade, after deducting 6 rupees service fee, your amount is 94 rupees. For a winning bet:',
            calculationExample: '(94 * 18) = 1692 rupees'
        };

        // Return the game instructions in JSON format
        return res.status(200).json(gameInstructions);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}