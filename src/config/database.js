const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://vivekchaurasiyatutorials_db_user:PYtsQuaWMHZDs6q4@nodejs.gjsarc2.mongodb.net/devTinder?appName=NodeJs'
    );
  } catch (error) {
    console.error('Database connection failed', error);
  }
};

module.exports = connectDb;


