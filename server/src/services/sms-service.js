// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const sendSMS = (phone, message) => {
//     return client.messages.create({
//         body: message,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: phone,
//     });
// };

const sendSMS = (phone, message) => {};

module.exports = { sendSMS };
