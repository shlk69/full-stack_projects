import FriendRequest from "../models/friendRequest.model.js";
import User from "../models/User.model.js";


export const getRecommendedUsers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - User session not found" });
        }

        const currentUser = req.user;
        const currentUserId = req.user._id || req.user.id;

        const userFriends = currentUser.friends || [];

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: userFriends } },
                { isOnBoarded: true } 
            ]
        });

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error('User recommendation error:', error.message);
        res.status(500).json({ message: 'Unable to get recommended users' });
    }
};


export const getMyFriends = async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-friends').populate('friends',
            'fullname profilePic nativeLanguage learningLanguage'
        )
        return res.status(200).json(user.friends)
    } catch (error) {
        console.log('Error while fetching friends :',error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const myId = req.user.id
        const { id: recipientId } = req.params
        if (myId === recipientId) {
            return res.status(400).json({message:'You can not send request to yourself'})
        }
    
        const recipient = await User.findById(recipientId)
        if (!recipient) {
            return res.status(404).json({message:'Recipient not found'})
        }
        if (recipient.friends.includes(myId)) {
            return res.status(400).json('You are already friends')
        }
    
        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sender:myId,recipient:recipientId},
                {sender:recipientId,recipient:myId}
            ]
        })
        if (existingRequest) {
            return res.status(400).json({message:'Request already exists'})
        }
    
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        })
        return res.status(201).json(friendRequest)
    } catch (error) {
        console.log('Error while sending request :', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params
        const friendRequest = await FriendRequest.findById(requestId)
        if (!friendRequest) {
            return res.status(404).json({message:'Friend request not found'})
        }

        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({message:'You are not authorized to accept this friend request'})
        }

        friendRequest.status = 'accepted'
        await friendRequest.save()

        //creating friends id in bothe sender and recepient account
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet:{friends:friendRequest.sender}
        })

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet:{friends:friendRequest.recipient}
        })

        return res.status(200).json({message:'friend request accepted'})

    } catch (error) {
        console.log('Error in acceptFrndRqst :', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const incomingRequest = await FriendRequest.find({
            recipient: req.user.id,
            status:'pending'
        }).populate('sender', 'fullname profilePic nativeLanguage learningLanguage')
        
        const acceptedRequest = await FriendRequest.find({
            sender: req.user.id,
            status:'accepted'
        }).populate('recipient', 'fullname profilePic')
        
        res.status(200).json({incomingRequest,acceptedRequest})
    } catch (error) {
        console.log('Error while getting frnd req :', error.message)
        res.status(500).json({message:'Internal server error'})
    }
}

export const getOutgoingFriendRequests = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - User session not found" });
        }

        // 1. Use req.user._id fallback to prevent reading undefined values
        const currentUserId = req.user._id || req.user.id;

        // 2. Fetch the pending transaction requests
        const outgoingReq = await FriendRequest.find({
            sender: currentUserId,
            status: 'pending',
        })
            // 3. FIX: Populate the 'recipient' (or 'receiver') field, NOT 'friends'
            .populate('recipient', 'fullName profilePic nativeLanguage learningLanguage');

        return res.status(200).json(outgoingReq);
    } catch (error) {
        console.error('Error while getting outgoing req:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
