import { REQUEST_ACCESS_TOKEN_SUCCESS } from '../actions';

const initialState = {
    twilioAccessToken: ''
}

export default function chatReducer(state, action) {
    if (typeof state === 'undefined') {
        return initialState
    }

    switch(action.type){
        case REQUEST_ACCESS_TOKEN_SUCCESS:
            return {...state, twilioAccessToken: action.payload}

            default:
            return state
    
    }
}