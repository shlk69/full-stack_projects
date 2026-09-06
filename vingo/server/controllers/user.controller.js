import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
    try {
        // 1. Check if userId exists (passed from your auth middleware)
        const userId = req.userId
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Missing user reference." })
        }

        // 2. Find user and exclude sensitive fields like password
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User account does not exist." })
        }

        // 3. Return user data
        return res.status(200).json(user)

    } catch (error) {
        // 4. Handle unexpected database or server errors
        console.error("Error in getCurrentUser controller:", error)
        return res.status(500).json({
            message: "Internal server error while fetching user profile."
        })
    }
}


export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body
        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        }, { new: true })
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }

        return res.status(200).json({ message: 'location updated' })
    } catch (error) {
        console.log('Error while setting the location ',error.message)
        return res.status(500).json({ message: `Internal server error` })
    }
}
