const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';

    res.status(statusCode).json({
        success: false,
        message,
        code
    });
};

module.exports = { errorHandler };
