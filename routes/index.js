import express from 'express'; 
import jwtAuth from '../middleware/jwt.js'
import { deleteTransactionById, getAllWithdrawTransactions,getTransactionById, updateTransactionById } from '../controllers/adminController/withdrawRequestController.js';
import {deleteUser, getAllRegisteredUser, getAllSupportData, getUserById, updateUser } from '../controllers/adminController/registeredController.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { getAllTransactionsByUserId, withdrawTransaction } from '../controllers/adminController/listWithDrawController.js';
import { deleteComplain, getAllComplains, getUserByComplainId, updateComplainStatus } from '../controllers/adminController/helpSupportController.js';
import { adminUpdate, getAdminProfileById } from '../controllers/adminController/adminProfile.js';
import { getAdminAmountData } from '../controllers/adminController/amtAdminController.js';
import {  calculateAndStoreBettingDetail } from '../controllers/adminController/bettingController.js';
import { getDeposited } from '../controllers/adminController/depositedController.js';
import { fetchAdminRevenueData } from '../controllers/adminController/revenueController.js';
import { Userlist, userStatFilterGraph, userStatGraph } from '../controllers/adminController/userManagementController.js';


const adminRouter=express.Router();

//adminProfile
adminRouter.get('/getAdminProfile',jwtAuth,isAdmin,getAdminProfileById);
adminRouter.put('/adminUpdate',jwtAuth,isAdmin,adminUpdate);


// withDraw REquest
adminRouter.get('/withDrawReq',jwtAuth,isAdmin,getAllWithdrawTransactions);
adminRouter.get('/getTransactionById/:transactionId',jwtAuth,isAdmin,getTransactionById);
adminRouter.put('/updateTransactionById/:transactionId',jwtAuth,isAdmin,updateTransactionById);
adminRouter.delete('/deleteTransactionById/:transactionId',jwtAuth,isAdmin,deleteTransactionById);

// Registerred User
adminRouter.get('/getAllRegisteredUser',jwtAuth,isAdmin,getAllRegisteredUser);
adminRouter.get('/getUserById/:userId',jwtAuth,isAdmin,getUserById);
adminRouter.put('/updateUser/:userId',jwtAuth,isAdmin,updateUser);
adminRouter.delete('/deleteUser/:userId',jwtAuth,isAdmin,deleteUser);
adminRouter.delete('/logout/:userId',jwtAuth,isAdmin,deleteUser);

adminRouter.get('/getAllSupportData/',jwtAuth,isAdmin,getAllSupportData);


// Withdraw LIST
adminRouter.post('/withdrawTransaction',jwtAuth,isAdmin,withdrawTransaction);
adminRouter.get('/getAllTransactionsByUserId/',jwtAuth,isAdmin,getAllTransactionsByUserId);//sort, id, date used them as query

//helpAndSupport
adminRouter.get('/getAllComplains',jwtAuth,isAdmin,getAllComplains);
adminRouter.get('/updateComplainStatus/:id',jwtAuth,isAdmin,updateComplainStatus);
adminRouter.get('/getUserByComplainId/:id',jwtAuth,isAdmin,getUserByComplainId);
adminRouter.delete('/deleteComplain/:id',jwtAuth,isAdmin,deleteComplain);


// User Management
adminRouter.get('/userStatGraph',jwtAuth,isAdmin,userStatGraph);
adminRouter.get('/userStatFilterGraph',jwtAuth,isAdmin,userStatFilterGraph);//  const { type } = req.query; // Type can be 'week', 'month', '6months', or 'year'
adminRouter.get('/Userlist',jwtAuth,isAdmin,Userlist); 
adminRouter.put('/updateUser/:userID',jwtAuth,isAdmin,updateUser); // body: userWallet, status
adminRouter.delete('/deleteUser/:userId',jwtAuth,isAdmin,deleteUser); 

//Admin amount 
adminRouter.get('/getAdminAmountData',jwtAuth,isAdmin,getAdminAmountData);// you can sort the query sortByDate =asc, sortByTotalAmount=asc

//betting details
adminRouter.get('/getBettingDetails',jwtAuth,isAdmin,calculateAndStoreBettingDetail);//

// Deposited Amount
adminRouter.get('/getDeposited',jwtAuth,isAdmin,getDeposited);//

//Total Revenene  
adminRouter.get('/revenueAdminProfit',jwtAuth,isAdmin,fetchAdminRevenueData);//

export default adminRouter; 