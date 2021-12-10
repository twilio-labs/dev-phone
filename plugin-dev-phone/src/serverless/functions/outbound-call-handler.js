// Create an outbound PTSN voip call
// params: from, to, identity

exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    if (!event.from || !event.to) {
        return callback('You need to provide From and To params', null);
    }

    twiml.say(`Hello! I'm connecting you to the phone...`);

    const dial = twiml.dial({
        callerId: event.from,
    }, event.to);

    return callback(null, twiml);
};
