import User from "../models/User.model.js";


export const getRecommendedUsers = async (req, res) => {
    try {
        const currentUser = req.user
        const currentUserId = req.user.id
        const recommendedUser = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { $id: { $nin: currentUser.friends } },
                {isOnBoarded}
            ]
        })
        res.status(200).json(recommendedUser)
    } catch (error) {
        console.log('User recommendation error ',error.message)
        res.status(500).json({message:'Unable to get recommended users'})
    }
}

export const getMyFriends = async (req,res) => {
    
}