const mongoose = require('mongoose');
module.exports = async function connectToDb() {
    if (!process.env.DB_CONNECT) throw new Error('DB_CONNECT is required');
    await mongoose.connect(process.env.DB_CONNECT, { serverSelectionTimeoutMS: 10000 });

};
