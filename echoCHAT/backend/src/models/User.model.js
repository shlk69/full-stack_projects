import mongoose from "mongoose";
import bcrypt from 'bcryptjs'



const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    bio: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    },
    learningLanguage: {
        type: String,
        default: ''
    },
    nativeLanguage: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true })



//pre hook

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});


UserSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

const User = mongoose.model('User', UserSchema)
export default User