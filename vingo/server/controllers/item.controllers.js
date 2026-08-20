import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Item } from "../models/item.model.js";
import { Shop } from "../models/shop.model.js";
import fs from "fs";




export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id
        })

        return res.status(201).json({message:'Item created successfully',item})
    } catch (error) {
        console.log('error while creating item ', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}




export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, category, foodType, price } = req.body;

        let image;
        if (req.file) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
                image = cloudinaryResponse?.url || cloudinaryResponse;
            } catch (uploadError) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(502).json({
                    message: "Failed to upload new image to cloud storage.",
                });
            }
        }

        const updateData = { name, category, foodType, price };
        if (image) updateData.image = image;

        const item = await Item.findByIdAndUpdate(
            itemId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!item) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                message: "Item not found"
            });
        }

        return res.status(200).json({
            message: "Item updated successfully",
            item
        });

    } catch (error) {
        // Fallback file cleanup on exception
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error while updating item.",
            error: error.message
        });
    }
};
