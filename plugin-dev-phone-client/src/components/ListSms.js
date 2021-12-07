import { useState } from 'react';

const formatPnForForm = pn => `${pn.phoneNumber} [${pn.friendlyName}]`

function ListSms({ }) {

    return (
        <div className="smsList">
        <h1>List of messages</h1>
        <ul className="listSms">

        </ul>
        </div>
    );
}

export default ListSms;