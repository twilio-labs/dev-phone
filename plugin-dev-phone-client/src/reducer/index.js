import { 
    REQUEST_CLIENT_TOKEN_SUCCESS,
    REQUEST_CLIENT_TOKEN_ERROR,
    REQUEST_CHANNEL_DATA_SUCCESS,
    REQUEST_CHANNEL_DATA_ERROR,
    ADD_MESSAGES
} from '../actions'

const initialState = {
    channelData: {},
    twilioAccessToken: '',
    voiceDevice: {},
    messageList: [],
    error: {}
}

export default function reducer(state = initialState, action) {
    switch(action.type){
        case ADD_MESSAGES:
            return {...state, messageList: [...state.messageList, ...action.payload]}
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