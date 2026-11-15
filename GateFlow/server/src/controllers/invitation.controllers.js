import { Invitation } from "../models/invitation.model"
import { Organization } from "../models/organization.model"
import { User } from "../models/user.model"
import crypto from 'crypto'
import { sendInviteEmail } from "../utils/sendEmail"

export const sendInvite = async (req, res) => {
    try {
        const { orgId } = rqe.params
        const { email, role } = req.body
        
        const org = await Organization.findById(orgId)
        if (!org) return res.status(404).json({ message: 'Organization not found' })
        
        if (org.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({message:'only organization members can invite members'})
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            const isMember = org.members.some((m) => m.userId.toString() === existingUser._id.toString())
            if (isMember || org.owner.toString() === existingUser._id.toString()) {
                return res.status(400).json({message:'User is already member in this organization'})
            }
        }

        const duplicateInvite = await Invitation.findOne({ orgId, email, status: 'pending' })
        
        if (duplicateInvite) {
            return res.status(409).json({message:'Invitation is already sent to the user'})
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        
        const invite = await Invitation.create({
            orgId,
            email,role,token,invitedBy:req.user._id,expiresAt
        })
        const inviteUrl = `${process.env.FRONTEND_URL}/invite/token=${token}`

        try {
            await sendInviteEmail({
                to: email,
                orgName: org.name,
                role,
                inviteUrl
            })
        } catch (error) {
            console.log('error while sending invitaion mail  ', error.message)
            return res.status(502).json({message:'Failed to send invitation'})
        }
        return res.status(200).json({message:'Invitaion sent successfully'})
    } catch (error) {
        console.log('error while creating invite ', error.message)
        return res.status(500).json({message:'Unable to send invitation'})
    }
} 
export const respondToInvite = async (req, res) => {
    try {
        const { token, action } = req.body; // action: 'accept' or 'reject'
        const currentUser = req.user;

        const invite = await Invitation.findOne({ token, status: 'pending' });
        if (!invite || invite.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired invitation' });
        }

        // Ensure logged-in user's email matches the invited email
        if (currentUser.email.toLowerCase() !== invite.email) {
            return res.status(403).json({ message: 'This invitation belongs to a different email address' });
        }

        if (action === 'reject') {
            invite.status = 'rejected';
            await invite.save();
            return res.status(200).json({ message: 'Invitation declined' });
        }

        if (action === 'accept') {
            const org = await Organization.findById(invite.orgId);
            if (!org) return res.status(404).json({ message: 'Organization not found' });

            org.members.push({
                userId: currentUser._id,
                role: invite.role,
            });
            await org.save();

            invite.status = 'accepted';
            await invite.save();

            return res.status(200).json({
                message: `Successfully joined ${org.name}`,
                orgId: org._id,
            });
        }

        return res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};