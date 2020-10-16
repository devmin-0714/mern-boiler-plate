import axios from 'axios'

// action의 타입들만 관리(_actions/user_action.js)
import {
    LOGIN_USER,
    REGISTER_USER
} from './types'

// dataToSubmit : dispatch(loginUser(body))의 body부분을 받아옴 (LoginPage.js)
export function loginUser(dataToSubmit) {

    const request = axios.post('/api/users/login', dataToSubmit)
        .then(response => response.data)
    // return을 통해 (Action을) Reducer(_reducers/user_reducer.js)로 보내야 한다
    return {
        type: LOGIN_USER,
        payload: request
    }    
}

// dataToSubmit : dispatch(registerUser(body))의 body부분을 받아옴 (RegisterPage.js)
export function registerUser(dataToSubmit) {

    const request = axios.post('/api/users/register', dataToSubmit)
        .then(response => response.data)
    // return을 통해 (Action을) Reducer(_reducers/user_reducer.js)로 보내야 한다
    return {
        type: REGISTER_USER,
        payload: request
    }    
}