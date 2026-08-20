import { config } from "../config/config.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function renderEmailTemplate({
    title,
    preheader = "",
    bodyHtml,
    ctaText,
    ctaUrl,
    isWarning = false,
}) {
    const brandColor = isWarning ? "#A53B32" : "#174D35";
    const badgeTitle = isWarning ? "SECURITY NOTICE" : "ROOM MARKETPLACE";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${preheader}</div>
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F0; padding: 36px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFDF8; border: 1px solid #E8E3D6; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(28,27,24,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: ${brandColor}; padding: 32px 32px 26px 32px; text-align: center;">
                            <span style="font-family: Georgia, serif; font-size: 34px; font-style: italic; color: #F8F4EA; text-decoration: none; font-weight: normal; letter-spacing: -0.5px;">room.</span>
                            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #EDE6D9; margin-top: 6px;">${badgeTitle}</div>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 36px 32px; color: #1C1B18; font-size: 15px; line-height: 1.6;">
                            <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: ${brandColor}; margin: 0 0 20px 0; line-height: 1.3;">${title}</h1>
                            ${bodyHtml}
                            ${
                                ctaText && ctaUrl
                                    ? `
                            <div style="text-align: center; margin: 32px 0 16px 0;">
                                <a href="${ctaUrl}" style="background-color: ${brandColor}; color: #F8F4EA; text-decoration: none; padding: 14px 32px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-radius: 50px; display: inline-block;">${ctaText}</a>
                            </div>
                            `
                                    : ""
                            }
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #FAF7F0; border-top: 1px solid #E8E3D6; padding: 24px 32px; text-align: center; color: #756A5C; font-size: 12px; line-height: 1.5;">
                            <p style="margin: 0 0 6px 0; font-weight: 600; color: #5F554A;">ROOM • Premium Rental Marketplace</p>
                            <p style="margin: 0; color: #9A9186;">This is an automated operational notification regarding your ROOM account.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

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
    const title = "Verify Your Account";
    const bodyHtml = `
        <p style="margin-top: 0;">Hello <strong>${username}</strong>,</p>
        <p>Thank you for creating an account with ROOM. Use the 6-digit verification code below to confirm your email address and activate your account:</p>
        
        <div style="background-color: #174D35; color: #F8F4EA; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 18px; border-radius: 14px; margin: 24px 0;">
            ${otp}
        </div>
        
        <p style="font-size: 13px; color: #5F554A;">This verification code is valid for <strong>15 minutes</strong>. If you did not sign up for a ROOM account, please disregard this email.</p>
    `;

    const htmlContent = renderEmailTemplate({
        title,
        preheader: `Your verification code is ${otp}`,
        bodyHtml,
    });

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
    const title = "Welcome to ROOM 🎉";
    const bodyHtml = `
        <p style="margin-top: 0;">Hello <strong>${username}</strong>,</p>
        <p>Your email has been verified and your ROOM account is now <strong>fully activated</strong>.</p>
        <p>You can now explore premium long-term room listings, connect directly with property owners, save favorite spaces, or list your own rental property.</p>
    `;

    const htmlContent = renderEmailTemplate({
        title,
        preheader: "Your ROOM account is now active!",
        bodyHtml,
        ctaText: "Explore ROOM Marketplace",
        ctaUrl: config.FRONTEND_URL,
    });

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
    const title = "Room Listed Successfully 🏡";
    const bodyHtml = `
        <p style="margin-top: 0;">Hello <strong>${username}</strong>,</p>
        <p>Great news! Your room listing has been published and is now active on the ROOM marketplace.</p>
        
        <div style="background-color: #FAF7F0; border: 1px dashed #174D35; padding: 20px; border-radius: 14px; margin: 24px 0;">
            <h3 style="margin: 0 0 10px 0; color: #174D35; font-family: Georgia, serif; font-size: 18px;">${roomTitle}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #5F554A;"><strong>Location:</strong> ${location}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #174D35; font-weight: 700;"><strong>Monthly Rent:</strong> ₹${Number(rent).toLocaleString("en-IN")}</p>
        </div>
        
        <p style="font-size: 13px; color: #5F554A;">Tenants can now view your room listing and send direct inquiry messages.</p>
    `;

    const htmlContent = renderEmailTemplate({
        title,
        preheader: `Your room ${roomTitle} is now live on ROOM`,
        bodyHtml,
        ctaText: "View Owner Dashboard",
        ctaUrl: `${config.FRONTEND_URL}/owner-dashboard`,
    });

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
    const title = "Account Deletion Confirmed";
    const bodyHtml = `
        <p style="margin-top: 0;">Hello <strong>${username}</strong>,</p>
        <p>This email confirms that your ROOM account and associated data have been <strong>permanently deleted</strong> as requested.</p>
        <p>We are sorry to see you go! You are always welcome to sign up again whenever you need a rental home or wish to list a property.</p>
    `;

    const htmlContent = renderEmailTemplate({
        title,
        preheader: "Your ROOM account deletion confirmation",
        bodyHtml,
        isWarning: true,
    });

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
    const title = "Password Reset OTP";
    const bodyHtml = `
        <p style="margin-top: 0;">Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your ROOM account password. Use the verification code below to proceed:</p>
        
        <div style="background-color: #174D35; color: #F8F4EA; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 18px; border-radius: 14px; margin: 24px 0;">
            ${otp}
        </div>
        
        <p style="font-size: 13px; color: #5F554A;">This OTP will expire in <strong>10 minutes</strong>. If you did not request a password reset, please secure your account immediately.</p>
    `;

    const htmlContent = renderEmailTemplate({
        title,
        preheader: `Your password reset code is ${otp}`,
        bodyHtml,
    });

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
    const title = "Account Deletion Code";
    const bodyHtml = `
        <p style="margin-top: 0;">Hello <strong>${username}</strong>,</p>
        <p>We received a request to permanently delete your ROOM account. Use the authorization code below to confirm:</p>
        
        <div style="background-color: #A53B32; color: #F8F4EA; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 18px; border-radius: 14px; margin: 24px 0;">
            ${otp}
        </div>
        
        <p style="font-size: 13px; color: #A53B32; font-weight: 600;">
            Warning: Confirming account deletion permanently removes all profile information, room listings, and chat conversations.
        </p>
    `;

    const htmlContent = renderEmailTemplate({
        title,
        preheader: `Your account deletion code is ${otp}`,
        bodyHtml,
        isWarning: true,
    });

    return sendEmail({
        to: email,
        subject: "ROOM - Account Deletion OTP",
        htmlContent,
    });
}