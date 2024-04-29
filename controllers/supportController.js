 import nodemailer from 'nodemailer'
import Support from '../models/supportCare.js';
import { simpleParser } from 'mailparser';
import  Imap from 'imap';
import dotenv from "dotenv";
  
dotenv.config(); 

// Function to process incoming emails
async function processIncomingEmail(email) {
  try {
    const currentDate = new Date();
    const emailDate = new Date(email.date);

    // Check if the email date is today or later
    if (emailDate >= currentDate) { 
      // Save the email to MongoDB (optional)
      await saveEmailToDatabase(email);
    }

    // Send an auto-response
    await sendAutoResponse(email.from.value[0].address);
    console.log('Auto-response sent to:', email.from.value[0].address);
  } catch (error) {
    console.error('Error processing email:', error);
  }
}

// Function to save email to the database (example)
async function saveEmailToDatabase(email) {
  try {
    // Extract relevant data from the email object
    // const user = email.from.value[0].address;
    const emailData = {
      email: email.from.text,
      name: email.from.value[0].name || '',
      support: email.subject
    };

    // Create a new instance of the Support model
    const newSupport = new Support(emailData);

    // Save the support data to the database
    await newSupport.save();

    console.log('Email saved to the database:', emailData);
  } catch (error) {
    console.error('Error saving email to database:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

// Function to send auto-response
async function sendAutoResponse(senderEmail) {
  const transporter = nodemailer.createTransport({
    // Setup your email provider here (e.g., Gmail, Outlook, etc.)
    service: 'Gmail',
    auth: {
      user: process.env.NODE_EMAIL, // Your email address
      pass:process.env.NODEMAILER_PASSWORD
      // pass: process.env.NODEMAILER_PASSWORD // Your email password
    }
  });

  const mailOptions = {
    from: process.env.NODE_EMAIL, // Sender email address
    to: senderEmail, // Recipient email address (sender's email)
    subject: 'Auto-response: Email Received',
    text: 'Thank you for contacting us. We have received your email and will get back to you as soon as possible.'
  };

  await transporter.sendMail(mailOptions);
}

// Setup IMAP configuration
const imapConfig = {
  user: process.env.NODE_EMAIL, // Your application's email address
  pass:"nodeflyweis@742#",
  // password: process.env.NODEMAILER_PASSWORD, // Your email password
  host: 'imap.gmail.com', // IMAP server host
  port: 993, // IMAP port (993 for SSL)
  tls: true // Use TLS
};

// Connect to the IMAP server
const imap = new Imap(imapConfig);

// Listen for new emails
imap.once('ready', () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('Error opening INBOX:', err);
      return;
    }
    imap.on('mail', async numNewMsgs => {
      // Fetch and process new emails
      imap.search(['UNSEEN'], (searchErr, searchResults) => {
        if (searchErr) {
          console.error('Error searching for new emails:', searchErr);
          return;
        }
        const fetch = imap.fetch(searchResults, { bodies: '' });
        fetch.on('message', msg => {
          msg.on('body', stream => {
            simpleParser(stream, async (parseErr, parsedEmail) => {
              if (parseErr) {
                console.error('Error parsing email:', parseErr);
                return;
              }
              processIncomingEmail(parsedEmail);
            });
          });
        });
        fetch.once('end', () => {
          // Mark fetched emails as read
          imap.setFlags(searchResults, ['\\Seen'], err => {
            if (err) {
              console.error('Error marking emails as read:', err);
              return;
            }
          });
        });
      });
    });
  });
});

imap.once('error', err => {
  console.error('IMAP error:', err);
  // You can handle the error here, e.g., send an email to the admin
});

imap.once('end', () => {
  console.log('IMAP connection ended');
  // You can handle the end of the connection here
});

// Start listening for new emails
// imap.connect();   //uncomment it when we got email 16 password

export default imap;


export const writeUsAt=async (req,res)=>{
  res.json({email:"fiewin.recharge@support.com"})//what ever the email user write it will save above i code 
}

export const chatWithUs=async (req,res)=>{
  res.json({message:"let Start the chat",email:"https://wa.me/991125387"})
}