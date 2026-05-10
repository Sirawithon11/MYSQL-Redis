var error = require('./../error');
const redis = require('./../config/redis');
const crypto = require('crypto');

/**
 * Typical refreshToken schema:
 * userId:   { type: "object", required: true },
 * clientId: { type: "object", required: true },
 * token:    { type: "string", required: true, unique: true },
 * scope:  { type: "array", required: false,
 *     items: { type: "string", enum: ["possible", "scope", "values"] },
 * }
 *
 * Primary key: token
 * Unique key: userId + clientId pair should be unique
 * 
 * Redis Storage Strategy:
 * - refreshToken:{token} -> JSON object with userId, clientId, scope, createdAt
 * - refreshToken:user:{userId}:client:{clientId} -> token (for quick lookup)
 */

/**
 * Gets userId parameter of the refreshToken
 *
 * @param refreshToken {Object} RefreshToken object
 */
module.exports.getUserId = function(refreshToken) {
    if (!refreshToken || !refreshToken.userId) {
        throw new error.serverError('Invalid refreshToken object');
    }
    return refreshToken.userId;
};

/**
 * Gets clientId parameter of the refreshToken
 *
 * @param refreshToken {Object} RefreshToken object
 */
module.exports.getClientId = function(refreshToken) {
    if (!refreshToken || !refreshToken.clientId) {
        throw new error.serverError('Invalid refreshToken object');
    }
    return refreshToken.clientId;
};

/**
 * Gets scope parameter of the refreshToken
 *
 * @param refreshToken {Object} RefreshToken object
 */
module.exports.getScope = function(refreshToken) {
    if (!refreshToken) {
        throw new error.serverError('Invalid refreshToken object');
    }
    return refreshToken.scope || [];
};

/**
 * Fetches refreshToken object by token
 * Should be implemented with server logic
 *
 * @param token {String} Unique identifier
 * @param cb {Function} Function callback ->(error, object)
 */
module.exports.fetchByToken = function(token, cb) {
    (async () => {
        try {
            const key = `refreshToken:${token}`;
            const data = await redis.get(key);
            
            if (!data) {
                return cb(null, null);
            }
            
            const refreshToken = JSON.parse(data);
            cb(null, refreshToken);
        } catch (err) {
            cb(err);
        }
    })();
};

/**
 * Removes refreshToken (revokes) for the client-user pair
 * Should be implemented with server logic
 *
 * @param userId {String} Unique identifier
 * @param clientId {String} Unique identifier
 * @param cb {Function} Function callback ->(error)
 */
module.exports.removeByUserIdClientId = function(userId, clientId, cb) {
    (async () => {
        try {
            const lookupKey = `refreshToken:user:${userId}:client:${clientId}`;
            const token = await redis.get(lookupKey);
            
            if (!token) {
                return cb(null);
            }
            
            const tokenKey = `refreshToken:${token}`;
            await redis.del(tokenKey);
            await redis.del(lookupKey);
            
            cb(null);
        } catch (err) {
            cb(err);
        }
    })();
};

/**
 * Removes refreshToken (revokes) by token value
 * Should be implemented with server logic
 *
 * @param token {String} Unique identifier (token string)
 * @param cb {Function} Function callback ->(error)
 */
module.exports.removeByRefreshToken = function(token, cb) {
    (async () => {
        try {
            const tokenKey = `refreshToken:${token}`;
            const data = await redis.get(tokenKey);
            
            if (!data) {
                return cb(null);
            }
            
            const refreshToken = JSON.parse(data);
            const lookupKey = `refreshToken:user:${refreshToken.userId}:client:${refreshToken.clientId}`;
            
            await redis.del(tokenKey);
            await redis.del(lookupKey);
            
            cb(null);
        } catch (err) {
            cb(err);
        }
    })();
};

/**
 * Create refreshToken object (generate + save)
 * Should be implemented with server logic
 *
 * @param userId {String} Unique identifier
 * @param clientId {String} Unique identifier
 * @param scope {Array|null} Scope values
 * @param cb {Function} Function callback ->(error, token{String})
 */
module.exports.create = function(userId, clientId, scope, cb) {
    (async () => {
        try {
            // Generate unique token
            const token = crypto.randomBytes(32).toString('hex');
            
            const refreshToken = {
                userId: userId,
                clientId: clientId,
                token: token,
                scope: scope || [],
                createdAt: new Date().toISOString()
            };
            
            const tokenKey = `refreshToken:${token}`;
            const lookupKey = `refreshToken:user:${userId}:client:${clientId}`;
            
            // Set with 30-day expiration
            const expirationSeconds = 30 * 24 * 60 * 60; // 30 days
            
            // Store token object
            await redis.setEx(tokenKey, expirationSeconds, JSON.stringify(refreshToken));
            
            // Store lookup key for quick access by userId + clientId
            await redis.setEx(lookupKey, expirationSeconds, token);
            
            cb(null, token);
        } catch (err) {
            cb(err);
        }
    })();
};