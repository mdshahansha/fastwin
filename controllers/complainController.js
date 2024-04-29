import Complain from '../models/complain.js'
import User from '../models/userModel.js';

let ticketNumber = 1000000;

export const generateTicketNumber = () => {
    ticketNumber++;
    return ticketNumber.toString().padStart(7, '0');
};

export const createComplaint = async (req, res) => {
    const { email, complainBody } = req.body;
    const userId = req.userID;
    try {
    // Find the user by userID
    const user = await User.findById(userId);
    // Check if user exists
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }   
    console.log(user.email," ",user.name)
    const newTicketNumber = generateTicketNumber();

        // Create a new complaint instance
        const newComplaint = new Complain({
            user: userId,
            email: email,
            name:user.name,
            complainBody,
            ticketNumber:newTicketNumber
        });
        // Save the complaint to the database
        await newComplaint.save();

        return res.status(201).json({ message: 'Complaint created successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const fetchAllComplaints = async (req, res) => {
    try {
        // Fetch all complaints from the database
        const complaints = await Complain.find();

        return res.status(200).json({ complaints });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
