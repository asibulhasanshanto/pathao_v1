const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateJwtToken = (payload, option = { expiresIn: process.env.JWT_EXPIRES_IN }) => {
    return jwt.sign(payload, process.env.JWT_SECRET, option);
};

const verifyJwtToken = (token) => {
    return promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

// const verifyJwt = (token, secret, callback) => {
//     jwt.verify(token, secret, callback);
// };

// const verifyJwtToken = async (token) => {
//     // Convert the custom wrapper function into a promise using the promisify utility.
//     const verifyPromise = promisify(verifyJwt);

//     // Verify the JWT using the promisified verifyJwt function and the JWT_SECRET from the environment.
//     const decodedPayload = await verifyPromise(token, process.env.JWT_SECRET);

//     // Return the decoded payload as a Promise.
//     return Promise.resolve(decodedPayload);
// };

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
    generateJwtToken,
    verifyJwtToken,
    hashToken,
};
