import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        unique: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number']
    },

    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy"],
        required: true
    },
    resetOtp: {
        type:String
    },
    isOtpVerified: {
        type: Boolean,
        default:false
    },
    otpExpires: {
        type:Date
    }

}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


const User = mongoose.model('User', userSchema);
export default User
