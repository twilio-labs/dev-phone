import { useState } from 'react';

function SendSmsForm({ twilioPns, sendSms }) {

    const [fromPn, setFromPn] = useState(twilioPns[0].phoneNumber);
    const [toPn, setToPn] = useState(null);
    const [body, setBody] = useState(null);

    const sendIt = () => {
        sendSms(fromPn, toPn, body);
    }

    return (
        <div className="smsForm">
            <label htmlFor="sendSmsFromPn">From</label>
            <select
                id="sendSmsFromPn"
                onChange={e => setFromPn(e.target.value)}>

                {twilioPns.map(pn =>
                    <option key={pn.phoneNumber}
                        value={pn.phoneNumber}>
                        {pn.phoneNumber} [{pn.friendlyName}]
                    </option>
                )}
            </select>

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