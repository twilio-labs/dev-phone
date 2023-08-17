export function isSmsUrlSet(smsUrl: string) {
    // consider it "unset" if it is blank, or at the default value
    return smsUrl && smsUrl !== "" && smsUrl !== 'https://demo.twilio.com/welcome/sms/reply';
}

export function isVoiceUrlSet(voiceUrl: string) {
    // consider it "unset" if it is blank, or at the default value
    return voiceUrl && voiceUrl !== "" && voiceUrl !== 'https://demo.twilio.com/welcome/voice/';
}

export async function updatePhoneWebhooks(selectedNumber: TwilioPhoneNumber, incomingPhoneNumbersApi: Function, properties: PhoneNumberProps) {
    if (!selectedNumber) return;

    console.log(`💻 Updating Voice and SMS webhooks for ${selectedNumber.phoneNumber}...`);

    selectedNumber.voiceUrl = properties.voiceUrl;
    selectedNumber.smsUrl = properties.smsUrl;
    selectedNumber.statusCallback = properties.statusCallback;

    try {
        const updated = await incomingPhoneNumbersApi(selectedNumber.sid)
            .update({
                voiceUrl: properties.voiceUrl,
                smsUrl: properties.smsUrl,
                statusCallback: properties.statusCallback,
            })
        console.log('✅ Webhooks updated\n');
        return updated;
    } catch (err) {
        console.error(err)
    }
}

export async function removePhoneWebhooks(activeNumber: TwilioPhoneNumber, incomingPhoneNumbersApi: Function) {
    if (!activeNumber) return;

    console.log(`🚮 Removing incoming Voice and SMS webhooks for ${activeNumber.phoneNumber}`);
    try {
        const updated = await incomingPhoneNumbersApi(activeNumber.sid)
            .update({
                voiceUrl: "",
                smsUrl: "",
                statusCallback: "",
            })
        return updated
    } catch (err) {
        console.error(err)
    }
}

interface PhoneNumberProps {
    voiceUrl: string,
    smsUrl: string,
    statusCallback: string
}

interface TwilioPhoneNumber extends PhoneNumberProps {
    phoneNumber: string,
    sid: string
}

