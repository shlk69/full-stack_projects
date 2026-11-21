
import { randomUUID } from "crypto";
import { saveGatewayRequestLog } from "./gateway.controller.js";

export const requestLoggingMiddleware = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    const requestId = randomUUID();

    req.requestId = requestId;

    res.setHeader("X-Request-ID", requestId);

    let logged = false;

    const saveLog = (clientAborted = false) => {
        if (logged) return;

        logged = true;

        const endTime = process.hrtime.bigint();

        const durationMs = Number(endTime - startTime) / 1_000_000;

        const responseSize = Number(
            res.getHeader("content-length") || 0
        );

        void saveGatewayRequestLog({
            requestId,

            environmentId: req.environment?._id,
            apiKeyId: req.apiKey?.id,
            apiConfigurationId: req.apiConfiguration?._id,

            method: req.method,
            path: req.path,

            statusCode: clientAborted ? 499 : res.statusCode,
            durationMs: Math.round(durationMs),

            responseSize,
            clientAborted,
        });
    };

    res.on("finish", () => {
        saveLog(false);
    });

    res.on("close", () => {
        if (!res.writableFinished) {
            saveLog(true);
        }
    });

    next();
};
