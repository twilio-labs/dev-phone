import { REQUEST_VOICE_TOKEN_SUCCESS } from '../actions';

const initialState = {
    voiceAccessToken: ''
}

export default function chatReducer(state, action) {
    if (typeof state === 'undefined') {
        return initialState
    }

    switch(action.type){
        case REQUEST_VOICE_TOKEN_SUCCESS:
            return {...state, voiceAccessToken: action.payload}

            default:
            return state
    
    }
}