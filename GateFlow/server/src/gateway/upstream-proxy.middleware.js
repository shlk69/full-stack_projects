
import axios from "axios";
import { pipeline } from "stream/promises";

const HOP_BY_HOP_HEADERS = [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
    "x-api-key",
];

const buildUpstreamUrl = (baseUrl, upstreamPath, originalUrl) => {
    const url = new URL(baseUrl);

    // Preserve any base path configured in the upstream URL.
    const basePath = url.pathname.replace(/\/+$/, "");
    const path = upstreamPath.startsWith("/")
        ? upstreamPath
        : `/${upstreamPath}`;

    url.pathname = `${basePath}${path}` || "/";

    // Preserve the original query string.
    const queryIndex = originalUrl.indexOf("?");

    if (queryIndex !== -1) {
        url.search = originalUrl.slice(queryIndex);
    }

    return url.toString();
};

const getForwardHeaders = (headers) => {
    const forwardedHeaders = { ...headers };

    for (const header of HOP_BY_HOP_HEADERS) {
        delete forwardedHeaders[header];
    }

    return forwardedHeaders;
};

export const upstreamProxyMiddleware = async (req, res, next) => {
    try {
        const apiConfiguration = req.apiConfiguration;
        const upstreamPath = req.upstreamPath;

        if (!apiConfiguration?.baseUrl || upstreamPath === undefined) {
            return res.status(500).json({
                success: false,
                message: "Upstream configuration is incomplete",
            });
        }

        // Build the final upstream URL.
        const targetUrl = buildUpstreamUrl(
            apiConfiguration.baseUrl,
            upstreamPath,
            req.originalUrl
        );

        // Prepare headers without exposing the GateFlow API key.
        const headers = getForwardHeaders(req.headers);

        // Forward the request to the upstream server.
        const upstreamResponse = await axios({
            method: req.method,
            url: targetUrl,
            headers,
            data: req.body,
            timeout: apiConfiguration.timeoutMs ?? 10000,
            responseType: "stream",
            validateStatus: () => true,
            maxRedirects: 0,
            maxBodyLength: 10 * 1024 * 1024,
            maxContentLength: 10 * 1024 * 1024,
        });

        // Remove hop-by-hop response headers.
        const responseHeaders = {
            ...upstreamResponse.headers,
        };

        for (const header of HOP_BY_HOP_HEADERS) {
            delete responseHeaders[header];
        }

        // Preserve upstream response headers and status code.
        res.status(upstreamResponse.status);
        res.set(responseHeaders);

        // Stream the upstream response to the client.
        await pipeline(upstreamResponse.data, res);

    } catch (error) {
        if (res.headersSent) {
            res.destroy(error);
            return;
        }

        if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
            return res.status(504).json({
                success: false,
                message: "Upstream server timed out",
            });
        }

        console.error("Upstream proxy error:", error.message);

        return res.status(502).json({
            success: false,
            message: "Unable to reach upstream server",
        });
    }
};
