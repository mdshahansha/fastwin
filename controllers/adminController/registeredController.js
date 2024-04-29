import User from "../../models/userModel.js";
import Support from "../../models/supportCare.js";





//USER
export const getAllRegisteredUser = async (req, res) => {
    try {
        let sortCriteria = {};

        // Check if sorting is requested
        const { sort, sortBy } = req.query;
        if (sort && sortBy) {
            if (sortBy.toLowerCase() === 'date') {
                sortCriteria.createdAt = sort === 'asc' ? 1 : -1; // Sort by date
            } else if (sortBy.toLowerCase() === 'id') {
                sortCriteria._id = sort === 'asc' ? 1 : -1; // Sort by ID
            }
        }

        // Fetch users with specified fields and sort criteria
        const users = await User.find({}, '_id name email phoneNumber')
            .sort(sortCriteria);

        res.status(200).json({ success: true, users: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, user: user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { name, email, phoneNumber } = req.body;

        // Find the user by ID
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update user details
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Save the updated user
        user = await user.save();

        res.status(200).json({ success: true, user: user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID and delete
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
export const logout = async (req, res) => {
    // 1. Read the token from the request headers
    const token = req.headers.authorization;
  
    // 2. If no token is provided or token is blacklisted, return an unauthorized response
    if (!token || blacklistedTokens.has(token)) {
      return res.status(401).send('Unauthorized,');
    }
  
    try {
      // 3. Add the token to the blacklist to invalidate it
      blacklistedTokens.add(token);
  // Clear the token from the client-side storage
  res.clearCookie('token'); // Example for cookies, adjust for your storage mechanism
  
      // 4. Return a success response indicating logout is successful
      return res.status(200).send('Logout successful');
    } catch (err) {
      // 5. If an error occurs, log it and return an internal server error response
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
  };


export const getAllSupportData = async (req, res) => {
      try {
          // Fetch all support data from the database
          const allSupportData = await Support.find();
  
          // Send the support data as a JSON response
          res.status(200).json({ success: true, data: allSupportData });
      } catch (error) {
          console.error("Error fetching support data:", error);
          // Send an error response to the client
          res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
  };