module.exports = {
    isSmsUrlSet: function(smsUrl){
        // consider it "unset" if it is blank, or at the default value
        return smsUrl !== "" && smsUrl !== 'https://demo.twilio.com/welcome/sms/reply';
    },

    isVoiceUrlSet: function(voiceUrl){
        // consider it "unset" if it is blank, or at the default value
        return voiceUrl !== "" && voiceUrl !== 'https://demo.twilio.com/welcome/voice/';
    }
}