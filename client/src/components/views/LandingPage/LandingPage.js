// LandingPage.js
import React from 'react'
import axios from 'axios'
import { withRouter, Link } from 'react-router-dom'
import { Button } from 'antd'

const LandingPage = (props) => {

     const onClickHandler = () => {
         axios.get('/api/users/logout')
            .then(res => {
                if (res.data.success) {
                    props.history.push('/login')
                } else {
                    alert('로그아웃 하는데 실패했습니다.')
                }
            })
     }

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            width: '100%', height: '100vh'
        }}>


            <Link to='/login'>
                <Button style={{ background: '#1890ff', color: '#fff'}}>로그인</Button>
            </Link>

            <Button style={{ background: '#1890ff', color: '#fff'}} 
                onClick={onClickHandler}>
                로그아웃
            </Button>

        </div>
    )
}
export default withRouter(LandingPage)