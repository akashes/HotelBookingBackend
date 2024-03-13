const express  = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserModel = require('./Models/userModel')
const dotenv = require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials:true,
    origin:'http://localhost:3000'
}))
console.log(process.env.MONGO);
mongoose.connect(process.env.MONGO).then(()=>{
    console.log('connected to database');
}).catch(()=>{
    console.log('failed connecting to database');
})

app.get('/test',(req,res)=>{
    res.status(200).json('test success ok')
})


//REGISTER
app.post('/register',async(req,res)=>{
const{name,email,password}=req.body 
const existingUser = await UserModel.findOne({email})
try{
    if(existingUser){
        res.status(401).json('User already exists')
    }else{
    
        const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    console.log('hashed is ',hashedPassword);
      
    const user = await UserModel.create({
        name,
        email,
        password:hashedPassword,
    })
        res.status(200).json(user)
    }
    
    } catch(err){
        res.status(401).json(err)
    }
    
    
   
})

//LOGIN
app.post('/login',async(req,res)=>{
   try{
    const {email,password}=req.body
    const existingUser = await UserModel.findOne({email})
    if(existingUser){
        const passOK = bcrypt.compareSync(password,existingUser.password)
        if(passOK){
            //email and password ok
            const payload ={
                email:existingUser.email,
                id:existingUser._id,
            }
            const secretKey = 'hacker'
            jwt.sign(payload,secretKey,{},(err,token)=>{
                if(err) throw err
                res.cookie('token',token).json(existingUser)
                // res.status(200).json({token})
            })
            // res.status(200).json('Login successfull')

        }else{
            res.status(401).json('wrong Password')
        }
    }else{
        res.status(401).json('not an existing user')
    }
   }catch(err){
    res.status(401).json(err)
   }
})

//PROFILE DATA
app.get('/profile',(req,res)=>{
//grabbing token from cookie of req
    const {token} = req.cookies
    if(token){
        jwt.verify(token,"hacker",{},async(err,tokenData)=>{
            if(err) throw err
        const userData=   await UserModel.findById(tokenData.id)
            res.status(200).json(userData)

        })
    }
    // res.status(200).json({token})
})

//LOGOUT
app.post('/logout',(req,res)=>{
    res.cookie('token','').json('logout successfull')
})

app.post('/upload-by-link',(req,res)=>{
    const{link}=req.body
})


const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`server started and listening in the port ${PORT}`);
})