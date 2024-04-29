import express from 'express'; 
import jwtAuth from '../middleware/jwt.js'; 
import { createComplaint, fetchAllComplaints } from '../controllers/complainController.js';

const complainRouter=express.Router();

complainRouter.post('/createComplaint',jwtAuth,createComplaint);
complainRouter.get('/fetchAllComplaints',jwtAuth,fetchAllComplaints);



export default complainRouter;