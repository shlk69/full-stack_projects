
import { ApiRequestLog } from "../models/api-request-log.model.js";

export const saveGatewayRequestLog = async (logData) => {
    try {
        await ApiRequestLog.create({
            requestId: logData.requestId,

            environmentId: logData.environmentId || null,
            apiKeyId: logData.apiKeyId || null,
            apiConfigurationId: logData.apiConfigurationId || null,

            method: logData.method,
            path: logData.path,

            statusCode: logData.statusCode,
            durationMs: logData.durationMs,

            responseSize: logData.responseSize,
            clientAborted: logData.clientAborted,
        });
    } catch (error) {
        // Logging failure must not affect the API response.
        console.error("Gateway request logging failed:", error.message);
    }
};
