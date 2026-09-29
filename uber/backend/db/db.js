const mongoose = require('mongoose');

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Successfully connected to the database.');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1); 
    }
};

module.exports = connectToDb;
