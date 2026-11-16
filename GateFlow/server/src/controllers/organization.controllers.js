import mongoose from "mongoose"
import { Organization } from "../models/organization.model.js"
import { User } from "../models/user.model.js"
import { Invitation } from "../models/invitation.model.js";
import crypto from 'crypto'
import { sendInviteEmail } from "../utils/sendEmail.js";




const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const createOrganization = async (req, res) => {
    try {
        const { name, description } = req.body;
        const currentUserId = req.user?._id;

        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let finalSlug = generateSlug(name);

        if (!finalSlug) {
            finalSlug = `org-${crypto.randomBytes(3).toString('hex')}`;
        }

        // 2. If user didn't provide a custom slug, auto-resolve collisions
        const existingOrg = await Organization.findOne({ slug: finalSlug });
        if (existingOrg) {
            const suffix = crypto.randomBytes(2).toString('hex');
            finalSlug = `${finalSlug}-${suffix}`;
        }

        // 3. Create organization
        const org = await Organization.create({
            name: name.trim(),
            description,
            slug: finalSlug,
            owner: currentUserId,
            members: [
                {
                    userId: currentUserId,
                    role: 'owner',
                },
            ],
        });

        return res.status(201).json({
            message: 'Organization created',
            organization: org,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An organization with this slug already exists' });
        }
        console.log('Error while creating org:', error.message);
        return res.status(500).json({ message: 'Failed to create organization' });
    }
};


export const getOrganization = async (req, res) => {
    try {
        const currentUserId = req.user?._id

        const organizations = await Organization.find({
            $or: [
                { owner: currentUserId },
                { "members.userId": currentUserId },
            ],
        });
        if (!organizations) {
            return res.status(404).json({ message: 'Organization not found' })
        }
        return res.status(200).json({ message: 'Fetced organization', organizations })
    } catch (error) {
        console.log('Error while fetching the org ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getOrganizationById = async (req, res) => {
    try {
        const { orgId } = req.params
        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }
        const isOwner = org.owner.toString() === currentUserId
        const reqeusterMember = org.members.find((m) => m.userId.toString === currentUserId)
        const isAdmin = reqeusterMember?.role === 'admin'
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Only owners and admins can see the organization data' })
        }
        return res.status(200).json({ message: 'Fetced organization', org })

    } catch (error) {
        console.log('Error while fetching the org from id ', error.message)
        return res.status(500).json({ message: 'Unable to fetch th organization' })

    }
}


export const deleteOrg = async (req, res) => {
    try {
        const { orgId } = req.params
        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({ message: 'Invalid organization ID' });
        }
        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }

        if (org.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unable to delete the organization. Unauthorized' })
        }

        await org.deleteOne();
        return res.status(200).json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.log('Error while deleting org ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


export const updateOrg = async (req, res) => {
    try {
        const { orgId } = req.params
        const { name, description } = req.body
        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({ message: 'Invalid organization id' })
        }
        const updates = {
            name, description
        }
        const updatedOrg = await Organization.findByIdAndUpdate({
            _id: orgId, owner: req.user._id
        },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedOrg) {
            return res.status(404).json({ message: 'Organization not found or Unauthorized', data: updatedOrg })
        }

        return res.status(200).json({ message: 'Organization updated successfully' })

    } catch (error) {
        console.log('error while updating organization ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const addMemberToOrg = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { email, role } = req.body;
        const requesterId = req.user._id;

        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        if (org.owner.toString() !== requesterId.toString()) {
            return res.status(403).json({ message: 'Only organization owner can add members' });
        }

        const userToAdd = await User.findOne({ email: normalizedEmail });
        if (!userToAdd) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        if (userToAdd._id.toString() === org.owner.toString()) {
            return res.status(400).json({ message: 'User is already the owner of this organization' });
        }

        // Check if user is already in org.members
        const isAlreadyMember = org.members.some(
            (m) => m.userId.toString() === userToAdd._id.toString()
        );
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User is already a member of this organization' });
        }

        // Check if a pending invite already exists
        const existingInvite = await Invitation.findOne({
            orgId,
            email: normalizedEmail,
            status: 'pending',
        });
        if (existingInvite) {
            return res.status(400).json({ message: 'An active invitation was already sent to this user' });
        }

        // Create invite token (expires in 48 hours)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        const invite = await Invitation.create({
            orgId,
            email: normalizedEmail,
            role,
            token,
            invitedBy: requesterId,
            expiresAt,
        });

        const inviteUrl = `${process.env.FRONTEND_URL}/invite?token=${token}`;

        try {
            await sendInviteEmail({
                to: normalizedEmail,
                orgName: org.name,
                role,
                inviteUrl,
            });
        } catch (emailError) {
            await Invitation.findByIdAndDelete(invite._id);
            return res.status(502).json({ message: 'Failed to send invitation email', error: emailError.message });
        }

        return res.status(200).json({ message: 'Invitation email sent successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const respondToInvite = async (req, res) => {
    try {
        const { token, action } = req.body; // 'accept' or 'reject'
        const currentUser = req.user;

        const invite = await Invitation.findOne({ token, status: 'pending' });
        if (!invite || invite.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired invitation' });
        }

        if (currentUser.email.toLowerCase() !== invite.email) {
            return res.status(403).json({ message: 'This invitation was sent to a different email address' });
        }

        if (action === 'reject') {
            invite.status = 'rejected';
            await invite.save();
            return res.status(200).json({ message: 'Invitation rejected' });
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

            return res.status(200).json({ message: `You have joined ${org.name}`, orgId: org._id });
        }

        return res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const deleteMember = async (req, res) => {
    try {
        const { orgId, userId } = req.params
        const currentUserId = (req.user._id || req.user.id).toString();
        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }
        const isOwner = org.owner.toString() === currentUserId
        const reqeusterMember = org.members.find((m) => m.userId.toString() === currentUserId)
        const isAdmin = reqeusterMember?.role === 'admin'
        if (!isOwner && !isAdmin) {
            return res.status(400).json({ message: 'Only owners and admins can remove members' })
        }

        const targetUser = org.members.some((m) => m.userId.toString() === userId)
        if (!targetUser) {
            return res.status(404).json({ message: 'Member not found in this organization' })
        }

        if (org.owner?.toString() === userId) {
            return res.status(400).json({ message: 'Canno remove the organization owner' })
        }

        await Organization.findByIdAndUpdate(orgId, {
            $pull: { members: { userId: userId } }
        })
        return res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        console.log('error while removing member ', error.message)
        return res.status(500).json({ message: 'Unable to remove members' })
    }
}

export const updateMemberRole = async (req, res) => {
    try {
        const { orgId, userId } = req.params
        const { role } = req.body
        const currentUserId = req.user._id.toString()
        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }

        const isOwner = org.owner.toString() === currentUserId
        const reqeusterMember = org.members.find((m) => m.userId.toString() === currentUserId)
        const isAdmin = reqeusterMember?.role === 'admin'
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Only owners and admins can update member's role" })
        }

        const targetUser = org.members.some((m) => m.userId.toString() === userId)
        if (!targetUser) {
            return res.status(404).json({ message: "Member doesn't exist" })
        }

        if (reqeusterMember.userId.toString() === userId) {
            return res.status(403).json({ message: "Only organization can change admin's role" })
        }
        const updatedMember = await Organization.findOneAndUpdate({ _id: orgId, 'members.userId': userId },
            {
                $set: { 'members.$.role': role }
            },
            { new: true }
        )
        return res.status(200).json({ message: 'Member role updated successfully ', members: updatedMember.members })

    } catch (error) {
        console.log('error while updating a member role ', error.message)
        return res.status(500).json({ message: 'Unable to update a member role ' })
    }
}