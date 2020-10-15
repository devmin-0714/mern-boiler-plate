const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 저장하기 전에 어떤 처리를 하는 부분(index.js)
// next는 index.js의 user.save()는 부분이 실행된다.
userSchema.pre('save', function(next) {
    // user은 userSchema를 가리키고 있다.
    // index.js의 const user = new User(req.body)
    var user = this

    // 비밀번호를 바꿀때만 저장
    if (user.isModified('password')){

        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt){
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    }   else {
        next()
    }
})

// 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
userSchema.methods.comparePassword = function(plainPassword, cb) {

    // plainPassword : 1234567
    // 암호화된 비밀번호 : $2b$10$kqEZbclUfOIFSnkgUZsnxurUt3ugTNAeunLyC6IudjXu.1bGg0Osa
    // 암호화된 비밀번호는 복호화가 되지않아 plainPassword를 암호화해서 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch) // isMatch 정보는 index.js의 comparePassword 파라미터로 들어간다.
    })
}

// 3. 비밀번호까지 맞다면 토큰을 생성하기
userSchema.methods.generateToken = function(cb) {

    // user은 userSchema를 가리키고 있다.
    // index.js의 const user = new User(req.body)
    var user = this

    // jsonwebtoken을 이용해서 token을 생성하기
    
    // _id는 데이터베이스의 id
    // user._id + 'secretToken = token ------> 'secretToken' -> user._id
    // user.id는 plain object여야 되기 때문에 toHexString
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user) // user 정보는 index.js의 getnerateToken 파라미터로 들어간다.
    })
}

userSchema.statics.findByToken = function(token, cb) {
    
    // user은 userSchema를 가리키고 있다.
    // index.js의 const user = new User(req.body)
    var user = this
    
    // 토큰을 decode 한다.
    // decoded = user id
    jwt.verify(token, 'secretToken', function(err, decoded) {

        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        // findOne : 데이터베이스에서 찾는다.
        user.findOne({ "_id": decoded, "token": token}, function (err, user) {
            if (err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports= { User }