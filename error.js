/**
 * Custom Error Classes for the Application
 */

/**
 * Server Error - For general server errors
 */
class ServerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServerError';
        this.statusCode = 500;
    }
}

/**
 * Validation Error - For input validation errors
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

/**
 * Authentication Error - For auth failures
 */
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}

/**
 * Authorization Error - For permission denied
 */
class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = 403;
    }
}

/**
 * Not Found Error - For resource not found
 */
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

module.exports = {
    serverError: ServerError,
    ValidationError: ValidationError,
    AuthenticationError: AuthenticationError,
    AuthorizationError: AuthorizationError,
    NotFoundError: NotFoundError
};
