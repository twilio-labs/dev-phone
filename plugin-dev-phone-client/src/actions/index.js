// Actions for handling history logic in the UI
export const ADD_MESSAGES = "ADD_MESSAGES"
export const ADD_CALL_RECORD = "ADD_CALL_RECORD"
export const UPDATE_CALL_RECORD = "UPDATE_CALL_RECORD"

export function addMessages(payload) {
    const payloadArray = Array.isArray(payload) ? payload : [payload]
    return {
        type: ADD_MESSAGES,
        payload: payloadArray.length > 0 && payloadArray[0].conversation ? payloadArray : []
    }
}

export function addCallRecord(payload) {
    return {
        type: ADD_CALL_RECORD,
        payload
    }
}

export function updateCallRecord(payload) {
    return {
        type: UPDATE_CALL_RECORD,
        payload
    }
}

// Voice Device Actions
export const UPDATE_CALL_INFORMATION = "UPDATE_CALL_INFORMATION"

export function updateCallInformation(call) {
    return {
        type: UPDATE_CALL_INFORMATION,
        call
    }
}


// Logic for communicating with the local backend
export const DEV_PHONE_NUMBER_SELECTED = "DEV_PHONE_NUMBER_SELECTED"
export const CONFIGURE_NUMBER_IN_USE = "CONFIGURE_NUMBER_IN_USE"
export const DEV_PHONE_CONFIG_ERROR = "DEV_PHONE_CONFIG_ERROR"

export function selectDevPhoneNumberRequest() {
    return {
        type: DEV_PHONE_NUMBER_SELECTED
    }
}

export function changeNumberInUse(number) {
    return {
        type: CONFIGURE_NUMBER_IN_USE,
        number
    }
}

// TODO: This may be too pessimistic - should we just configure it and warn that inbound may not work?
export function devPhoneConfigError(error) {
    return {
        type: DEV_PHONE_CONFIG_ERROR,
        error
    }
}

export function configureNumberInUse(number) {
    return async function (dispatch) {
        dispatch(selectDevPhoneNumberRequest())
        try {
            const response = await fetch('/choose-phone-number', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(number),
              })

            // A success response suggests that the backend was able to configure serverless correctly
            const data = await response.json()
            dispatch(changeNumberInUse(data.phoneNumber))
        } catch (error) {
            dispatch(devPhoneConfigError(error))
        }
    }
}

export const REQUEST_PHONE_NUMBERS = "REQUEST_PHONE_NUMBERS"
export const REQUEST_PHONE_NUMBERS_SUCCESS = "REQUEST_PHONE_NUMBERS_SUCCESS"
export const REQUEST_PHONE_NUMBERS_ERROR = "REQUEST_PHONE_NUMBERS_ERROR"

export function phoneNumberRequest() {
    return {
        type: REQUEST_PHONE_NUMBERS
    }
}

export function phoneNumberRequestSuccess(payload) {
    return {
        type: REQUEST_PHONE_NUMBERS_SUCCESS,
        payload
    }
}

export function phoneNumberRequestFailure(error) {
    return {
        type: REQUEST_PHONE_NUMBERS_ERROR,
        error
    }
}

export function fetchPhoneNumbers() {
    return async function (dispatch) {
        dispatch(phoneNumberRequest)
        try {
            const response = fetch("/phone-numbers")
            const data = await response.json()
            dispatch(phoneNumberRequestSuccess(data))
        } catch (error) {
            dispatch(phoneNumberRequestFailure(error))
        }
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
