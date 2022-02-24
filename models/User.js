const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema( {
    name: {
        type : String,
        maxlength:50
    },
    email: {
        type:String,
        trim: true,
        unique:1
    },
    password: {
        type:String,
        maxlength:100
    },
    role: {
        type:Number,
        default:0
    },
    image:String,
    token: {
        type:String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    var user = this;
    // 비밀번호를 암호화 시킨다.
    if(user.isModified('password')) {  // 비번이 바뀔 때만 적용
        bcrypt.genSalt(saltRounds,function(err,salt) {
            if(err) return next(err)
            bcrypt.hash(user.password,salt,function(err,hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {  // 비밀번호가 아닌 다른 것을 바꾸는 경우는 
        next()  // 그냥 빠져나가도록 next() 줘야함.
    }

})

userSchema.methods.comparePassword = function(plainPassword,cb) {
    //plainPassword 1234567, 암호화된 비번 $2b$10$UtGPotm... 과의 비교
    //plainPassword 를 암호화 하고 이를 암호화된 비번과 확인해야..
    bcrypt.compare(plainPassword,this.password,function(err,isMatch) {
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    // jsonwebtoken 을 이용해서 token 을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token
    // -> 
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err,user) {
        if(err) console.log("token save err")
        if(err) return cb(err);
        cb(null,user)
    })
}

const User = mongoose.model('User',userSchema)
module.exports = { User}