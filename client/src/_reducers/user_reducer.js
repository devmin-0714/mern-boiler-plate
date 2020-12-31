// _reducers/user_reducer.js
import {
    REGISTER_USER,
    LOGIN_USER,
    AUTH_USER
} from '../_actions/types'

export default (state={}, action) => {

    switch (action.type) {
        case REGISTER_USER:
            return {...state, register: action.payload}
            break

        case LOGIN_USER:
            return {...state, loginSuccess: action.payload}
            break
        
        case AUTH_USER:
            return {...state, userData: action.payload}
            break

        default:
            return state
    }
}