import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import Restaurant from "../models/Restaurant.js";

export const addRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    const existingRestaurant = await Restaurant.findOne({
        ownerId: user._id
    })

    if (existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant",
        });
    }
    const { name, description, latitude, longitude, formattedAddress, phone } = req.body

    if (!name || !latitude || !longitude) {
        return res.status(400).json({
            message: "Provide all the necessary details"
        })
    }

    const file = req.file
    if (!file) {
        return res.status(400).json({
            message: "Please give image.",
        });
    }
    const fileBuffer = getBuffer(file)
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to create file buffer",
        });
    }
    const { data } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    })

    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        image: data.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress
        },
        isVerified: false
    })
    return res.status(201).json({
        message: "Restaurant Added",
        restaurant
    })
})

export const fetchMyRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login First"
        })
    }
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id })
    if (!restaurant) {
        return res.status(400).json({
            message: "No Restaurant Found"
        })
    }
    return res.json({ restaurant });

})
 
export const updateStatusRestaurant = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(403).json({
            message:"Please Login"
        })
    }
    const {status} = req.body
    const restaurant = await Restaurant.findOneAndUpdate({ownerId:req.user._id,},{isOpen:status},{new:true})
    if(!restaurant){
        return res.status(400).json({
            message:"Restaurant not found"
        })
    }

    return res.status(200).json({
        message:"Restaurant status updated",
        restaurant,
    })

})

export const saveChanges = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(403).json({
            message:"Please Login"
        })
    }
    const {name,description} = req.body
    const restaurant = await Restaurant.findOneAndUpdate({ownerId:req.user._id},{name:name,description:description},{new:true})
    return res.status(200).json({
        message:"Restaurant status updated",
        restaurant,
    })
})

export const getNearbyRestaurant = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const {latitude,longitude,radius=5000,search=""}=req.query
    
    
    if(!latitude || !longitude){
        return res.status(400).json({
            message:"Latitude and Longitude is required"
        })
    }
    const query:any = {
        isVerified:true
    }

    if(search && typeof search==="string"){
        query.name = {$regex:search,$options:"i"}
    }
    
    const restaurants= await Restaurant.aggregate([
        {
            $geoNear:{
                near:{
                    type:"Point",
                    coordinates:[Number(longitude),Number(latitude)],
                },

                distanceField:"distance",
                maxDistance:Number(radius),
                spherical:true,
                query:query
            }
        },
        {
            $sort:{
                isOpen:-1,
                distance:1,

            }
        },
        {
            $addFields:{
                distanceKm:{
                    $round:[{$divide:["$distance",1000]},2],
                }
            }
        }
    ])
    res.json({
        success:true,
        count:restaurants.length,
        restaurants
    })
})
export const fetchSingleRestaurant = TryCatch(async (req:AuthenticatedRequest,res)=>{
    const restaurant = await Restaurant.findById(req.params.id)
    res.json(restaurant)
})
