import express from 'express'; 
import jwtAuth from '../middleware/jwt.js';
import { everyoneOrderHeadTail, flipCoin, headTailRule, myOrderHeadTail } from '../controllers/GameController.js';
import {   everyoneOrderSpin, myOrderSpin, playCircleGame, spinRule } from '../controllers/GameSpinController.js';
 

const gameRouter=express.Router();

gameRouter.post('/flipCoin',jwtAuth,flipCoin)
gameRouter.get('/headTailRule',headTailRule)
gameRouter.get('/myOrderHeadTail',jwtAuth,myOrderHeadTail)
gameRouter.get('/everyoneOrderHeadTail',everyoneOrderHeadTail) 

gameRouter.post('/spin',jwtAuth,playCircleGame)
gameRouter.get('/myOrderSpin',jwtAuth,myOrderSpin)
gameRouter.get('/everyoneOrderSpin',everyoneOrderSpin)
gameRouter.get('/spinRule',spinRule) 






export default gameRouter;