const express  = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserModel = require('./Models/userModel')
const PlaceModel = require('./Models/PlaceModel')
const BookingModel = require('./Models/BookingModel')
const dotenv = require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')
const route = require('./Routes/route')
const multerConfig = require('./Middlewares/multerMiddleware.js')


const imageDownloader = require('image-downloader')
const multer = require('multer')
const { errorMonitor } = require('stream')

app.use(express.json())
app.use(cookieParser())

app.use('/uploads',express.static(__dirname+'/uploads')) 
app.use(cors({
    credentials:true,
    origin:'http://localhost:3000'
}))
app.use(route)


console.log(process.env.MONGO);
mongoose.connect(process.env.MONGO).then(()=>{
    console.log('connected to database');
}).catch(()=>{
    console.log('failed connecting to database');
})



app.get('/',(req,res)=>{
    res.status(200).json('test success ok')
})
 


 











//UPLOAD IMAGE USING LINK - IMAGEDOWNLOADER NPM
app.post('/upload-by-link',async(req,res)=>{
    const{link}=req.body
    try{
        const newName ='photo'+ Date.now()+'.jpg'
        await imageDownloader.image({
            url:link,
            dest:__dirname + '/uploads/'+ newName
        })
        res.status(200).json(newName)
        //OR imageDownloader.(options) // where we predefine options object

    }catch(err){
        res.json(err)
    }
  
})


const photosMiddleware= multer({dest:'uploads/'})

//photo upload from system using multer
app.post('/upload',photosMiddleware.array('photos',10),(req,res)=>{
    const uploadedFiles =[]
    //looping through each file object and taking extension from original filename appending extension to path and the same path without 'uploads/' 
    // in front is send to frontend in an array so that front end can acess the static files using the name . uses fs and path packages
    for(let i =0;i<req.files.length;i++){
        const {path,originalname} = req.files[i]
       const parts= originalname.split('.')
       const ext = parts[parts.length-1]
        const newPath = path + '.' +ext
        fs.renameSync(path,newPath)
        //cant replace 'uploads\' so replacing 'upload' and '\' is removed by the front end section
        uploadedFiles.push(newPath.replace('uploads',''))

    }
    res.json(uploadedFiles)
    
})

app.put('/update-user-info',multerConfig.single('profile'),async(req,res)=>{
    const{user,address,phone,userId,profile}=req.body
    console.log(user,address,phone,userId,profile);
    const uploadImage = req.file?req.file.filename:profile   // updated image or the image which already existed
console.log(uploadImage);
const updateProject = await UserModel.findByIdAndUpdate({_id:userId},{name:user,address,phone,profile:uploadImage},{new:true})
console.log(updateProject);
res.status(200).json(updateProject)
})



 app.get('/user/:id',async(req,res)=>{
    console.log('inside user');
    const {id} = req.params
    console.log(id);
    const userData = await UserModel.findById(id)
    res.status(200).json(userData)
 })





//  TO BOOK PLACE
app.post('/booking',async(req,res)=>{
   try{
    const userData = await getUserDataFromReq(req)

    const{place,checkIn,checkOut,
        numberOfGuests,name,phone,price}=req.body
        console.log(place,checkIn,checkOut,
            numberOfGuests,name,phone,price);

       const bookingDoc = await  BookingModel.create({
            place,checkIn,checkOut,
        numberOfGuests,name,phone,price,user:userData.id

        })
        if(bookingDoc){
            res.json(bookingDoc)
        }

   }catch(err){
    res.json(err)

   }
       

})

const getUserDataFromReq=async(req)=>{
    // return new Promise((resolve,reject)=>{
    //     jwt.verify(req.cookies.token,"hacker",{},async(err,tokenData)=>{
    //         if(err) throw err
    //         resolve(tokenData)
    //  })
    // })
    try {
        const tokenData = await jwt.verify(req.cookies.token, "hacker", {});
        return tokenData;
      } catch (err) {
        throw err;
      }

}


// GET BOOKINGS
app.get('/bookings',async(req,res)=>{
   const userData = await getUserDataFromReq(req)
   console.log('userdata is ',userData.id);
   try{
  const bookingDoc = await  BookingModel.find({user:userData.id}).populate('place')
  console.log('bookingdoc is',bookingDoc);
  res.json(bookingDoc)
   }catch(err){
    res.json(err)
   }
 

})

//DELETE BOOKINGS
// app.delete('/delete-booking',async(req,res)=>{
//     try{

//         const {id} = req.body
//         const userData = await getUserDataFromReq(req)
//         if(userData){
//             const result = await BookingModel.findByIdAndDelete(id)
//             res.status(200).json(result)
            
    
//         }
//     }catch(err){
//         res.status(500).json(err)
//     }
  


  
// })

const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`server started and listening in the port ${PORT}`); 
})