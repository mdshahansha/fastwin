import User from '../../models/userModel.js'; // Import the User model

export const getAdminProfileById = async (req, res) => {
    try {
        // Extract the user ID from the request parameters
        const  userId  = req.userID;

        // Find the user by ID
        const adminProfile = await User.findOne({ _id: userId, isAdmin: true });

        // Check if the user exists and is an admin
        if (!adminProfile) {
            return res.status(404).json({ success: false, error: 'Admin profile not found' });
        }

        // Respond with the admin profile data
        res.status(200).json({ success: true, adminProfile });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error fetching admin profile:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


export const adminUpdate = async (req, res) => {
    try {
        // Extract the user ID from the request parameters
        const id=req.userID
        // Extract all fields to be updated from the request body
        const { name, email, phoneNumber, password, lastLogin, dailyStreaks, accountNumber, ifscCode } = req.body;

        // Find the user by ID
        let user = await User.findById(id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ success: false, error: 'admin not found' });
        }

        // Update user details including admin-specific fields if they are present in the request body
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password) user.password = password;
        if (lastLogin) user.lastLogin = lastLogin;
        if (dailyStreaks) user.dailyStreaks = dailyStreaks;
        if (accountNumber) user.adminData.accountNumber = accountNumber;
        if (ifscCode) user.adminData.ifscCode = ifscCode;

        // Save the updated user
        const updatedUser = await user.save();

        // Respond with the updated user data
        res.status(200).json({ success: true, updatedUser });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
