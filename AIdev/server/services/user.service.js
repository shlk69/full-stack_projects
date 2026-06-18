import { User } from '../models/user.model.js'

export const registerUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Email or password is required')
    }
    const user = await User.create({ email, password })
    return user
}

export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Email or password is required')
    }
    const user = await User.create({ email, password })
    return user
}

