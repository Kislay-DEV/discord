import mongoose from 'mongoose';

interface Connection {
  isConnected?: number;
}

const connection: Connection = {}; // Track the connection state

export async function connect(): Promise<void> {
  try {
    // Check if there is an existing connection
    if (connection.isConnected && mongoose.connection.readyState === 1) {
      console.log('Using existing database connection');
      return;
    }

    // Establish a new connection
    const db = await mongoose.connect(process.env.MONGO_URI!);

    connection.isConnected = db.connections[0].readyState; // Update connection state
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Database connection failed');
  }
}