const { User } = require('../models/User')

let auth = (req, res, next) => {

    // 인증 처리를 하는 곳

    // 1. 클라이언트 쿠키에서 토큰을 가져온다. (Cookie-parser이용)
    let token = req.cookies.x_auth

    // 토큰을 복호화(decode) 한후 유저(USER ID)를 찾는다.
    User.findByToken(token, (err, user) => {
        if (err) throw err
        if (!user) return res.json({ isAuth: false, error: true})
    
        // req에 token과 user를 넣어주는 이유는 
        // index.js에서 req 정보(token, user)를 받아 처리가 가능
        req.token = token
        req.user = user
        // next()를 사용하지 않으면 미들웨어 갖혀버린다.
        next()
    })
}

module.exports = { auth }