const bcrypt = require("bcrypt");

// Verifies if the hashed data in the database is the same as user input
const verifyHashedData = async (unhashed, hashed) => {
  try {
    const match = await bcrypt.compare(unhashed, hashed);
    return match;
  } catch (error) {
    throw error;
  }
};

module.exports = verifyHashedData;
