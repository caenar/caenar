const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
   const { username, password } = req.body;
   try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
         console.log("User not found");
         return res
            .status(401)
            .json({ message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      console.log("Is password valid?", isValidPassword);

      if (!isValidPassword) {
         console.log("Invalid password");
         return res
            .status(401)
            .json({ message: "Invalid username or password" });
      }

      const token = jwt.sign({ userId: user.id }, "Angelou<3", {
         expiresIn: "1h",
      });
      console.log("Authentication successful");
      res.json({ token });
   } catch (error) {
      console.error("Error during authentication:", error);
      res.status(500).json({ message: "Internal server error" });
   }
};
