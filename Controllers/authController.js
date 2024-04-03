const UserModel = require('../Models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.registerUser=async(req,res)=>{
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
        
}

exports.loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body
        const existingUser = await UserModel.findOne({email})
        if(existingUser){
            const passOK = bcrypt.compareSync(password,existingUser.password)
            if(passOK){
                //email and password ok creating jwt token
                const payload ={
                    email:existingUser.email,
                    id:existingUser._id,
                }
                const secretKey = 'hacker'
                const {password,...existingUserWithOutPassword}=existingUser._doc

                const cookieExpiration = new Date(Date.now() +  60 * 60 * 1000); 
                
                jwt.sign(payload,secretKey,{},(err,token)=>{
                    if(err) throw err
                    res.cookie('token',token,{httpOnly:true,expires:cookieExpiration}).status(200).json(existingUserWithOutPassword)
                })
    
            }else{
                res.status(401).json('wrong Password')
            }
        }else{
            res.status(401).json('not an existing user')
        }
       }catch(err){
        res.status(401).json(err)
       }
}