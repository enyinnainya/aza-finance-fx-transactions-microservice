
const TransactionsController = require('../controllers/transactions');
const jwt = require('jsonwebtoken');
const {APP_ACCESS_API_KEY, APP_JWT_SECRET} = require('../lib/constants');
const {empty} = require('../lib/utils');

/**
 * JWT signing claim is:
 * payload: {apiKey: APP_ACCESS_API_KEY } with signing options:
 * signing options: {
        issuer: "AZA Finance FX Transactions",
        subject: "enyinnainya@azafinanceassessment.com",
        expiresIn: (60 * 60 * 24 * 30 * 12) // expires in 12 months for testing
    }
 * signing key is APP_JWT_SECRET
 *  To pass, verified token need to have the field apiKey and must match the APP_ACCESS_API_KEY defined in lib/constants
 *  This is only for this Assessment and Demonstrate the use of jwt to prevent unauthorized access to this microservice.
 *  In real cases, they would be an access token endpoint specifically to issue access tokens for login and access to apis
 */
const AppAuth = async (req, res, next) => {
    let bearer_token = (!empty(req.headers) && !empty(req.headers.authorization)) ? req.headers.authorization.trim() : "";

    //Extracting access token from original authorization header. Header is in the format: "Bearer [token]". If well-formed, token will be the 2nd element of the split string in array form
    let bearer_token_split = !empty(bearer_token) ? bearer_token.split(" ") : [];
    let access_token = (!empty(bearer_token_split) && !empty(bearer_token_split[1])) ? bearer_token_split[1].trim() : "";

    if (empty(access_token)) {
        return TransactionsController.sendFailedResponse(res, {
            message: "Unauthorized Access: No Authorization token header provided"
        }, 401);
    }

    const verify_token = (access_token, secret) => {
        return new Promise(function (resolve, reject) {
            jwt.verify(access_token, secret, function (err, decoded) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        })
    }
    let verified_token_data = null;
    try {
        verified_token_data = await verify_token(access_token, APP_JWT_SECRET);
    } catch (err) {}
    let isAccessAuthorized = false;
    if (verified_token_data && !empty(verified_token_data) && !empty(verified_token_data.apiKey) && verified_token_data.apiKey === APP_ACCESS_API_KEY) {
        isAccessAuthorized = true;
    }
    if (!isAccessAuthorized) {
        return TransactionsController.sendFailedResponse(res, {
            message: "Unauthorized Access: Failed to authenticate token",
        }, 401);
    } else {
        next();
    }
};

module.exports = AppAuth;
