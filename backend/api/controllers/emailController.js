const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (req, res) => {
  const { name, location, email, form_message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: "kaiserlaconfiture@gmail.com",
    subject: "Project Inquiry | Caenar",
    text: 
    `Name: ${name}\nLocation: ${location}\nEmail address: ${email}\nMessage: ${form_message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: `Email sent succesfully.`
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to send email`
    });
  }
};

module.exports = { sendEmail };
