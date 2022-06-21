export function isSmsUrlSet (smsUrl: string){
    // consider it "unset" if it is blank, or at the default value
    return smsUrl && smsUrl !== "" && smsUrl !== 'https://demo.twilio.com/welcome/sms/reply';
}

export function isVoiceUrlSet(voiceUrl: string){
    // consider it "unset" if it is blank, or at the default value
    return voiceUrl && voiceUrl !== "" && voiceUrl !== 'https://demo.twilio.com/welcome/voice/';
}
