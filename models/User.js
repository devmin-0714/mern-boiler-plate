const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10


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

// 저장하기 전에 무엇을 하는 것 (index.js)

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
    }
})

const User = mongoose.model('User', userSchema)

module.exports= { User }