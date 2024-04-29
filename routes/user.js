import express from 'express'; 
import { addWallet, followUs,   headProfile, logout, orderRecord, resendOtp, sendOtp, signIn, transactionWalletGame, updateName, updatePassword, userProfile, verifyOtpAndRegisterUser } from '../controllers/userController.js';
import jwtAuth from '../middleware/jwt.js';
import  {upload}  from '../middleware/fileupload.middleware.js';

const userRouter=express.Router();
// console.log("->",upload);
 
userRouter.post('/sendOtp',sendOtp);
userRouter.post('/verifyOtpAndRegisterUser',verifyOtpAndRegisterUser);
userRouter.post('/resendOtp',resendOtp);
userRouter.post('/signIn',signIn);
userRouter.put('/addWallet',jwtAuth,addWallet);
userRouter.get('/logout',jwtAuth,logout);
  
userRouter.get('/headProfile',jwtAuth,headProfile);
userRouter.put('/updateName',jwtAuth,updateName);
userRouter.put('/updatePassword',jwtAuth,updatePassword);
userRouter.get('/orderRecord',jwtAuth,orderRecord);
userRouter.get('/followUs',jwtAuth,followUs);

userRouter.get('/transactionWalletGame',jwtAuth,transactionWalletGame);
userRouter.put('/userProfile',jwtAuth,upload.single('imageUrl'),userProfile);








// userRouter.post('/getGamesByUserAndType',jwtAuth,getGamesByUserAndType);
// userRouter.get('/getGamesByTypeHeadTail',getGamesByTypeHeadTail);




export default userRouter;