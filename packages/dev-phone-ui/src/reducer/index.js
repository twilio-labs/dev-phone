import {
    REQUEST_CLIENT_TOKEN_SUCCESS,
    REQUEST_CLIENT_TOKEN_ERROR,
    REQUEST_CHANNEL_DATA_SUCCESS,
    REQUEST_CHANNEL_DATA_ERROR,
    ADD_MESSAGE,
    DEV_PHONE_CONFIG_ERROR,
    CONFIGURE_NUMBER_IN_USE,
    ADD_CALL_RECORD,
    UPDATE_CALL_RECORD,
    UPDATE_CALL_INFORMATION,
    SET_DESTINATION_NUMBER,
    ADD_DIGIT_TO_DESTINATION_NUMBER
} from '../actions'

const initialState = {
    currentCallInfo: null,
    callLog: [],
    channelData: {},
    destinationNumber: '',
    messageList: [],
    numberInUse: {
        phoneNumber: '',
    },
    twilioAccessToken: '',
    voiceDevice: {},
    error: {}
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case ADD_MESSAGE:
            const duplicateMessage = state.messageList.findIndex(message => message.sid === action.payload.sid)
            return duplicateMessage > -1 ? state : { ...state, messageList: [...state.messageList, action.payload] }
        case ADD_CALL_RECORD:
            const duplicateCall = state.callLog.findIndex(call => call.Sid === action.payload.Sid)
            return duplicateCall > -1 ? state : { ...state, callLog: [...state.callLog, action.payload] }
        case UPDATE_CALL_RECORD:
            return {
                ...state,
                callLog: state.callLog.map(call => { 
                    return call.Sid === action.payload.Sid ? action.payload : call
                })
            }
        case CONFIGURE_NUMBER_IN_USE:
            return { ...state, numberInUse: action.number }
        case DEV_PHONE_CONFIG_ERROR:
            return { ...state, error: action.error }
        case REQUEST_CLIENT_TOKEN_SUCCESS:
            return { ...state, twilioAccessToken: action.payload }
        case REQUEST_CLIENT_TOKEN_ERROR:
            return { ...state, error: action.error }
        case REQUEST_CHANNEL_DATA_SUCCESS:
            return { ...state, channelData: action.payload }
        case REQUEST_CHANNEL_DATA_ERROR:
            return { ...state, error: action.error }
        case SET_DESTINATION_NUMBER:
            return { ...state, destinationNumber: action.number }
        case UPDATE_CALL_INFORMATION:
            return { ...state, currentCallInfo: action.call ? { ...state.currentCallInfo, ...action.call } : null }
        case ADD_DIGIT_TO_DESTINATION_NUMBER:
            return { ...state, destinationNumber: state.destinationNumber + action.digit }
        default:
            return state
    }
}
