import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required:true
    },
    address: {
        typ: String,
        required:true
    },
    items: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Item'
    }
}, {
    timestamps:true
})


export const Shop = mongoose.model('Shop', userSchema);
