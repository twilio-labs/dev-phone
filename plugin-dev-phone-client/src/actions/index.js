// import { API_BASE } from './config';

export const SEND_MESSAGE_REQUEST = "SEND_MESSAGE_REQUEST"
export const UPDATE_CHAT_LOG = "UPDATE_CHAT_LOG"

export const INCOMING_CALL_REQUEST = "INCOMING_CALL_REQUEST"
export const INCOMING_CALL_REQUEST_SUCCESS = "INCOMING_CALL_REQUEST_SUCCESS"
export const INCOMING_CALL_REQUEST_FAILURE = "INCOMING_CALL_REQUEST_FAILURE"

// // Now we define actions
// export function incomingCallRequest(){
//     return {
//         type: INCOMING_CALL_REQUEST
//     }
// }

// export function incomingCallSuccess(payload){
//     return {
//         type: INCOMING_CALL_REQUEST_SUCCESS,
//         payload
//     }
// }

// export function incomingCallFailure(error){
//     return {
//         type: INCOMING_CALL_REQUEST_FAILURE,
//         error
//     }
// }



// export function setUpPhone(connection) {
//     return async function (dispatch) {
//         dispatch(incomingCallRequest());
//         try{
//             const response = await axios.get(`${API_BASE}/room?name=${roomName}`)
//             dispatch(createRoomSuccess(response.data));
//         }catch(error){
//             dispatch(createRoomError(error));
//         }
//     }
// }


export const REQUEST_ACCESS_TOKEN = "REQUEST_ACCESS_TOKEN"
export const REQUEST_ACCESS_TOKEN_SUCCESS = "REQUEST_ACCESS_TOKEN_SUCCESS"
export const REQUEST_ACCESS_TOKEN_ERROR = "REQUEST_ACCESS_TOKEN_ERROR"

export function accessTokenRequest(){
    return {
        type: REQUEST_ACCESS_TOKEN
    }
}

export function accessTokenRequestSuccess(payload){
    return {
        type: REQUEST_ACCESS_TOKEN_SUCCESS,
        payload
    }
}

export function accessTokenRequestError(error){
    return {
        type: REQUEST_ACCESS_TOKEN_ERROR,
        error
    }
}

export function fetchTwilioAccessToken(roomId) {
    return async function (dispatch) {
        dispatch(accessTokenRequest());
        try{
            const response = await fetch(`/accessToken`) // Routed to localhost:3001 via proxy config
            dispatch(accessTokenRequestSuccess(response.data));
        }catch(error){
            dispatch(accessTokenRequestError(error));
        }
    }
}