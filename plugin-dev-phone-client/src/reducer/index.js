import { 
    REQUEST_CLIENT_TOKEN_SUCCESS,
    REQUEST_CLIENT_TOKEN_ERROR,
    REQUEST_CHANNEL_DATA_SUCCESS,
    REQUEST_CHANNEL_DATA_ERROR,
    ADD_MESSAGES,
    DEV_PHONE_CONFIG_ERROR,
    CONFIGURE_NUMBER_IN_USE,
    ADD_CALL_RECORD
} from '../actions'

const initialState = {
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
            return {...state, callLog: [...state.callLog, action.payload]}
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
        default:
            return state
    }
}