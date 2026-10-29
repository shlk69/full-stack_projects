
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export async function registerUser({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const user = await User.create({
            name,
            email,
            passwordHash,
        });

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
        };
    } catch (error) {
        if (error.code === 11000) {
            const duplicateError = new Error(
                "An account with this email already exists"
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }
        throw error;
    }
}
