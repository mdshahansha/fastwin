import express from 'express'; 
import jwtAuth from '../middleware/jwt.js'; 
import { agencyPrivilge, agentMillionariePlan, createMyLinkAndCode, fetchReferralCounts, getAgentAmount, getMyReferralLinkAndCode, getReferAll, incomeDetails, inviteLinkByEmail, invitedToday, referralRanking, todayIncome } from '../controllers/refferalController.js';

const referRouter=express.Router();

referRouter.get('/referralRanking',referralRanking);
referRouter.get('/agencyPrivilge',agencyPrivilge);
referRouter.post('/createMyLinkAndCode',jwtAuth,createMyLinkAndCode)
referRouter.post('/getMyReferralLinkAndCode',jwtAuth,getMyReferralLinkAndCode)
referRouter.post('/inviteLinkByEmail',jwtAuth,inviteLinkByEmail)
referRouter.post('/agentMillionariePlan',jwtAuth,agentMillionariePlan)
referRouter.get('/',getReferAll);

referRouter.get('/levelCounts',jwtAuth,fetchReferralCounts)//on basis of level
referRouter.get('/inviteToday',jwtAuth,invitedToday) 
referRouter.get('/todayIncome',jwtAuth,todayIncome) 
referRouter.get('/incomeDetails',jwtAuth,incomeDetails) 

referRouter.get('/getAgentAmount',jwtAuth,getAgentAmount) 


//only agent withdraw is left
//while sign up now user data updating level,referrer money,agent amount 4 level embedded the data
export default referRouter;