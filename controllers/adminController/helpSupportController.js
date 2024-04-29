import Complain from '../../models/complain.js'; // Import the Complain model
import User from '../../models/userModel.js';



export const getAllComplains = async (req, res) => {
    try {
        const userId = req.userID;
        // Find the user by userID
        const user = await User.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        let sortCriteria = {};

        // Check if the sort parameter is provided
        if (req.query.sort) {
            // Sort based on the specified parameter
            if (req.query.sort === 'id') {
                sortCriteria = { _id: 1 }; // Sort by ID in ascending order
            } else if (req.query.sort === 'date') {
                sortCriteria = { createdAt: 1 }; // Sort by date in ascending order
            }
            // Add more conditions for additional sorting parameters if needed
        }

        // Fetch all complains from the database, sorted based on the criteria
        const complains = await Complain.find()
            .select('user status ticketNumber') // Select only the required fields
            .populate('user', 'name email phoneNumber') // Populate the 'user' field with 'name', 'email', and 'phoneNumber'
            .sort(sortCriteria); // Apply the sorting criteria

        // Respond with the list of complains
        res.status(200).json({ success: true, complains });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error fetching complains:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//update
export const updateComplainStatus = async (req, res) => {
    try {
        const userId = req.userID;
        // Find the user by userID
        const user = await User.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const { id } = req.params; // Extract the complaint ID from the request parameters
        const { status } = req.body; // Extract the new status from the request body

        // Find the complaint by ID and update its status
        const updatedComplain = await Complain.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedComplain) {
            // If no complaint is found with the given ID, respond with an error message
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        // Respond with the updated complaint
        res.status(200).json({ success: true, updatedComplain });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error updating complain status:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//view
export const getUserByComplainId = async (req, res) => {
    try {
        const userId = req.userID;
        // Find the user by userID
        const user = await User.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const { id } = req.params; // Extract the complaint ID from the request parameters

        // Find the complaint by ID and populate the 'user' field to retrieve all user parameters
        const complainWithUser = await Complain.findById(id)

        if (!complainWithUser) {
            // If no complaint is found with the given ID, respond with an error message
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        // Respond with the user associated with the complaint
        res.status(200).json({ success: true, user: complainWithUser });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error fetching user by complain ID:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteComplain = async (req, res) => {
    try {
        // Extract the complain ID from the request parameters
        const { id } = req.params;

        // Find the complain by ID and delete it
        const deletedComplain = await Complain.findByIdAndDelete(id);

        // Check if the complain exists
        if (!deletedComplain) {
            return res.status(404).json({ success: false, error: 'Complain not found' });
        }

        // Respond with a success message and the deleted complain data
        res.status(200).json({ success: true, message: 'Complain deleted successfully', complain: deletedComplain });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error("Error deleting complain:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


