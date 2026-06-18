import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select:false
    }
}, {
    timestamps:true
})


userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isValidPassword = async function (password)  {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateJwt = function () {
    return jwt.sign(
        { _id: this._id, email: this.email }, 
        process.env.JWT_SECRET,
        { expiresIn: '1d' } 
    );
};

export const User = mongoose.model('User', userSchema)