const jwt = require('jsonwebtoken')
const UserModel = require('../Models/userModel')
exports.getUserData=async(req,res)=>{
      //grabbing token from cookie of req
      const {token} = req.cookies
      if(token){
          jwt.verify(token,"hacker",{},async(err,tokenData)=>{
              if(err) throw err
          const userData=   await UserModel.findById(tokenData.id)
              res.status(200).json(userData)
  
          })
      }

}