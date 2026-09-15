import mongoose from "mongoose";

const connectToDatabase = () =>
  mongoose.connect(process.env.MONGODB_URL as string).then(() => {
    console.log("Connected to MongoDB");
  });

export default connectToDatabase;
