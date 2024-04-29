import express from 'express'; 
import jwtAuth from '../middleware/jwt.js'; 
import { firstRechargeReward,checkDailyLoginStreak, firstInviteReward, order10000InviteReward, order1000InviteReward, order100InviteReward, order2000InviteReward, order20InviteReward, order3000InviteReward, order5000InviteReward, order500InviteReward, order50InviteReward, updateWallet, walletUserID, welcomeReward } from '../controllers/HomeController.js';

const homeRouter=express.Router();

homeRouter.get('/checkDailyLoginStreak',jwtAuth,checkDailyLoginStreak);
homeRouter.get('/firstRechargeReward',jwtAuth,firstRechargeReward);

// check trasaction for that user 
homeRouter.get('/welcomeReward',jwtAuth,welcomeReward);
homeRouter.get('/firstInviteReward',jwtAuth,firstInviteReward);
homeRouter.get('/order20InviteReward',jwtAuth,order20InviteReward);
homeRouter.get('/order50InviteReward',jwtAuth,order50InviteReward);
homeRouter.get('/order100InviteReward',jwtAuth,order100InviteReward);
homeRouter.get('/order500InviteReward',jwtAuth,order500InviteReward);
homeRouter.get('/order1000InviteReward',jwtAuth,order1000InviteReward);
homeRouter.get('/order2000InviteReward',jwtAuth,order2000InviteReward);
homeRouter.get('/order3000InviteReward',jwtAuth,order3000InviteReward);
homeRouter.get('/order5000InviteReward',jwtAuth,order5000InviteReward);
homeRouter.get('/order10000InviteReward',jwtAuth,order10000InviteReward);

homeRouter.get('/order10000InviteReward',jwtAuth,order10000InviteReward);

homeRouter.get('/walletUserID',jwtAuth,walletUserID);
homeRouter.get('/updateWallet',jwtAuth,updateWallet);

export default homeRouter;