// Incoming Message Handler

exports.handler = async function(context, event, callback) {
    // receive an SMS and put into a conversation

    // Webhook URL should be https://dev-phone-[RANDOM].twil.io/inbound-sms?conversation=[YOUR_CONVERSATION_SID]
    const client = context.getTwilioClient();
    await client.conversations.conversations(context.CONVERSATION_SID) //conversation.sid)
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
