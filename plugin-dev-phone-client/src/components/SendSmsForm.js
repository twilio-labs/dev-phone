import { useState } from 'react';

function SendSmsForm({ devPhonePn, sendSms }) {

    const [toPn, setToPn] = useState(null);
    const [body, setBody] = useState(null);

    const sendIt = () => {
        sendSms(devPhonePn.phoneNumber, toPn, body);
    }

    return (
        <div className="smsForm">
            <label htmlFor="sendSmsFromPn">From</label>
            <input
                id="sendSmsFromPn"
                disabled={true}
                value={devPhonePn.phoneNumber}
                />

            <label htmlFor="sendSmsToPn">To</label>
            <input
                id="sendSmsToPn"
                placeholder="E.164 format please"
                defaultValue={toPn}
                onChange={e => setToPn(e.target.value)} />

            <label htmlFor="sendSmsBody">Message</label>
            <textarea id="sendSmsBody" onChange={e => setBody(e.target.value)} />

            <span></span>
            <input type="button" value="send it!" onClick={sendIt} />
        </div>
    );
}

export default SendSmsForm;