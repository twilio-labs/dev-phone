import {
    REQUEST_CLIENT_TOKEN_SUCCESS,
    REQUEST_CLIENT_TOKEN_ERROR,
    REQUEST_CHANNEL_DATA_SUCCESS,
    REQUEST_CHANNEL_DATA_ERROR,
    ADD_MESSAGES,
    DEV_PHONE_CONFIG_ERROR,
    CONFIGURE_NUMBER_IN_USE,
    ADD_CALL_RECORD,
    UPDATE_CALL_RECORD,
    SET_ACTIVE_CALL
} from '../actions'

const initialState = {
    activeCall: null,
    callLog: [],
    channelData: {},
    twilioAccessToken: '',
    voiceDevice: {},
    messageList: [],
    numberInUse: {
        phoneNumber: ''
    },
    error: {}
}

export default function reducer(state = initialState, action) {
    switch(action.type){
        case ADD_MESSAGES:
            return {...state, messageList: [...state.messageList, ...action.payload]}
        case ADD_CALL_RECORD:
            return {...state, callLog: [ action.payload, ...state.callLog]}
        case UPDATE_CALL_RECORD:
            let callLog = []
            state.callLog.forEach((call, index) => {
                if (call.Sid === action.payload.Sid) {
                    callLog[index] = action.payload
                } else {
                    callLog[index] = call
                }
            })
            return {...state, callLog: callLog}
        case CONFIGURE_NUMBER_IN_USE:
            return {...state, numberInUse: action.number}
        case DEV_PHONE_CONFIG_ERROR:
            return {...state, error: action.error}
        case REQUEST_CLIENT_TOKEN_SUCCESS:
            return {...state, twilioAccessToken: action.payload}
        case REQUEST_CLIENT_TOKEN_ERROR:
            return {...state, error: action.error}
        case REQUEST_CHANNEL_DATA_SUCCESS:
            return {...state, channelData: action.payload}
        case REQUEST_CHANNEL_DATA_ERROR:
            return {...state, error: action.error}
        case SET_ACTIVE_CALL:
            return {...state, activeCall: action.call}
        default:
            return state
    }
}
