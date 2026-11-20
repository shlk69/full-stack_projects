
import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { redis } from "./config/redis.js";

const port = Number(process.env.PORT) || 3001;

async function startServer() {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`GateFlow server running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start GateFlow:", error.message);
        process.exitCode = 1;
    }
}

const testRedis = async () => {
    try {
        const response = await redis.ping();
        console.log("Redis ping response:", response);
    } catch (error) {
        console.error("Redis test failed:", error.message);
    }
};


startServer();
testRedis();
