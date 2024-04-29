import User from "../models/userModel.js";
// Middleware to check if the user is an admin

export const isAdmin=async (req, res, next) =>{
    // Check if the user is logged in and is an admin
    const user = await User.findById(req.userID);
// console.log("   -> ",user.isAdmin)
    if (user && user.isAdmin) {
        // User is an admin, proceed to the next middleware
        return next();
    }
    // User is not an admin, send unauthorized response
    return res.status(403).json({ success: false, error: 'Unauthorized' });
}
 
