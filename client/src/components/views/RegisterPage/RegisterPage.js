// RegisterPage.js
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { registerUser } from '../../../_actions/user_action'
import { withRouter } from 'react-router-dom'
import { Form, Input, Button} from 'antd'

const RegisterPage = (props) => {

    const dispatch = useDispatch()

    const [Email, setEmail] = useState('')
    const [Name, setName] = useState('')
    const [Password, setPassword] = useState('')
    const [ConfirmPassword, setConfirmPassword] = useState('')
    
    const onEmailHandler = (e) => {
        setEmail(e.currentTarget.value)
    }
    const onNameHandler = (e) => {
        setName(e.currentTarget.value)
    }
    const onPasswordHandler = (e) => {
        setPassword(e.currentTarget.value)
    }
    const onConfirmPasswordHandler = (e) => {
        setConfirmPassword(e.currentTarget.value)
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()

        if (Password.length < 5) {
            return alert('비밀번호는 5자리 이상이여야 합니다.')
        }
        if (Password !== ConfirmPassword) {
            return alert('비밀번호가 일치하지 않습니다.')
        }

        let body = {
            email: Email,
            password: Password,
            name: Name
        }

        dispatch(registerUser(body))
            .then(res => {
                if (res.payload.success) {
                    props.history.push('/login')
                } else {
                    alert("회원가입에 실패하였습니다.")
                }
            })
    }

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            width: '100%', height: '100vh' }}>
            
            <Form style={{ display: 'flex', flexDirection: 'column' }}
                onSubmit={onSubmitHandler}>
                    
                <label>E-mail</label>
                <Input type="email" value={Email} onChange={onEmailHandler}/>
                
                <label>Name</label>
                <Input type="text" value={Name} onChange={onNameHandler}/>
                
                <label>Password</label>
                <Input type="password" value={Password} onChange={onPasswordHandler}/>
                
                <label>Confirm Password</label>
                <Input type="password" value={ConfirmPassword} onChange={onConfirmPasswordHandler}/>

                <br/>
                <Button type="submit" style={{ background: '#1890ff', color: '#fff'}}>
                    회원가입
                </Button>
            </Form>
            
        </div>
    )
}

export default withRouter(RegisterPage)