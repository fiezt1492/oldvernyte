const mongoose = require("mongoose");

module.exports =  async (dbURL) => {
  try {
    await mongoose.connect(dbURL, {
    //   useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    //   useFindAndModify: false,
    });

    console.log(`[MONGO] Database connected`);
  } catch (error) {
    console.log("[MONGO] Error: " + error.message);
    process.exit(1);
  }
};
