const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require('dotenv').config();

exports.login = async (req, res) => {
   const { username, password } = req.body;
   try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
         return res
            .status(401)
            .json({ message: "User does not exist" });
      }

      const isValidPassword = await bcrypt.compare(
         password,
         user.hashedPassword
      );

      if (!isValidPassword) {
         return res
            .status(401)
            .json({ message: "Invalid username or password" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
         expiresIn: "30min",
      });
      
      console.log("Authentication successful");
      res.json({ token });
   } catch (error) {
      console.error("Error during authentication:", error);
      res.status(500).json({ message: "Internal server error" });
   }
};
