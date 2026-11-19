import cookieParser from 'cookie-parser'
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.routes.js";
import orgRouter from './routes/organization.routes.js'
import projectRouter from "./routes/project.routes.js";
import environmenRouter from './routes/environment.routes.js'
import apiConfigRouter from './routes/api-configuration.routes.js'
import apiKeyRouter from './routes/api-key.routes.js'


export const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
}));
app.use(cookieParser())
app.use(express.json({ limit: "100kb" }));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GateFlow API is running",
    });
});


app.use("/api/auth", authRouter);
app.use("/api/organizations", orgRouter);
app.use("/api", projectRouter);
app.use("/api", environmenRouter);
app.use("/api/", apiConfigRouter);
app.use("/api/", apiKeyRouter);


app.get("/", (req, res) => {
    res.status(200).send("GateFlow server is live");
});
