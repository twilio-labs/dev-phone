import { useState, useEffect } from 'react';

const hasExistingSmsConfig = pn => {
    return pn.smsUrl && (pn.smsUrl !== 'https://demo.twilio.com/welcome/sms/reply');
}

const hasExistingVoiceConfig = pn => {
    return pn.voiceUrl && (pn.voiceUrl !== 'https://demo.twilio.com/welcome/voice/');
}

const hasExistingConfig = pn => {
    return hasExistingSmsConfig(pn) || hasExistingVoiceConfig(pn);
}

const getSelectLabelForPn = pn => {
    const warning = hasExistingConfig(pn) ? "⚠️ " : "";
    return `${warning}${pn.phoneNumber} [${pn.friendlyName}]`;
}

const getPnDetailsByNumber = (pn, allPns) => {
    return allPns.filter(thisPn => thisPn.phoneNumber === pn)[0];
}

const sortUnconfiguredNumbersFirstThenAlphabetically = (pn1, pn2) => {
    if (hasExistingConfig(pn1) && !hasExistingConfig(pn2)) return 1;
    if (hasExistingConfig(pn2) && !hasExistingConfig(pn1)) return -1;
    return pn1.phoneNumber.localeCompare(pn2.phoneNumber);
}

function PhoneNumberPicker({ setDevPhonePn }) {

    const [twilioPns, setTwilioPns] = useState(null);
    const [chosenPn, setChosenPn] = useState(null);

    useEffect(() => {
        fetch("/phone-numbers")
            .then((res) => res.json())
            .then((data) => {
                data["phone-numbers"].sort(sortUnconfiguredNumbersFirstThenAlphabetically);
                setTwilioPns(data["phone-numbers"]);
                if (data["phone-numbers"].length !== 0) {
                    setChosenPn(getPnDetailsByNumber(data["phone-numbers"][0].phoneNumber, data["phone-numbers"]));
                }
            })
    }, []);

    if (twilioPns === null) {
        return "loading phone numbers...";

    } else if (twilioPns.length === 0) {
        return "you have no phone numbers, please buy one (TODO: implement the 'buy' flow)";

    } else {
        return (
            <div className="pnPicker">

                <div className="pnSelect">
                    <h2>Choose a phone number for this dev-phone</h2>

                    <select
                        id="devPhonePn"
                        onChange={e => setChosenPn(getPnDetailsByNumber(e.target.value, twilioPns))}>

                        {twilioPns.map(pn =>
                            <option key={pn.phoneNumber}
                                value={pn.phoneNumber}>
                                {getSelectLabelForPn(pn)}
                            </option>
                        )}
                    </select>
                </div>

                {chosenPn ?
                    <div className="pnConfirm">
                        {hasExistingConfig(chosenPn) ?
                            <div>
                                <h4>⚠️ This phone number has existing config which will be overwritten ⚠️</h4>
                                {hasExistingSmsConfig(chosenPn) ?
                                    <div>
                                        Configured SMS URL: {chosenPn.smsUrl}
                                    </div>
                                    : ""}
                                {hasExistingVoiceConfig(chosenPn) ?
                                    <div>
                                        Configured Voice URL: {chosenPn.voiceUrl}
                                    </div>
                                    : ""}
                            </div>
                            : ""}

                        <input
                            type="button"
                            value="Use this phone number"
                            onClick={e => setDevPhonePn(chosenPn)} />
                    </div>
                    :
                    ""
                }

            </div>
        );
    }
}

export default PhoneNumberPicker;