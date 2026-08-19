import { config } from "../config/config.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
    to,
    subject,
    htmlContent,
}) {
    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": config.BREVO_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: "ROOM",
                    email: config.BREVO_EMAIL,
                },
                to: [
                    {
                        email: to,
                    },
                ],
                subject,
                htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();

            console.error("Brevo Email Error:", errorData);

            throw new Error("Failed to send email");
        }

        return true;

    } catch (error) {
        console.error("Send Email Error:", error);

        throw error;
    }
}

export async function sendVerificationEmail({
    email,
    username,
    otp,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C1B18; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E8E3D6; border-radius: 16px; background-color: #FAF7F0;">
            <h2 style="color: #174D35; font-family: Georgia, serif; font-size: 26px;">Verify Your ROOM Account</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Thank you for signing up for ROOM! Please use the OTP below to verify your email address and activate your account:</p>
            <div style="background-color: #174D35; color: #F8F4EA; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px; border-radius: 12px; margin: 24px 0;">
                ${otp}
            </div>
            <p>This verification code is valid for <strong>15 minutes</strong>.</p>
            <p style="color: #756A5C; font-size: 13px;">If you did not register for a ROOM account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E8E3D6; margin: 24px 0;" />
            <p style="color: #756A5C; font-size: 12px;">Warm regards,<br><strong>The ROOM Team</strong></p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "ROOM - Verify Your Account",
        htmlContent,
    });
}

export async function sendWelcomeEmail({
    email,
    username,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C1B18; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E8E3D6; border-radius: 16px; background-color: #FAF7F0;">
            <h2 style="color: #174D35; font-family: Georgia, serif; font-size: 26px;">Welcome to ROOM! 🎉</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Your email has been verified and your ROOM account is now <strong>fully activated</strong>.</p>
            <p>You can now explore premium room listings, save your favorites, connect directly with property owners, or list your own rental spaces.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${config.CLIENT_URL || 'http://localhost:3000'}" style="background-color: #174D35; color: #F8F4EA; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 50px; display: inline-block;">Explore ROOM</a>
            </div>
            <hr style="border: none; border-top: 1px solid #E8E3D6; margin: 24px 0;" />
            <p style="color: #756A5C; font-size: 12px;">Welcome aboard,<br><strong>The ROOM Team</strong></p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "Welcome to ROOM - Account Activated",
        htmlContent,
    });
}

export async function sendRoomAddedEmail({
    email,
    username,
    roomTitle,
    rent,
    location,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C1B18; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E8E3D6; border-radius: 16px; background-color: #FAF7F0;">
            <h2 style="color: #174D35; font-family: Georgia, serif; font-size: 26px;">Room Listed Successfully! 🏡</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Great news! Your room listing has been created and published on ROOM marketplace.</p>
            <div style="background-color: #FFFDF8; border: 1px dashed #174D35; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #174D35;">${roomTitle}</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Location:</strong> ${location}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Monthly Rent:</strong> ₹${Number(rent).toLocaleString("en-IN")}</p>
            </div>
            <p>Tenants can now view your listing and send direct inquiry messages.</p>
            <hr style="border: none; border-top: 1px solid #E8E3D6; margin: 24px 0;" />
            <p style="color: #756A5C; font-size: 12px;">Happy hosting,<br><strong>The ROOM Team</strong></p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `ROOM - Room Listed: ${roomTitle}`,
        htmlContent,
    });
}

export async function sendAccountDeletedConfirmationEmail({
    email,
    username,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C1B18; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E8E3D6; border-radius: 16px; background-color: #FAF7F0;">
            <h2 style="color: #c53030; font-family: Georgia, serif; font-size: 26px;">Account Deleted</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>This email confirms that your ROOM account and all associated data (profile info, room listings, chats, and messages) have been <strong>permanently deleted</strong> as per your request.</p>
            <p>We're sorry to see you go! You are always welcome back if you need a room or wish to list a property again in the future.</p>
            <hr style="border: none; border-top: 1px solid #E8E3D6; margin: 24px 0;" />
            <p style="color: #756A5C; font-size: 12px;">Best regards,<br><strong>The ROOM Team</strong></p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "ROOM - Account Deleted Confirmation",
        htmlContent,
    });
}

export async function sendPasswordResetOtpEmail({
    email,
    username,
    otp,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C1B18;">
            <h2>Password Reset Request</h2>
            <p>Hello ${username},</p>
            <p>We received a request to reset your ROOM account password.</p>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing: 8px;">${otp}</h1>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Regards,<br>ROOM Team</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "ROOM - Password Reset OTP",
        htmlContent,
    });
}

export async function sendAccountDeletionOtpEmail({
    email,
    username,
    otp,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C1B18;">
            <h2 style="color: #c53030;">Account Deletion Verification</h2>
            <p>Hello ${username},</p>
            <p>We received a request to permanently delete your ROOM account.</p>
            <p>Your Verification OTP is:</p>
            <h1 style="letter-spacing: 8px; color: #c53030; font-size: 32px;">${otp}</h1>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="color: #756A5C; font-size: 12px;">
                <strong>Warning:</strong> Deleting your account will permanently remove all your profile data, listings, and conversations.
                If you did not request this, please ignore this email.
            </p>
            <p>Regards,<br>ROOM Team</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "ROOM - Account Deletion OTP",
        htmlContent,
    });
}