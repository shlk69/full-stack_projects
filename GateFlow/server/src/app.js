
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
}));
app.use(express.json({ limit: "100kb" }));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GateFlow API is running",
    });
});
app.use("/api/v1/auth", authRouter);
app.get("/", (req, res) => {
    res.status(200).send("GateFlow server is live");
});
