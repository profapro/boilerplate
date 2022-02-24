// index.js
const express = require('express'); // express 임포트
const app = express(); // app생성
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const {User}=require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

// 몽구스 연결
const mongoose = require('mongoose');
mongoose
  .connect(
    config.mongoURI,   // <== 'mongodb://localhost:27017/test',
    {
    }
  )
  .then(() => console.log('MongoDB conected'))
  .catch((err) => {
    console.log(err);
  });

app.get('/', function (req, res) {
    res.send('hello world!!');
});
  
app.post('/register',(req,res) => {
  // 회원 가입 할때 필요한 정보들을 client에서 가져오면
  // 이들을 디비에 넣어둔다.
  const user = new User(req.body)  
  user.save((err,userInfo)=> {
    if(err) return res.json({success:false, err})
    return res.status(200).json( {
      success:true
    })
  })

})

app.post('/login',(req,res) => {
  // 요청된 이메일을 디비에서 찾는다. 
  User.findOne({email:req.body.email},(err,user) => {
    if(!user) {
      return res.json({
        loginSuccess:false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    } 
    console.log('find email');
    // 요청된 이메일이 디비에 있다면 비번이 맞는 비번인지를 확인
    user.comparePassword(req.body.password,(err,isMatch) => {
      console.log('err',err)
      console.log('isMatch',isMatch)
      if(!isMatch)
        return res.json({loginSuccess:false, message:"비밀번호가 틀렸습니다."})
      // 비밀번호까지 맞다면 토큰을 생성하기.
      user.generateToken((err,user) => {
        console.log("generateToken")
        if(err) return res.status(400).send(err);
        // 토큰을 저장한다. 어디에 ?  쿠키, 로컬 스토리지
        console.log("store cookie")
        res.cookie("x_auth",user.token)
        .status(200)
        .json({loginSuccess: true, userId: user._id})
      })


    })

  })

})


app.listen(port, () => console.log(`${port}포트입니다.`));
  
  