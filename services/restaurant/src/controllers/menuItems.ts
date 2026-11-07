import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import MenuItems from "../models/MenuItems.js";
import Restaurant from "../models/Restaurant.js";

export const addMenuItems = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        })
    }
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(404).json({
            message: "No Restaurant found",
        });
    }
    const { name, description, price } = req.body
    if (!name || !description || !price) {
        return res.status(400).json({
            message: "Name,description and price are required"
        })
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "Please give image.",
        });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to create file buffer",
        });
    }

    const { data: uploadResult } = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        {
            buffer: fileBuffer.content,
        },
    );

    const item = await MenuItems.create({
        name,
        description,
        price,
        restaurantId: restaurant._id,
        image: uploadResult.url,
    });

    res.json({
        message: "Item added successfully",
        item,
    });
});

export const getAllItems = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params //this id is restaurant id
    if (!id) {
        return res.status(400).json({
            message: "Id is required",
        });
    }
    const items = await MenuItems.find({ restaurantId: id })
    res.json({ items })
})
export const deleteItems = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    const { itemId } = req.params
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required",
        });
    }
    const item = await MenuItems.findById(itemId)
    if (!item) {
        return res.status(404).json({
            messsage: "No item found",
        });
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    })

    if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant Found!!"
        })
    }

    await item.deleteOne();
    res.json({
        message:"Menu Item deleted Successfully"
    })
})
export const toggleMenuItemAvailability = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    const { itemId } = req.params
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required",
        });
    }
    const item = await MenuItems.findById(itemId)
    if (!item) {
        return res.status(404).json({
            messsage: "No item found",
        });
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    })

    if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant Found!!"
        })
    }
    item.isAvailable = !item.isAvailable
    await item.save()
    res.json({
        message:`Item is marked as ${item.isAvailable? "Available":"Unavailable"}`,
        item
    })
})
    
