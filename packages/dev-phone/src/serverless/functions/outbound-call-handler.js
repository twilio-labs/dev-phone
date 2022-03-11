// Create an outbound PTSN voip call
// params: from, to, identity

exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    if (!event.from || !event.to) {
        return callback('You need to provide From and To params', null);
    }
    const dial = twiml.dial({
        callerId: event.from,
    });
    dial.number({
        statusCallback: `https://${context.DOMAIN_NAME}/sync-call-history`,
        statusCallbackEvent: 'initiated ringing answered completed'
    }, event.to);
    console.log(twiml.toString());

    return callback(null, twiml);
};
