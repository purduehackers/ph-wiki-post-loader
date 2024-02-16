import mongoose from 'mongoose'

export const connectDB = async () => {
  if (process.env.NODE_ENV === 'production') {
    await mongoose
      .connect(process.env.MONGODB_URI || '')
      .then(() => {
        console.log('Connected to MongoDB')
      })
      .catch(() => {
        console.log("Couldn't connect to MongoDB")
      })
  } else {
    await mongoose
      .connect(`mongodb://127.0.0.1:27017/${process.env.DEV_DB_NAME}`)
      .then(() => {
        console.log('Connected to MongoDB')
      })
      .catch(() => {
        console.log("Couldn't connect to MongoDB")
      })
  }
}

export const disconnectDB = async () => {
  await mongoose.connection.close()
}
