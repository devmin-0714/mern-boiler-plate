// LoginPage.js
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginUser } from '../../../_actions/user_action'
import { withRouter, Link } from 'react-router-dom'
import { Form, Input, Button} from 'antd'

const LoginPage = (props) => {

    const dispatch = useDispatch()

    const [Email, setEmail] = useState('')
    const [Password, setPassword] = useState('')
    
    const onEmailHandler = (e) => {
        setEmail(e.currentTarget.value)
    }
    const onPasswordHandler = (e) => {
        setPassword(e.currentTarget.value)
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()

        let body = {
            email: Email,
            password: Password
        }

        dispatch(loginUser(body))
            .then(res => {
                if (res.payload.loginSuccess) {
                    props.history.push('/')
                } else {
                    alert('Error')
                }
            })
    }

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flexDirection: 'column', width: '100%', height: '100vh' }}>
            
            <Form style={{ display: 'flex', flexDirection: 'column' }}
                onSubmit={onSubmitHandler} >
                <label>E-mail</label>
                <Input type='email' value={Email} onChange={onEmailHandler}/>
                <label>Password</label>
                <Input type='password' value={Password} onChange={onPasswordHandler}/>

                <br/>
                <Button type='submit' style={{ background: '#1890ff', color: '#fff'}}>
                    Login
                </Button>
            </Form>

            <br/>
            
            <Link to='/register' >
                <Button style={{ display: 'block', background: '#1890ff', color: '#fff'}}>
                    Register
                </Button>
            </Link>

        </div>
    )
}

export default withRouter(LoginPage)