import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

export const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
    console.log("Could not connect to DB");
  }
};
