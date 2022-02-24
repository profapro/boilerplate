// index.js
const express = require('express'); // express 임포트
const app = express(); // app생성
const port = 3000;
const bodyParser = require('body-parser');
const {User}=require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
// application/json
app.use(bodyParser.json());

// 몽구스 연결
const mongoose = require('mongoose');
mongoose
  .connect(
    'mongodb://localhost:27017/test',
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



app.listen(port, () => console.log(`${port}포트입니다.`));
  
  