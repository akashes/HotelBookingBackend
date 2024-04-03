const express = require('express')
const route = new express.Router()
const authController = require('../Controllers/authController')
const placeController = require('../Controllers/placeController')
const userController = require('../Controllers/userController')


//REGISTER
route.post('/register',authController.registerUser)
//LOGIN
route.post('/login',authController.loginUser)
//LOGOUT
route.post('/logout',(req,res)=>{
    res.cookie('token','').json('logout successfull')
})
 
//GET SPECIFIC USER DATA
//PROFILE DATA
route.get('/profile',userController.getUserData)
    


//SHOW ALL PLACES 
route.post('/places/all',placeController.showAllPlaces)

//SHOW ACCOMODATIONS CREATED BY A USER
route.get('/user-places',placeController.userCreatedAccomodations)

//GET A PARTICULAR PLACE DETAILS
route.get('/places/:id',placeController.singlePlaceDetails)





//ADDING PLACES
// form uploading 
route.post('/places',placeController.addNewPlace)

route.put('/places',placeController.updatePlace)








module.exports = route  