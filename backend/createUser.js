// createUser.js
const bcrypt = require('bcrypt');
const User = require('./api/models/User');

async function createAdminUser() {
  const username = 'admin';
  const password = 'YourAcunt.123'; // Replace with your desired password

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      hashedPassword
    });

    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createAdminUser();