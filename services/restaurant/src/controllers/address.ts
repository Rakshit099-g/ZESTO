import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import Address from "../models/Address.js";

export const addAddress = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user
    if(!user){
        return res.status(401).json({
            message:"Unaouthorised!! Please Login Again"
        })
    }

    const {formattedAddress,latitude,longitude,mobile} = req.body 

    if(!formattedAddress || !mobile || latitude===undefined || longitude===undefined){
        return res.status(400).json({
            message:"Please provide all the Fields"
        })
    }

    const newAddress = await Address.create({
        userId:user?._id,
        formattedAddress,
        mobile,
        location:{
            type:"Point",
            coordinates:[Number(longitude),Number(latitude)]
        },
    })

    return res.json({
        message:"Address added successfully",
        address:newAddress
    })
})

export const deleteAddress = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user
    if(!user){
        return res.status(401).json({
            message:"Unauthorised!! Please Login Again"
        })
    }

    const {id} = req.params

    if(!id){
        return res.status(400).json({
            message:"Id is Required"
        })
    }

    const address = await Address.findOne({
        _id:id,
        userId:user._id.toString()
    })
    if(!address){
        return res.status(400).json({
            message:"Address not found"
        })
    }
    
    await Address.deleteOne(address)
    res.json({
        message:"Address deleted successfully"
    })

})

export const getMyAddress = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user
    if(!user){
        return res.status(401).json({
            message:"Unauthorised!! Please Login Again"
        })
    }

    const address = await Address.find({
        userId:user._id.toString()
    }).sort({createdAt:-1})

    res.json(address)


})