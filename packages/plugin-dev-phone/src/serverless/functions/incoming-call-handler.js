// Incoming call from PTSN to the dev phone browser

exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();

    const dial = twiml.dial({answerOnBridge: true});
    const client = dial.client();
    client.identity(context.DEV_PHONE_NAME);
    Object.entries(event).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            client.parameter({name: key, value: String(value)});
        }
    });

    return callback(null, twiml);
};
