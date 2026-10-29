import mongoose from 'mongoose';

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected successfully`);
    } catch (error) {
        console.error('❌ Error while connecting to the DB:', error.message);
        process.exit(1);
    }
}
