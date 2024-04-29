import express from 'express'; 
import jwtAuth from '../middleware/jwt.js'; 
import { chatWithUs, writeUsAt } from '../controllers/supportController.js';

const supportRouter=express.Router();

supportRouter.get('/writeUsAt',jwtAuth,writeUsAt);
supportRouter.get('/chatWithUs',jwtAuth,chatWithUs);


export default supportRouter;