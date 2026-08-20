import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

 export const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
        try {
            const result = await cloudinary.uploader.upload(file)
            await fs.unlinkSync(file)
            return result.secure_url
        } catch (error) {
            await fs.unlinkSync(file)
            console.log('Cloudinary error ',error.message)
        }
}

