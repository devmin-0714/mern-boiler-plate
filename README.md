# react-boiler-plate

- 출처 : [Johan Ahn님 github](https://github.com/jaewonhimnae)

## 1~6. 초기세팅

- `npm init`
- `npm install express --svae`
- `package.json`

  - `script` : `"start": "node index.js"`

- `mongoDB`

  - 클러스터, user 생성

- `index.js`

  - `npm install mongoose --save`
  - `Model`, `Schema` 생성

```js
// models/User.js
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
})

const User = mongoose.model('User', userSchema)

module.exports = { User }
```

- `.gitignore`

  - 푸쉬하지 않을 파일 : `node.modules`

```js
// .gitignore
node_modules
```

- `SSH`를 통한 `GitHub` 연결
  - 구글링 : `github ssh`

## 7. BodyParser & PostMan & 회원가입 기능

- `npm install body-parser --save`
- `Postman`
  - 클라이언트에 요청 테스트
  - 설정 : `Body`, `raw`, `JSON`

```js
// index.js
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const { User } = require('./models/User')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// application/json
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose
  .connect(
    'mongodb+srv://devPark:1234@react-boiler-plate.ovbtd.mongodb.net/<dbname>?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', (req, res) => {
  // 회원 가입 할때 필요한 정보들을 clinet에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body)
  // mongoDB
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true,
    })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
```

## 8. Nodemon 설치

- `npm install nodemon --save-dev`
  - `-dev` : `local`에서 사용할때만
  - `script` : `"backend": "nodemon index,js"`

## 9. 비밀 설정 정보 관리

```js
// index.js
const config = require('./config/key')
mongoose.connect(config.mongoURI, ...)

// config/key.js
if (process.env.NODE_ENV === 'production') {
    module.exports = require('./prod')
} else {
    module.exports = require('./dev')
}

// config/dev.js
module.exports = {
    mongoURI: 'mongodb+srv://devPark:1234@react-boiler-plate.ovbtd.mongodb.net/<dbname>?retryWrites=true&w=majority'
}

// config/prod.js
module.exports = {
    // MONGO_URI는 헤로쿠의 이름과 동일하게
    mongoURI: process.env.MONGO_URI
}

// .gitignore
dev.js
```

## 10. Bcrypt로 비밀번호 암호화 하기

- `npm install bcrypt --save`
  - 전달받은 비밀번호 암호화
    [bcrypt 라이브러리](https://www.npmjs.com/package/bcrypt)
  - `Salt`를 이용해서 비밀번호를 암호화 해야 하기 때문에<br>salt를 먼저 생성
  - `saltRounds` : `Salt`가 몇 글자인지

```js
// models/User.js
const bcrypt = require('bcrypt')
const saltRounds = 10

// 저장하기 전에 무엇을 하는 것 (index.js)

// next는 index.js의 user.save()는 부분이 실행된다.
userSchema.pre('save', function (next) {
  // user은 userSchema를 가리키고 있다.
  // index.js의 const user = new User(req.body)
  var user = this

  // 비밀번호를 바꿀때만 암호화
  if (user.isModified('password')) {
    // 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err)
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err)
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})
```

## 11~12. 로그인 기능 with Bcrypt, 토큰 생성 with jsonwebtoken

- **로그인 기능**

  1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
  3. 비밀번호까지 맞다면 토큰을 생성하기.

- **토큰 생성**
- `jsonwebtoken` 라이브러리

  - [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
  - 토큰 생성을 위해
  - `npm install jsonwebtoken --save`

- 쿠키 저장 라이브러리

  - `npm install cookie-parser --save`

```js
// index.js
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.post('/login', (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      })
    }

    // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        })

      // 3. 비밀번호까지 맞다면 토큰을 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err)

        // 토큰을 저장한다. 어디에? (*쿠키*, 세션, 로컬스토리지)
        res
          .cookie('x_auth', user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

// models/User.js
const jwt = require('jsonwebtoken')

// 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword : 1234567
  // 암호화된 비밀번호 : $2b$10$kqEZbclUfOIFSnkgUZsnxurUt3ugTNAeunLyC6IudjXu.1bGg0Osa
  // 암호화된 비밀번호는 복호화가 되지않아 plainPassword를 암호화해서 비교
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch) // isMatch 정보는 index.js의 comparePassword 파라미터로 들어간다.
  })
}

// 3. 비밀번호까지 맞다면 토큰을 생성하기
userSchema.methods.generateToken = function (cb) {
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
```
