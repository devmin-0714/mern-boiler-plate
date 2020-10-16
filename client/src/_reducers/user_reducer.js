// action의 타입은 _actions/types.js에서 가져온다
import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER
} from '../_actions/types'

// previousState와 action을 nextState로 만든다
export default function (state={}, action) {
    // action에서 많은 다른 타입이 오기때문에 switch를 사용해 주는 것이 좋다
    switch (action.type) {
        case LOGIN_USER:
            // nextState
            return {...state, loginSuccess: action.payload}
            break
        
        case REGISTER_USER:
            return {...state, register: action.payload}
            break

        // userdata : 서버에서 받은 모든 유저데이터가 들어가 있다    
        case AUTH_USER:
            return {...state, userData: action.payload}
            break

        default:
            return state
    }
}