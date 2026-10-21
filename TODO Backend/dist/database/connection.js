import mongoose from "mongoose";
const connectToDatabase = () => mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connected to MongoDB");
});
export default connectToDatabase;
//# sourceMappingURL=connection.js.map