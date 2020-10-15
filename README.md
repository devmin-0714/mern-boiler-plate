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
  // user._id + 'secretToken = token ------> 'secretToken'을 넣으면 user._id가 나온다.
  // user.id는 plain object여야 되기 때문에 toHexString
  var token = jwt.sign(user._id.toHexString(), 'secretToken')

  user.token = token
  user.save(function (err, user) {
    if (err) return cb(err)
    cb(null, user) // user 정보는 index.js의 getnerateToken 파라미터로 들어간다.
  })
}
```

## 13. Auth 기능 만들기

- `클라이언트`와 `서버`의 `Token`을 비교해서 `Auth`를 관리
- `엔드포인트` 수정
  - `Express`의 `Router` 처리를 위해서
  - `/api/~`

```js
// index.js
// auth라는 미들웨어(auth.js)는 req를 받고 콜백 function을 하기 전에 어떤 일을 처리
app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True
  res.status(200).json({
    // auth.js에서 user정보를 넣었기 때문에 user._id가 가능
    _id: req.user._id,
    // cf) role이 0 이면 일반유저, role이 아니면 관리자
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
})

// middleware/auth.js
const { User } = require('../models/User')

let auth = (req, res, next) => {
  // 인증 처리를 하는 곳

  // 1. 클라이언트 쿠키에서 토큰을 가져온다. (Cookie-parser이용)
  let token = req.cookies.x_auth

  // 토큰을 복호화(decode) 한후 유저(USER ID)를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err
    if (!user) return res.json({ isAuth: false, error: true })

    // req에 token과 user를 넣어주는 이유는
    // index.js에서 req 정보(token, user)를 받아 처리가 가능
    req.token = token
    req.user = user
    // next()를 사용하지 않으면 미들웨어 갖혀버린다.
    next()
  })
}

module.exports = { auth }

// models/User.js
userSchema.statics.findByToken = function (token, cb) {
  // user은 userSchema를 가리키고 있다.
  // index.js의 const user = new User(req.body)
  var user = this

  // 토큰을 decode 한다.
  // decoded = user id
  jwt.verify(token, 'secretToken', function (err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    // findOne : 데이터베이스에서 찾는다.
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err)
      cb(null, user)
    })
  })
}
```

## 14. 로그아웃 기능

- **로그아웃 기능**

  1. 로그아웃 Route 만들기
  2. 로그아웃 하려는 유저를 데이터베이스에서 찾아서
  3. 그 유저의 토큰을 지워준다.

- 로그아웃을 하면 Token이 사라진다.

```js
// auth를 넣는 이유는 login이 되어있는 상태이기 때문에
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).send({
      success: true,
    })
  })
})
```

## 15~25. 초기세팅

- `npx create-react-app`

- `Create React App` 구조

  - `_actions`, `_reducer` : `Redux`를 위한 폴더들
  - `components/views` : `Page`들을 넣는다
  - `components/views/Sections` : 해당 페이지에 관련된 `css 파일`이나 `component`들을 넣는다
  - `App.js` : `Routing` 관련 일을 처리
  - `Config.js` : 환경변수 같은 것들을 정하는 곳
  - `hoc` : `Higher Order Component`
    - `Auth (HOC)` - `LOGGED IN COMPONENT` : 여기서 해당 유저가 해당 페이지에 들어갈 자격이 되는지를 알아 낸 후에 자격이 된다면 `Admin component`에 가게 해주고 아니라면 다른 페이지로 보내버린다
  - `utils` : 여러 군데에서 쓰일 수 있는 것들을 이곳에 넣어둬서 어디든 쓸 수 있게 해준다

- `React Router Dom`

  - `npm install react-router-dom --save`

```js
// App.js
import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import LandingPage from './components/views/LandingPage/LandingPage'
import LoginPage from './components/views/LoginPage/LoginPage'
import RegisterPage from './components/views/RegisterPage/RegisterPage'

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
```

- `axios`, `Hooks`

  - 클라이언트에서 서버로 데이터를 보내줄 때 (Request)
  - `npm install axios --save`

```js
// LandingPage.js
import React,{ useEffect} from 'react'
import axios from 'axios'

function LandingPage() {

     useEffect(() => {
        axios.get('/api/hello')
        .then(response=> { console.log(response)})
     }, [])

    return (
      ...
    )
}

// server/index.js
app.get('/api/hello', (req, res) => res.send('Hello World!~~ '))
```

- `CORS(Cross-Origin Resource Sharing)`

  - 클라이언트와 서버가 두 개의 다른 포트를 가지고 있을 때
  - `Proxy`로 문제 해결

- `Proxy`

  - 유저 -> Proxy Server -> 인터넷
  - `npm intall http-proxy-middleware --save`

```js
//src/setupProxy.js
const proxy = require('http-proxy-middleware')
module.exports = function (app) {
  app.use(
    '/api',
    proxy({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  )
}
```

- `Concurrently`

  - 프론트, 백 서버 한번에 켜기 (**root에 설치**)
  - `npm install concurrently --save`
  - `concurrently "command1 arg" "command2 arg"`
  - script : `"start": "concurrently \"command1 arg\" \"command2 arg\""`
    - `"dev": "concurrently \"npm run backend\" \"npm run start --prefix client\""`

- `Ant Design`

  - `CSS Framework`
  - `npm install antd --save`
  - [Ant Design](https://ant.design/)

## 26~28. Redux

- `props` : immutable, 부모 컴포너트에서 자식 컴포넌트로 값 전달
- `state` : mutalbe, 값이 변화하면 리렌더링이 된다
- `Store`에서 모든 상태를 관리한다

  - `Action` : 객체형태로 상태를 알려준다
  - `Reducer` : `Action`으로 인해 바뀐 것을 설명 `(previousState, action) => nextState`
  - `Store` : `state`를 감싸고 있으며 다양한 method를 가지고 있다. `순수 객체`, `promise`, `function(redux-thunk)`을 받을 수 있다.

- `Dependency`

  - `redux`
  - `react-redux`
  - `redux-promise` : `promise`를 받는 미들웨어
  - `redux-thunk` : `function`을 받는 미들웨어

- `Redux Dev Tools` : 크롬 익스텐션

- `Redux`를 연결하는 방법

```js
// index.js
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import promiseMiddleware from 'redux-promise'
import ReduxThunk from 'redux-thunk'
import Reducer from './_reducers'

const createStoreWithMiddleware = applyMiddleware(
  promiseMiddleware,
  ReduxThunk
)(createStore)

ReactDOM.render(
  <Provider
    store={createStoreWithMiddleware(
      Reducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    )}
  >
    <App />
  </Provider>,
  document.getElementById('root')
)

// _reducers/index.js
import { combineReducers } from 'redux'
//import user from './user_reducer';

const rootReducer = combineReducers({
  //user
})

export default rootReducer
```
