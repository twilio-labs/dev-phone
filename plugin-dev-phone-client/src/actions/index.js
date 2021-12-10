export const ADD_MESSAGES = "ADD_MESSAGES"

export function addMessages(payload) {
    const payloadArray = Array.isArray(payload) ? payload : [payload]
    return {
        type: ADD_MESSAGES,
        payload: payloadArray.length > 0 && payloadArray[0].conversation ? payloadArray : []
    }
}

export const REQUEST_CLIENT_TOKEN = "REQUEST_CLIENT_TOKEN"
export const REQUEST_CLIENT_TOKEN_SUCCESS = "REQUEST_CLIENT_TOKEN_SUCCESS"
export const REQUEST_CLIENT_TOKEN_ERROR = "REQUEST_CLIENT_TOKEN_ERROR"

export function clientTokenRequest() {
    return {
        type: REQUEST_CLIENT_TOKEN
    }
}

export function clientTokenRequestSuccess(payload) {
    return {
        type: REQUEST_CLIENT_TOKEN_SUCCESS,
        payload
    }
}

export function clientTokenRequestFailure(error) {
    return {
        type: REQUEST_CLIENT_TOKEN_ERROR,
        error
    }
}

export function fetchClientToken() {
    return async function (dispatch) {
        dispatch(clientTokenRequest)
        try {
            const response = await fetch('/client-token')
            const data = await response.json()
            dispatch(clientTokenRequestSuccess(data.token))
        } catch (error) {
            dispatch(clientTokenRequestFailure(error))
        }
    }
}

export const REQUEST_CHANNEL_DATA = "REQUEST_CHANNEL_DATA"
export const REQUEST_CHANNEL_DATA_SUCCESS = "REQUEST_CHANNEL_DATA_SUCCESS"
export const REQUEST_CHANNEL_DATA_ERROR = "REQUEST_CHANNEL_DATA_ERROR"

export function channelDataRequest() {
    return {
        type: REQUEST_CHANNEL_DATA
    }
}

export function channelDataRequestSuccess(payload) {
    return {
        type: REQUEST_CHANNEL_DATA_SUCCESS,
        payload
    }
}

export function channelDataRequestFailure(error) {
    return {
        type: REQUEST_CHANNEL_DATA_ERROR,
        error
    }
}

export function fetchChannelData() {
    return async function (dispatch) {
        dispatch(channelDataRequest)
        try {
            const response = await fetch('/plugin-settings')
            const data = await response.json()
            dispatch(channelDataRequestSuccess(data))
        } catch (error) {
            dispatch(channelDataRequestFailure(error))
        }
    }
}