const fs = require('fs');

let content = fs.readFileSync('src/controllers/auth.controllers.js', 'utf8');

// Modify registerController
// Find: // 7. Create user (email unverified by default)
const createReg = /\/\/ 7\. Create user \(email unverified by default\)[\s\S]*?(?=return res\.status\(201\))/;

const replacement = `// 7. Check if email was pre-verified via Redis
        const verifiedFlag = await redis.get(\`reg-verified:\${normalizedEmail}\`);
        if (!verifiedFlag) {
            return res.status(400).json({
                success: false,
                message: "Email is not verified. Please verify your email first."
            });
        }

        // 8. Create user (already verified)
        const user = await UserModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            contact: normalizedContact,
            isEmailVerified: true,
            role: "tenant",
            authProvider: "local"
        });

        // 9. Cleanup Redis
        await redis.del(\`reg-verified:\${normalizedEmail}\`);

        // 10. Send Welcome / Account Created Email
        try {
            await sendWelcomeEmail({
                email: user.email,
                username: user.username,
            });
        } catch (welcomeErr) {
            console.error("Welcome Email Error:", welcomeErr);
        }

        // 11. Generate Tokens & Session
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const sessionId = crypto.randomUUID();
        await redis.set(\`session:\${sessionId}\`, refreshToken, { ex: 7 * 24 * 60 * 60 });

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            sessionId,
            accessToken,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                avatar: user.avatar,
                authProvider: user.authProvider,
            },
        });

    } catch (error) {`;

content = content.replace(/\/\/ 7\. Create user \(email unverified by default\)[\s\S]*?\} catch \(error\) \{/, replacement);

// New Controllers to inject before export default
const newControllers = `
// Send Pre-Registration OTP
async function sendRegistrationOtpController(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        const normalizedEmail = email.toLowerCase().trim();

        const existingEmail = await UserModel.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Store OTP in Redis for 15 minutes
        await redis.set(\`reg-otp:\${normalizedEmail}\`, otp, { ex: 15 * 60 });

        try {
            await sendVerificationEmail({
                email: normalizedEmail,
                username: "User", // generic name for now
                otp,
            });
        } catch (emailErr) {
            console.error("Verification Email Error:", emailErr);
        }

        return res.status(200).json({
            success: true,
            message: "Verification OTP has been sent to your email.",
        });
    } catch (error) {
        console.error("Send Registration OTP error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Verify Pre-Registration OTP
async function verifyRegistrationOtpController(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }
        const normalizedEmail = email.toLowerCase().trim();

        const storedOtp = await redis.get(\`reg-otp:\${normalizedEmail}\`);
        if (!storedOtp || storedOtp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification OTP" });
        }

        // Set verified flag for 1 hour
        await redis.set(\`reg-verified:\${normalizedEmail}\`, "true", { ex: 60 * 60 });
        await redis.del(\`reg-otp:\${normalizedEmail}\`);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify Registration OTP error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

`;

content = content.replace('export default {', newControllers + 'export default {\n    sendRegistrationOtpController,\n    verifyRegistrationOtpController,');

fs.writeFileSync('src/controllers/auth.controllers.js', content);
console.log('auth.controllers.js updated');
