import express from 'express';
import bodyParser from 'body-parser';
import {connectUsingMongoose} from './config/mongoose.js' 
import gameRouter from './routes/game.js';
import userRouter from './routes/user.js';
import jwtAuth from './middleware/jwt.js';
import dotenv from "dotenv";
import referRouter from './routes/refferal.js';
import cron from 'node-cron';
import cors from 'cors';
import User from './models/userModel.js';
import homeRouter from './routes/home.js';
import supportRouter from './routes/support.js';
import complainRouter from './routes/complain.js';
import paymentRouter from './routes/transaction.js';
// import imap from './controllers/supportController.js'
import path from 'path';

import  serverless from "serverless-http";

import adminRouter from './routes/index.js';



const app = express();
const PORT = 3000;
 
app.use(bodyParser.json());
app.use(express.urlencoded()); 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());
// const corsOptions = {
//     origin: 'https://fastwin-7rev.onrender.com',
//     optionsSuccessStatus: 200 // Yeh woh browsers hain jo thoda purane hain aur kuch specific response codes ko sahi tareeke se handle nahi kar pate hain
// };
// app.use(cors(corsOptions));
dotenv.config();

// Use express router

app.use('/', userRouter); 
app.use('/headTail',gameRouter);
app.use('/refer',referRouter)
app.use('/home',homeRouter)
app.use('/complain',complainRouter )
app.use('/support',supportRouter)
app.use('/payment',paymentRouter)
app.use('/admin',adminRouter);
 
app.set('view engine', 'ejs');
app.set('views',path.join(path.resolve(), 'views')
);


export const blacklistedTokens = new Set();

// Schedule the daily check to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
      // Get the current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Query the database for all users
      const users = await User.find();

      // Process each user
      users.forEach(async (user) => {
          // Check if the user's last login was yesterday
          if (user.lastLogin && user.lastLogin.getTime() < today.getTime()) {
              // If there are no daily streaks or the last streak is not from yesterday, reset streak
              if (!user.dailyStreaks.length || user.dailyStreaks[user.dailyStreaks.length - 1].date < today) {
                  // Reset the streak if last login was not yesterday
                  user.dailyStreaks = [{ date: today, streak: 1 }];
              } else {
                  // Increment the streak if last login was yesterday
                  user.dailyStreaks[user.dailyStreaks.length - 1].streak++;
                  // Check if the streak is 7 or more
                  if (user.dailyStreaks[user.dailyStreaks.length - 1].streak >= 7) {
                      console.log(`User ${user.username} has logged in for 7 days continuously.`);
                      // Perform action for user who has logged in for 7 days continuously
                  }
              }
              // Update the user's last login
              user.lastLogin = today;
              await user.save();
          }
      });
      console.log('Daily check completed successfully.');
  } catch (error) {
      console.error('Error in daily check:', error);
  }
});

 


export const totalAdminAmount = 1000; // Example value, you can set it to whatever initial value you need




app.get('/',(req,res)=>{
    res.send(`<h1>Welcome Gaming FAST WIN .......</h1>`)
})

app.listen(PORT, () => {    
  console.log(`Gaming Server is running on ${PORT}`);
  connectUsingMongoose();
    
});

// module.exports = app;
// module.exports.handler = serverless(app);
export default app; 
export const handler= serverless(app)
// module.exports.handler = serverless(app);
