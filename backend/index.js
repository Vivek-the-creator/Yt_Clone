import dotenv from "dotenv";
import connectDB from "./config/mongoDB.js";
import app from "./app.js";

dotenv.config();

// Connect to MongoDB and start the server
connectDB().then(() => {
  const PORT = process.env.PORT || 5004;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}!`);
  });
});
