const bcrypt = require("bcrypt");

// Encrypts data using brcypt
// parameter: data to be hashed and the saltRounds
// returns the hashedData
const hashGenerator = async (data, saltRounds = 10) => {
  try {
    const hashedData = bcrypt.hash(data, saltRounds);
    return hashedData;
  } catch (error) {
    throw error;
  }
};

module.exports = hashGenerator;
