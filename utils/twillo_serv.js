const accountSid = "AC8051bcff82a2eb262d8c2e1a43a16e31";
const serviceSid = "VA8a150b11a5dfe2e2c166f2bf90a7ee06";
const authToken = "560058970035b5e761ddcc682093c1be";

const channelSid = "XEee1691c1df9d28afd8c8ab70a912aa16";


//

const client = require('twilio')(accountSid, authToken);

module.exports = {
    client, accountSid, serviceSid, authToken, channelSid
}


