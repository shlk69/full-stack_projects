import mongoose from "mongoose"
import { Organization } from "../models/organization.model"
import { User } from "../models/user.model"

export const createOrganization = async (req, res) => {
    try {
        const { name, description, slug } = rqe.body
        const org = await Organization.create({ name, description, slug })
        return res.status(201).json({ message: 'Organization created' })
    } catch (error) {
        console.log('Error while creating org ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getOrganization = async (req, res) => {
    try {
        const loggedInUserId = req.user?._id
        const org = await Organization.findById(loggedInUserId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }
        return res.status(200).json({ message: 'Fetced organization', org })
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
        return res.status(200).json({ message: 'Fetced organization', org })

    } catch (error) {
        console.log('Error while fetching the org from id ', error.message)
        return res.status(500).json({ message: 'Internal server error' ,data:org})

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
            return res.status(404).json({ message: 'Organization not found or Unauthorized',data:updatedOrg })
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

// 2. Invited user accepts or rejects from the email link
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
