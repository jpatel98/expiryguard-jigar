import { config } from 'dotenv'
import { dbConnect } from './dbConnect'
import mongoose from 'mongoose'

// Load environment variables from .env file
config()

async function testConnection() {
  try {
    // Log the MongoDB URI (with password hidden)
    const uri = process.env.MONGODB_URI || ''
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@')
    console.log('Attempting to connect with URI:', maskedUri)

    // Try to connect to the database
    await dbConnect()
    console.log('Successfully connected to MongoDB!')

    // Log the connection state
    const state = mongoose.connection.readyState
    console.log('Mongoose connection state:', state)
    console.log('Connection states:')
    console.log('0 = disconnected')
    console.log('1 = connected')
    console.log('2 = connecting')
    console.log('3 = disconnecting')

    // Create a test collection to verify write access
    const testCollection = mongoose.connection.collection('test')
    await testCollection.insertOne({ test: 'Hello MongoDB!' })
    console.log('Successfully wrote to test collection')

    // Read from the test collection
    const result = await testCollection.findOne({ test: 'Hello MongoDB!' })
    console.log('Successfully read from test collection:', result)

    // Clean up - delete the test document
    await testCollection.deleteOne({ test: 'Hello MongoDB!' })
    console.log('Successfully deleted test document')

    console.log('All database operations successful!')
  } catch (error) {
    console.error('Database connection test failed with error:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

// Run the test
testConnection() 