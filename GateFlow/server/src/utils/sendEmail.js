import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async ({ to, orgName, role, inviteUrl }) => {
    const { data, error } = await resend.emails.send({
        from: 'Acme Org <onboarding@resend.dev>',
        to,
        subject: `You've been invited to join ${orgName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111827;">Organization Invitation</h2>
                <p style="color: #374151; font-size: 15px;">
                    You have been invited to join <strong>${orgName}</strong> as a <strong>${role}</strong>.
                </p>
                <div style="margin: 24px 0;">
                    <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Accept or Decline Invitation
                    </a>
                </div>
                <p style="color: #6b7280; font-size: 12px;">
                    This invitation link will expire in 48 hours. If you did not expect this email, you can safely ignore it.
                </p>
            </div>
        `,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};
