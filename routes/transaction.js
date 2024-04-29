import express from 'express'; 
import jwtAuth from '../middleware/jwt.js'; 
import { RecordTransactionAll, createOrder,  paymentCallBack, paymentCancel, renderProductPage, withdrawRequest } from '../controllers/trasactionController.js';
// import { renderProductPage } from '../controllers/trasactionController.js';
import {helpGPay, helpPaytm, helpPhonePay} from '../controllers/trasactionController.js'

const paymentRouter=express.Router();

paymentRouter.post('/createOrder',jwtAuth,createOrder);
paymentRouter.post('/withdrawRequest',jwtAuth, withdrawRequest)


// // paymentRouter.post('/createOrder', jwtAuth, createOrder);
paymentRouter.get('/transactionPage/:transactionId', renderProductPage);
// // // paymentRouter.post('/orders',getOrderID)
paymentRouter.post('/payment-callback/:transactionId', paymentCallBack)
paymentRouter.get('/payment-cancel/:transactionId', paymentCancel)
paymentRouter.get('/recordAllUser',jwtAuth,RecordTransactionAll);

paymentRouter.get('/helpPhonePay',jwtAuth,helpPhonePay);
paymentRouter.get('/helpGPay',jwtAuth,helpGPay);
paymentRouter.get('/helpPaytm',jwtAuth,helpPaytm);

    



export default paymentRouter;