import mongoose, { mongo, Schema } from 'mongoose'

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    users: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]
}, { timestamps: true })


export const Project = mongoose.model('Project',projectSchema)