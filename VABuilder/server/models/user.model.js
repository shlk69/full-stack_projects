import mongoose from "mongoose"



const pageSchema = new mongoose.Schema({
    name: String,
    path: String,
    keywords: {
        type: ['String'],
        default:[]
    }
}, {
    _id: false
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    assistantName: {
        type: String,
        default: 'V A',
    },
    buisnessName: {
        type: String,
        default:''
    },
    buisnessType: {
        type: String,
        default:''
    },
    buisnessDescription: {
        type: String,
        default:''   
    },
    tone: {
        type: String,
        enum: ['Friendly , Professional , Sales'],
        default:'Friendly'
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'glass', 'neon'],
        default:'dark'
    },
    enableVoice: {
        type: Boolean,
        default:true
    },
    pages: {
        type: [pageSchema],
        default:[]
    },
    enableNavigation: {
        type: Boolean,
        default:true
    },
    geminiApiKey: {
        type: String,
        default:''
    },
    geminiStatus: {
        type: String,
        enum: ['activate', 'qouta_exceeded', 'invalid'],
        default:'active'
    },
    totalMessages: {
        type: Number,
        default:0
    },
    plan: {
        type: String,
        enum: [
            'free',
            'pro'
        ],
        default:'free'
    },
    requestLimit: {
        type: number,
        default:200
    },
    proExpiresAt: {
        type: Date,
        default:null
    },
    isSetupComplete: {
        type: Boolean,
        default:false
    }

}, {
    timestamps:true
})


export const User = mongoose.model('users',userSchema)