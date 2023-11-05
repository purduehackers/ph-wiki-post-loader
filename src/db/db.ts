import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch(() => {
      console.log("Couldn't connect to MongoDB");
    });
};

export const disconnectDB = () => {
  mongoose.connection.close();
};
