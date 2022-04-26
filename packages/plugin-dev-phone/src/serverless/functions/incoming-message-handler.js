// Incoming Message Handler

exports.handler = async function(context, event, callback) {
    // receive an SMS and put into a conversation

    const client = context.getTwilioClient({
        userAgentExtension: [
            `@twilio-labs/dev-phone/${context.DEV_PHONE_VERSION}`,
            `@twilio-labs/dev-phone/serverless`,
            'serverless-functions'
        ]
    });
    await client.conversations
        .services(context.CONVERSATION_SERVICE_SID)
        .conversations(context.CONVERSATION_SID)
        .messages
        .create({
            author: event.From,
            body: event.Body,
            attributes: {
                fromCity: event.FromCity,
                fromCountry: event.FromCountry,
                messageSid: event.MessageSid,
                numMedia: event.NumMedia
            }
        })
        .then(message => console.log(message));

    // Answer with an empty response
    let twiml = new Twilio.twiml.MessagingResponse();
    return callback(null, twiml);
};
