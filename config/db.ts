// db.ts
import mongoose, { ConnectOptions } from 'mongoose';

const MONGO_URL = 'mongodb+srv://Abnet:80110847@cluster0.a2m4yru.mongodb.net/?retryWrites=true&w=majority'; // DB URI

const mongooseOptions: ConnectOptions = {};
 
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URL, mongooseOptions);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from the database');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
};

export { connectToDatabase, disconnectFromDatabase };
