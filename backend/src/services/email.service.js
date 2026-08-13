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

export async function sendPasswordResetOtpEmail({
    email,
    username,
    otp,
}) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Password Reset Request</h2>

            <p>Hello ${username},</p>

            <p>
                We received a request to reset your ROOM account password.
            </p>

            <p>Your OTP is:</p>

            <h1 style="letter-spacing: 8px;">
                ${otp}
            </h1>

            <p>
                This OTP will expire in <strong>10 minutes</strong>.
            </p>

            <p>
                If you did not request a password reset,
                please ignore this email.
            </p>

            <p>Regards,<br>ROOM Team</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "ROOM - Password Reset OTP",
        htmlContent,
    });
}