
import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

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

startServer();
