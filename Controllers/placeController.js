const PlaceModel = require('../Models/PlaceModel')
const jwt = require('jsonwebtoken')

exports.showAllPlaces=async(req,res)=>{
        try{
            const{searchKey}=req.body
            if(searchKey){
               
               const query = {
                    $or: [
                        { address: { $regex: searchKey, $options: "i" } },
                        { title: { $regex: searchKey, $options: "i" } }
                    ]
                };
                res.json(await PlaceModel.find(query))
        
            }else{
                res.json(await PlaceModel.find())
            }
            
        
    }catch(err){
            res.status(500).json(err)
        }
       
       

}

exports.userCreatedAccomodations=async(req,res)=>{
    const {token} = req.cookies
    if(token){
        jwt.verify(token,"hacker",{},async(err,tokenData)=>{
            if(err) throw err

            const {id} = tokenData
            res.json(await PlaceModel.find({owner:id}))

   
        })
    }
}


// /places/:id
exports.singlePlaceDetails=async(req,res)=>{  
    try{
        const {id} = req.params
        const result =    await PlaceModel.findById(id)
        res.status(200).json(result)
    }catch(err){
        res.status(401).json('cant get data')
    }
}


// /places   ->post
exports.addNewPlace=async(req,res)=>{
    const{title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price}=req.body

    const {token} = req.cookies
    if(token){
        jwt.verify(token,"hacker",{},async(err,tokenData)=>{
            if(err) throw err
            console.log('token data is ',tokenData);
      const placeDoc =     await  PlaceModel.create({
                owner:tokenData.id,
                title,address,
                photos:addedPhotos,
                description,perks,extraInfo,checkIn,checkOut,maxGuests,price
            })
            await placeDoc.save()
            console.log('place doc is ',placeDoc);
    
            res.json(placeDoc)
    
        })

    }
}


// /places   ->put
exports.updatePlace=async(req,res)=>{
    const {token} = req.cookies
    console.log('token is ',token);
    console.log('reqbody is ',req.body);
    const {id,title,addedPhotos,address,description,perks,extraInfo,checkIn,checkOut,maxGuests,price}=req.body
    if(token){
        jwt.verify(token,"hacker",{},async(err,tokenData)=>{
            if(err) throw err

            const placeDoc =await PlaceModel.findById(id)

            //checks if the current user is same as the owner of place
            if(tokenData.id === placeDoc.owner.toString() ){
              
                placeDoc.set({
                    title,address,
                    photos:addedPhotos,
                    description,perks,extraInfo,checkIn,checkOut,maxGuests,price

                }) 
                await placeDoc.save()
                res.json('ok')

            }
        })

    }
}